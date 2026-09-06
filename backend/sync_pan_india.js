const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const mongoose = require('mongoose');
const { getInitialData } = require('./utils/seedData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://akgupta197600_db_user:4TxS6UOnQ3Vx9MAv@mywood.xufejkv.mongodb.net/safar?retryWrites=true&w=majority';

async function sync() {
  try {
    console.log('Connecting to MongoDB Atlas at safar database...');
    await mongoose.connect(MONGO_URI, { dbName: 'safar' });
    const db = mongoose.connection.db;
    const seed = getInitialData();

    for (const u of seed.users) {
      await db.collection('users').updateOne({ email: u.email }, { $set: u }, { upsert: true });
    }
    for (const t of seed.tourists) {
      await db.collection('tourists').updateOne({ touristId: t.touristId }, { $set: t }, { upsert: true });
    }
    for (const d of seed.digitalIds) {
      await db.collection('digitalids').updateOne({ touristId: d.touristId }, { $set: d }, { upsert: true });
    }
    for (const g of seed.geofences) {
      await db.collection('geofences').updateOne({ id: g.id }, { $set: g }, { upsert: true });
    }
    for (const es of seed.emergencyServices) {
      await db.collection('emergencyservices').updateOne({ id: es.id }, { $set: es }, { upsert: true });
    }

    console.log('✓ Successfully synced Taj Mahal & Real-Time Tourist into MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('Sync Error:', err);
    process.exit(1);
  }
}

sync();
