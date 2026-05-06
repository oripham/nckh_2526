/**
 * RAG Service — Retrieval-Augmented Generation using local models.
 * 
 * Flow:
 *   1. Embed the user's question (local embedding model)
 *   2. Find top-k relevant documents via cosine similarity
 *   3. Generate answer using ViT5 QA (local model)
 * 
 * No external API dependencies — everything runs through the ML Server.
 */
const mongoose = require('mongoose');
const Job = require('../models/Job');
const mlService = require('./mlService');

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  // Guard: skip if dimensions don't match (e.g. old Gemini 768d vs new MiniLM 384d)
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += (vecA[i] * vecB[i]);
    mA += (vecA[i] * vecA[i]);
    mB += (vecB[i] * vecB[i]);
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  if (mA === 0 || mB === 0) return 0;
  return dotProduct / (mA * mB);
}

/**
 * Find relevant content from user's knowledge base
 * @param {string} userId 
 * @param {string} query 
 * @returns {Promise<string>} - Context string
 */
async function getRelevantContext(userId, query) {
  try {
    // 1. Generate embedding for the query (local model)
    const queryEmbedding = await mlService.generateEmbedding(query);
    if (!queryEmbedding || !queryEmbedding.length) return null;

    // 2. Find jobs belonging to the user that have semantic chunks
    const orConditions = [
      { userId: { $exists: false } },
      { userId: null }
    ];

    // Chỉ thêm userId vào tìm kiếm nếu nó hợp lệ
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      orConditions.push({ userId: userId });
    }

    const jobs = await Job.find({ 
      $or: orConditions,
      status: 'done',
      chunks: { $exists: true, $not: { $size: 0 } }
    }).select('title chunks chunkEmbeddings');

    if (!jobs.length) {
      console.log(`🔍 RAG: No documents found for search (userId: ${userId})`);
      return null;
    }
    console.log(`🔍 RAG: Searching across ${jobs.length} documents...`);

    // 3. Find the ABSOLUTE BEST chunk across all documents
    let bestChunk = null;
    let maxSim = -1;

    jobs.forEach(job => {
      if (job.chunks && job.chunkEmbeddings) {
        job.chunks.forEach((chunkText, idx) => {
          const chunkVector = job.chunkEmbeddings[idx];
          if (chunkVector) {
            const sim = cosineSimilarity(queryEmbedding, chunkVector);
            if (sim > maxSim) {
              maxSim = sim;
              bestChunk = { text: chunkText, source: job.title };
            }
          }
        });
      }
    });

    if (maxSim < 0.55) {
      console.log(`🔍 RAG: No relevant chunks found (Best sim: ${maxSim.toFixed(3)} < 0.55)`);
      return null;
    }

    console.log(`🔍 RAG: Found best chunk (Sim: ${maxSim.toFixed(3)}) from "${bestChunk.source}"`);
    console.log(`   [Chunk Text]: ${bestChunk.text.substring(0, 500)}${bestChunk.text.length > 500 ? '...' : ''}`);

    // Simplified: No more per-sentence similarity/re-ranking
    return `${bestChunk.text}\n(Nguồn: ${bestChunk.source.substring(0, 50)}...)`;
  } catch (error) {
    console.error('RAG Context Error:', error);
    return null;
  }
}

/**
 * Chat with the knowledge base using local ViT5 QA model.
 * @param {string} userId 
 * @param {string} message 
 * @returns {Promise<string>} - AI response
 */
async function chatWithBrain(userId, message) {
  try {
    const context = await getRelevantContext(userId, message);

    if (!context) {
      // No relevant context found — answer based on question alone
      const result = await mlService.answerQuestion(message, "Không có tài liệu nào liên quan.");
      return result.answer || "Xin lỗi, tôi không tìm thấy thông tin phù hợp trong kho tri thức của bạn để trả lời câu hỏi này.";
    }

    console.log(`🧠 [RAG] Sending question to ViT5 QA: "${message.substring(0, 50)}..."`);
    // Send question + context to ViT5 QA
    const result = await mlService.answerQuestion(message, context);
    console.log(`🧠 [RAG] AI Answer received: "${result.answer?.substring(0, 50)}..."`);
    return result.answer || "Xin lỗi, tôi không thể trả lời câu hỏi này dựa trên tài liệu hiện có.";
  } catch (error) {
    console.error('Brain Chat Error:', error);
    throw error;
  }
}

/**
 * Generate and save a summary of the current chat conversation.
 * @param {string} jobId 
 * @param {Array} messages 
 */
async function generateChatSummary(jobId, messages) {
  try {
    if (!messages || messages.length < 2) return null;
    
    console.log(`🧠 [RAG] Summarizing chat history for job ${jobId}...`);
    const summaryResult = await mlService.summarizeHistory(messages);
    
    if (summaryResult && summaryResult.text) {
      await Job.findByIdAndUpdate(jobId, {
        'chatSummary.content': summaryResult.text,
        'chatSummary.completedAt': new Date()
      });
      return summaryResult.text;
    }
    return null;
  } catch (error) {
    console.error('Chat Summarization Error:', error);
    return null;
  }
}

module.exports = {
  chatWithBrain,
  generateChatSummary,
};
