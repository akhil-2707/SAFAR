const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { dbStore } = require('../config/db');
const { blockchainInstance } = require('../services/blockchainService');

// Register a new Local Guide
function registerGuide(req, res) {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      city,
      operatingDestinations,
      languages,
      experienceYears,
      specialization,
      idProofType,
      idProofNumber,
      bio,
      dailyRate,
      hourlyRate
    } = req.body;

    if (!fullName || !email || !phone || !city) {
      return res.status(400).json({ success: false, error: 'Full name, email, phone, and city are required' });
    }

    const existingUser = dbStore.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email is already registered' });
    }

    const citySlug = (city || 'IND').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const guideId = `GID-2026-${citySlug}-${randomSuffix}`;
    const passwordHash = bcrypt.hashSync(password || 'guide123', 10);

    // 1. Create User
    const newUser = dbStore.insert('users', {
      name: fullName,
      email: email.toLowerCase(),
      password: passwordHash,
      role: 'GUIDE',
      guideId,
      phone
    });

    // 2. Parse arrays safely
    const parsedDestinations = Array.isArray(operatingDestinations)
      ? operatingDestinations
      : (operatingDestinations || city).split(',').map(s => s.trim()).filter(Boolean);

    const parsedLanguages = Array.isArray(languages)
      ? languages
      : (languages || 'Hindi, English').split(',').map(s => s.trim()).filter(Boolean);

    // 3. Create Guide Profile in PENDING_VERIFICATION state
    const newGuide = dbStore.insert('guides', {
      guideId,
      userId: newUser.id,
      fullName,
      email: email.toLowerCase(),
      phone,
      city,
      operatingDestinations: parsedDestinations,
      languages: parsedLanguages,
      experienceYears: Number(experienceYears) || 1,
      specialization: specialization || 'Heritage & Cultural Tourism',
      idProofType: idProofType || 'Aadhaar Card',
      idProofNumber: idProofNumber || 'DOC-PENDING-VERIFY',
      bio: bio || 'Professional local guide committed to tourist hospitality and cultural heritage.',
      dailyRate: Number(dailyRate) || 1400,
      hourlyRate: Number(hourlyRate) || 300,
      status: 'PENDING_VERIFICATION',
      isAvailable: false,
      rating: 0,
      totalReviews: 0,
      toursCompleted: 0,
      policeVerificationStatus: 'PENDING',
      digitalId: null,
      reviews: [],
      createdAt: new Date().toISOString()
    });

    // 4. Create Notification for Central Authority Desk
    dbStore.insert('notifications', {
      id: `notif_guide_${Date.now()}`,
      type: 'MEDIUM',
      title: 'New Guide Verification Request',
      message: `Local Guide candidate ${fullName} (${city}) submitted credentials for verification.`,
      timestamp: new Date().toISOString(),
      read: false,
      guideId
    });

    return res.status(201).json({
      success: true,
      message: 'Registration submitted successfully! Your credentials are under review by the S.A.F.A.R. Authority Desk.',
      guide: newGuide,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        guideId: newUser.guideId
      }
    });
  } catch (err) {
    console.error('Register Guide Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to register guide: ' + err.message });
  }
}

