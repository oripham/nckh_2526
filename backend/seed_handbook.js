const fs = require('fs');
const axios = require('axios');
const mongoose = require('mongoose');
const pdf = require('pdf-parse');

// Cấu hình
const ML_SERVER_URL = 'http://192.168.1.205:8000';
const MONGO_URI = 'mongodb://localhost:27017/asr_db';
const PDF_PATH = 'd:/nckh2526/Demo-ASR/data_test/Sổ tay sinh viên Khóa 64.pdf';

// Định nghĩa Schema tối giản để seed
const jobSchema = new mongoose.Schema({
  title: String,
  fileType: { type: String, default: 'document' },
  status: { type: String, default: 'done' },
  originalFilename: String,
  filePath: String,
  chunks: [String],
  chunkEmbeddings: [[Number]],
  pipeline: { stage2_clean: String },
  transcript: { content: String },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

async function seed() {
  try {
    console.log('🚀 Đang kết nối MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Đã kết nối MongoDB.');

    console.log('📄 Đang đọc file PDF...');
    const dataBuffer = fs.readFileSync(PDF_PATH);
    const pdfData = await pdf(dataBuffer);
    const fullText = pdfData.text;
    console.log(`✅ Đã trích xuất ${fullText.length} ký tự.`);

    // Chia nhỏ text để tránh timeout ML Server (mỗi lần 10.000 ký tự)
    const segmentSize = 10000;
    const segments = [];
    for (let i = 0; i < fullText.length; i += segmentSize) {
      segments.push(fullText.substring(i, i + segmentSize));
    }

    console.log(`🧩 Chia tài liệu thành ${segments.length} phần để xử lý...`);

    let allChunks = [];
    let allEmbeddings = [];

    for (let i = 0; i < segments.length; i++) {
      console.log(`⏳ Đang xử lý phần ${i + 1}/${segments.length}...`);
      try {
        const response = await axios.post(`${ML_SERVER_URL}/api/document-pipeline`, {
          text: segments[i]
        }, { timeout: 300000 }); // 5 phút timeout cho chắc

        if (response.data && response.data.chunks) {
          allChunks = allChunks.concat(response.data.chunks);
          // ML Server trả về chunk_embeddings (snake_case)
          const embeddings = response.data.chunk_embeddings || response.data.chunkEmbeddings || [];
          allEmbeddings = allEmbeddings.concat(embeddings);
        }
      } catch (err) {
        console.error(`❌ Lỗi ở phần ${i + 1}:`, err.message);
      }
    }

    console.log(`💾 Đang lưu vào Database (${allChunks.length} chunks)...`);
    
    const newJob = new Job({
      title: 'Sổ tay sinh viên Khóa 64 (Pre-loaded)',
      originalFilename: 'Sổ tay sinh viên Khóa 64.pdf',
      filePath: PDF_PATH,
      chunks: allChunks,
      chunkEmbeddings: allEmbeddings,
      pipeline: { stage2_clean: fullText.substring(0, 5000) + '...' }, // Preview
      transcript: { content: fullText },
      status: 'done'
    });

    await newJob.save();
    console.log('⭐⭐⭐ HOÀN THÀNH! Dữ liệu đã sẵn sàng trong App của em.');
    process.exit(0);

  } catch (err) {
    console.error('💥 Lỗi tổng thể:', err);
    process.exit(1);
  }
}

seed();
