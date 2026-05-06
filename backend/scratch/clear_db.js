const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function clearDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asr_demo';
    console.log(`📡 Connecting to: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      console.log(`🧹 Clearing collection: ${collection.collectionName}`);
      await collection.deleteMany({});
    }

    console.log('✨ All data has been cleared successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error clearing database:', err);
    process.exit(1);
  }
}

clearDatabase();