// Get all guides (with optional filtering)
function getGuides(req, res) {
  try {
    const { city, status, available, search } = req.query;
    let guides = dbStore.get('guides') || [];

    if (city) {
      const cLower = city.toLowerCase();
      guides = guides.filter(g => 
        (g.city && g.city.toLowerCase().includes(cLower)) ||
        (g.operatingDestinations && g.operatingDestinations.some(d => d.toLowerCase().includes(cLower)))
      );
    }

    if (status) {
      guides = guides.filter(g => g.status === status);
    }

    if (available !== undefined) {
      const isAvail = available === 'true';
      guides = guides.filter(g => Boolean(g.isAvailable) === isAvail);
    }

    if (search) {
      const sLower = search.toLowerCase();
      guides = guides.filter(g =>
        g.fullName.toLowerCase().includes(sLower) ||
        g.guideId.toLowerCase().includes(sLower) ||
        (g.city && g.city.toLowerCase().includes(sLower)) ||
        (g.specialization && g.specialization.toLowerCase().includes(sLower))
      );
    }

    return res.json({ success: true, guides, count: guides.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Get a single guide by id or guideId
function getGuideById(req, res) {
  try {
    const { id } = req.params;
    const guide = dbStore.findOne('guides', (g) => g.guideId === id || g.id === id || g.userId === id);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }
    return res.json({ success: true, guide });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Authority: Verify Guide & Mint Blockchain Digital ID Card
function verifyGuide(req, res) {
  try {
    const { id } = req.params;
    const guide = dbStore.findOne('guides', (g) => g.guideId === id || g.id === id);

    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }

    // 1. Generate Cryptographic Signature & Digital ID
    const rawMeta = `${guide.guideId}:${guide.fullName}:${guide.idProofNumber}:${guide.city}:${Date.now()}`;
    const digitalIdHash = crypto.createHash('sha256').update(rawMeta).digest('hex');

    // 2. Mint block on Prototype Blockchain Ledger
    const block = blockchainInstance.addBlock({
      guideId: guide.guideId,
      guideName: guide.fullName,
      city: guide.city,
      verificationStatus: 'VERIFIED_LOCAL_GUIDE',
      issuer: 'Ministry of Tourism, Govt. of India (S.A.F.A.R.)',
      licenseNumber: guide.idProofNumber,
      digitalIdHash,
      validityYears: 2
    });

    const host = req.get('host') || 'safetour.gov.in';
    const protocol = req.protocol || 'https';
    const qrCodeData = `${protocol}://${host}/guide/verify/${guide.guideId}?hash=${digitalIdHash.substring(0, 16)}`;

    const digitalIdData = {
      guideId: guide.guideId,
      fullName: guide.fullName,
      issuer: 'Ministry of Tourism, Govt. of India (S.A.F.A.R.)',
      issuedAt: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 2 * 365 * 86400000).toISOString().split('T')[0],
      digitalIdHash,
      blockIndex: block.index,
      blockchainTxHash: block.hash,
      digitalSignature: `SIG-GUIDE-SHA256-${digitalIdHash.substring(0, 16).toUpperCase()}`,
      qrCodeData
    };

    // 3. Update Guide Record
    const updatedGuide = dbStore.update('guides', guide.id, {
      status: 'VERIFIED',
      policeVerificationStatus: 'VERIFIED',
      isAvailable: true,
      digitalId: digitalIdData,
      verifiedAt: new Date().toISOString(),
      verifiedBy: req.user?.name || 'Central Tourism Authority Desk'
    });

    // 4. Also store in digitalIds collection for unified verification
    dbStore.insert('digitalIds', {
      id: `did_${guide.guideId}`,
      touristId: guide.guideId, // dual query key
      fullName: guide.fullName,
      role: 'GUIDE',
      verificationStatus: 'VERIFIED',
      touristIdHash: crypto.createHash('sha256').update(guide.guideId).digest('hex'),
      digitalIdHash,
      blockIndex: block.index,
      blockchainTxHash: block.hash,
      issuedAt: digitalIdData.issuedAt,
      expiryDate: digitalIdData.expiryDate,
      digitalSignature: digitalIdData.digitalSignature,
      qrCodeData
    });

    // 5. Notification
    dbStore.insert('notifications', {
      id: `notif_verify_${Date.now()}`,
      type: 'SUCCESS',
      title: 'Local Guide Certified',
      message: `Local Guide ${guide.fullName} (${guide.guideId}) has been certified with Blockchain Digital ID.`,
      timestamp: new Date().toISOString(),
      read: false,
      guideId: guide.guideId
    });

    return res.json({
      success: true,
      message: `Local Guide ${guide.fullName} successfully verified! Digital Guide ID minted on Blockchain.`,
      guide: updatedGuide
    });
  } catch (err) {
    console.error('Verify Guide Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to verify guide: ' + err.message });
  }
}

// Authority: Reject Guide Application
function rejectGuide(req, res) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const guide = dbStore.findOne('guides', (g) => g.guideId === id || g.id === id);

    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }

    const updatedGuide = dbStore.update('guides', guide.id, {
      status: 'REJECTED',
      rejectionReason: reason || 'Documents could not be validated against official registry.',
      rejectedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: `Guide application for ${guide.fullName} rejected.`,
      guide: updatedGuide
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Guide: Toggle On-Duty Availability
function toggleAvailability(req, res) {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;
    const guide = dbStore.findOne('guides', (g) => g.guideId === id || g.id === id || g.userId === id);

    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }

    const newAvail = isAvailable !== undefined ? Boolean(isAvailable) : !guide.isAvailable;
    const updated = dbStore.update('guides', guide.id, { isAvailable: newAvail });

    return res.json({
      success: true,
      message: `Guide status set to ${newAvail ? 'AVAILABLE (On Duty)' : 'OFF DUTY'}`,
      guide: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Tourist: Request a Local Guide
function createGuideRequest(req, res) {
  try {
    const {
      touristId,
      touristName,
      touristPhone,
      destination,
      city,
      preferredLanguage,
      travelDate,
      tourType,
      notes
    } = req.body;

    if (!destination) {
      return res.status(400).json({ success: false, error: 'Destination is required for requesting a local guide' });
    }

    let tName = touristName;
    let tPhone = touristPhone;
    if (touristId && (!tName || !tPhone)) {
      const tourist = dbStore.findOne('tourists', (t) => t.touristId === touristId);
      if (tourist) {
        tName = tName || tourist.fullName;
        tPhone = tPhone || tourist.mobileNumber;
      }
    }

    const newRequest = dbStore.insert('guideRequests', {
      touristId: touristId || 'TID-DEMO',
      touristName: tName || 'Traveling Tourist',
      touristPhone: tPhone || '+91 98765 00000',
      destination,
      city: city || destination.split(',')[0].split(' ')[0],
      preferredLanguage: preferredLanguage || 'Hindi / English',
      travelDate: travelDate || new Date().toISOString().split('T')[0],
      tourType: tourType || 'Heritage & Sightseeing',
      notes: notes || 'Assistance requested through S.A.F.A.R. safety portal.',
      status: 'PENDING_ASSIGNMENT',
      assignedGuideId: null,
      assignedGuideName: null,
      assignedGuidePhone: null,
      assignedAt: null
    });

    // Alert Central Authority Desk
    dbStore.insert('notifications', {
      id: `notif_req_${Date.now()}`,
      type: 'MEDIUM',
      title: 'New Guide Request',
      message: `Tourist ${tName || touristId} requested a local guide for ${destination}.`,
      timestamp: new Date().toISOString(),
      read: false,
      requestId: newRequest.id
    });

    return res.status(201).json({
      success: true,
      message: 'Guide request submitted to Authority Desk. An authorized local guide will be assigned shortly!',
      request: newRequest
    });
  } catch (err) {
    console.error('Create Guide Request Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create guide request: ' + err.message });
  }
}

// Get all Guide Requests
function getGuideRequests(req, res) {
  try {
    const { touristId, status, guideId } = req.query;
    let requests = dbStore.get('guideRequests') || [];

    if (touristId) {
      requests = requests.filter(r => r.touristId === touristId);
    }

    if (status) {
      requests = requests.filter(r => r.status === status);
    }

    if (guideId) {
      requests = requests.filter(r => r.assignedGuideId === guideId);
    }

    return res.json({ success: true, requests, count: requests.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Authority: Assign a Verified Local Guide to a Tourist Request
function assignGuideToRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { guideId } = req.body;

    if (!guideId) {
      return res.status(400).json({ success: false, error: 'guideId is required for assignment' });
    }

    const request = dbStore.findOne('guideRequests', (r) => r.id === requestId);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Guide request not found' });
    }

    const guide = dbStore.findOne('guides', (g) => g.guideId === guideId || g.id === guideId);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Selected guide not found' });
    }

    // Update request
    const updatedRequest = dbStore.update('guideRequests', request.id, {
      status: 'ASSIGNED',
      assignedGuideId: guide.guideId,
      assignedGuideName: guide.fullName,
      assignedGuidePhone: guide.phone,
      assignedGuideLanguages: guide.languages,
      assignedGuideRating: guide.rating,
      assignedAt: new Date().toISOString()
    });

    // Increment guide's tours completed counter
    dbStore.update('guides', guide.id, {
      toursCompleted: (guide.toursCompleted || 0) + 1
    });

    // Notify Tourist & System
    dbStore.insert('notifications', {
      id: `notif_assign_${Date.now()}`,
      type: 'SUCCESS',
      title: 'Local Guide Assigned',
      message: `Verified Guide ${guide.fullName} (${guide.phone}) has been assigned to ${request.touristName} for ${request.destination}.`,
      timestamp: new Date().toISOString(),
      read: false,
      touristId: request.touristId,
      guideId: guide.guideId
    });

    return res.json({
      success: true,
      message: `Guide ${guide.fullName} assigned to tourist ${request.touristName}!`,
      request: updatedRequest,
      guide
    });
  } catch (err) {
    console.error('Assign Guide Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to assign guide: ' + err.message });
  }
}

// Tourist: Rate & Review Assigned Guide
function reviewGuide(req, res) {
  try {
    const { id } = req.params;
    const { rating, comment, touristName, touristId } = req.body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const guide = dbStore.findOne('guides', (g) => g.guideId === id || g.id === id);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }

    const newReview = {
      id: `rev_${Date.now()}`,
      touristName: touristName || 'Verified Tourist',
      touristId: touristId || 'TID-1000',
      rating: Number(rating),
      comment: comment || 'Smooth and pleasant tour with verified local guidance.',
      date: new Date().toISOString().split('T')[0]
    };

    const currentReviews = guide.reviews || [];
    currentReviews.unshift(newReview);

    const sumRatings = currentReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0);
    const avgRating = Number((sumRatings / currentReviews.length).toFixed(1));

    const updatedGuide = dbStore.update('guides', guide.id, {
      reviews: currentReviews,
      rating: avgRating,
      totalReviews: currentReviews.length
    });

    return res.json({
      success: true,
      message: `Review submitted for Guide ${guide.fullName}! Current Rating: ${avgRating} ★`,
      guide: updatedGuide,
      review: newReview
    });
  } catch (err) {
    console.error('Review Guide Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to submit review: ' + err.message });
  }
}

