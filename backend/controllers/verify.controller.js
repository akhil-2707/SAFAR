const jwt = require('jsonwebtoken');
const { dbStore } = require('../config/db');
const { blockchainInstance } = require('../services/blockchainService');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Valid Rescue / Police Master PINs for Emergency Medical Unlock (DPDP Override)
const EMERGENCY_MASTER_PINS = ['1122', '9999', '112'];

// 1. Resolve Verification by Hash or Tourist ID with Strict DPDP Role-Based Masking
function getVerification(req, res) {
  try {
    const identifier = req.params.hash || req.params.touristId || req.query.hash || req.query.touristId;
    const { pin, otp } = req.query;

    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Verification Hash or Tourist ID is required' });
    }

    const cleanId = identifier.trim();

    // Check optional JWT auth from header
    let authUser = req.user;
    if (!authUser && req.headers && req.headers['authorization']) {
      try {
        const token = req.headers['authorization'].split(' ')[1];
        if (token) authUser = jwt.verify(token, JWT_SECRET);
      } catch (e) {}
    }

    const tourists = dbStore.get('tourists');
    const digitalIds = dbStore.get('digitalIds');
    const verificationRecords = dbStore.get('verificationRecords');
    const medicalProfiles = dbStore.get('medicalProfiles');
    const checkpoints = dbStore.get('checkpoints');

    // Find Digital ID by hash or touristId
    const digitalId = digitalIds.find((d) => 
      (d.digitalIdHash && (d.digitalIdHash.toLowerCase() === cleanId.toLowerCase() || d.digitalIdHash.startsWith(cleanId) || cleanId.startsWith(d.digitalIdHash.substring(0, 16)))) ||
      (d.touristId && d.touristId.toLowerCase() === cleanId.toLowerCase()) ||
      (d.blockchainTxHash && d.blockchainTxHash.toLowerCase() === cleanId.toLowerCase())
    );

    // Find Tourist Profile
    let tourist = null;
    if (digitalId) {
      tourist = tourists.find((t) => t.touristId === digitalId.touristId);
    } else {
      tourist = tourists.find((t) => 
        t.touristId.toLowerCase() === cleanId.toLowerCase() ||
        t.id === cleanId
      );
    }

    // If neither is found, return TAMPERED_INVALID response
    if (!digitalId && !tourist) {
      return res.json({
        success: true,
        verified: false,
        status: 'TAMPERED_INVALID',
        displayStatus: '🔴 TAMPERED / INVALID',
        message: 'Cryptographic signature or hash mismatch. No matching cryptographic credential found on S.A.F.A.R. Ledger. Alert checkpoint guard.',
        tourist: null,
        digitalId: null,
        isMasked: true
      });
    }

    const targetTid = tourist ? tourist.touristId : digitalId.touristId;
    const vRecord = verificationRecords.find((v) => v.touristId === targetTid);
    const mProfile = medicalProfiles.find((m) => m.touristId === targetTid) || {
      bloodGroup: tourist?.bloodGroup || 'O+',
      conditions: tourist?.medicalConditions ? [tourist.medicalConditions] : ['None reported'],
      allergies: tourist?.allergies || 'None reported',
      emergencyContact: tourist?.emergencyContact
    };

    const assignedCheckpointId = tourist?.entryCheckpoint || vRecord?.entryCheckpoint || 'CHK-GW-01';
    const checkpoint = checkpoints.find((c) => c.id === assignedCheckpointId) || {
      id: assignedCheckpointId,
      name: 'Guwahati Entry Gateway Desk'
    };

    // Cross-verify with Consortium Ledger
    const ledgerAudit = blockchainInstance.verifyDigitalID(targetTid, digitalId?.digitalIdHash);

    // Determine Status
    let rawStatus = vRecord?.status || tourist?.idVerificationStatus || digitalId?.verificationStatus || 'PENDING_REVIEW';

    // Check if tampered via demo hook or ledger hash failure
    let warningMessage = '';
    let displayStatus = '';

    if (blockchainInstance.isTampered || !ledgerAudit.chainValid) {
      rawStatus = 'TAMPERED_INVALID';
      displayStatus = '🔴 TAMPERED / INVALID';
      warningMessage = 'Cryptographic signature or hash mismatch. Unauthorized block alteration detected! Alert checkpoint guard.';
    } else if (rawStatus === 'VERIFIED') {
      displayStatus = '🟢 VERIFIED TOURIST ID';
      warningMessage = 'Digital Tourist ID Authenticity Cryptographically Secured on S.A.F.A.R. Zero-Gas Consortium Ledger.';
    } else if (rawStatus === 'PROVISIONALLY_ACTIVE') {
      displayStatus = '🔵 PROVISIONALLY ACTIVE';
      warningMessage = 'Pass is provisionally cleared via DigiLocker e-KYC. Final physical checkpoint stamp pending.';
    } else if (rawStatus === 'REJECTED') {
      displayStatus = '🔴 REJECTED';
      warningMessage = `Pass has been rejected by checkpoint authorities. Reason: ${vRecord?.rejectionReason || 'Restricted entry.'}`;
    } else {
      rawStatus = 'PENDING_REVIEW';
      displayStatus = '🟡 PENDING APPROVAL';
      warningMessage = 'Pass is under review by checkpoint authorities. Restricted access.';
    }

    // Role-Based DPDP Access Control:
    // Check if Emergency Medical override is unlocked:
    // 1. Valid Master PIN provided in query or body (e.g. 1122 or 9999)
    // 2. Authenticated user is AUTHORITY or POLICE or RESCUE
    // 3. User is viewing their own profile
    const isPinAuthorized = Boolean(pin && EMERGENCY_MASTER_PINS.includes(pin.trim()));
    const isSessionAuthorized = Boolean(
      authUser && (authUser.role === 'AUTHORITY' || authUser.role === 'POLICE' || authUser.touristId === targetTid)
    );
    const canAccessMedical = isPinAuthorized || isSessionAuthorized;

    // Masked Origin for DPDP Compliance:
    // Only city & state shown to public/hotel; street address is completely masked
    const originCityState = tourist?.origin?.city
      ? `${tourist.origin.city}, ${tourist.origin.state || ''}, ${tourist.origin.country || 'India'}`
      : (typeof tourist?.origin === 'string' ? tourist.origin : 'India');

    // Basic Public/Hotel Info
    const publicProfile = {
      touristId: targetTid,
      fullName: tourist?.fullName || digitalId?.fullName || 'Verified Tourist',
      photoUrl: tourist?.photoUrl || null,
      originCityState,
      destination: tourist?.destination || 'Authorized National Circuit',
      clearanceValidity: `${tourist?.travelStartDate || '2026-09-01'} to ${tourist?.travelEndDate || '2026-09-30'}`,
      entryCheckpoint: {
        id: checkpoint.id,
        name: checkpoint.name,
        officerName: vRecord?.approvingOfficerName || checkpoint.officerName
      },
      status: rawStatus,
      displayStatus,
      message: warningMessage,
      blockchainProof: {
        txHash: digitalId?.blockchainTxHash || vRecord?.blockchainTxHash || ledgerAudit.verificationHash || '0x0000000000000000',
        blockIndex: digitalId?.blockIndex || 1,
        ledgerProof: `SHA256:${digitalId?.blockchainTxHash || vRecord?.blockchainTxHash || ''}`,
        network: 'S.A.F.A.R. Zero-Gas Consortium Ledger (PoA)'
      }
    };

    // Emergency Rescue Override Data
    let emergencyMedical = null;
    if (canAccessMedical) {
      emergencyMedical = {
        unlocked: true,
        bloodGroup: mProfile.bloodGroup || 'O+',
        chronicConditions: Array.isArray(mProfile.conditions) ? mProfile.conditions : [mProfile.conditions || 'None reported'],
        allergies: mProfile.allergies || 'None reported',
        emergencyContact: {
          name: mProfile.emergencyContact?.name || tourist?.emergencyContact?.name || 'Emergency Contact',
          phone: mProfile.emergencyContact?.phone || tourist?.emergencyContact?.phone || '112',
          relation: mProfile.emergencyContact?.relation || tourist?.emergencyContact?.relation || 'Family'
        },
        fullAddress: tourist?.origin?.street 
          ? `${tourist.origin.street}, ${tourist.origin.city}, ${tourist.origin.state} - ${tourist.origin.postalCode || ''}`
          : originCityState,
        unlockedVia: isPinAuthorized ? 'POLICE_MASTER_PIN' : (authUser?.role || 'AUTHORIZED_SESSION')
      };
    }

    return res.json({
      success: true,
      verified: rawStatus === 'VERIFIED' || rawStatus === 'PROVISIONALLY_ACTIVE',
      status: rawStatus,
      displayStatus,
      message: warningMessage,
      tourist: publicProfile,
      emergencyMedical,
      isMedicalMasked: !canAccessMedical,
      digitalId: digitalId ? {
        id: digitalId.id,
        touristId: digitalId.touristId,
        issuedAt: digitalId.issuedAt,
        digitalSignature: digitalId.digitalSignature,
        offlineEnvelope: digitalId.offlineEnvelope
      } : null,
      verificationRecord: vRecord ? {
        id: vRecord.id,
        status: vRecord.status,
        approvalTimestamp: vRecord.approvalTimestamp,
        rejectionReason: vRecord.rejectionReason,
        approvingOfficerName: vRecord.approvingOfficerName
      } : null
    });
  } catch (err) {
    console.error('Verification query error:', err);
    return res.status(500).json({ success: false, error: 'Verification resolution failed' });
  }
}

