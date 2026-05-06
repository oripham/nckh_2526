const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const jobSchema = new mongoose.Schema({}, { strict: false });
const Job = mongoose.model('Job', jobSchema);

async function checkLatestJob() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const latestJob = await Job.findOne().sort({ createdAt: -1 }).lean();

    if (!latestJob) {
      console.log('❌ No jobs found in database.');
    } else {
      console.log('================ LATEST JOB DATA ================');
      console.log('ID:', latestJob._id);
      console.log('Title:', latestJob.title);
      console.log('Status:', latestJob.status);
      console.log('\n--- PIPELINE ---');
      console.log('Stage 1 (Raw) chars:', latestJob.pipeline?.stage1_raw?.length || 0);
      console.log('Stage 2 (Clean) chars:', latestJob.pipeline?.stage2_clean?.length || 0);
      console.log('Stage 3 (Summary) chars:', latestJob.pipeline?.stage3_summary?.length || 0);
      
      console.log('\n--- TRANSCRIPT ---');
      console.log('Segments count:', latestJob.transcript?.segments?.length || 0);
      
      console.log('\n--- RAG DATA ---');
      console.log('Embeddings dimensions:', latestJob.embeddings?.length || 0);
      
      // Kiểm tra xem đã có chunks chưa
      console.log('\n--- NEW FIELDS (CHUNKS) ---');
      console.log('Chunks exist:', !!latestJob.chunks);
      if (latestJob.chunks) {
        console.log('Number of chunks:', latestJob.chunks.length);
      }
      
      console.log('==================================================');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkLatestJob();
