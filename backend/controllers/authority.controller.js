const crypto = require('crypto');
const { dbStore } = require('../config/db');
const { blockchainInstance } = require('../services/blockchainService');

// 1. Get List of Gateway Checkpoints
function getCheckpoints(req, res) {
  try {
    const checkpoints = dbStore.get('checkpoints');
    return res.json({
      success: true,
      count: checkpoints.length,
      checkpoints
    });
  } catch (err) {
    console.error('Error fetching checkpoints:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve checkpoints' });
  }
}

// 2. Real-Time Verification Queue filtered by Entry Checkpoint & Status
function getCheckpointQueue(req, res) {
  try {
    const { checkpointId, status, search } = req.query;

    const tourists = dbStore.get('tourists');
    const verificationRecords = dbStore.get('verificationRecords');
    const medicalProfiles = dbStore.get('medicalProfiles');
    const digitalIds = dbStore.get('digitalIds');
    const checkpoints = dbStore.get('checkpoints');

    let queue = tourists.map((t) => {
      const vRecord = verificationRecords.find((v) => v.touristId === t.touristId) || {
        id: `vr_${t.touristId}`,
        touristId: t.touristId,
        fullName: t.fullName,
        status: t.idVerificationStatus || 'PENDING_REVIEW',
        entryCheckpoint: t.entryCheckpoint || 'CHK-GW-01',
        intendedRoute: t.destination,
        origin: t.origin || { city: 'Unknown', state: 'Unknown', country: 'India' },
        govtIdProofType: t.idProofType || 'Aadhaar Card',
        govtIdPreviewUrl: t.idProofUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        rejectionReason: null
      };

      const mProfile = medicalProfiles.find((m) => m.touristId === t.touristId) || {
        bloodGroup: t.bloodGroup || 'O+',
        conditions: t.medicalConditions ? [t.medicalConditions] : ['None reported'],
        allergies: t.allergies || 'None reported',
        emergencyContact: t.emergencyContact
      };

      const dId = digitalIds.find((d) => d.touristId === t.touristId);
      const chkPoint = checkpoints.find((c) => c.id === (t.entryCheckpoint || vRecord.entryCheckpoint)) || {
        id: t.entryCheckpoint || 'CHK-GW-01',
        name: 'Guwahati Entry Gateway Desk'
      };

      // Flag high-risk medical alerts
      const medicalConditionsList = Array.isArray(mProfile.conditions) 
        ? mProfile.conditions 
        : [mProfile.conditions || 'None'];
      const hasHighRiskCondition = medicalConditionsList.some((c) => 
        /asthma|altitude|heart|cardiac|hypertension|diabetes/i.test(c)
      );

      return {
        touristId: t.touristId,
        fullName: t.fullName,
        photoUrl: t.photoUrl || null,
        mobileNumber: t.mobileNumber,
        email: t.email,
        origin: t.origin || { city: 'Guwahati', state: 'Assam', country: 'India' },
        destination: t.destination,
        entryCheckpoint: chkPoint,
        travelValidity: `${t.travelStartDate} to ${t.travelEndDate}`,
        status: vRecord.status || t.idVerificationStatus || 'PENDING_REVIEW',
        idProofType: t.idProofType || 'Aadhaar Card',
        idProofUrl: vRecord.govtIdPreviewUrl || t.idProofUrl,
        medicalProfile: {
          bloodGroup: mProfile.bloodGroup || 'O+',
          conditions: medicalConditionsList,
          allergies: mProfile.allergies || 'None reported',
          emergencyContact: mProfile.emergencyContact || t.emergencyContact
        },
        hasHighRiskCondition,
        blockchainTxHash: vRecord.blockchainTxHash || dId?.blockchainTxHash || null,
        rejectionReason: vRecord.rejectionReason || null,
        approvalTimestamp: vRecord.approvalTimestamp || null,
        offlineEnvelope: dId?.offlineEnvelope || vRecord.offlineEnvelope || null,
        riskScore: t.riskScore || 10,
        riskLevel: t.riskLevel || 'LOW',
        isRealUser: t.isRealUser ?? false
      };
    });

    // Checkpoint Filter
    if (checkpointId && checkpointId !== 'ALL') {
      queue = queue.filter((item) => item.entryCheckpoint.id === checkpointId);
    }

    // Status Filter
    if (status && status !== 'ALL') {
      queue = queue.filter((item) => item.status === status);
    }

    // Search Query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      queue = queue.filter((item) => 
        item.fullName.toLowerCase().includes(q) ||
        item.touristId.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q))
      );
    }

    // Compute queue statistics
    const stats = {
      total: tourists.length,
      pending: queue.filter((q) => q.status === 'PENDING_REVIEW').length,
      provisional: queue.filter((q) => q.status === 'PROVISIONALLY_ACTIVE').length,
      verified: queue.filter((q) => q.status === 'VERIFIED').length,
      rejected: queue.filter((q) => q.status === 'REJECTED').length
    };

    return res.json({
      success: true,
      count: queue.length,
      stats,
      queue
    });
  } catch (err) {
    console.error('Error fetching checkpoint queue:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve checkpoint queue' });
  }
}