// 2. Emergency PIN Unlock Verification Endpoint
function unlockEmergencyMedical(req, res) {
  try {
    const { touristId, pin } = req.body;

    if (!touristId || !pin) {
      return res.status(400).json({ success: false, error: 'Tourist ID and Master PIN are required' });
    }

    if (!EMERGENCY_MASTER_PINS.includes(pin.trim())) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Police/Rescue Master PIN. Access to confidential health records denied under DPDP Act.'
      });
    }

    const tourists = dbStore.get('tourists');
    const medicalProfiles = dbStore.get('medicalProfiles');

    const tourist = tourists.find((t) => t.touristId === touristId || t.id === touristId);
    if (!tourist) {
      return res.status(404).json({ success: false, error: 'Tourist not found' });
    }

    const mProfile = medicalProfiles.find((m) => m.touristId === tourist.touristId) || {
      bloodGroup: tourist.bloodGroup || 'O+',
      conditions: tourist.medicalConditions ? [tourist.medicalConditions] : ['None reported'],
      allergies: tourist.allergies || 'None reported',
      emergencyContact: tourist.emergencyContact
    };

    return res.json({
      success: true,
      unlocked: true,
      message: '✓ Emergency Medical Override Unlocked via Authorized Police Master PIN.',
      emergencyMedical: {
        bloodGroup: mProfile.bloodGroup || 'O+',
        chronicConditions: Array.isArray(mProfile.conditions) ? mProfile.conditions : [mProfile.conditions || 'None reported'],
        allergies: mProfile.allergies || 'None reported',
        emergencyContact: {
          name: mProfile.emergencyContact?.name || tourist.emergencyContact?.name || 'Emergency Contact',
          phone: mProfile.emergencyContact?.phone || tourist.emergencyContact?.phone || '112',
          relation: mProfile.emergencyContact?.relation || tourist.emergencyContact?.relation || 'Family'
        },
        fullAddress: tourist.origin?.street 
          ? `${tourist.origin.street}, ${tourist.origin.city}, ${tourist.origin.state} - ${tourist.origin.postalCode || ''}`
          : (tourist.origin || 'India')
      }
    });
  } catch (err) {
    console.error('Error unlocking emergency medical:', err);
    return res.status(500).json({ success: false, error: 'Emergency unlock failed' });
  }
}

