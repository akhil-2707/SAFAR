import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Leaf, ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, 
  Car, Building2, Utensils, Coffee, Search, Filter, RefreshCw, 
  ExternalLink, Eye, Check, X, ShieldAlert, Plus, Edit2, Sliders, ChevronRight
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 380, damping: 28 };

export default function AuthorityGreenRewardsDesk({ onRefreshData }) {
  const [activeSubTab, setActiveSubTab] = useState('PENDING'); // 'PENDING' | 'HISTORY' | 'PARTNERS' | 'CONFIG'
  const [requests, setRequests] = useState([]);
  const [partners, setPartners] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Modals & previews
  const [selectedProofPreview, setSelectedProofPreview] = useState(null);
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [editingPartner, setEditingPartner] = useState(null);
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);

  // New partner form state
  const [newPartnerForm, setNewPartnerForm] = useState({
    name: '',
    type: 'HOTEL',
    location: 'Ayodhya',
    address: '',
    contactPhone: '',
    rewardCoins: 1,
    isSpecialEco: false,
    maximumDiscount: 20,
    discountPolicy: [
      { coins: 10, discountPercent: 2 },
      { coins: 25, discountPercent: 5 },
      { coins: 50, discountPercent: 10 },
      { coins: 100, discountPercent: 20 }
    ]
  });

  useEffect(() => {
    fetchDeskData();
  }, []);

  const fetchDeskData = async () => {
    try {
      setLoading(true);
      const [resR, resP, resC] = await Promise.all([
        fetch('/api/rewards/requests?status=ALL'),
        fetch('/api/rewards/partners?all=true'),
        fetch('/api/rewards/config')
      ]);

      const [dataR, dataP, dataC] = await Promise.all([
        resR.json(),
        resP.json(),
        resC.json()
      ]);

      if (dataR.success) setRequests(dataR.requests || []);
      if (dataP.success) setPartners(dataP.partners || []);
      if (dataC.success) setConfig(dataC.config || null);
    } catch (err) {
      console.error('Fetch Desk Data Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // 1. Approve Request
  const handleApprove = async (reqItem) => {
    try {
      const res = await fetch(`/api/rewards/requests/${reqItem.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE' })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`✓ Request approved! Awarded Green Coins to ${reqItem.touristName}.`);
        fetchDeskData();
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.error || 'Failed to approve request');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Reject Request
  const handleRejectSubmit = async () => {
    if (!rejectingRequest) return;
    try {
      const res = await fetch(`/api/rewards/requests/${rejectingRequest.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'REJECT', 
          rejectionReason: rejectionReasonInput || 'Proof photograph does not meet verification requirements' 
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Request rejected with logged reason.`);
        setRejectingRequest(null);
        setRejectionReasonInput('');
        fetchDeskData();
        if (onRefreshData) onRefreshData();
      } else {
        alert(data.error || 'Failed to reject request');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Add Partner
  const handleCreatePartner = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/rewards/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPartnerForm)
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`✓ New partner "${newPartnerForm.name}" registered successfully!`);
        setShowAddPartnerModal(false);
        fetchDeskData();
      } else {
        alert(data.error || 'Failed to add partner');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Update Partner Policy
  const handleUpdatePartnerPolicy = async (partnerId, maxDisc, tiers) => {
    try {
      const res = await fetch(`/api/rewards/partners/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maximumDiscount: Math.min(Number(maxDisc), 40),
          discountPolicy: tiers
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`✓ Partner discount policy updated (capped at max 40%).`);
        setEditingPartner(null);
        fetchDeskData();
      } else {
        alert(data.error || 'Failed to update partner');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // KPIs
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const approvedRequests = requests.filter((r) => r.status === 'APPROVED');
  const totalCoinsAwarded = approvedRequests.reduce((acc, r) => acc + (Number(r.coins) || 0), 0);
  const activePartnersCount = partners.filter((p) => p.status === 'ACTIVE').length;

  return (
    <div className="space-y-5" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {actionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold"
          >
            <span>{actionNotice}</span>
            <button onClick={() => setActionNotice(null)}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner */}
      <div 
        className="rounded-3xl p-5 sm:p-6 relative overflow-hidden border shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.98) 0%, rgba(255, 255, 255, 0.98) 60%, rgba(239, 246, 255, 0.98) 100%)',
          borderColor: 'rgba(52, 199, 89, 0.35)',
          boxShadow: '0 10px 30px rgba(52, 199, 89, 0.1)'
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-sm">
              <Leaf className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Green Rewards Authority Desk
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Govt Sentinel
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Verification cockpit for eco-friendly vehicle travel and SAFAR partner visit proofs
              </p>
            </div>
          </div>

          <button
            onClick={fetchDeskData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm flex items-center space-x-1.5 self-end sm:self-auto transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          <div className="p-3 rounded-2xl bg-white/90 border border-amber-200/80 shadow-sm">
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">Pending Proofs</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
              {pendingRequests.length}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">Awaiting Verification</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/90 border border-emerald-200/80 shadow-sm">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">Approved Submissions</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
              {approvedRequests.length}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Validated by Authority</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/90 border border-blue-200/80 shadow-sm">
            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block">Green Coins Distributed</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
              {totalCoinsAwarded}
            </span>
            <span className="text-[10px] text-blue-600 font-medium">Total In Circulation</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/90 border border-purple-200/80 shadow-sm">
            <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">Certified Partners</span>
            <span className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">
              {activePartnersCount}
            </span>
            <span className="text-[10px] text-purple-600 font-medium">Hotels, Cafes & Dining</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center space-x-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit backdrop-blur-md">
        {[
          { id: 'PENDING', label: `Pending Queue (${pendingRequests.length})`, icon: Clock },
          { id: 'HISTORY', label: `Audit & History (${requests.length})`, icon: CheckCircle2 },
          { id: 'PARTNERS', label: `Partner Directory & Limits (${partners.length})`, icon: Building2 },
          { id: 'CONFIG', label: 'Reward Policies & Limits', icon: Sliders }
        ].map((tab) => {
          const IconC = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                active
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <IconC className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PENDING QUEUE */}
      {activeSubTab === 'PENDING' && (
        <div className="space-y-3">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200/80">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">All Proofs Verified!</h3>
              <p className="text-xs text-slate-500 mt-1">There are currently no pending green reward requests in the authority queue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((reqItem) => (
                <div 
                  key={reqItem.id}
                  className="apple-card p-4 rounded-3xl bg-white border border-amber-200 shadow-md space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-black text-slate-900">{reqItem.touristName}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-500 px-1.5 py-0.2 rounded bg-slate-100">
                          {reqItem.touristId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Submitted {new Date(reqItem.submittedAt).toLocaleString()}
                      </p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                      Pending Verification
                    </span>
                  </div>

                  {/* Activity Details */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Activity:</span>
                      <span className="font-bold text-slate-800 flex items-center space-x-1">
                        {reqItem.activityType === 'ECO_VEHICLE' ? (
                          <>
                            <Car className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Eco Travel — {reqItem.vehicleType}</span>
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Partner Visit — {reqItem.partnerType}</span>
                          </>
                        )}
                      </span>
                    </div>

                    {reqItem.vehicleNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Vehicle Number:</span>
                        <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {reqItem.vehicleNumber}
                        </span>
                      </div>
                    )}

                    {reqItem.farePaid && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Fare Paid by Tourist:</span>
                        <span className="font-bold text-slate-800">₹{reqItem.farePaid}</span>
                      </div>
                    )}

                    {reqItem.partnerName && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Tagged Partner:</span>
                        <span className="font-bold text-slate-900 truncate max-w-[200px]">
                          {reqItem.partnerName}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">Tagged Desk:</span>
                      <span className="font-semibold text-blue-700 text-[11px]">
                        SAFAR Central Command Desk
                      </span>
                    </div>
                  </div>

                  {/* Uploaded Proof Preview Thumbnail */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Uploaded Proof Photo:
                    </span>
                    <div 
                      onClick={() => setSelectedProofPreview(reqItem.proofImage)}
                      className="h-32 w-full rounded-2xl overflow-hidden relative cursor-pointer group border border-slate-200"
                    >
                      <img 
                        src={reqItem.proofImage} 
                        alt="Proof" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>Enlarge Photograph</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => handleApprove(reqItem)}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Award</span>
                    </button>

                    <button
                      onClick={() => {
                        setRejectingRequest(reqItem);
                        setRejectionReasonInput('');
                      }}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AUDIT & HISTORY */}
      {activeSubTab === 'HISTORY' && (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-md overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">Complete Reward Verification Audit Trail</h3>
            <span className="text-xs text-slate-500 font-medium">Total: {requests.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Tourist</th>
                  <th className="p-3">Activity</th>
                  <th className="p-3">Partner / Vehicle</th>
                  <th className="p-3">Proof</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Coins</th>
                  <th className="p-3">Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-bold">{r.touristName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{r.touristId}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold">
                        {r.activityType === 'ECO_VEHICLE' ? `Eco: ${r.vehicleType}` : `Visit: ${r.sourceCategory}`}
                      </span>
                      <div className="text-[10px] text-slate-400">{new Date(r.submittedAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3 font-mono font-medium">
                      {r.vehicleNumber || r.partnerName || '—'}
                    </td>
                    <td className="p-3">
                      {r.proofImage ? (
                        <button 
                          onClick={() => setSelectedProofPreview(r.proofImage)}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 inline-block hover:scale-110 transition-transform"
                        >
                          <img src={r.proofImage} alt="Proof" className="w-full h-full object-cover" />
                        </button>
                      ) : '—'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'REJECTED' ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-black text-emerald-700">
                      {r.coins > 0 ? `+${r.coins}` : '—'}
                    </td>
                    <td className="p-3 text-[11px] text-slate-500">
                      {r.verifiedBy || (r.status === 'PENDING' ? 'Pending Action' : 'System')}
                      {r.rejectionReason && (
                        <div className="text-[10px] text-red-600 font-medium truncate max-w-xs" title={r.rejectionReason}>
                          Reason: {r.rejectionReason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PARTNERS & DISCOUNT LIMITS */}
      {activeSubTab === 'PARTNERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Certified SAFAR Partners Directory</h3>
              <p className="text-xs text-slate-500">
                Configure partner establishments and custom Green Coin discount policies. Hard 40% limit enforced.
              </p>
            </div>

            <button
              onClick={() => setShowAddPartnerModal(true)}
              className="py-2 px-3.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-md flex items-center space-x-1.5 self-end sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Register Partner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <div 
                key={partner.id}
                className={`p-4 rounded-3xl bg-white border shadow-sm space-y-3 ${
                  partner.status === 'ACTIVE' ? 'border-slate-200' : 'border-slate-300 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-black text-slate-900">{partner.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">{partner.location} · {partner.type}</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                    partner.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {partner.status}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Visit Reward:</span>
                    <span className="font-black text-emerald-700">+{partner.rewardCoins || 1} Green Coin</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Partner Max Discount:</span>
                    <span className="font-black text-blue-700 font-mono">
                      {partner.maximumDiscount || 20}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">SAFAR Hard Limit:</span>
                    <span className="font-bold text-slate-700 font-mono">40% max (Enforced)</span>
                  </div>
                </div>

                {/* Tiers List */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Configured Discount Policy:
                  </span>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                    {(partner.discountPolicy && partner.discountPolicy.length > 0) ? (
                      partner.discountPolicy.map((t, idx) => (
                        <div key={idx} className="p-1.5 rounded-lg bg-slate-100/80 flex items-center justify-between">
                          <span className="text-slate-600">{t.coins} coins</span>
                          <span className="font-bold text-emerald-700">→ {t.discountPercent}%</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-400 italic col-span-2">Using SAFAR default tiers</span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => setEditingPartner(partner)}
                    className="py-1.5 px-3 rounded-xl font-bold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center space-x-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Policy</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURATION & HARD LIMITS */}
      {activeSubTab === 'CONFIG' && (
        <div className="max-w-2xl mx-auto p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">System Reward Policy & Hard Limits</h3>
              <p className="text-xs text-slate-500">Immutable backend business guardrails</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center space-x-1.5 font-black text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Hard Rule 1: Maximum Discount = 40%</span>
              </div>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                Even if a tourist holds 100, 500, or 1,000 Green Coins, the maximum possible discount is strictly capped at 40%. Any partner attempt to exceed 40% is rejected.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
              <div className="flex items-center space-x-1.5 font-black text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-700" />
                <span>Hard Rule 2: Purchase Can Never Become Free (Min 60% Payable)</span>
              </div>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Green Coins are reward points, not Rupees. A ₹1,000 bill with maximum discount becomes ₹600, never ₹0. The minimum payable amount is always 60% of eligible bill.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
              <div className="flex items-center space-x-1.5 font-black text-amber-900">
                <Car className="w-4 h-4 text-amber-700" />
                <span>Eco-Friendly Vehicle Reward Rates</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                <div className="p-2 bg-white rounded-xl border border-amber-200 flex justify-between">
                  <span>E-Rickshaw:</span>
                  <strong className="text-emerald-700">+1 Coin</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-amber-200 flex justify-between">
                  <span>E-Auto:</span>
                  <strong className="text-emerald-700">+1 Coin</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-amber-200 flex justify-between">
                  <span>Electric Cab:</span>
                  <strong className="text-emerald-700">+2 Coins</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-amber-200 flex justify-between">
                  <span>Electric Bus:</span>
                  <strong className="text-emerald-700">+1 Coin</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fullscreen Proof Photo Preview */}
      <AnimatePresence>
        {selectedProofPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProofPreview(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl relative"
            >
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Verification Proof Photograph</span>
                <button onClick={() => setSelectedProofPreview(null)} className="p-1 rounded-full hover:bg-slate-100">
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="p-2 max-h-[75vh] overflow-auto flex items-center justify-center bg-slate-950">
                <img src={selectedProofPreview} alt="Proof Full" className="max-h-[70vh] w-auto object-contain rounded-xl" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Rejection Reason Dialog */}
      <AnimatePresence>
        {rejectingRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center space-x-2 text-red-600 font-black text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Reject Green Reward Proof</span>
              </div>
              <p className="text-xs text-slate-600">
                Please specify a reason for rejecting the submission for <strong>{rejectingRequest.touristName}</strong>:
              </p>

              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g., Photograph is blurry, vehicle registration plate is not visible, or duplicate journey."
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setRejectingRequest(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Register New Partner */}
      <AnimatePresence>
        {showAddPartnerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-black text-sm text-slate-900">Register Certified SAFAR Partner</span>
                </div>
                <button onClick={() => setShowAddPartnerModal(false)}>
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreatePartner} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Establishment Name</label>
                  <input
                    type="text"
                    required
                    value={newPartnerForm.name}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, name: e.target.value })}
                    placeholder="e.g., Hotel Ayodhya Heritage"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Partner Type</label>
                    <select
                      value={newPartnerForm.type}
                      onChange={(e) => setNewPartnerForm({ ...newPartnerForm, type: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="HOTEL">Hotel</option>
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="CAFE">Cafe</option>
                      <option value="OTHER">Other Partner</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Location Circuit</label>
                    <input
                      type="text"
                      required
                      value={newPartnerForm.location}
                      onChange={(e) => setNewPartnerForm({ ...newPartnerForm, location: e.target.value })}
                      placeholder="e.g., Ayodhya"
                      className="w-full p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Address</label>
                  <input
                    type="text"
                    required
                    value={newPartnerForm.address}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, address: e.target.value })}
                    placeholder="e.g., Ram Path, Ayodhya, UP"
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Visit Reward Coins</label>
                    <select
                      value={newPartnerForm.rewardCoins}
                      onChange={(e) => setNewPartnerForm({ ...newPartnerForm, rewardCoins: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value={1}>+1 Coin (Standard Partner)</option>
                      <option value={2}>+2 Coins (Special Eco Partner)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Max Discount (% capped at 40%)
                    </label>
                    <input
                      type="number"
                      max={40}
                      min={1}
                      value={newPartnerForm.maximumDiscount}
                      onChange={(e) => setNewPartnerForm({ ...newPartnerForm, maximumDiscount: Math.min(Number(e.target.value), 40) })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPartnerModal(false)}
                    className="px-3.5 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    Register Partner
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
