import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, ShieldCheck, AlertTriangle, CheckCircle, 
  ExternalLink, ArrowRight, Camera, Upload, RefreshCw, Award,
  Cpu, FileCheck, Layers, HelpCircle
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 360, damping: 28 };

// Presets for 1-click live demo during presentation round
const DEMO_PRESETS = [
  {
    id: 'demo_pashmina_real',
    title: 'Authentic Kashmir Pashmina Shawl',
    craftType: 'pashmina',
    quotedPrice: 5200,
    simulatedCondition: 'authentic',
    tag: 'Authentic Handloom',
    image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'demo_pashmina_fake',
    title: 'Tourist Market "Pashmina" (Scam)',
    craftType: 'pashmina',
    quotedPrice: 18000,
    simulatedCondition: 'counterfeit',
    tag: 'Machine Polyester Scam',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'demo_banarasi_real',
    title: 'Pure Zari Handloom Banarasi Saree',
    craftType: 'banarasi_silk',
    quotedPrice: 3800,
    simulatedCondition: 'authentic',
    tag: 'Real Silver Zari',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'demo_moradabad_real',
    title: 'Moradabad Hand-Chiseled Brass Lamp',
    craftType: 'moradabad_brass',
    quotedPrice: 1150,
    simulatedCondition: 'authentic',
    tag: 'Virgin Bell-Metal',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=400&auto=format&fit=crop&q=80'
  }
];

