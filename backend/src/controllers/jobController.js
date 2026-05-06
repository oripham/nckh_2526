const fs = require('fs');
const path = require('path');
const Job = require('../models/Job');
const User = require('../models/User');
const mlService = require('../services/mlService');
const documentService = require('../services/documentService');
const { uploadToCloud, deleteFromCloud } = require('../services/cloudinaryService');


// ─── UPLOAD & START JOB ──────────────────────────────────────────────────────
exports.uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn file' });
    }

    const { language = 'vi', title } = req.body;
    const mimeType = req.file.mimetype;
    const localPath = req.file.path;
    
    // Detect file type
    let fileType = 'audio';
    if (mimeType.startsWith('video/')) fileType = 'video';
    else if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('officedocument')) fileType = 'document';

    // Upload to Cloudinary (keep local copy until ML server processes it)
    console.log(`☁️  [Upload] Uploading to Cloudinary...`);
    let cloudUrl = null;
    let cloudPublicId = null;
    try {
      // Upload to cloud - but DON'T delete local yet (ML server needs it)
      const { v2: cloudinary } = require('cloudinary');
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key:    process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      let resource_type = 'raw';
      if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) resource_type = 'video';
      const result = await cloudinary.uploader.upload(localPath, {
        resource_type,
        folder: 'student-ai',
        use_filename: true,
        unique_filename: true,
      });
      cloudUrl = result.secure_url;
      cloudPublicId = result.public_id;
      console.log(`✅ [Cloudinary] Uploaded: ${cloudUrl}`);
    } catch (cloudErr) {
      console.warn(`⚠️  [Cloudinary] Upload failed, using local:`, cloudErr.message);
    }

    // Create job with cloud info
    const job = await Job.create({
      userId: req.userId,
      title: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      fileType,
      originalFilename: req.file.originalname,
      filePath: localPath,
      cloudUrl,
      cloudPublicId,
      fileSize: req.file.size,
      mimeType,
      language,
      status: 'pending',
    });

    res.status(202).json({
      message: 'File đã được tải lên, đang xử lý...',
      jobId: job._id,
      status: 'pending',
    });

    // Background processing (local file still exists at this point)
    processJob(job._id, localPath, mimeType, fileType, language);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ─── STREAM CHUNK (LIVE PREVIEW) ─────────────────────────────────────────────
exports.streamAudio = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    
    const { language = 'vi', streamId } = req.body;
    const result = await mlService.streamTranscribe(req.file.path, language, streamId);
    
    // Cleanup chunk immediately
    try { fs.unlinkSync(req.file.path); } catch {}
    
    res.json(result);
  } catch (err) {
    if (req.file) try { fs.unlinkSync(req.file.path); } catch {}
    res.status(500).json({ message: err.message });
  }
};

