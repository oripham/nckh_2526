const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');
const {
  uploadAudio,
  streamAudio,
  getJob,
  getJobs,
  deleteJob,
  updateJob,
  cleanupGuest,
  warmup,
  processLiveText,
} = require('../controllers/jobController');

// ─── Guest cleanup ───────────────────────────────────────────────────────────
// DELETE /api/jobs/guest/cleanup — xoá toàn bộ dữ liệu guest (manual call)
router.delete('/guest/cleanup', cleanupGuest);
// POST version for sendBeacon (browser auto-cleanup on tab close)
router.post('/guest/cleanup', cleanupGuest);

// ─── Public (guest + user) ────────────────────────────────────────────────────
// POST /api/jobs/warmup — tải sẵn model cho live
router.post('/warmup', optionalAuth, warmup);

// POST /api/jobs/process-live — xử lý văn bản raw từ live session
router.post('/process-live', optionalAuth, processLiveText);

// POST /api/jobs/upload — không cần đăng nhập, guest vẫn dùng được
router.post('/upload', optionalAuth, upload.single('file'), uploadAudio);

// POST /api/jobs/stream — xử lý chunk âm thanh cho live preview
router.post('/stream', optionalAuth, upload.single('file'), streamAudio);

// GET /api/jobs/:id — poll kết quả theo jobId, guest truy cập được
router.get('/:id', optionalAuth, getJob);

// ─── Chỉ dành cho user đã đăng nhập ──────────────────────────────────────────
// GET /api/jobs — lịch sử cần login
router.get('/', auth, getJobs);

// PATCH /api/jobs/:id — cập nhật tiêu đề
router.patch('/:id', optionalAuth, updateJob);

// DELETE /api/jobs/:id — xóa job
router.delete('/:id', optionalAuth, deleteJob);

module.exports = router;