// 3. Return Authority ECDSA Public Key for Local / Offline Verification
function getAuthorityPublicKey(req, res) {
  try {
    const pkInfo = blockchainInstance.getAuthorityPublicKey();
    return res.json({
      success: true,
      network: 'S.A.F.A.R. Zero-Gas Consortium Ledger',
      ...pkInfo
    });
  } catch (err) {
    console.error('Error exporting public key:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve public key' });
  }
}

// 4. Verify Compact Offline Cryptographic Payload
function verifyOfflineSignature(req, res) {
  try {
    const { envelope, signature } = req.body;

    if (!envelope || !signature) {
      return res.status(400).json({ success: false, error: 'Envelope payload and signature required' });
    }

    const result = blockchainInstance.verifyOfflineEnvelope(envelope, signature);

    return res.json({
      success: true,
      verified: result.isValid,
      algorithm: result.algorithm,
      fingerprint: result.fingerprint,
      decodedEnvelope: envelope,
      status: result.isValid ? (envelope.status || 'VERIFIED') : 'TAMPERED_INVALID',
      message: result.isValid
        ? '✓ Cryptographic ECDSA Signature Validated against Authority Public Key.'
        : '✕ Cryptographic signature verification failed! Data altered or forged.'
    });
  } catch (err) {
    console.error('Offline verify error:', err);
    return res.status(500).json({ success: false, error: 'Failed to verify offline signature' });
  }
}

module.exports = {
  getVerification,
  unlockEmergencyMedical,
  getAuthorityPublicKey,
  verifyOfflineSignature
};