// Tourist: File Safety Complaint against Guide
function complainAgainstGuide(req, res) {
  try {
    const { id } = req.params;
    const { category, description, urgency, touristId, touristName, touristPhone } = req.body;

    if (!category || !description) {
      return res.status(400).json({ success: false, error: 'Complaint category and description are required' });
    }

    const guide = dbStore.findOne('guides', (g) => g.guideId === id || g.id === id);
    if (!guide) {
      return res.status(404).json({ success: false, error: 'Guide not found' });
    }

    const newComplaint = dbStore.insert('guideComplaints', {
      guideId: guide.guideId,
      guideName: guide.fullName,
      guidePhone: guide.phone,
      touristId: touristId || 'TID-ANON',
      touristName: touristName || 'Tourist',
      touristPhone: touristPhone || '+91 98765 00000',
      category,
      description,
      urgency: urgency || 'MEDIUM',
      status: 'INVESTIGATING',
      actionTaken: 'Complaint logged on Authority Desk. Case officer dispatched for review.',
      createdAt: new Date().toISOString()
    });

    // Alert Central Authority Desk
    dbStore.insert('notifications', {
      id: `notif_comp_${Date.now()}`,
      type: urgency === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      title: '🚨 Guide Safety Complaint Filed',
      message: `Tourist ${touristName || touristId} filed a ${urgency || 'MEDIUM'} complaint against Guide ${guide.fullName}: "${category}"`,
      timestamp: new Date().toISOString(),
      read: false,
      complaintId: newComplaint.id,
      guideId: guide.guideId
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint lodged successfully. The Ministry of Tourism Authority Desk has been alerted and will investigate immediately.',
      complaint: newComplaint
    });
  } catch (err) {
    console.error('Complain Guide Error:', err);
    return res.status(500).json({ success: false, error: 'Failed to lodge complaint: ' + err.message });
  }
}

