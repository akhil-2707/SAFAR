import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, IndianRupee, CheckCircle, Ticket } from 'lucide-react';

export default function MyBookings() {
  const user = JSON.parse(localStorage.getItem('safar_user') || 'null');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/marketplace/bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('safar_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
          <Ticket className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Tour Bookings</h1>
          <p className="text-sm text-gray-500">View and manage your S.A.F.A.R. verified tour packages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? <p>Loading your bookings...</p> : bookings.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-3xl border border-gray-100">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-bold">You have no active bookings.</p>
          </div>
        ) : bookings.map(bkg => (
          <div key={bkg.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center mb-2 w-fit ${
                  bkg.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                  bkg.status === 'PENDING_CONFIRMATION' ? 'bg-orange-100 text-orange-800' :
                  bkg.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  <CheckCircle className="w-3 h-3 mr-1" /> {bkg.status}
                </span>
                <h3 className="text-lg font-black text-gray-900">{bkg.packageName}</h3>
                <p className="text-xs text-gray-500 mt-1">Provider: <strong className="text-gray-700">{bkg.partnerName}</strong></p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Booking ID</span>
                <span className="font-mono text-sm bg-gray-50 p-1.5 rounded-md border border-gray-100">{bkg.bookingId}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">Travel Date</span>
                <span className="font-bold text-gray-900 flex items-center mt-0.5"><Calendar className="w-3.5 h-3.5 mr-1 text-indigo-500"/>{bkg.travelDate}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Tourists</span>
                <span className="font-bold text-gray-900">{bkg.touristsCount} Pax</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-bold uppercase">Total Amount</span>
              <span className="text-xl font-black text-gray-900 flex items-center">
                <IndianRupee className="w-4 h-4 mr-0.5" />{bkg.totalPrice}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
