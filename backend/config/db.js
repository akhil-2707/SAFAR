const dns = require('dns');
// Set public DNS fallback so SRV lookups work seamlessly on all Windows network configurations
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if permissions or env don't allow
}

const mongoose = require('mongoose');
const { getInitialData } = require('../utils/seedData');

let state = null;
let isMongoConnected = false;

function getFallbackInitialState() {
  const initialData = getInitialData();
  return {
    users: initialData.users,
    geofences: initialData.geofences,
    tourists: initialData.tourists,
    digitalIds: initialData.digitalIds,
    emergencyServices: initialData.emergencyServices,
    incidents: initialData.incidents,
    trips: initialData.trips,
    notifications: [
      {
        id: 'notif_01',
        type: 'CRITICAL',
        title: 'SOS Emergency Signal',
        message: 'Tourist TID-1026 (David Miller) triggered SOS in Kaziranga Core Forest Zone.',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        read: false,
        touristId: 'TID-1026'
      },
      {
        id: 'notif_02',
        type: 'HIGH',
        title: 'Geo-fence Border Breach',
        message: 'Tourist TID-1027 (Aarav Sharma) entered Kamrup Restricted Border Buffer.',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        read: false,
        touristId: 'TID-1027'
      },
      {
        id: 'notif_03',
        type: 'MEDIUM',
        title: 'Route Deviation Offset',
        message: 'Tourist TID-1025 (Priya Mukherjee) 3.2km offset from planned route.',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        read: true,
        touristId: 'TID-1025'
      }
    ]
  };
}

function initState() {
  if (!state) {
    state = getFallbackInitialState();
    console.log('✓ S.A.F.A.R. Database State Initialized');
  }
  return state;
}

// Connect to MongoDB Atlas
async function connectMongoDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('ℹ No MONGO_URI provided, using local in-memory store.');
    return;
  }

  try {
    console.log('Connecting to MongoDB Atlas at', uri.replace(/:([^:@]+)@/, ':****@'), '...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000
    });
    isMongoConnected = true;
    console.log('=======================================================');
    console.log('✓ MongoDB Atlas "safar" Database Successfully Connected!');
    console.log('=======================================================');

    // Sync from MongoDB into state
    const db = mongoose.connection.db;
    const collectionsToSync = ['users', 'tourists', 'digitalids', 'geofences', 'incidents', 'emergencyservices', 'trips'];

    for (const colName of collectionsToSync) {
      try {
        const docs = await db.collection(colName).find({}).toArray();
        if (docs && docs.length > 0) {
          // Normalize mongo _id
          const cleanDocs = docs.map(d => {
            const { _id, ...rest } = d;
            return rest;
          });
          const targetKey = colName === 'digitalids' ? 'digitalIds' : colName === 'emergencyservices' ? 'emergencyServices' : colName;
          state[targetKey] = cleanDocs;
          console.log(`✓ Loaded ${cleanDocs.length} ${targetKey} from MongoDB Atlas`);
        }
      } catch (err) {
        console.warn(`Could not sync collection ${colName}:`, err.message);
      }
    }
  } catch (err) {
    console.warn('⚠️ MongoDB Atlas connection notice (using fallback in-memory store):', err.message);
  }
}

const dbStore = {
  get: (collectionName) => {
    const currentState = initState();
    return currentState[collectionName] || [];
  },

  find: (collectionName, filterFn = null) => {
    const items = dbStore.get(collectionName);
    if (!filterFn) return items;
    return items.filter(filterFn);
  },

  findOne: (collectionName, filterFn) => {
    const items = dbStore.get(collectionName);
    return items.find(filterFn) || null;
  },

  findById: (collectionName, id) => {
    return dbStore.findOne(collectionName, (item) => item.id === id || item.touristId === id);
  },

  insert: (collectionName, newItem) => {
    const items = dbStore.get(collectionName);
    if (!newItem.id) {
      newItem.id = `${collectionName}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
    if (!newItem.createdAt) {
      newItem.createdAt = new Date().toISOString();
    }
    items.unshift(newItem);

    // Asynchronously persist to MongoDB Atlas if connected
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const colName = collectionName.toLowerCase();
      mongoose.connection.db.collection(colName).insertOne({ ...newItem }).catch(err => {
        console.error(`Error persisting insert to MongoDB [${colName}]:`, err.message);
      });
    }

    return newItem;
  },

  update: (collectionName, id, updateFields) => {
    const items = dbStore.get(collectionName);
    const index = items.findIndex((item) => item.id === id || item.touristId === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updateFields, updatedAt: new Date().toISOString() };

      // Asynchronously persist update to MongoDB Atlas if connected
      if (isMongoConnected && mongoose.connection.readyState === 1) {
        const colName = collectionName.toLowerCase();
        mongoose.connection.db.collection(colName).updateOne(
          { $or: [{ id }, { touristId: id }] },
          { $set: updateFields }
        ).catch(err => {
          console.error(`Error persisting update to MongoDB [${colName}]:`, err.message);
        });
      }

      return items[index];
    }
    return null;
  },

  remove: (collectionName, id) => {
    const currentState = initState();
    const initialLen = currentState[collectionName].length;
    currentState[collectionName] = currentState[collectionName].filter(
      (item) => item.id !== id && item.touristId !== id
    );

    // Asynchronously persist delete to MongoDB Atlas if connected
    if (isMongoConnected && mongoose.connection.readyState === 1) {
      const colName = collectionName.toLowerCase();
      mongoose.connection.db.collection(colName).deleteOne(
        { $or: [{ id }, { touristId: id }] }
      ).catch(err => {
        console.error(`Error persisting delete to MongoDB [${colName}]:`, err.message);
      });
    }

    return currentState[collectionName].length < initialLen;
  },

  reset: () => {
    state = null;
    return initState();
  }
};

module.exports = {
  dbStore,
  initState,
  connectMongoDB
};