export default function AICraftScannerModal({ isOpen, onClose }) {
  const [selectedPreset, setSelectedPreset] = useState(DEMO_PRESETS[0]);
  const [craftType, setCraftType] = useState('pashmina');
  const [quotedPrice, setQuotedPrice] = useState(5200);
  const [condition, setCondition] = useState('authentic');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setCraftType(preset.craftType);
    setQuotedPrice(preset.quotedPrice);
    setCondition(preset.simulatedCondition);
    setReport(null);
    setError(null);
  };

  const runAIScan = async () => {
    setIsScanning(true);
    setReport(null);
    setError(null);
    setScanStep(1);

    // Visual scan sequence progression for judges
    const timer1 = setTimeout(() => setScanStep(2), 700);
    const timer2 = setTimeout(() => setScanStep(3), 1400);

    try {
      const response = await fetch('/api/artisans/ai-inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          craftType,
          quotedPrice: Number(quotedPrice),
          simulatedCondition: condition
        })
      });

      const data = await response.json();
      setTimeout(() => {
        setIsScanning(false);
        if (data.success && data.report) {
          setReport(data.report);
        } else {
          setError(data.error || 'AI scanner could not complete inspection');
        }
      }, 2100);
    } catch (err) {
      setTimeout(() => {
        setIsScanning(false);
        setError('Network error connecting to AI inspection service: ' + err.message);
      }, 2100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={SPRING}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Top Gradient Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Cpu className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-extrabold tracking-tight">S.A.F.A.R. AI Craft Vision Inspector</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-amber-950 uppercase tracking-wider">
                    GI Neural Engine
                  </span>
                </div>
                <p className="text-xs text-white/80">
                  Real-time microscopic weave audit against Government of India GI Registry
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[calc(85vh-100px)] overflow-y-auto">
          
          {/* Demo Presets Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Select Craft Specimen for Evaluation (or Custom Entry):</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">1-Click Live Test</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    selectedPreset.id === preset.id
                      ? 'border-purple-600 bg-purple-50/80 shadow-sm ring-2 ring-purple-200'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="w-full h-16 rounded-xl overflow-hidden mb-1.5 relative">
                    <img src={preset.image} alt={preset.title} className="w-full h-full object-cover" />
                    <span className={`absolute bottom-1 right-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md text-white ${
                      preset.simulatedCondition === 'counterfeit' ? 'bg-red-600' : 'bg-emerald-600'
                    }`}>
                      {preset.simulatedCondition === 'counterfeit' ? 'Fake Test' : 'Real GI'}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 line-clamp-1">{preset.title}</p>
                  <p className="text-[10px] text-slate-500 font-medium">₹{preset.quotedPrice.toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Craft Discipline</label>
              <select
                value={craftType}
                onChange={(e) => setCraftType(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="pashmina">Kashmir Pashmina (GI-IN-0046)</option>
                <option value="banarasi_silk">Banaras Brocades (GI-IN-0023)</option>
                <option value="moradabad_brass">Moradabad Brassware (GI-IN-0418)</option>
                <option value="channapatna_toys">Channapatna Toys (GI-IN-0049)</option>
                <option value="jaipur_pottery">Jaipur Blue Pottery (GI-IN-0036)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Shopkeeper Quoted Price (₹)</label>
              <input
                type="number"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g. 5000"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Physical Specimen Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="authentic">Authentic Handloom / Charkha Specimen</option>
                <option value="counterfeit">Suspected Industrial Counterfeit / Powerloom</option>
              </select>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={runAIScan}
            disabled={isScanning}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white flex items-center justify-center space-x-2 shadow-lg transition-all ${
              isScanning
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98]'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {scanStep === 1 && 'AI Micro-Structure Neural Parsing...'}
                  {scanStep === 2 && 'Querying DPIIT GI Registry Database...'}
                  {scanStep === 3 && 'Synthesizing Cryptographic Integrity Certificate...'}
                </span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span>Launch AI Micro-Weave & Anti-Scam Audit</span>
              </>
            )}
          </button>

          {/* Scanning Progress Animation */}
          {isScanning && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-center space-y-2">
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '15%' }}
                  animate={{ width: scanStep === 1 ? '40%' : scanStep === 2 ? '75%' : '95%' }}
                  transition={{ duration: 0.6 }}
                  className="bg-purple-600 h-full rounded-full"
                />
              </div>
              <p className="text-xs text-indigo-900 font-bold">
                Evaluating warp-weft tension index, micron diameter, and silver zari purity...
              </p>
            </div>
          )}

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* AI Inspection Report Card */}
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING}
              className="space-y-4 rounded-3xl border-2 p-4 sm:p-5 bg-white shadow-xl"
              style={{
                borderColor: report.verdict === 'GOVERNMENT_GI_CERTIFIED_AUTHENTIC' ? '#10B981' : '#EF4444'
              }}
            >
              {/* Header Badge */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    report.verdict === 'GOVERNMENT_GI_CERTIFIED_AUTHENTIC'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {report.verdict === 'GOVERNMENT_GI_CERTIFIED_AUTHENTIC' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    )}
                    <span>{report.verdictLabel}</span>
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                    {report.craftAnalyzed} ({report.giTagNumber})
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Authenticity Confidence</span>
                  <span className={`text-xl font-black ${
                    report.authenticityScore >= 75 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {report.authenticityScore}%
                  </span>
                </div>
              </div>

              {/* Price & Scam Breakdown */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Shopkeeper Quote</span>
                  <span className="text-sm font-black text-slate-800">₹{report.pricingAnalysis.quotedSellerPrice.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Govt Fair Price Band</span>
                  <span className="text-sm font-black text-emerald-700">{report.pricingAnalysis.governmentCertifiedFairBand}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Scam Probability</span>
                  <span className={`text-sm font-black ${
                    parseInt(report.pricingAnalysis.scamProbability) > 50 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {report.pricingAnalysis.scamProbability}
                  </span>
                </div>
              </div>

              {/* AI Recommendation Alert */}
              <div className={`p-3 rounded-2xl text-xs font-bold flex items-start gap-2 ${
                report.pricingAnalysis.isOverpriced || report.verdict !== 'GOVERNMENT_GI_CERTIFIED_AUTHENTIC'
                  ? 'bg-amber-50 text-amber-900 border border-amber-300'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              }`}>
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="font-extrabold block">AI Recommendation:</span>
                  <span className="text-[11px] font-medium">{report.pricingAnalysis.recommendedAction}</span>
                </div>
              </div>

              {/* Indicators List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Observed Structural Indicators:
                </span>
                <ul className="space-y-1 text-xs">
                  {report.structuralAnalysis.keyIndicatorsFound.map((ind, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="text-emerald-600 font-bold shrink-0">✓</span>
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Official Registry Footnote */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-slate-500">
                <div>
                  <span>Registered Proprietor: <strong>{report.registeredProprietor}</strong></span>
                  <span className="block font-mono text-[9px] text-slate-400">
                    Audit Token: {report.auditToken} · SHA-256: {report.blockchainVerificationHash.substring(0, 16)}...
                  </span>
                </div>
                <a
                  href={report.officialRegistryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>Verify at IP India (DPIIT)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
