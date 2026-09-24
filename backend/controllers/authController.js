const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { dbStore } = require('../config/db');
const { blockchainInstance } = require('../services/blockchainService');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Register Tourist & Generate Digital ID + State Machine + Linked Records
function registerTourist(req, res) {
  try {
    const {
      fullName,
      dob,
      gender,
      nationality,
      mobileNumber,
      email,
      password,
      // Origin Details
      originStreet,
      originCity,
      originState,
      originCountry,
      originPostalCode,
      origin,
      // Travel Context
      intendedRoute,
      destination,
      entryCheckpoint = 'CHK-GW-01',
      // Govt ID
      idProofType = 'Aadhaar Card',
      idProofUrl,
      // Medical & Emergency Essentials
      bloodGroup = 'O+',
      medicalConditions,
      allergies,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      // State Machine Options
      fastTrackDigiLocker = true, // Default e-KYC passed -> PROVISIONALLY_ACTIVE
      enforceManualReview = false,
      travelStartDate,
      travelEndDate
    } = req.body;

    if (!fullName || !email || !mobileNumber || !destination) {
      return res.status(400).json({ success: false, error: 'Missing required registration fields' });
    }

    // Check existing email
    const existingUser = dbStore.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const nextIdNum = dbStore.get('tourists').length + 1029;
    const touristId = `TID-${nextIdNum}`;
    const passwordHash = bcrypt.hashSync(password || 'tourist123', 10);

    // Consolidated Origin Object
    const consolidatedOrigin = origin || {
      street: originStreet || 'Permanent Residence',
      city: originCity || 'Guwahati',
      state: originState || 'Assam',
      country: originCountry || 'India',
      postalCode: originPostalCode || '781001'
    };

    // State Machine Determination:
    // If fastTrackDigiLocker is true and not enforceManualReview -> PROVISIONALLY_ACTIVE
    // Else -> PENDING_REVIEW
    const initialStatus = (fastTrackDigiLocker && !enforceManualReview)
      ? 'PROVISIONALLY_ACTIVE'
      : 'PENDING_REVIEW';

    // 1. Create User
    const newUser = dbStore.insert('users', {
      name: fullName,
      email: email.toLowerCase(),
      password: passwordHash,
      role: 'TOURIST',
      touristId,
      origin: consolidatedOrigin,
      isDemo: false,
      isRealUser: true
    });

    // 2. Default initial location based on checkpoint
    const checkpointObj = dbStore.findOne('checkpoints', (c) => c.id === entryCheckpoint) || {
      id: 'CHK-GW-01',
      name: 'Guwahati Entry Gateway Desk'
    };
    const initialLocation = {
      lat: 26.1445,
      lng: 91.7362,
      address: checkpointObj.name || 'Guwahati Entry Gateway Desk',
      isLiveGps: false
    };

    // 3. Create Tourist Record
    const newTourist = dbStore.insert('tourists', {
      touristId,
      fullName,
      isDemo: false,
      isRealUser: true,
      dob: dob || '1998-05-15',
      gender: gender || 'Other',
      nationality: nationality || 'Indian',
      preferredLanguage: req.body.preferredLanguage || 'en',
      mobileNumber,
      email: email.toLowerCase(),
      origin: consolidatedOrigin,
      entryCheckpoint,
      destination,
      intendedRoute: intendedRoute || destination,
      travelStartDate: travelStartDate || new Date().toISOString().split('T')[0],
      travelEndDate: travelEndDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      idProofType,
      idProofUrl: idProofUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      idVerificationStatus: initialStatus,
      bloodGroup,
      medicalConditions: medicalConditions || 'None reported',
      allergies: allergies || 'None reported',
      emergencyContact: {
        name: emergencyContactName || 'Emergency Contact',
        phone: emergencyContactPhone || mobileNumber,
        relation: emergencyContactRelation || 'Family'
      },
      currentLocation: initialLocation,
      riskScore: 10,
      riskLevel: 'LOW',
      isSosActive: false,
      status: 'SAFE',
      lastSeen: new Date().toISOString()
    });

    // 4. Create Linked Medical Profile
    const newMedicalProfile = dbStore.insert('medicalProfiles', {
      id: `med_${touristId}`,
      touristId,
      bloodGroup,
      conditions: Array.isArray(medicalConditions) ? medicalConditions : (medicalConditions ? [medicalConditions] : ['None reported']),
      allergies: allergies || 'None reported',
      emergencyContact: {
        name: emergencyContactName || 'Emergency Contact',
        phone: emergencyContactPhone || mobileNumber,
        relation: emergencyContactRelation || 'Family'
      },
      lastUpdated: new Date().toISOString()
    });

    // 5. Generate SHA-256 Hashed Digital ID + Consortium Ledger Block
    const rawMeta = `${touristId}:${fullName}:${dob || '1998'}:${nationality || 'Indian'}:${idProofType}`;
    const touristIdHash = crypto.createHash('sha256').update(touristId).digest('hex');
    const digitalIdHash = crypto.createHash('sha256').update(rawMeta).digest('hex');

    const block = blockchainInstance.addBlock({
      touristId,
      touristIdHash,
      digitalIdHash,
      verificationStatus: initialStatus,
      issuer: initialStatus === 'PROVISIONALLY_ACTIVE'
        ? 'S.A.F.A.R. DigiLocker e-KYC Verification Gateway'
        : 'S.A.F.A.R. National Tourism Safety Authority',
      network: 'S.A.F.A.R. Zero-Gas Consortium Ledger',
      travelValidity: `${newTourist.travelStartDate} to ${newTourist.travelEndDate}`
    });

    // 6. Generate Compact Offline ECDSA Envelope
    const offlineEnvelope = {
      uuid: touristId,
      bloodGroup,
      exp: newTourist.travelEndDate,
      checkpointId: entryCheckpoint,
      status: initialStatus,
      txHash: block.hash
    };
    const ecdsaSignature = blockchainInstance.signOfflineEnvelope(offlineEnvelope);
    offlineEnvelope.sig = ecdsaSignature;

    const newDigitalId = dbStore.insert('digitalIds', {
      id: `did_${touristId}`,
      touristId,
      fullName,
      verificationStatus: initialStatus,
      touristIdHash,
      digitalIdHash,
      blockIndex: block.index,
      blockchainTxHash: block.hash,
      issuedAt: block.timestamp,
      expiryDate: newTourist.travelEndDate,
      digitalSignature: `SIG-ECDSA-${ecdsaSignature.substring(0, 16).toUpperCase()}`,
      offlineEnvelope,
      qrCodeData: `https://safetour.gov.in/verify/${digitalIdHash.substring(0, 16)}`
    });

    // 7. Create Verification Record
    const rawMedStr = `${bloodGroup}:${medicalConditions || 'None'}:${allergies || 'None'}`;
    const medicalDataDigest = crypto.createHash('sha256').update(rawMedStr).digest('hex');

    const newVerificationRecord = dbStore.insert('verificationRecords', {
      id: `vr_${touristId}`,
      touristId,
      fullName,
      status: initialStatus,
      entryCheckpoint,
      intendedRoute: newTourist.destination,
      origin: consolidatedOrigin,
      govtIdProofType: idProofType,
      govtIdPreviewUrl: newTourist.idProofUrl,
      medicalDataDigest,
      approvingOfficerId: initialStatus === 'PROVISIONALLY_ACTIVE' ? 'DIGILOCKER_EKYC_SYSTEM' : null,
      approvingOfficerName: initialStatus === 'PROVISIONALLY_ACTIVE' ? 'DigiLocker Fast-Track System' : null,
      approvalTimestamp: initialStatus === 'PROVISIONALLY_ACTIVE' ? block.timestamp : null,
      rejectionReason: null,
      blockchainTxHash: block.hash,
      offlineEnvelope,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 8. Generate JWT Token
    const token = jwt.sign(
      { id: newUser.id, role: 'TOURIST', email: email.toLowerCase(), touristId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      success: true,
      message: initialStatus === 'PROVISIONALLY_ACTIVE'
        ? '✓ Tourist registered & Provisionally Cleared via DigiLocker e-KYC. Travel pass ready!'
        : '✓ Tourist registered. Pass under review by checkpoint authority.',
      token,
      status: initialStatus,
      user: { id: newUser.id, name: fullName, email: email.toLowerCase(), role: 'TOURIST', touristId, isDemo: false, isRealUser: true },
      tourist: newTourist,
      digitalId: newDigitalId,
      verificationRecord: newVerificationRecord,
      medicalProfile: newMedicalProfile
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

    let isMatch = false;
    if (user.password && user.password.startsWith('$2')) {
      isMatch = bcrypt.compareSync(password, user.password);
    } else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Check Supreme Authority Clearance for Officers
    const isDG = Boolean(user.isMasterAuthority || user.email?.toLowerCase() === 'akhil@gmail.com');
    if (user.role === 'AUTHORITY' && !isDG) {
      const officerStatus = user.status || 'APPROVED';
      if (officerStatus === 'PENDING_APPROVAL') {
        return res.status(403).json({
          success: false,
          error: 'Officer Clearance Pending: Your account has been registered but is awaiting supreme approval from Director General Akhil Gupta (akhil@gmail.com).'
        });
      }
      if (officerStatus === 'REJECTED') {
        return res.status(403).json({
          success: false,
          error: `Officer Clearance Denied: Your registration was rejected by Supreme Authority (Director General Akhil Gupta). Reason: ${user.rejectionReason || 'Credentials unverified'}`
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, touristId: user.touristId, guideId: user.guideId, isMasterAuthority: isDG },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    let touristProfile = null;
    let guideProfile = null;
    let digitalId = null;

    if (user.role === 'TOURIST' && user.touristId) {
      touristProfile = dbStore.findOne('tourists', (t) => t.touristId === user.touristId);
      digitalId = dbStore.findOne('digitalIds', (d) => d.touristId === user.touristId);
    } else if (user.role === 'GUIDE' && (user.guideId || user.id)) {
      guideProfile = dbStore.findOne('guides', (g) => g.guideId === user.guideId || g.userId === user.id);
      digitalId = guideProfile?.digitalId || null;
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
        touristId: user.touristId,
        guideId: user.guideId,
        phone: user.phone,
        isMasterAuthority: isDG,
        status: isDG ? 'APPROVED' : (user.status || 'APPROVED'),
        isDemo: user.isDemo ?? (touristProfile?.isDemo ?? false),
        isRealUser: user.isRealUser ?? (touristProfile?.isRealUser ?? (user.role === 'TOURIST' && !touristProfile?.isDemo))
      },
      tourist: touristProfile,
      guide: guideProfile,
      digitalId
    });
  } catch (err) {
    console.error('Login Error:', err);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
}

const { generateOTP, verifyOTP, sendOTPEmail } = require('../services/emailService');

function getMe(req, res) {
  const user = dbStore.findOne('users', (u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  let touristProfile = null;
  let guideProfile = null;
  let digitalId = null;
  if (user.role === 'TOURIST' && user.touristId) {
    touristProfile = dbStore.findOne('tourists', (t) => t.touristId === user.touristId);
    digitalId = dbStore.findOne('digitalIds', (d) => d.touristId === user.touristId);
  } else if (user.role === 'GUIDE' && (user.guideId || user.id)) {
    guideProfile = dbStore.findOne('guides', (g) => g.guideId === user.guideId || g.userId === user.id);
    digitalId = guideProfile?.digitalId || null;
  }

  const isDG = Boolean(user.isMasterAuthority || user.email?.toLowerCase() === 'akhil@gmail.com');

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      touristId: user.touristId,
      guideId: user.guideId,
      phone: user.phone,
      isMasterAuthority: isDG,
      status: isDG ? 'APPROVED' : (user.status || 'APPROVED'),
      isDemo: user.isDemo ?? (touristProfile?.isDemo ?? false),
      isRealUser: user.isRealUser ?? (touristProfile?.isRealUser ?? (user.role === 'TOURIST' && !touristProfile?.isDemo))
    },
    tourist: touristProfile,
    guide: guideProfile,
    digitalId
  });
}

// Send OTP to Email
async function sendOTP(req, res) {
  try {
    const { email, purpose = 'LOGIN' } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify if the email is already registered in S.A.F.A.R.
    const registeredUser = dbStore.findOne('users', (u) => u.email && u.email.toLowerCase() === normalizedEmail)
      || dbStore.findOne('tourists', (t) => t.email && t.email.toLowerCase() === normalizedEmail);

    if (purpose === 'REGISTER') {
      if (registeredUser) {
        return res.status(400).json({
          success: false,
          error: 'This email is already registered. Please go to Login.'
        });
      }
    } else {
      // LOGIN mode: Must already be registered!
      if (!registeredUser) {
        return res.status(404).json({
          success: false,
          error: 'Sorry wrong Gmail'
        });
      }
    }

    const otp = generateOTP(normalizedEmail);
    const emailResult = await sendOTPEmail(normalizedEmail, otp, purpose);

    return res.json({
      success: true,
      message: emailResult.sentRealEmail
        ? `✓ Verification OTP sent to your Gmail inbox (${normalizedEmail})! Please check your email.`
        : `Verification OTP dispatched to ${normalizedEmail}`,
      email: normalizedEmail,
      demoOtp: emailResult.sentRealEmail ? null : otp, // Real email active: hide demo OTP
      sentRealEmail: emailResult.sentRealEmail,
      expiresInSeconds: 600
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to send OTP to email' });
  }
}

// Verify OTP and Complete Login
function verifyOTPLogin(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP code are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const verification = verifyOTP(normalizedEmail, otp);

    if (!verification.valid) {
      return res.status(401).json({ success: false, error: verification.error });
    }

    let user = dbStore.findOne('users', (u) => u.email && u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      const tourist = dbStore.findOne('tourists', (t) => t.email && t.email.toLowerCase() === normalizedEmail);
      if (tourist) {
        user = dbStore.insert('users', {
          name: tourist.fullName,
          email: normalizedEmail,
          password: bcrypt.hashSync('tourist123', 10),
          role: 'TOURIST',
          touristId: tourist.touristId,
          isDemo: tourist.isDemo || false,
          isRealUser: true
        });
      } else {
        return res.status(404).json({
          success: false,
          error: 'Sorry wrong Gmail'
        });
      }
    }

    // Role-specific check: if Officer, check clearance status
    const isDG = Boolean(user.isMasterAuthority || user.email?.toLowerCase() === 'akhil@gmail.com');
    if (user.role === 'AUTHORITY' && !isDG) {
      const officerStatus = user.status || 'APPROVED';
      if (officerStatus === 'PENDING_APPROVAL') {
        return res.status(403).json({
          success: false,
          error: 'Officer Clearance Pending: Your account has been registered but is awaiting supreme approval from Director General Akhil Gupta (akhil@gmail.com).'
        });
      }
      if (officerStatus === 'REJECTED') {
        return res.status(403).json({
          success: false,
          error: `Officer Clearance Denied: Your registration was rejected by Supreme Authority (Director General Akhil Gupta). Reason: ${user.rejectionReason || 'Credentials unverified'}`
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, touristId: user.touristId, guideId: user.guideId, isMasterAuthority: isDG },
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
      message: 'OTP verified successfully. Login granted!',
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
    console.error('Verify OTP Login Error:', err);
    return res.status(500).json({ success: false, error: 'OTP login verification failed' });
  }
}

// Verify OTP for Email Validation (e.g. Registration check)
function verifyEmailOTP(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const verification = verifyOTP(normalizedEmail, otp);

    if (!verification.valid) {
      return res.status(400).json({ success: false, error: verification.error });
    }

    return res.json({
      success: true,
      message: `Email ${normalizedEmail} successfully verified!`
    });
  } catch (err) {
    console.error('Verify Email OTP Error:', err);
    return res.status(500).json({ success: false, error: 'OTP verification failed' });
  }
}

// Register Authority Officer / Employee under Command Desk
function registerAuthority(req, res) {
  try {
    const {
      fullName,
      name,
      email,
      password,
      phone,
      department,
      jurisdiction,
      serviceBadgeId,
      designation
    } = req.body;

    const officerName = (fullName || name || '').trim();

    if (!officerName || !email || !password || !department) {
      return res.status(400).json({ success: false, error: 'Full name, email, password, and official department are required' });
    }

    const existingUser = dbStore.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email is already registered in S.A.F.A.R. system' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = `usr_auth_${Date.now()}`;

    const newAuthority = dbStore.insert('users', {
      id: userId,
      name: officerName,
      email: email.toLowerCase(),
      password: passwordHash,
      role: 'AUTHORITY',
      department: department || 'S.A.F.A.R. Incident Response Unit',
      jurisdiction: jurisdiction || 'National Tourism Safety Grid',
      serviceBadgeId: serviceBadgeId || `GOV-${Math.floor(1000 + Math.random() * 9000)}`,
      designation: designation || 'Security Operations Officer',
      phone: phone || '+91 98000 00000',
      status: 'PENDING_APPROVAL',
      isMasterAuthority: false,
      createdAt: new Date().toISOString()
    });

    // Notify Central Command Desk for DG Akhil Gupta
    dbStore.insert('notifications', {
      id: `notif_officer_${Date.now()}`,
      type: 'MEDIUM',
      title: 'New Officer Clearance Request',
      message: `Officer ${officerName} (${department}, Badge: ${newAuthority.serviceBadgeId}) registered. Awaiting clearance approval by DG Akhil Gupta.`,
      timestamp: new Date().toISOString(),
      read: false
    });

    return res.status(201).json({
      success: true,
      pendingApproval: true,
      status: 'PENDING_APPROVAL',
      message: 'Officer registration submitted! Clearance is PENDING supreme approval from Director General Akhil Gupta (akhil@gmail.com). You cannot log in until DG Akhil Gupta grants your security clearance.',
      user: {
        id: newAuthority.id,
        name: newAuthority.name,
        email: newAuthority.email,
        role: newAuthority.role,
        department: newAuthority.department,
        jurisdiction: newAuthority.jurisdiction,
        serviceBadgeId: newAuthority.serviceBadgeId,
        designation: newAuthority.designation,
        status: 'PENDING_APPROVAL',
        isMasterAuthority: false
      }
    });
  } catch (err) {
    console.error('Register Authority Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to register authority officer: ' + err.message });
  }
}

// Get Authority Officers / Staff List
function getAuthorityOfficers(req, res) {
  try {
    const users = dbStore.get('users') || [];
    const officers = users.filter((u) => u.role === 'AUTHORITY').map((u) => {
      const isDG = Boolean(u.isMasterAuthority || u.email?.toLowerCase() === 'akhil@gmail.com');
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        department: u.department,
        jurisdiction: u.jurisdiction || 'Central Command Desk',
        serviceBadgeId: u.serviceBadgeId || (isDG ? 'DG-COMMAND-01' : 'HQ-COMMAND'),
        designation: u.designation || (isDG ? 'Director General & Chief Security Officer' : 'Security Operations Officer'),
        isMasterAuthority: isDG,
        status: isDG ? 'APPROVED' : (u.status || 'APPROVED'),
        approvedBy: isDG ? 'President of India / Ministry of Tourism' : (u.approvedBy || 'DG Akhil Gupta'),
        approvedAt: u.approvedAt || u.createdAt,
        rejectionReason: u.rejectionReason || null,
        phone: u.phone,
        createdAt: u.createdAt
      };
    });

    return res.json({ success: true, count: officers.length, officers });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Approve Officer Clearance (Strictly Director General Akhil Gupta)
function approveOfficer(req, res) {
  try {
    const { id } = req.params;
    const isDG = Boolean(req.user?.isMasterAuthority || req.user?.email?.toLowerCase() === 'akhil@gmail.com');
    if (!isDG) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Only Supreme Authority (Director General Akhil Gupta) has clearance to approve departmental officers.'
      });
    }

    const officer = dbStore.findOne('users', (u) => (u.id === id || u.email?.toLowerCase() === id.toLowerCase()) && u.role === 'AUTHORITY');
    if (!officer) {
      return res.status(404).json({ success: false, error: 'Officer account not found' });
    }

    const updated = dbStore.update('users', officer.id, {
      status: 'APPROVED',
      approvedBy: req.user.name || 'Director General Akhil Gupta',
      approvedAt: new Date().toISOString()
    });

    // Notify Central Command Desk
    dbStore.insert('notifications', {
      id: `notif_officer_approved_${Date.now()}`,
      type: 'LOW',
      title: 'Officer Clearance Granted',
      message: `Director General Akhil Gupta granted supreme clearance to Officer ${officer.name} (${officer.department}).`,
      timestamp: new Date().toISOString(),
      read: false
    });

    return res.json({
      success: true,
      message: `Clearance successfully granted to Officer ${officer.name}! Account is now fully authorized to access the Command Desk.`,
      officer: updated
    });
  } catch (err) {
    console.error('Approve Officer Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Reject Officer Clearance (Strictly Director General Akhil Gupta)
function rejectOfficer(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const isDG = Boolean(req.user?.isMasterAuthority || req.user?.email?.toLowerCase() === 'akhil@gmail.com');
    if (!isDG) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Only Supreme Authority (Director General Akhil Gupta) has clearance to reject departmental officers.'
      });
    }

    const officer = dbStore.findOne('users', (u) => (u.id === id || u.email?.toLowerCase() === id.toLowerCase()) && u.role === 'AUTHORITY');
    if (!officer) {
      return res.status(404).json({ success: false, error: 'Officer account not found' });
    }

    const updated = dbStore.update('users', officer.id, {
      status: 'REJECTED',
      rejectedBy: req.user.name || 'Director General Akhil Gupta',
      rejectionReason: reason || 'Service credentials unverified or failed background screening',
      rejectedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `Clearance for Officer ${officer.name} was rejected.`,
      officer: updated
    });
  } catch (err) {
    console.error('Reject Officer Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  registerTourist,
  registerAuthority,
  getAuthorityOfficers,
  approveOfficer,
  rejectOfficer,
  login,
  getMe,
  sendOTP,
  verifyOTPLogin,
  verifyEmailOTP
};
