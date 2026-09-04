const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { dbStore } = require('../config/db');
const { blockchainInstance } = require('../services/blockchainService');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Register Tourist & Generate Digital ID + Blockchain Record
function registerTourist(req, res) {
  try {
    const {
      fullName,
      dob,
      gender,
      nationality,
      mobileNumber,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      email,
      password,
      idProofType,
      destination,
      travelStartDate,
      travelEndDate
    } = req.body;

    if (!fullName || !email || !mobileNumber || !destination) {
      return res.status(400).json({ success: false, error: 'Missing required registration fields' });
    }

    // Check existing email
    const existingUser = dbStore.findOne('users', (u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const nextIdNum = dbStore.get('tourists').length + 1029;
    const touristId = `TID-${nextIdNum}`;
    const passwordHash = bcrypt.hashSync(password || 'tourist123', 10);

    // 1. Create User
    const newUser = dbStore.insert('users', {
      name: fullName,
      email,
      password: passwordHash,
      role: 'TOURIST',
      touristId
    });

    // 2. Default initial location (Guwahati Safe Zone)
    const initialLocation = { lat: 26.1445, lng: 91.7362, address: 'Guwahati Entry Checkpoint' };

    // 3. Create Tourist Record
    const newTourist = dbStore.insert('tourists', {
      touristId,
      fullName,
      dob: dob || '1998-05-15',
      gender: gender || 'Other',
      nationality: nationality || 'Indian',
      preferredLanguage: req.body.preferredLanguage || 'en',
      mobileNumber,
      emergencyContact: {
        name: emergencyContactName || 'Emergency Contact',
        phone: emergencyContactPhone || mobileNumber,
        relation: emergencyContactRelation || 'Family'
      },
      email,
      idProofType: idProofType || 'Aadhaar Card',
      idVerificationStatus: 'VERIFIED',
      destination,
      travelStartDate: travelStartDate || new Date().toISOString().split('T')[0],
      travelEndDate: travelEndDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      currentLocation: initialLocation,
      riskScore: 10,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    });

    // 4. Generate SHA-256 Hashed Digital ID
    const rawMeta = `${touristId}:${fullName}:${dob}:${nationality}:${idProofType}`;
    const touristIdHash = crypto.createHash('sha256').update(touristId).digest('hex');
    const digitalIdHash = crypto.createHash('sha256').update(rawMeta).digest('hex');

    // 5. Add Block to Prototype Blockchain Ledger
    const block = blockchainInstance.addBlock({
      touristId,
      touristIdHash,
      digitalIdHash,
      verificationStatus: 'VERIFIED',
      issuer: 'S.A.F.A.R. National Tourism Safety Authority',
      network: 'Prototype Blockchain Ledger',
      travelValidity: `${newTourist.travelStartDate} to ${newTourist.travelEndDate}`
    });

    const newDigitalId = dbStore.insert('digitalIds', {
      id: `did_${touristId}`,
      touristId,
      fullName,
      verificationStatus: 'VERIFIED',
      touristIdHash,
      digitalIdHash,
      blockIndex: block.index,
      blockchainTxHash: block.hash,
      issuedAt: block.timestamp,
      expiryDate: newTourist.travelEndDate,
      digitalSignature: `SIG-SHA256-${digitalIdHash.substring(0, 16).toUpperCase()}`,
      qrCodeData: `https://safetour.gov.in/verify-id/${touristId}?hash=${digitalIdHash.substring(0, 16)}`
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser.id, role: 'TOURIST', email, touristId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Tourist registered and Digital Tourist ID minted on Prototype Blockchain Ledger',
      token,
      user: { id: newUser.id, name: fullName, email, role: 'TOURIST', touristId },
      tourist: newTourist,
      digitalId: newDigitalId
    });
  } catch (err) {
    console.error('Registration Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to complete tourist registration' });
  }
}

// User Login (Tourist or Authority)
function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = dbStore.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, touristId: user.touristId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    let touristProfile = null;
    let digitalId = null;

    if (user.role === 'TOURIST' && user.touristId) {
      touristProfile = dbStore.findOne('tourists', (t) => t.touristId === user.touristId);
      digitalId = dbStore.findOne('digitalIds', (d) => d.touristId === user.touristId);
    }

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        touristId: user.touristId
      },
      tourist: touristProfile,
      digitalId
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
}

function getMe(req, res) {
  const user = dbStore.findOne('users', (u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  let touristProfile = null;
  let digitalId = null;
  if (user.role === 'TOURIST' && user.touristId) {
    touristProfile = dbStore.findOne('tourists', (t) => t.touristId === user.touristId);
    digitalId = dbStore.findOne('digitalIds', (d) => d.touristId === user.touristId);
  }

  return res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, touristId: user.touristId },
    tourist: touristProfile,
    digitalId
  });
}

module.exports = {
  registerTourist,
  login,
  getMe
};