// 3. Approve Entry Pass (Commit to Zero-Gas Consortium Ledger)
function approveEntryPass(req, res) {
  try {
    const {
      touristId,
      checkpointId = 'CHK-GW-01',
      approvingOfficerId = 'usr_auth_01',
      approvingOfficerName = 'Insp. Bikram Gogoi',
      notes
    } = req.body;

    if (!touristId) {
      return res.status(400).json({ success: false, error: 'Tourist ID is required' });
    }

    const tourist = dbStore.findOne('tourists', (t) => t.touristId === touristId || t.id === touristId);
    if (!tourist) {
      return res.status(404).json({ success: false, error: 'Tourist not found' });
    }

    const targetTid = tourist.touristId;
    const medicalProfile = dbStore.findOne('medicalProfiles', (m) => m.touristId === targetTid) || {
      bloodGroup: tourist.bloodGroup || 'O+',
      conditions: tourist.medicalConditions ? [tourist.medicalConditions] : ['None'],
      allergies: tourist.allergies || 'None'
    };

    // Construct Medical Data Digest (SHA-256 of sensitive health credentials)
    const condStr = Array.isArray(medicalProfile.conditions) ? medicalProfile.conditions.join(',') : medicalProfile.conditions;
    const rawMedString = `${medicalProfile.bloodGroup}:${condStr}:${medicalProfile.allergies}`;
    const medicalDataDigest = crypto.createHash('sha256').update(rawMedString).digest('hex');

    const originString = typeof tourist.origin === 'object'
      ? `${tourist.origin.city || ''}, ${tourist.origin.state || ''}, ${tourist.origin.country || 'India'}`
      : (tourist.origin || 'India');

    const approvalTimestamp = new Date().toISOString();

    // Zero-Gas Consortium Ledger Commit
    const commitResult = blockchainInstance.commitCheckpointPass({
      touristId: targetTid,
      origin: originString,
      medicalDataDigest,
      approvingOfficerId,
      checkpointId,
      timestamp: approvalTimestamp
    });

    // Create Compact Offline Envelope & Sign with Authority ECDSA Private Key
    const offlineEnvelope = {
      uuid: targetTid,
      bloodGroup: medicalProfile.bloodGroup || 'O+',
      exp: tourist.travelEndDate,
      checkpointId,
      status: 'VERIFIED',
      txHash: commitResult.txHash
    };
    const ecdsaSignature = blockchainInstance.signOfflineEnvelope(offlineEnvelope);
    offlineEnvelope.sig = ecdsaSignature;

    // Update Tourist State
    const updatedTourist = dbStore.update('tourists', tourist.id, {
      idVerificationStatus: 'VERIFIED',
      entryCheckpoint: checkpointId,
      status: 'SAFE',
      lastApprovedAt: approvalTimestamp
    });

    // Update or Insert Verification Record
    let vRecord = dbStore.findOne('verificationRecords', (v) => v.touristId === targetTid);
    if (vRecord) {
      vRecord = dbStore.update('verificationRecords', vRecord.id, {
        status: 'VERIFIED',
        entryCheckpoint: checkpointId,
        approvingOfficerId,
        approvingOfficerName,
        approvalTimestamp,
        rejectionReason: null,
        blockchainTxHash: commitResult.txHash,
        cryptographicPayloadHash: commitResult.receiptHash,
        medicalDataDigest,
        offlineEnvelope,
        notes: notes || 'Entry approved and verified on consortium ledger.'
      });
    } else {
      vRecord = dbStore.insert('verificationRecords', {
        id: `vr_${targetTid}`,
        touristId: targetTid,
        fullName: tourist.fullName,
        status: 'VERIFIED',
        entryCheckpoint: checkpointId,
        intendedRoute: tourist.destination,
        origin: tourist.origin || { city: 'Guwahati', state: 'Assam', country: 'India' },
        govtIdProofType: tourist.idProofType || 'Aadhaar Card',
        govtIdPreviewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        medicalDataDigest,
        approvingOfficerId,
        approvingOfficerName,
        approvalTimestamp,
        rejectionReason: null,
        blockchainTxHash: commitResult.txHash,
        cryptographicPayloadHash: commitResult.receiptHash,
        offlineEnvelope,
        notes: notes || 'Entry approved and verified on consortium ledger.'
      });
    }

    // Update Digital ID Record
    let digitalId = dbStore.findOne('digitalIds', (d) => d.touristId === targetTid);
    if (digitalId) {
      digitalId = dbStore.update('digitalIds', digitalId.id, {
        verificationStatus: 'VERIFIED',
        blockchainTxHash: commitResult.txHash,
        blockIndex: commitResult.blockIndex,
        digitalSignature: `SIG-ECDSA-${ecdsaSignature.substring(0, 16).toUpperCase()}`,
        offlineEnvelope,
        issuedAt: approvalTimestamp
      });
    }

    return res.json({
      success: true,
      message: `✓ S.A.F.A.R. Entry Pass for ${tourist.fullName} (${targetTid}) approved and committed to Zero-Gas Consortium Ledger!`,
      txHash: commitResult.txHash,
      receiptHash: commitResult.receiptHash,
      blockIndex: commitResult.blockIndex,
      approvalTimestamp,
      checkpointId,
      offlineEnvelope,
      tourist: updatedTourist,
      verificationRecord: vRecord,
      digitalId
    });
  } catch (err) {
    console.error('Error approving entry pass:', err);
    return res.status(500).json({ success: false, error: 'Failed to approve checkpoint entry pass' });
  }
}

