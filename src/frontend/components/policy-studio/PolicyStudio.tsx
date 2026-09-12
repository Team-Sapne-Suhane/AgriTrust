import React, { useState } from 'react';
import { DeclarativeProduct, Crop, RegionGrid, Language } from '../../../types';
import { DEFAULT_CROPS, DEFAULT_GRIDS } from '../../../database/seeds/initialData';
import { TRANSLATIONS } from '../../translations/translations';
import { policyEngine } from '../../../backend/services/policyEngine';
import { audioService } from '../../../backend/services/audioService';
import { PlusCircle, CheckCircle, Code, Layers, FileCode2, Building2 } from 'lucide-react';

interface PolicyStudioProps {
  language: Language;
  onProductCreated: (prod: DeclarativeProduct) => void;
}

export const PolicyStudio: React.FC<PolicyStudioProps> = ({ language, onProductCreated }) => {
  const t = TRANSLATIONS[language];
  const [products, setProducts] = useState<DeclarativeProduct[]>(policyEngine.getAllProducts());
  const [code, setCode] = useState('MUST-DRY-26');
  const [name, setName] = useState(language === 'hi' ? 'रबी सरसों सूखा सुरक्षा योजना 2026-27' : 'Rabi Mustard Extreme Drought Shield 2026-27');
  const [cropId, setCropId] = useState('crop_mustard');
  const [gridId, setGridId] = useState('grid_solapur_02');
  const [thresholdMm, setThresholdMm] = useState(28);
  const [maxPayoutInr, setMaxPayoutInr] = useState(10000);
  const [premiumInr, setPremiumInr] = useState(140);
  const [wAws, setWAws] = useState(0.35);
  const [wRadar, setWRadar] = useState(0.35);
  const [wSat, setWSat] = useState(0.30);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLaunchProduct = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newProd = policyEngine.launchDeclarativeProduct({
        code,
        name,
        cropId,
        gridId,
        thresholdMm,
        maxPayoutPaise: maxPayoutInr * 100,
        premiumPaise: premiumInr * 100,
        season: 'Rabi 2026-27',
        oracleWeights: {
          awsGround: wAws,
          imdRadar: wRadar,
          chirpsSat: wSat
        },
        payoutCurveType: 'step_binary',
        active: true
      });

      setProducts(policyEngine.getAllProducts());
      onProductCreated(newProd);
      audioService.playTone('success');
      setSuccessMsg(
        language === 'hi'
          ? `योजना "${newProd.name}" नीति आयोग सैंडबॉक्स में बिना कोड डिप्लॉयमेंट के तुरंत सक्रिय हुई!`
          : `Scheme "${newProd.name}" launched live in NITI Aayog Sandbox with 0 Code Deployment!`
      );
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: unknown) {
      audioService.playTone('alert');
      alert((err as Error).message);
    }
  };

  const zeroCodeStats = policyEngine.getZeroCodeStats();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* NITI Aayog Sandbox Banner */}
      <div className="bg-white border border-slate-300 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-800"></span>
            <h2 className="text-base font-bold text-[#002244]">
              {t.nitiStudioTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            {t.nitiStudioSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300">
            <span className="text-slate-600 mr-2">{t.zeroCodeLaunches}</span>
            <strong className="text-blue-900 font-mono text-sm">{zeroCodeStats.launchedWithoutCode}</strong>
          </div>
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300">
            <span className="text-slate-600 mr-2">{t.activeCatalog}</span>
            <strong className="text-slate-900 font-mono text-sm">{zeroCodeStats.totalActive}</strong>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-400 p-3 rounded-lg flex items-center gap-2 text-emerald-900 text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-700" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NITI Authoring Form */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wide">
              {t.authorSchemeTitle}
            </h3>
          </div>

          <form onSubmit={handleLaunchProduct} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">{t.schemeCodeLabel}</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">{t.droughtThresholdLabel}</label>
                <input
                  type="number"
                  value={thresholdMm}
                  onChange={e => setThresholdMm(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-amber-900 font-bold outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-semibold">{t.schemeNameLabel}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">{t.cropSelectLabel}</label>
                <select
                  value={cropId}
                  onChange={e => setCropId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 outline-none"
                >
                  {DEFAULT_CROPS.map(c => (
                    <option key={c.id} value={c.id}>{language === 'hi' ? c.nameHi : c.nameEn}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">{t.gridSelectLabel}</label>
                <select
                  value={gridId}
                  onChange={e => setGridId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 outline-none"
                >
                  {DEFAULT_GRIDS.map(g => (
                    <option key={g.id} value={g.id}>{g.mandal} ({g.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">{t.farmerPremiumLabel}</label>
                <input
                  type="number"
                  value={premiumInr}
                  onChange={e => setPremiumInr(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-bold outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">{t.dbtPayoutLabel}</label>
                <input
                  type="number"
                  value={maxPayoutInr}
                  onChange={e => setMaxPayoutInr(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-emerald-800 font-bold outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#002244] hover:bg-[#0b3c6d] text-white font-bold rounded-lg text-xs transition-colors mt-2"
            >
              {t.launchSchemeBtn}
            </button>
          </form>
        </div>

        {/* Live Scheme Catalog */}
        <div className="bg-white border border-slate-300 rounded-xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold text-[#002244] uppercase tracking-wide">
              {t.nationalCatalogTitle} ({products.length})
            </h3>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
              {t.hotMemoryStore}
            </span>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {products.map(prod => (
              <div key={prod.id} className="bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{prod.name}</span>
                  <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">
                    {prod.code}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 text-[11px] text-slate-600">
                  <div>{language === 'hi' ? 'सीमा:' : 'Threshold:'} <strong className="text-amber-800">&lt; {prod.thresholdMm}mm</strong></div>
                  <div>{language === 'hi' ? 'प्रीमियम:' : 'Premium:'} <strong className="text-slate-900">₹{prod.premiumPaise / 100}</strong></div>
                  <div>{language === 'hi' ? 'डीबीटी भुगतान:' : 'Payout:'} <strong className="text-emerald-700 font-bold">₹{prod.maxPayoutPaise / 100}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
