const { dbStore } = require('../config/db');

// --- PARTNER ---
exports.registerPartner = (req, res) => {
  const { businessName, contactEmail, contactPhone, address, registrationNumber } = req.body;
  // Note: in a real system we'd create a user as well, but for hackathon demo:
  
  const partnerId = `PRT-${Date.now()}`;
  const newPartner = {
    partnerId,
    businessName,
    contactEmail,
    contactPhone,
    address,
    registrationNumber,
    status: 'PENDING_VERIFICATION', // Will be approved by Authority
    createdAt: new Date().toISOString()
  };

  dbStore.insert('partners', newPartner);

  res.json({ success: true, partner: newPartner });
};

// --- PACKAGES ---
exports.getPackages = (req, res) => {
  const user = req.user;
  let allPackages = dbStore.get('packages');

  if (user && user.role === 'AUTHORITY') {
    // Authority sees all
    return res.json({ success: true, packages: allPackages });
  } else if (user && user.role === 'PARTNER') {
    // Partner sees only their own
    const partner = dbStore.findOne('partners', p => p.userId === user.id);
    if (!partner) return res.json({ success: true, packages: [] });
    const myPackages = allPackages.filter(p => p.partnerId === partner.partnerId);
    return res.json({ success: true, packages: myPackages });
  } else {
    // Tourist / Public sees only APPROVED
    const approvedPackages = allPackages.filter(p => p.status === 'APPROVED');
    return res.json({ success: true, packages: approvedPackages });
  }
};

exports.createPackage = (req, res) => {
  const user = req.user;
  const partner = dbStore.findOne('partners', p => p.userId === user.id);
  
  if (!partner) {
    return res.status(403).json({ success: false, error: 'User is not a registered partner' });
  }

  const {
    name, destination, itinerary, duration, price, inclusions, exclusions,
    groupCapacity, availableDates, images, guideDetails, emergencyContact, safetyInformation
  } = req.body;

  const newPackage = {
    partnerId: partner.partnerId,
    partnerName: partner.businessName,
    name,
    destination,
    itinerary,
    duration,
    price: Number(price),
    inclusions,
    exclusions,
    groupCapacity: Number(groupCapacity),
    availableDates: availableDates || [], // Array of dates
    images: images || [],
    guideDetails,
    emergencyContact,
    safetyInformation,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  const inserted = dbStore.insert('packages', newPackage);
  res.json({ success: true, package: inserted });
};

exports.updatePackageStatus = (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes } = req.body;

  const pkg = dbStore.findOne('packages', p => p.id === id);
  if (!pkg) {
    return res.status(404).json({ success: false, error: 'Package not found' });
  }

  const updated = dbStore.update('packages', id, { 
    status, 
    reviewNotes,
    reviewedBy: req.user.name,
    reviewedAt: new Date().toISOString()
  });

  res.json({ success: true, package: updated });
};

// --- BOOKINGS ---
exports.createBooking = (req, res) => {
  const { packageId, travelDate, touristsCount } = req.body;
  const user = req.user; // Tourist

  const pkg = dbStore.findOne('packages', p => p.id === packageId);
  if (!pkg) {
    return res.status(404).json({ success: false, error: 'Package not found' });
  }

  if (pkg.status !== 'APPROVED') {
    return res.status(400).json({ success: false, error: 'Cannot book unapproved package' });
  }

  const tourist = dbStore.findOne('tourists', t => t.email === user.email || t.id === user.id);
  const touristId = tourist ? tourist.touristId : user.id;

  const newBooking = {
    bookingId: `BKG-${Date.now()}`,
    touristId,
    touristName: user.name,
    packageId: pkg.id,
    packageName: pkg.name,
    partnerId: pkg.partnerId,
    partnerName: pkg.partnerName,
    travelDate,
    touristsCount: Number(touristsCount),
    totalPrice: pkg.price * Number(touristsCount),
    status: 'PENDING_CONFIRMATION',
    createdAt: new Date().toISOString()
  };

  const inserted = dbStore.insert('bookings', newBooking);
  res.json({ success: true, booking: inserted });
};

exports.getBookings = (req, res) => {
  const user = req.user;
  let allBookings = dbStore.get('bookings');

  if (user.role === 'AUTHORITY') {
    return res.json({ success: true, bookings: allBookings });
  } else if (user.role === 'PARTNER') {
    const partner = dbStore.findOne('partners', p => p.userId === user.id);
    if (!partner) return res.json({ success: true, bookings: [] });
    const myBookings = allBookings.filter(b => b.partnerId === partner.partnerId);
    return res.json({ success: true, bookings: myBookings });
  } else {
    // Tourist
    const tourist = dbStore.findOne('tourists', t => t.email === user.email || t.id === user.id);
    const touristId = tourist ? tourist.touristId : user.id;
    const myBookings = allBookings.filter(b => b.touristId === touristId);
    return res.json({ success: true, bookings: myBookings });
  }
};

exports.updateBookingStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = req.user;

  const bkg = dbStore.findOne('bookings', b => b.bookingId === id || b.id === id);
  if (!bkg) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  // Only the partner who owns the package can confirm/reject
  const partner = dbStore.findOne('partners', p => p.userId === user.id);
  if (!partner || partner.partnerId !== bkg.partnerId) {
    return res.status(403).json({ success: false, error: 'Unauthorized to update this booking' });
  }

  const updated = dbStore.update('bookings', bkg.id, { 
    status, 
    updatedAt: new Date().toISOString()
  });

  res.json({ success: true, booking: updated });
};