exports.warmup = async (req, res) => {
  try {
    const result = await mlService.warmup();
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Process raw text from a live session.
 * Performs GEC + Summarization and saves as a completed Job.
 */
exports.processLiveText = async (req, res) => {
  try {
    const { text, title = 'Live Session' } = req.body;
    if (!text) return res.status(400).json({ message: 'No text provided' });

    // 1. Correct Text
    const correctRes = await mlService.correctText(text);
    const cleanText = correctRes.corrected || text;

    // 2. Summarize
    const summaryRes = await mlService.summarize(cleanText);

    // 3. Create Job
    const job = await Job.create({
      userId: req.userId,
      title: `${title} (${new Date().toLocaleTimeString()})`,
      fileType: 'text',
      originalFilename: 'live_session.txt',
      filePath: 'internal',
      status: 'done',
      progress: 100,
      completedAt: new Date(),
      pipeline: {
        stage1_raw: text,
        stage2_clean: cleanText,
        stage3_summary: summaryRes.summary,
      },
      transcript: {
        content: cleanText,
        wordCount: cleanText.split(/\s+/).filter(Boolean).length,
      },
      summary: {
        content: summaryRes.summary,
        keyPoints: summaryRes.key_points || [],
        keywords: summaryRes.keywords || [],
      },
    });

    res.json({ jobId: job._id, cleanText, summary: summaryRes.summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Background: Pipeline 4 bước tuần tự qua ML Server ───────────────────────
async function processJob(jobId, filePath, mimeType, fileType, language = 'vi') {
  try {
    console.log(`🧵 [Background] Starting job ${jobId} (${fileType})...`);
    await Job.findByIdAndUpdate(jobId, { status: 'processing', progress: 5 });

    let stage1_raw = '';
    let stage2_clean = '';
    let stage3_summary = '';
    let keyPoints = [];
    let keywords = [];
    let segments = [];
    let embedding = [];

    const isMedia = mimeType.startsWith('audio/') || mimeType.startsWith('video/');

    if (isMedia) {
      // ── STAGE 1: WHISPER ASR ──
      console.log(`🚀 [Stage 1] Whisper ASR for job ${jobId}...`);
      await Job.findByIdAndUpdate(jobId, { 
        progress: 10, 
        stage: '🎤 Whisper (Fine-tuned) — Nhận dạng giọng nói tiếng Việt...' 
      });
      const transcribeRes = await mlService.transcribe(filePath, language);
      stage1_raw = transcribeRes.text;
      segments = transcribeRes.segments || [];

      if (!stage1_raw.trim()) {
        throw new Error("Không thể nhận diện giọng nói trong file này.");
      }

      // ── STAGE 2: ViT5 GEC ──
      console.log(`🚀 [Stage 2] ViT5 GEC for job ${jobId} (${segments.length} segments)...`);
      await Job.findByIdAndUpdate(jobId, { 
        progress: 35, 
        stage: '✏️ ViT5-GEC (Fine-tuned) — Sửa lỗi chính tả & ngữ pháp...' 
      });
      
      // Pass the list of segments for granular correction
      const rawSegments = segments.map(s => s.text);
      const correctRes = await mlService.correctText(rawSegments);
      
      stage2_clean = correctRes.corrected || stage1_raw;
      
      // Update our segments with corrected text for better RAG
      if (correctRes.segments && correctRes.segments.length === segments.length) {
        segments = segments.map((s, i) => ({
          ...s,
          text: correctRes.segments[i]
        }));
        console.log(`   → Segments updated with corrected text.`);
      }

      // ── STAGE 3: ViT5 SUMMARIZE ──
      console.log(`🚀 [Stage 3] ViT5 Summarize for job ${jobId}...`);
      await Job.findByIdAndUpdate(jobId, { 
        progress: 60, 
        stage: '📝 ViT5-Summarize — Tóm tắt & Trích xuất tri thức...' 
      });
      const summarizeRes = await mlService.summarize(stage2_clean);
      stage3_summary = summarizeRes.summary;
      keyPoints = summarizeRes.key_points || [];
      keywords = summarizeRes.keywords || [];

      // ── STAGE 4: SEMANTIC CHUNKING & EMBEDDING ──
      console.log(`🚀 [Stage 4] Semantic Guard for job ${jobId}...`);
      await Job.findByIdAndUpdate(jobId, { 
        progress: 85, 
        stage: '🧠 Embedding — Tạo vector cho Kho tri thức...' 
      });
      
      // Use the document pipeline for the final clean text to get semantic chunks
      const semanticRes = await mlService.runDocumentPipeline(stage2_clean);
      const chunks = semanticRes.chunks || [];
      const chunkEmbeddings = semanticRes.chunk_embeddings || [];
      embedding = semanticRes.embedding || [];

      console.log(`✅ [Pipeline] Completed: ${chunks.length} semantic chunks created.`);

      // ── Save all results to MongoDB ─────────────────────────────────────────
      await Job.findByIdAndUpdate(jobId, {
        status: 'done',
        progress: 100,
        stage: '✅ Hoàn tất! Đã nạp vào Kho tri thức cá nhân.',
        completedAt: new Date(),
        pipeline: {
          stage1_raw,
          stage2_clean,
          stage3_summary,
        },
        'transcript.content': stage2_clean,
        'transcript.segments': segments,
        'transcript.wordCount': stage2_clean.split(/\s+/).filter(Boolean).length,
        'summary.content': stage3_summary,
        'summary.keyPoints': keyPoints,
        'summary.keywords': keywords,
        embeddings: embedding,
        chunks: chunks,
        chunkEmbeddings: chunkEmbeddings,
      });

    } else if (fileType === 'document') {
      // ── SPECIAL DOCUMENT PIPELINE (PDF/Word) ──
      // Bypasses Whisper and GEC. Focuses on Structure → Summary → Semantic RAG.
      console.log(`📄 [Document Pipeline] Processing ${jobId}...`);
      await Job.findByIdAndUpdate(jobId, { 
        progress: 10, 
        stage: '📄 Đang trích xuất văn bản từ tài liệu...' 
      });

      // 1. Extract text locally at Backend
      const textContent = await documentService.extractText(filePath, mimeType);
      if (!textContent || textContent.trim().length < 5) {
         throw new Error("Tài liệu không có nội dung văn bản có thể trích xuất.");
      }
      stage1_raw = textContent;
      
      await Job.findByIdAndUpdate(jobId, { 
        progress: 30, 
        stage: '📝 ViT5-Summarize — Tóm tắt nội dung tài liệu...' 
      });

      // 2. Call specialized ML document pipeline (Summary + Semantic Chunking + Embed)
      console.log(`🚀 [ML Server] Running document specialized pipeline...`);
      const result = await mlService.runDocumentPipeline(textContent);
      
      stage3_summary = result.summary;
      keyPoints = result.key_points || [];
      keywords = result.keywords || [];
      const chunks = result.chunks || [];
      const chunkEmbeddings = result.chunk_embeddings || [];
      embedding = result.embedding || [];

      console.log(`   → Document processed: ${chunks.length} semantic chunks created.`);
      await Job.findByIdAndUpdate(jobId, { 
        progress: 90, 
        stage: '🧠 Embedding — Tạo vector cho Kho tri thức...' 
      });

      // 3. Save to MongoDB
      await Job.findByIdAndUpdate(jobId, {
        status: 'done',
        progress: 100,
        stage: '✅ Hoàn tất! Đã nạp vào Kho tri thức cá nhân.',
        completedAt: new Date(),
        pipeline: { 
          stage1_raw, 
          stage2_clean: stage1_raw, 
          stage3_summary 
        },
        'transcript.content': stage1_raw,
        'summary.content': stage3_summary,
        'summary.keyPoints': keyPoints,
        'summary.keywords': keywords,
        embeddings: embedding,
        chunks: chunks,
        chunkEmbeddings: chunkEmbeddings,
      });
    }

    // Cleanup local file
    try {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      console.warn(`⚠️ [Cleanup] Error: ${e.message}`);
    }

    const completedJob = await Job.findById(jobId);
    if (completedJob?.userId) {
      await User.findByIdAndUpdate(completedJob.userId, { $inc: { totalJobs: 1 } });
    }
    console.log(`✅ [Background] Job ${jobId} completed successfully`);

  } catch (err) {
    console.error(`❌ [Background] Job ${jobId} failed:`, err);
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
    await Job.findByIdAndUpdate(jobId, {
      status: 'failed',
      errorMessage: err.message,
      progress: 0,
    });
  }
}


// ─── GET JOB (poll status) ───────────────────────────────────────────────────
// Guest có thể truy cập bằng jobId (không cần đăng nhập)
exports.getJob = async (req, res) => {
  try {
    const { isValid } = require('mongoose').Types.ObjectId;
    if (!isValid(req.params.id)) {
      return res.status(404).json({ message: 'Không tìm thấy job (ID không hợp lệ)' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Không tìm thấy job' });

    // Nếu đã đăng nhập, kiểm tra job có thuộc về user không
    // (guest job có userId = null → ai cũng truy cập được bằng ID)
    if (job.userId && req.userId && job.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET ALL JOBS (lịch sử) ──────────────────────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { userId: req.userId };
    if (status) filter.status = status;
    if (search) filter.$text = { $search: search };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-transcript.segments'), // bỏ segments để nhẹ hơn
      Job.countDocuments(filter),
    ]);

    res.json({
      jobs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE JOB ──────────────────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Không tìm thấy job' });
    if (job.userId && req.userId && job.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Không có quyền xóa' });
    }

    // Delete from Cloudinary if exists
    if (job.cloudPublicId) {
      await deleteFromCloud(job.cloudPublicId, job.mimeType);
    }

    // Delete local file if still exists
    if (job.filePath && fs.existsSync(job.filePath)) {
      fs.unlinkSync(job.filePath);
    }

    await job.deleteOne();
    res.json({ message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── UPDATE TITLE ─────────────────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    const { title } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Không tìm thấy job' });
    if (job.userId && req.userId && job.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa' });
    }
    job.title = title;
    await job.save();
    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── CLEANUP GUEST DATA ──────────────────────────────────────────────────────
exports.cleanupGuest = async (req, res) => {
  try {
    // Find all guest jobs (no userId)
    const guestJobs = await Job.find({ userId: null });
    
    // Delete local files
    for (const job of guestJobs) {
      if (job.filePath && fs.existsSync(job.filePath)) {
        fs.unlinkSync(job.filePath);
      }
    }

    // Delete from DB (Exclude Pre-loaded system jobs)
    const result = await Job.deleteMany({ 
      userId: null,
      title: { $not: /Pre-loaded/ } 
    });
    console.log(`🧹 [Cleanup] Deleted ${result.deletedCount} guest jobs.`);
    
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
