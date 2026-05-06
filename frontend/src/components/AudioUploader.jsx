import { useCallback, useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  X, FileAudio, FileText, Video, Loader2, 
  Mic, Plus, RefreshCw, Send, Square, Upload 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { jobsAPI } from '../services/api'
import useAppStore from '../store/useAppStore'
import './AudioUploader.css'

const ACCEPTED_TYPES = {
  'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.flac'],
  'video/*': ['.mp4', '.webm', '.mov'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/msword': ['.doc'],
}

export default function AudioUploader({ onJobStarted, onTextSend }) {
  const { setCurrentJob, setUploadProgress, uploadProgress, addRecentJob } = useAppStore()
  const [selectedFile, setSelectedFile] = useState(null)
  const [text, setText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [modelOpen, setModelOpen] = useState(false)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Định dạng file không hỗ trợ hoặc file quá lớn')
      return
    }
    if (acceptedFiles[0]) setSelectedFile(acceptedFiles[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 100 * 1024 * 1024,
    multiple: false,
    noClick: true,
  })

  const handleAction = () => {
    if (selectedFile) {
      handleFileUpload()
    } else if (text.trim()) {
      onTextSend?.(text)
      setText('')
    }
  }

  const handleFileUpload = async () => {
    if (uploading) return
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('language', 'auto')
      formData.append('title', selectedFile.name.replace(/\.[^/.]+$/, ''))

      const res = await jobsAPI.upload(formData, setUploadProgress)
      const { jobId } = res.data

      const newJob = { _id: jobId, status: 'pending', progress: 0, title: selectedFile.name }
      setCurrentJob(newJob)
      addRecentJob(newJob)
      setSelectedFile(null)
      toast.success('Đã tải lên bài giảng để phân tích!')
      onJobStarted?.(jobId)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tải lên thất bại')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const liveTextBuffer = useRef('')

  const startRecording = async () => {
    try {
      // 1. Warm up the model on server immediately
      jobsAPI.warmup().catch(console.warn)

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []
      liveTextBuffer.current = ''
      
      // Generate a unique ID for this specific stream session
      const streamId = `stream_${Date.now()}`
      
      // Real-time chunking (reduced to 2s for better "live" feel)
      const liveInterval = setInterval(() => {
        if (mediaRecorder.current?.state === 'recording') {
          mediaRecorder.current.requestData()
        }
      }, 2000)

      mediaRecorder.current.ondataavailable = async (e) => {
        audioChunks.current.push(e.data)
        
        if (mediaRecorder.current?.state === 'recording' && e.data.size > 0) {
          try {
            const formData = new FormData()
            formData.append('file', e.data, 'chunk.wav')
            formData.append('streamId', streamId)
            const res = await jobsAPI.stream(formData)
            if (res.data.text) {
              const fullText = res.data.text.trim()
              liveTextBuffer.current = fullText
              onTextSend?.(fullText, true) // Replace/Reset the display with full latest text
            }
          } catch (err) {
            console.warn('Live transcription error:', err)
          }
        }
      }

      mediaRecorder.current.onstop = () => {
        clearInterval(liveInterval)
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/mpeg' })
        const file = new File([audioBlob], `ghi-am-live-${Date.now()}.mp3`, { type: 'audio/mpeg' })
        
        // Finalize: If we have captured text, we can send it for GEC
        if (liveTextBuffer.current.trim()) {
          // Special handling for live session end: send the full raw text for GEC
          onTextSend?.(liveTextBuffer.current.trim(), false, true) // isLive=false, isFinal=true
        }
        
        setSelectedFile(file)
      }

      mediaRecorder.current.start()
      setIsRecording(true)
    } catch {
      toast.error('Không thể truy cập Microphone')
    }
  }

  const stopRecording = () => {
    mediaRecorder.current?.stop()
    setIsRecording(false)
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith('audio/')) return <FileAudio size={14} />
    if (file.type.startsWith('video/')) return <Video size={14} />
    return <FileText size={14} />
  }

  return (
    <div className="gemini-input-box" {...getRootProps()} data-drag={isDragActive}>
      <input {...getInputProps()} />

      {/* File preview */}
      {selectedFile && (
        <div className="gemini-file-chip">
          {getFileIcon(selectedFile)}
          <span>{selectedFile.name}</span>
          <button className="chip-close" onClick={() => setSelectedFile(null)}><X size={12} /></button>
          {uploading && <Loader2 size={12} className="animate-spin" />}
        </div>
      )}

      {/* Main Row */}
      <div className="input-row-main">
        <button className="icon-btn-round plus-btn" onClick={open} title="Tải lên tài liệu">
          <Plus size={20} />
        </button>

        <textarea
          className="gemini-text-input-area"
          placeholder={isRecording ? 'Đang lắng nghe bài giảng...' : 'Hỏi trợ lý bài giảng của bạn...'}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAction())}
          disabled={uploading}
        />

        <div className="input-right-group">
          {selectedFile || text.trim() ? (
            <button className="icon-btn-round send-btn active" onClick={handleAction} title="Gửi">
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          ) : (
            <button 
              className={`icon-btn-round mic-btn ${isRecording ? 'active' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? 'Dừng ghi âm' : 'Ghi âm trực tiếp'}
            >
              {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={20} />}
            </button>
          )}
        </div>
      </div>

      <div className="input-footer-row">
        <div className="model-badge">
          <RefreshCw size={12} />
          <span>Xử lý: Nhanh</span>
        </div>
        <div className="input-hint">AI có thể đưa ra câu trả lời không chính xác.</div>
      </div>
    </div>
  )
}