// 4. Reject Entry Pass with Mandatory Reason
function rejectEntryPass(req, res) {
  try {
    const {
      touristId,
      rejectionReason,
      rejectingOfficerId = 'usr_auth_01',
      checkpointId = 'CHK-GW-01'
    } = req.body;

    if (!touristId) {
      return res.status(400).json({ success: false, error: 'Tourist ID is required' });
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Mandatory Rejection Reason required (e.g., fraudulent identity proof, restricted zone permit missing).'
      });
    }

    const tourist = dbStore.findOne('tourists', (t) => t.touristId === touristId || t.id === touristId);
    if (!tourist) {
      return res.status(404).json({ success: false, error: 'Tourist not found' });
    }

    const targetTid = tourist.touristId;
    const rejectionTimestamp = new Date().toISOString();

    // Update Tourist State
    const updatedTourist = dbStore.update('tourists', tourist.id, {
      idVerificationStatus: 'REJECTED',
      status: 'BLOCKED'
    });

    // Update or Insert Verification Record
    let vRecord = dbStore.findOne('verificationRecords', (v) => v.touristId === targetTid);
    if (vRecord) {
      vRecord = dbStore.update('verificationRecords', vRecord.id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
        approvingOfficerId: rejectingOfficerId,
        entryCheckpoint: checkpointId,
        updatedAt: rejectionTimestamp
      });
    } else {
      vRecord = dbStore.insert('verificationRecords', {
        id: `vr_${targetTid}`,
        touristId: targetTid,
        fullName: tourist.fullName,
        status: 'REJECTED',
        entryCheckpoint: checkpointId,
        intendedRoute: tourist.destination,
        origin: tourist.origin || { city: 'Unknown', state: 'Unknown', country: 'India' },
        govtIdProofType: tourist.idProofType,
        rejectionReason: rejectionReason.trim(),
        approvingOfficerId: rejectingOfficerId,
        updatedAt: rejectionTimestamp
      });
    }

    // Update Digital ID
    let digitalId = dbStore.findOne('digitalIds', (d) => d.touristId === targetTid);
    if (digitalId) {
      dbStore.update('digitalIds', digitalId.id, {
        verificationStatus: 'REJECTED'
      });
    }

    return res.json({
      success: true,
      message: `Entry Pass for ${tourist.fullName} rejected: "${rejectionReason.trim()}".`,
      touristId: targetTid,
      rejectionReason: rejectionReason.trim(),
      status: 'REJECTED',
      tourist: updatedTourist,
      verificationRecord: vRecord
    });
  } catch (err) {
    console.error('Error rejecting entry pass:', err);
    return res.status(500).json({ success: false, error: 'Failed to reject checkpoint entry pass' });
  }
}

// 5. Offline Resolution: Cryptographically Verify Digital Signature Locally
function simulateOfflineScan(req, res) {
  try {
    const { envelope, signature } = req.body;

    if (!envelope || !signature) {
      return res.status(400).json({ success: false, error: 'Both envelope payload and ECDSA signature are required' });
    }

    const verification = blockchainInstance.verifyOfflineEnvelope(envelope, signature);

    return res.json({
      success: true,
      verified: verification.isValid,
      algorithm: verification.algorithm,
      fingerprint: verification.fingerprint,
      decodedEnvelope: envelope,
      status: verification.isValid ? (envelope.status || 'VERIFIED') : 'TAMPERED_INVALID',
      message: verification.isValid
        ? '✓ Cryptographic ECDSA Signature Validated against Authority Public Key without Internet.'
        : '✕ Invalid Cryptographic Signature! Potential forgery or tampering detected.'
    });
  } catch (err) {
    console.error('Error resolving offline envelope:', err);
    return res.status(500).json({ success: false, error: 'Offline signature verification failed' });
  }
}

module.exports = {
  getCheckpoints,
  getCheckpointQueue,
  approveEntryPass,
  rejectEntryPass,
  simulateOfflineScan
};
