import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Calendar, Clock, Users, IndianRupee, Search, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Marketplace() {
  const user = JSON.parse(localStorage.getItem('safar_user') || 'null');
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  // Booking state
  const [bookingDate, setBookingDate] = useState('');
  const [touristsCount, setTouristsCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchApprovedPackages();
  }, []);

  const fetchApprovedPackages = async () => {
    try {
      // The API by default returns APPROVED packages for public/tourist users.
      const res = await fetch('/api/marketplace/packages');
      const data = await res.json();
      if (data.success) {
        setPackages(data.packages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!user) {
      alert('Please log in as a Tourist to book a package.');
      navigate('/login');
      return;
    }
    if (user.role !== 'TOURIST') {
      alert('Only Tourists can book packages.');
      return;
    }
    if (!bookingDate) {
      alert('Please select a travel date.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch('/api/marketplace/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safar_token')}`
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          travelDate: bookingDate,
          touristsCount
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Booking Confirmed! Check your dashboard for details.');
        setSelectedPackage(null);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white/95 border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-20 -translate-y-20"></div>
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-widest text-cyan-800">S.A.F.A.R. Approved</span>
              <span className="bg-green-50 text-green-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-green-200 shadow-sm flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1"/> AUTHORITY VERIFIED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Verified Tour Packages</h1>
          </div>
        </div>
        <p className="relative z-10 text-xs text-gray-600 max-w-3xl leading-relaxed">
          Book authentic and safe travel experiences. Every package listed here has been rigorously verified by the S.A.F.A.R. Central Authority for safety, legitimate pricing, and certified local guides.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p>Loading packages...</p> : packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col group">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black text-gray-900 shadow-sm flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 mr-1"/> Verified
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center text-xs text-gray-500 font-bold mb-2">
                <MapPin className="w-3.5 h-3.5 mr-1" /> {pkg.destination}
              </div>
              <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{pkg.name}</h3>
              <p className="text-xs text-cyan-700 font-bold mb-4">By {pkg.partnerName}</p>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-600 mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400"/>{pkg.duration}</div>
                <div className="flex items-center"><Users className="w-3.5 h-3.5 mr-1.5 text-gray-400"/>Max {pkg.groupCapacity} pax</div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 block uppercase font-bold">Price</span>
                  <span className="text-xl font-black text-gray-900 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-0.5" />{pkg.price}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedPackage(pkg)}
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-cyan-700 transition-colors shadow-sm"
                >
                  View & Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            {/* Left: Info */}
            <div className="w-full md:w-3/5 p-6 overflow-y-auto bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedPackage.name}</h2>
              </div>
              
              <div className="space-y-5 text-sm">
                <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-2 rounded-lg border border-green-100">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-bold text-xs">S.A.F.A.R. Authority Verified Package</span>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-400"/> Itinerary</h4>
                  <p className="text-gray-600 bg-white p-3 rounded-xl border border-gray-200">{selectedPackage.itinerary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Inclusions</h4>
                    <p className="text-gray-600 text-xs bg-white p-2 rounded-lg border border-gray-200">{selectedPackage.inclusions}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Exclusions</h4>
                    <p className="text-gray-600 text-xs bg-white p-2 rounded-lg border border-gray-200">{selectedPackage.exclusions}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-red-900 mb-1 flex items-center">Safety Information</h4>
                  <p className="text-red-800 text-xs bg-red-50 p-3 rounded-xl border border-red-100">{selectedPackage.safetyInformation}</p>
                </div>
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="w-full md:w-2/5 p-6 bg-white border-l border-gray-100 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Book Package</h3>
                <button onClick={() => setSelectedPackage(null)} className="text-gray-400 hover:text-gray-600"><CheckCircle2 className="w-6 h-6 transform rotate-45"/></button>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Select Travel Date</label>
                  <select 
                    value={bookingDate} 
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm focus:border-cyan-500 outline-none font-semibold"
                  >
                    <option value="">Select a date...</option>
                    {selectedPackage.availableDates.map(d => (
                      <option key={d} value={d}>{new Date(d).toDateString()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Number of Tourists</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={selectedPackage.groupCapacity}
                    value={touristsCount} 
                    onChange={(e) => setTouristsCount(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl p-2.5 text-sm focus:border-cyan-500 outline-none font-semibold"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Max capacity: {selectedPackage.groupCapacity}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
                  <div className="flex justify-between text-sm mb-1 text-gray-500">
                    <span>Price per person</span>
                    <span>₹{selectedPackage.price}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t border-gray-200 mt-2">
                    <span>Total</span>
                    <span>₹{selectedPackage.price * touristsCount}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleBook}
                disabled={bookingLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-black py-4 rounded-xl shadow-lg transition-colors mt-6"
              >
                {bookingLoading ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
