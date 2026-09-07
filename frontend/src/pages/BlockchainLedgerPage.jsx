import React, { useState, useEffect } from 'react';
import { FileCode, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, Lock, Hash, ShieldAlert, Cpu } from 'lucide-react';

export default function BlockchainLedgerPage() {
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditResult, setAuditResult] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blockchain');
      const data = await res.json();
      setLedgerData(data);
      setAuditResult(data.auditResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blockchain/verify', { method: 'POST' });
      const data = await res.json();
      setAuditResult(data.audit);
      setActionMessage('SHA-256 cryptographic chain audit completed.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTamper = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blockchain/tamper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetIndex: 1 })
      });
      const data = await res.json();
      setActionMessage(data.message);
      fetchLedger();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/blockchain/restore', { method: 'POST' });
      const data = await res.json();
      setActionMessage(data.message);
      fetchLedger();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isChainValid = auditResult?.isValid;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-white/95 border border-gray-200/80 rounded-2xl p-4 sm:p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-xl sm:text-2xl text-gray-900">Blockchain Ledger & Tamper Audit</span>
            <span className="bg-cyan-50 text-cyan-800 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border border-cyan-200 uppercase tracking-widest shadow-sm">
              Private SHA-256
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Tamper-Evident Digital Tourist ID Verification Engine
          </p>
        </div>

        {/* Audit Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <button
            disabled={loading}
            onClick={handleVerify}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-1.5 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verify Integrity</span>
          </button>

          <button
            disabled={loading}
            onClick={handleTamper}
            className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-xl border border-rose-300 flex items-center justify-center space-x-1.5 transition-all shadow-sm"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Simulate Tampering</span>
          </button>

          <button
            disabled={loading}
            onClick={handleRestore}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-300 flex items-center justify-center space-x-1.5 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-cyan-600" />
            <span>Restore Ledger</span>
          </button>
        </div>
      </div>

      {/* Audit Banner Result */}
      {auditResult && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm ${
          isChainValid ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-red-50 border-red-300 text-red-900'
        }`}>
          <div className="flex items-start sm:items-center space-x-3">
            {isChainValid ? <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" /> : <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5 sm:mt-0" />}
            <div>
              <span className="font-extrabold text-sm block">
                {isChainValid ? '✓ Prototype Blockchain Ledger Integrity Verified' : '✗ Tampering Detected! Cryptographic Audit Failed'}
              </span>
              <p className="text-xs font-semibold mt-0.5 opacity-90 break-words">{auditResult.error || auditResult.message}</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm text-gray-800 shrink-0 self-start sm:self-auto">
            Total Blocks: {ledgerData?.chain?.length || 0}
          </span>
        </div>
      )}

      {/* Blocks Chain Visual Explorer */}
      <div className="space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-wider text-gray-700 block">
          Block Ledger Chain Visualization
        </span>

        <div className="space-y-4">
          {ledgerData?.chain?.map((block, idx) => {
            const isTamperedBlock = ledgerData.isTampered && ledgerData.tamperedBlockIndex === block.index;

            return (
              <div
                key={block.index}
                className={`p-5 rounded-2xl border transition-all shadow-md ${
                  isTamperedBlock
                    ? 'bg-red-50/90 border-2 border-red-400'
                    : 'bg-white/95 border-gray-200 hover:border-cyan-300 backdrop-blur-xl'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-black bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded border border-cyan-200 shadow-sm">
                      Block #{block.index}
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {block.index === 0 ? 'Genesis Node' : `Tourist Digital ID Record (${block.data?.touristId || 'TID-1024'})`}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-500 font-mono font-medium">
                    Timestamp: {new Date(block.timestamp).toLocaleString()}
                  </span>
                </div>

                {/* Hashes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 font-mono text-[11px]">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Previous Block Hash</span>
                    <span className="text-gray-700 break-all font-semibold">{block.previousHash}</span>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 shadow-sm">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Current Block SHA-256 Hash</span>
                    <span className={`break-all font-black ${isTamperedBlock ? 'text-red-700' : 'text-emerald-700'}`}>
                      {block.hash}
                    </span>
                  </div>
                </div>

                {/* Block Data Metadata */}
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Payload Verification Data</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-700 text-[11px]">
                    <div>
                      <span className="text-gray-500">Status: </span>
                      <strong className={isTamperedBlock ? 'text-red-700 font-bold' : 'text-emerald-700 font-extrabold'}>
                        {block.data?.verificationStatus}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500">Issuer: </span>
                      <strong className="text-gray-900 font-semibold">{block.data?.issuer}</strong>
                    </div>
                    <div className="truncate font-mono">
                      <span className="text-gray-500">Digital ID Hash: </span>
                      <strong className="text-cyan-800 font-bold">{block.data?.digitalIdHash?.substring(0, 16)}...</strong>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
