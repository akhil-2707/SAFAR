import React, { useState, useEffect } from 'react';
import { Package, Calendar, MapPin, Users, Edit, CheckCircle, Clock, XCircle, Plus, DollarSign } from 'lucide-react';

export default function PartnerDashboard() {
  const user = JSON.parse(localStorage.getItem('safar_user') || 'null');
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    destination: '',
    itinerary: '',
    duration: '',
    price: '',
    inclusions: '',
    exclusions: '',
    groupCapacity: '',
    guideDetails: '',
    emergencyContact: '',
    safetyInformation: ''
  });

  useEffect(() => {
    if (user?.role === 'PARTNER') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const pkgRes = await fetch('/api/marketplace/packages', {
        headers: { Authorization: `Bearer ${localStorage.getItem('safar_token')}` }
      });
      const pkgData = await pkgRes.json();
      if (pkgData.success) setPackages(pkgData.packages);

      const bkgRes = await fetch('/api/marketplace/bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('safar_token')}` }
      });
      const bkgData = await bkgRes.json();
      if (bkgData.success) setBookings(bkgData.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/marketplace/packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safar_token')}`
        },
        body: JSON.stringify({ ...formData, availableDates: ['2026-11-01', '2026-11-15'] })
      });
      const data = await res.json();
      if (data.success) {
        alert('Package submitted successfully! Waiting for Authority approval.');
        setShowForm(false);
        fetchDashboardData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('safar_token');
      const res = await fetch(`/api/marketplace/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchDashboardData();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      PENDING_CONFIRMATION: 'bg-orange-100 text-orange-800 border-orange-200',
      CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    const icons = {
      APPROVED: <CheckCircle className="w-4 h-4 mr-1" />,
      PENDING: <Clock className="w-4 h-4 mr-1" />,
      REJECTED: <XCircle className="w-4 h-4 mr-1" />,
      PENDING_CONFIRMATION: <Clock className="w-4 h-4 mr-1" />,
      CONFIRMED: <CheckCircle className="w-4 h-4 mr-1" />,
      CANCELLED: <XCircle className="w-4 h-4 mr-1" />
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center ${colors[status] || 'bg-gray-100'}`}>
        {icons[status]} {status}
      </span>
    );
  };

  if (!user || user.role !== 'PARTNER') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-md mx-auto">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-500 mb-6 text-sm">You must be logged in as a verified S.A.F.A.R. Partner to view this dashboard and create packages.</p>
          <a href="/login" className="inline-flex items-center justify-center w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors">
            Login as Partner
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900">S.A.F.A.R. Partner Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your verified tour packages and bookings.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-md hover:bg-blue-700 transition"
        >
          {showForm ? <XCircle className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
          {showForm ? 'Cancel' : 'Create Package'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Submit New Package for Approval</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Package Name</label>
              <input name="name" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5" placeholder="e.g. Sikkim 4-Day Trek" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Destination</label>
              <input name="destination" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5" placeholder="e.g. Sikkim" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Duration</label>
              <input name="duration" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5" placeholder="e.g. 3 Days, 2 Nights" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
              <input type="number" name="price" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5" placeholder="e.g. 5000" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Group Capacity</label>
              <input type="number" name="groupCapacity" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5" placeholder="e.g. 10" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Emergency Contact</label>
              <input name="emergencyContact" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5" placeholder="+91..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-1">Itinerary</label>
              <textarea name="itinerary" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5 h-20" placeholder="Day 1: ..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Inclusions</label>
              <input name="inclusions" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5" placeholder="Meals, Guide..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Exclusions</label>
              <input name="exclusions" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5" placeholder="Flights..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Guide Details</label>
              <input name="guideDetails" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5" placeholder="Certified Local Guide" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Safety Information</label>
              <input name="safetyInformation" required onChange={handleInputChange} className="w-full border rounded-lg p-2.5" placeholder="First Aid, Medical Kit..." />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition">
                Submit Package
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* My Packages */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6 text-gray-900">
            <Package className="w-6 h-6" />
            <h2 className="text-xl font-bold">My Packages</h2>
          </div>
          {loading ? <p>Loading...</p> : packages.length === 0 ? <p className="text-gray-500">No packages created yet.</p> : (
            <div className="space-y-4">
              {packages.map(pkg => (
                <div key={pkg.id} className="p-4 border rounded-2xl flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{pkg.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1" /> {pkg.destination}
                      </p>
                    </div>
                    <StatusBadge status={pkg.status} />
                  </div>
                  <div className="flex justify-between items-center text-sm font-semibold text-gray-700 bg-gray-50 p-2 rounded-xl">
                    <span className="flex items-center"><DollarSign className="w-4 h-4 text-green-600 mr-1"/> ₹{pkg.price}</span>
                    <span className="flex items-center"><Users className="w-4 h-4 text-blue-600 mr-1"/> {pkg.groupCapacity} max</span>
                  </div>
                  {pkg.reviewNotes && (
                    <div className="text-xs p-2 bg-red-50 text-red-800 rounded-lg border border-red-100">
                      <strong>Authority Note:</strong> {pkg.reviewNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6 text-gray-900">
            <Calendar className="w-6 h-6" />
            <h2 className="text-xl font-bold">Recent Bookings</h2>
          </div>
          {loading ? <p>Loading...</p> : bookings.length === 0 ? <p className="text-gray-500">No bookings yet.</p> : (
            <div className="space-y-4">
              {bookings.map(bkg => (
                <div key={bkg.id} className="p-4 border rounded-2xl flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold">{bkg.packageName}</span>
                    <span className="text-xs font-mono text-gray-500">{bkg.bookingId}</span>
                  </div>
                  <div className="text-sm text-gray-700">Tourist: <strong>{bkg.touristName}</strong> ({bkg.touristsCount} pax)</div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded-md">Travel Date: {bkg.travelDate}</span>
                    <div className="flex space-x-2">
                      <span className="font-bold text-green-700">Total: ₹{bkg.totalPrice}</span>
                      <StatusBadge status={bkg.status} />
                    </div>
                  </div>
                  {bkg.status === 'PENDING_CONFIRMATION' && (
                    <div className="pt-2 flex space-x-2">
                      <button
                        onClick={() => handleUpdateBookingStatus(bkg.id || bkg.bookingId, 'CONFIRMED')}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700"
                      >
                        Confirm Booking
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(bkg.id || bkg.bookingId, 'CANCELLED')}
                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
