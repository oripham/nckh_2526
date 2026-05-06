/**
 * ML Service — HTTP client for the Python ML Server.
 * 
 * Replaces geminiService.js. All AI processing is done locally
 * through the FastAPI server at ML_MODEL_URL (default: http://localhost:8000).
 * 
 * Endpoints consumed:
 *   POST /api/transcribe  — Whisper ASR
 *   POST /api/correct     — ViT5 GEC
 *   POST /api/summarize   — ViT5 Summarize
 *   POST /api/qa          — ViT5 QA
 *   POST /api/embed       — Embedding
 *   POST /api/pipeline    — Full pipeline (single call)
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const ML_URL = process.env.ML_MODEL_URL || 'http://localhost:8000';
const ML_TIMEOUT = parseInt(process.env.ML_TIMEOUT || '300000', 10); // 5 min default

const mlClient = axios.create({
  baseURL: ML_URL,
  timeout: ML_TIMEOUT,
});

// ─── Health Check ────────────────────────────────────────────────────────────

/**
 * Check if the ML server is running and models are available.
 * @returns {Promise<{status: string, device: string, models_available: object}>}
 */
async function healthCheck() {
  const res = await mlClient.get('/api/health');
  return res.data;
}

/**
 * Pre-load Whisper model for live sessions.
 */
async function warmup() {
  const res = await mlClient.post('/api/warmup');
  return res.data;
}

// ─── Stage 1: Transcribe (Whisper ASR) ───────────────────────────────────────

/**
 * Transcribe an audio/video file using fine-tuned Whisper.
 * @param {string} filePath - Absolute path to the audio file
 * @param {string} language - Language code (default: 'vi')
 * @returns {Promise<{text: string, segments: Array}>}
 */
async function transcribe(filePath, language = 'vi') {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), {
    filename: path.basename(filePath),
    contentType: getMimeType(filePath),
  });
  form.append('language', language);

  const res = await mlClient.post('/api/transcribe', form, {
    headers: form.getHeaders(),
    timeout: ML_TIMEOUT,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return res.data;
}

/**
 * Transcribe a small chunk of audio for live feedback.
 * @param {string} filePath - Path to the audio chunk
 * @param {string} language - Language code
 * @param {string} streamId - Optional ID for streaming session
 * @returns {Promise<{text: string}>}
 */
async function streamTranscribe(filePath, language = 'vi', streamId = null) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), {
    filename: 'chunk.wav',
    contentType: 'audio/wav',
  });
  form.append('language', language);
  if (streamId) form.append('streamId', streamId);

  const res = await mlClient.post('/api/stream-transcribe', form, {
    headers: form.getHeaders(),
    timeout: 10000, // Stream chunks should be fast
  });
  return res.data;
}

// ─── Stage 2: Correct Text (ViT5 GEC) ───────────────────────────────────────

/**
 * Correct grammatical errors in Vietnamese text.
 * @param {string} rawText - Raw text from Whisper
 * @returns {Promise<{corrected: string}>}
 */
async function correctText(rawText) {
  const res = await mlClient.post('/api/correct', { text: rawText });
  return res.data;
}

// ─── Stage 3: Summarize (ViT5 Summarization) ────────────────────────────────

/**
 * Generate summary, key points, and keywords from clean text.
 * @param {string} cleanText - Corrected text from GEC
 * @returns {Promise<{summary: string, key_points: string[], keywords: string[]}>}
 */
async function summarize(cleanText) {
  const res = await mlClient.post('/api/summarize', { text: cleanText });
  return res.data;
}
/**
 * Generate summary for a list of chat messages.
 * @param {Array<{role: string, content: string}>} messages 
 * @returns {Promise<{text: string}>}
 */
async function summarizeHistory(messages) {
  const res = await mlClient.post('/api/summarize-history', { messages });
  return res.data;
}

// ─── Stage 5: QA (ViT5 Question Answering) ──────────────────────────────────

/**
 * Answer a question based on context from the knowledge base.
 * @param {string} question - User's question
 * @param {string} context - Relevant context documents
 * @returns {Promise<{answer: string}>}
 */
async function answerQuestion(question, context) {
  const res = await mlClient.post('/api/qa', { question, context });
  return res.data;
}

// ─── Embedding ──────────────────────────────────────────────────────────────

/**
 * Generate embedding vector for text (used for RAG retrieval).
 * @param {string} text
 * @returns {Promise<number[]>}
 */
async function generateEmbedding(text) {
  try {
    const res = await mlClient.post('/api/embed', { text });
    return res.data.embedding || [];
  } catch (error) {
    console.error('Embedding Error:', error.message);
    return [];
  }
}

// ─── Full Pipeline (single call) ────────────────────────────────────────────

/**
 * Run the full pipeline: Transcribe → Correct → Summarize → Embed.
 * Alternative to calling each stage separately.
 * 
 * @param {string} filePath - Path to audio file
 * @param {string} language - Language code
 * @returns {Promise<{stage1_raw, stage2_clean, stage3_summary, key_points, keywords, segments, embedding}>}
 */
async function runPipeline(filePath, language = 'vi') {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), {
    filename: path.basename(filePath),
    contentType: getMimeType(filePath),
  });
  form.append('language', language);

  const res = await mlClient.post('/api/pipeline', form, {
    headers: form.getHeaders(),
    timeout: ML_TIMEOUT,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return res.data;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
  };
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * Run specialized document pipeline: Summarize → Chunk → Embed.
 */
async function runDocumentPipeline(text) {
  const res = await mlClient.post('/api/document-pipeline', { text });
  return res.data;
}

module.exports = {
  healthCheck,
  warmup,
  transcribe,
  streamTranscribe,
  correctText,
  summarize,
  summarizeHistory,
  answerQuestion,
  generateEmbedding,
  runPipeline,
  runDocumentPipeline,
};
