const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/asr_db';

async function checkStats() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    
    const job = await db.collection('jobs').findOne({ title: /Sổ tay/ });
    
    if (!job || !job.chunks) {
      console.log('❌ Không tìm thấy dữ liệu Sổ tay.');
      process.exit(1);
    }

    console.log(`📊 Thống kê Chunk cho: "${job.title}"`);
    console.log(`--------------------------------------------------`);
    console.log(`ID | Từ (Words) | Ký tự (Chars) | Ước lượng Token (x1.3)`);
    console.log(`--------------------------------------------------`);

    let totalWords = 0;
    job.chunks.forEach((chunk, i) => {
      const words = chunk.split(/\s+/).filter(Boolean).length;
      const chars = chunk.length;
      const estTokens = Math.round(words * 1.3);
      totalWords += words;
      
      if (i < 5 || i > job.chunks.length - 6) { // In 5 cái đầu và 5 cái cuối
        console.log(`${(i+1).toString().padEnd(2)} | ${words.toString().padEnd(10)} | ${chars.toString().padEnd(13)} | ~${estTokens}`);
      } else if (i === 5) {
        console.log('...');
      }
    });

    console.log(`--------------------------------------------------`);
    console.log(`✅ Tổng số chunk: ${job.chunks.length}`);
    console.log(`✅ Trung bình từ/chunk: ${Math.round(totalWords / job.chunks.length)} từ`);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStats();
