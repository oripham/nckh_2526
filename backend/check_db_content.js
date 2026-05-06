const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/asr_db';

async function checkDB() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const jobs = await db.collection('jobs').find({ title: /Sổ tay/ }).toArray();
    
    if (jobs.length === 0) {
      console.log('❌ KHÔNG tìm thấy Job nào có tiêu đề "Sổ tay"');
    } else {
      jobs.forEach(job => {
        console.log(`✅ Tìm thấy Job: "${job.title}"`);
        console.log(`   - Status: ${job.status}`);
        console.log(`   - Chunks: ${job.chunks ? job.chunks.length : 0}`);
        console.log(`   - Embeddings: ${job.chunkEmbeddings ? job.chunkEmbeddings.length : 0}`);
        if (job.chunks && job.chunks.length > 0) {
          console.log(`   - Preview chunk 1: ${job.chunks[0].substring(0, 50)}...`);
        }
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Lỗi check DB:', err);
    process.exit(1);
  }
}

checkDB();
