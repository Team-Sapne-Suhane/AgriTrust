import React, { useState, useEffect } from 'react';
import { localDb, StorageMetrics } from '../../../database/services/dbService';
import { PolicyRecord, OfflineVoucher, Language } from '../../../types';
import { TRANSLATIONS } from '../../translations/translations';
import { audioService } from '../../../backend/services/audioService';
import { Database, HardDrive, RefreshCw, Send, Trash2, CheckCircle2, ShieldAlert, FileText, ArrowDownToLine, Server } from 'lucide-react';

interface DatabaseInspectorProps {
  language: Language;
  onSyncOutbox: () => void;
}

export const DatabaseInspector: React.FC<DatabaseInspectorProps> = ({ language, onSyncOutbox }) => {
  const t = TRANSLATIONS[language];
  const [metrics, setMetrics] = useState<StorageMetrics>(localDb.getStorageMetrics());
  const [policies, setPolicies] = useState<PolicyRecord[]>(localDb.getPoliciesFromLocalStorage());
  const [vouchers, setVouchers] = useState<OfflineVoucher[]>(localDb.getVouchersFromLocalStorage());
  const [outbox, setOutbox] = useState<PolicyRecord[]>(localDb.getOutboxFromLocalStorage());
  const [activeSubTab, setActiveSubTab] = useState<'policies' | 'vouchers' | 'outbox' | 'architecture'>('policies');

  const refreshData = () => {
    setMetrics(localDb.getStorageMetrics());
    setPolicies(localDb.getPoliciesFromLocalStorage());
    setVouchers(localDb.getVouchersFromLocalStorage());
    setOutbox(localDb.getOutboxFromLocalStorage());
  };

  useEffect(() => {
    const unsubscribe = localDb.subscribe(refreshData);
    return () => unsubscribe();
  }, []);

  const handleManualSync = () => {
    localDb.clearOutbox();
    onSyncOutbox();
    audioService.playTone('success');
    refreshData();
  };

  const handleExportJson = () => {
    const exportData = {
      timestamp: Date.now(),
      metrics,
      policies,
      vouchers,
      outbox
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nic_dbt_database_dump_${Date.now()}.json`;
    a.click();
    audioService.playTone('click');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner: NIC Database Console */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-800"></span>
              <h2 className="text-base font-bold text-[#002244]">
                {t.nicDbTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {t.nicDbSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition-colors"
            >
              <ArrowDownToLine className="w-3.5 h-3.5 text-blue-800" />
              <span>{t.nicBackupBtn}</span>
            </button>
            {outbox.length > 0 && (
              <button
                onClick={handleManualSync}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#002244] hover:bg-[#0b3c6d] text-white rounded-lg text-xs font-bold shadow-xs animate-pulse transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.flushOutboxBtn} ({outbox.length} {t.pendingLabel})</span>
              </button>
            )}
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px] block">{language === 'hi' ? 'स्थानीय इंजन:' : 'Primary Engine:'}</span>
            <strong className="text-blue-900 font-bold">IndexedDB v1 ({language === 'hi' ? 'सक्रिय' : 'Active'})</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px] block">{language === 'hi' ? 'पॉलिसी रिकॉर्ड:' : 'Policy Records:'}</span>
            <strong className="text-slate-900 font-bold">{metrics.totalPoliciesStored} {language === 'hi' ? 'पंजीकृत' : 'Stored'}</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px] block">{language === 'hi' ? 'ऑफलाइन डीबीटी वाउचर:' : 'Offline DBT Vouchers:'}</span>
            <strong className="text-emerald-800 font-bold">{metrics.totalVouchersStored} {language === 'hi' ? 'सक्रिय' : 'Active'}</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px] block">{language === 'hi' ? 'सिंक आउटबॉक्स कतार:' : 'Sync Outbox Queue:'}</span>
            <strong className={`font-bold ${metrics.outboxPendingSyncCount > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
              {metrics.outboxPendingSyncCount} {language === 'hi' ? 'कतारबद्ध' : 'Queued'}
            </strong>
          </div>
        </div>
      </div>

      {/* Subtabs */}
      <div className="flex gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('policies')}
          className={`px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'policies'
              ? 'bg-[#002244] text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
          }`}
        >
          {t.tabPoliciesTable} ({policies.length})
        </button>

        <button
          onClick={() => setActiveSubTab('vouchers')}
          className={`px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'vouchers'
              ? 'bg-[#002244] text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
          }`}
        >
          {t.tabVouchersTable} ({vouchers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('outbox')}
          className={`px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'outbox'
              ? 'bg-[#002244] text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
          }`}
        >
          {t.tabOutboxTable} ({outbox.length})
        </button>

        <button
          onClick={() => setActiveSubTab('architecture')}
          className={`px-3.5 py-2 rounded-lg transition-all ${
            activeSubTab === 'architecture'
              ? 'bg-[#002244] text-white'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
          }`}
        >
          {t.tabArchitecture}
        </button>
      </div>

      {/* Policies Table View */}
      {activeSubTab === 'policies' && (
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-[#002244]">{t.tablePoliciesHeader}</h3>
            <span className="text-[11px] text-slate-500 font-mono">KeyPath: id</span>
          </div>

          {policies.length > 0 ? (
            <div className="space-y-2.5">
              {policies.map(p => (
                <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center text-slate-800">
                    <span className="font-bold text-blue-900 font-mono">{p.id}</span>
                    <span className="text-slate-500 font-mono text-[11px]">Tx: {p.clientTxUuid}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      p.status === 'bound_offline' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                    <div>{language === 'hi' ? 'लाभार्थी:' : 'Beneficiary:'} <strong className="text-slate-900">{p.farmerName}</strong></div>
                    <div>{language === 'hi' ? 'फसल:' : 'Crop:'} <strong>{p.productName}</strong></div>
                    <div>{language === 'hi' ? 'प्रीमियम:' : 'Premium:'} <strong>₹{p.premiumPaidPaise / 100}</strong></div>
                    <div>{language === 'hi' ? 'डीबीटी कवर:' : 'Cover:'} <strong className="text-emerald-700">₹{p.maxPayoutPaise / 100}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              {t.noPoliciesFound}
            </div>
          )}
        </div>
      )}

      {/* Vouchers Table View */}
      {activeSubTab === 'vouchers' && (
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-[#002244]">{t.tableVouchersHeader}</h3>
          </div>

          {vouchers.length > 0 ? (
            <div className="space-y-2.5">
              {vouchers.map(v => (
                <div key={v.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-900 font-mono">{v.id}</span>
                    <span className="font-bold text-emerald-800 text-sm font-mono">
                      ₹{(v.amountPaise / 100).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-bold font-mono">
                      OTP: {v.voucherCode}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    {language === 'hi' ? 'स्थिति:' : 'Status:'} <strong className="uppercase text-slate-900">{v.status}</strong> | {language === 'hi' ? 'प्रमाण:' : 'Proof:'} <span className="font-mono">{v.offlinePinProof}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
              {t.noVouchersFound}
            </div>
          )}
        </div>
      )}

      {/* Outbox Queue View */}
      {activeSubTab === 'outbox' && (
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-[#002244]">{t.tableOutboxHeader}</h3>
            <span className="text-[11px] text-slate-500 font-mono">108 Bytes / Transaction</span>
          </div>

          {outbox.length > 0 ? (
            <div className="space-y-2.5">
              {outbox.map((item, idx) => (
                <div key={idx} className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between items-center text-amber-900 font-bold">
                    <span className="font-mono">UUID: {item.clientTxUuid}</span>
                    <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded uppercase">{language === 'hi' ? 'ऑफलाइन कतारबद्ध' : 'QUEUED OFFLINE'}</span>
                  </div>
                  <p className="text-slate-700 text-[11px]">
                    {language === 'hi' ? 'योजना:' : 'Scheme:'} {item.productName} ({item.farmerName})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-col items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              <span>{t.outboxEmptyMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* Architecture Documentation */}
      {activeSubTab === 'architecture' && (
        <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-4 text-xs text-slate-700 leading-relaxed">
          <h3 className="text-sm font-bold text-[#002244]">
            {t.archTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-bold text-[#002244]">{t.archPoint1Title}</h4>
              <p>{t.archPoint1Desc}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <h4 className="font-bold text-[#002244]">{t.archPoint2Title}</h4>
              <p>{t.archPoint2Desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
