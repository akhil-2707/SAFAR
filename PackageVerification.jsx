import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Eye, ShieldCheck, MapPin } from 'lucide-react';

export default function PackageVerification() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/marketplace/packages', {
        headers: { Authorization: `Bearer ${localStorage.getItem('safar_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        // Sort PENDING to top
        const sorted = data.packages.sort((a, b) => {
          if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
          if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
          return 0;
        });
        setPackages(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    if (status === 'REJECTED' && !reviewNotes) {
      alert('Please provide review notes for rejection.');
      return;
    }

    try {
      const res = await fetch(`/api/marketplace/packages/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('safar_token')}`
        },
        body: JSON.stringify({ status, reviewNotes })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPackage(null);
        setReviewNotes('');
        fetchPackages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Package Verification Desk</h1>
          <p className="text-sm text-gray-500">Review and approve S.A.F.A.R. Partner tour packages.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? <p>Loading packages...</p> : packages.map(pkg => (
          <div key={pkg.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  pkg.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  pkg.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {pkg.status}
                </span>
                <span className="text-xs font-mono text-gray-400">ID: {pkg.id}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-1">{pkg.name}</h3>
              <p className="text-sm text-gray-600 flex items-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" /> {pkg.destination} • By {pkg.partnerName}
              </p>
            </div>
            
            <button
              onClick={() => setSelectedPackage(pkg)}
              className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition"
            >
              Review Details
            </button>
          </div>
        ))}
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold">Inspect Package: {selectedPackage.name}</h2>
              <button onClick={() => setSelectedPackage(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div><span className="text-gray-500 block">Partner Name</span><span className="font-bold">{selectedPackage.partnerName}</span></div>
                <div><span className="text-gray-500 block">Partner ID</span><span className="font-mono">{selectedPackage.partnerId}</span></div>
                <div><span className="text-gray-500 block">Destination</span><span className="font-bold">{selectedPackage.destination}</span></div>
                <div><span className="text-gray-500 block">Duration</span><span className="font-bold">{selectedPackage.duration}</span></div>
                <div><span className="text-gray-500 block">Price</span><span className="font-bold text-green-700">₹{selectedPackage.price}</span></div>
                <div><span className="text-gray-500 block">Capacity</span><span className="font-bold">{selectedPackage.groupCapacity}</span></div>
              </div>

              <div><span className="text-gray-500 font-bold block mb-1">Itinerary</span><p className="bg-gray-50 p-3 rounded-lg">{selectedPackage.itinerary}</p></div>
              <div><span className="text-gray-500 font-bold block mb-1">Safety Information</span><p className="bg-red-50 text-red-900 p-3 rounded-lg border border-red-100">{selectedPackage.safetyInformation}</p></div>
              <div><span className="text-gray-500 font-bold block mb-1">Guide Details</span><p className="bg-gray-50 p-3 rounded-lg">{selectedPackage.guideDetails}</p></div>

              <div className="mt-4">
                <label className="text-gray-700 font-bold block mb-1">Authority Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter rejection reason or approval notes..."
                  className="w-full border rounded-xl p-3 bg-gray-50"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
              <button 
                onClick={() => handleStatusUpdate(selectedPackage.id, 'REJECTED')}
                className="px-5 py-2.5 bg-red-100 text-red-800 font-bold rounded-xl hover:bg-red-200 transition"
              >
                Reject & Request Changes
              </button>
              <button 
                onClick={() => handleStatusUpdate(selectedPackage.id, 'APPROVED')}
                className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
              >
                Verify & Approve
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
