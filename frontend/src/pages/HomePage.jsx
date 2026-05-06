import { useEffect, useRef, useState } from 'react'
import useAppStore from '../store/useAppStore'
import { chatAPI } from '../services/api'
import toast from 'react-hot-toast'
import AudioUploader from '../components/AudioUploader'
import JobResult from '../components/JobResult'
import ChatMessage from '../components/ChatMessage'
import './HomePage.css'

export default function HomePage() {
  const { user, triggerNewChat } = useAppStore()
  const [messages, setMessages] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [chatTitle, setChatTitle] = useState('')
  const [liveTranscript, setLiveTranscript] = useState('') // For real-time feedback
  const scrollRef = useRef(null)

  const handleJobStarted = (jobId) => {
    setMessages(prev => [...prev, { type: 'job', id: jobId }])
  }

  const handleTextSend = async (text, isLive = false, isFinal = false) => {
    if (!text.trim()) return

    if (isLive) {
      setLiveTranscript(text.trim())
      return
    }

    if (isFinal) {
      // Special: Real-time session end, process the whole thing
      setIsThinking(true)
      try {
        const { jobsAPI } = await import('../services/api')
        const res = await jobsAPI.processLiveText(text)
        const { cleanText, summary, jobId } = res.data
        
        setMessages(prev => [...prev, 
          { type: 'chat', role: 'assistant', content: `📝 Đã phân tích xong phiên học tập trực tiếp.\n\n**Văn bản đã sửa lỗi:** ${cleanText}\n\n**Tóm tắt:** ${summary}` },
          { type: 'job', id: jobId }
        ])
      } catch (err) {
        toast.error('Lỗi khi xử lý phiên học tập')
      } finally {
        setIsThinking(false)
        setLiveTranscript('')
      }
      return
    }

    // Reset live transcript when a final message is sent
    setLiveTranscript('')

    // Set dynamic header title from first message
    if (!chatTitle) setChatTitle(text.slice(0, 60))

    setMessages(prev => [...prev, { type: 'chat', role: 'user', content: text }])
    setIsThinking(true)

    try {
      // Extract history for context
      const history = messages
        .filter(m => m.type === 'chat')
        .map(m => ({ role: m.role, content: m.content }))
      
      // Get the most recent jobId from the current session messages
      const lastJob = [...messages].reverse().find(m => m.type === 'job')
      const currentJobId = lastJob?.id

      const res = await chatAPI.sendMessage(text, currentJobId, history)
      const aiMsg = res.data.message || res.data.reply || ''
      setMessages(prev => [...prev, { type: 'chat', role: 'assistant', content: aiMsg }])
    } catch (err) {
      toast.error('Không thể kết nối tới trợ lý')
      console.error(err)
    } finally {
      setIsThinking(false)
    }
  }

  const handleDismiss = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Clear chat when sidebar "Cuộc trò chuyện mới" is clicked
  useEffect(() => {
    if (triggerNewChat > 0) {
      setMessages([])
      setChatTitle('')
    }
  }, [triggerNewChat])

  const isNewChat = messages.length === 0

  return (
    <>
      {/* ── PRESENTATION READY DUAL PANEL ───────────────────────────────────────── */}
      <div className="presentation-container">
        
        {/* Main Panel: Final Results & Chat */}
        <div className="main-panel">
          {isNewChat ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <h1 className="hero-greeting">
                Chào {user?.name || 'bạn'}, hôm nay chúng ta học gì?
              </h1>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '600px' }}>
                <button className="chip" onClick={() => handleTextSend('Tóm tắt bài giảng')}>📝 Tóm tắt</button>
                <button className="chip" onClick={() => handleTextSend('Hướng dẫn sử dụng hệ thống')}>💡 Hướng dẫn sử dụng</button>
              </div>
            </div>
          ) : (
            <div className="chat-thread" style={{ width: '100%' }}>
              {messages.map((m, idx) =>
                m.type === 'job' ? (
                  <JobResult key={m.id || idx} jobId={m.id} onDismiss={() => handleDismiss(m.id)} />
                ) : (
                  <div key={idx} className={`chat-card ${m.role}`}>
                    {m.content}
                  </div>
                )
              )}
              {isThinking && (
                <div className="chat-card assistant">
                  <div className="typing-indicator"><span /><span /><span /></div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {/* Side Panel: Live Feedback & Keywords */}
        <div className="side-panel">
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#ef4444', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-dot" /> Trực tiếp (Raw)
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', fontSize: '1.15rem', lineHeight: '1.8', color: 'var(--text-main)', fontWeight: '500' }}>
            {liveTranscript || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '400' }}>Đang đợi tín hiệu âm thanh từ bài giảng...</span>}
          </div>
          
          {liveTranscript && (
            <div className="waveform-container" style={{ marginTop: '16px' }}>
              {[...Array(15)].map((_, i) => <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />)}
            </div>
          )}
        </div>

      </div>

      {/* ── FOOTER INPUT ────────────────────────────────────────────────────────── */}
      <div className="chat-footer-input">
        <div>
          <AudioUploader
            onJobStarted={handleJobStarted}
            onTextSend={handleTextSend}
          />
          <p className="footer-disclaimer">
            AI có thể đưa ra câu trả lời không chính xác, hãy kiểm tra lại các thông tin quan trọng.
          </p>
        </div>
      </div>
    </>
  )
}