// Authority: Get all Guide Complaints
function getGuideComplaints(req, res) {
  try {
    const { guideId, status } = req.query;
    let complaints = dbStore.get('guideComplaints') || [];

    if (guideId) {
      complaints = complaints.filter(c => c.guideId === guideId);
    }
    if (status) {
      complaints = complaints.filter(c => c.status === status);
    }

    return res.json({ success: true, complaints, count: complaints.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// Authority: Update Complaint Status & Take Action
function updateComplaintStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, actionTaken } = req.body;

    const complaint = dbStore.findOne('guideComplaints', (c) => c.id === id);
    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    const updatedComplaint = dbStore.update('guideComplaints', complaint.id, {
      status: status || complaint.status,
      actionTaken: actionTaken || complaint.actionTaken,
      resolvedAt: ['RESOLVED', 'WARNING_ISSUED', 'SUSPENDED'].includes(status) ? new Date().toISOString() : null
    });

    // If suspended, mark guide suspended
    if (status === 'SUSPENDED') {
      const guide = dbStore.findOne('guides', (g) => g.guideId === complaint.guideId);
      if (guide) {
        dbStore.update('guides', guide.id, {
          status: 'SUSPENDED',
          isAvailable: false
        });
      }
    }

    return res.json({
      success: true,
      message: `Complaint ${complaint.id} updated to ${status}`,
      complaint: updatedComplaint
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  registerGuide,
  getGuides,
  getGuideById,
  verifyGuide,
  rejectGuide,
  toggleAvailability,
  createGuideRequest,
  getGuideRequests,
  assignGuideToRequest,
  reviewGuide,
  complainAgainstGuide,
  getGuideComplaints,
  updateComplaintStatus
};
