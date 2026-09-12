import React from 'react';
import { NetworkMode, Language, UserProfile } from '../../../types';
import { Wifi, WifiOff, Volume2, Shield, User, Database, Smartphone, Sliders, Radio, AlertOctagon, FileCode2, ChevronDown, Check } from 'lucide-react';
import { audioService } from '../../../backend/services/audioService';

interface HeaderProps {
  networkMode: NetworkMode;
  onNetworkChange: (mode: NetworkMode) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenThreatModal: () => void;
  onOpenEconomicsModal: () => void;
  onOpenWireModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  networkMode,
  onNetworkChange,
  language,
  onLanguageChange,
  currentProfile,
  profiles,
  onSelectProfile,
  activeTab,
  onTabChange,
  onOpenThreatModal,
  onOpenEconomicsModal,
  onOpenWireModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d0f17]/95 backdrop-blur-md border-b border-[#232738]">
      {/* Top Engineering & Constraint Bar */}
      <div className="bg-[#08090e] px-4 py-1.5 border-b border-[#1b1e2c] text-xs flex flex-wrap items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>FS-2604</span>
            <span className="text-slate-500 font-normal">| Parametric Micro-Insurance</span>
          </div>

          <div className="hidden md:flex items-center gap-1 pl-3 border-l border-[#232738]">
            <span className="text-slate-500 text-[11px]">Network:</span>
            <div className="inline-flex rounded-md bg-[#131622] p-0.5 border border-[#232738]">
              <button
                onClick={() => onNetworkChange('online')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  networkMode === 'online' ? 'bg-emerald-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                100 Mbps
              </button>
              <button
                onClick={() => onNetworkChange('degraded_2g')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  networkMode === 'degraded_2g' ? 'bg-amber-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2G (40kbps, 2s, 3% loss)
              </button>
              <button
                onClick={() => onNetworkChange('offline')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  networkMode === 'offline' ? 'bg-rose-600/90 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Uplink Cut
              </button>
            </div>
          </div>
        </div>

        {/* Constraint Audit Badges */}
        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={onOpenWireModal}
            className="px-2 py-0.5 bg-[#141724] hover:bg-[#1c2033] text-cyan-300 rounded border border-[#262c42] transition-colors"
          >
            Wire: <strong className="font-mono text-cyan-200">108 B</strong> / Sync
          </button>
          <button
            onClick={onOpenEconomicsModal}
            className="px-2 py-0.5 bg-[#141724] hover:bg-[#1c2033] text-emerald-300 rounded border border-[#262c42] transition-colors"
          >
            Cost: <strong className="font-mono text-emerald-200">₹0.20</strong> / Policy
          </button>
          <button
            onClick={onOpenThreatModal}
            className="px-2 py-0.5 bg-[#141724] hover:bg-[#1c2033] text-slate-300 rounded border border-[#262c42] transition-colors flex items-center gap-1"
          >
            <Shield className="w-3 h-3 text-purple-400" />
            <span>PIN Isolation</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                {language === 'hi' ? 'सुरक्षा किसान' : 'Suraksha Kisan'}
              </h1>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                Parametric MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {language === 'hi' ? 'ऑफलाइन स्वचालित सूखा सूचकांक बीमा' : 'Offline-First Drought Index Micro-Insurance'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#131622] p-1 rounded-xl border border-[#232738] overflow-x-auto">
          <button
            onClick={() => onTabChange('farmer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'farmer'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {language === 'hi' ? 'किसान पोर्टल' : 'Farmer Portal'}
          </button>

          <button
            onClick={() => onTabChange('policy_studio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'policy_studio'
                ? 'bg-[#23283d] text-cyan-300 shadow-sm font-semibold border border-[#373e5e]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Zero-Code Studio
          </button>

          <button
            onClick={() => onTabChange('oracles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'oracles'
                ? 'bg-[#23283d] text-cyan-300 shadow-sm font-semibold border border-[#373e5e]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            3-Oracle Trigger
          </button>

          <button
            onClick={() => onTabChange('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'database'
                ? 'bg-[#23283d] text-indigo-300 shadow-sm font-semibold border border-[#373e5e]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            DB &amp; Sync
          </button>

          <button
            onClick={() => onTabChange('h8_stress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'h8_stress'
                ? 'bg-rose-950/80 text-rose-200 shadow-sm font-semibold border border-rose-800'
                : 'text-rose-400 hover:text-rose-200'
            }`}
          >
            H+8 Stress Test
          </button>

          <button
            onClick={() => onTabChange('ussd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'ussd'
                ? 'bg-[#23283d] text-purple-300 shadow-sm font-semibold border border-[#373e5e]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            *144# (mKisan)
          </button>
        </nav>

        {/* Right Section: Profile & Language Controls */}
        <div className="flex items-center gap-2.5">
          {/* Shared Handset User Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141724] hover:bg-[#1a1e2f] border border-[#262c42] text-xs text-slate-200">
              <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 shrink-0">
                {currentProfile.photoUrl ? (
                  <img src={currentProfile.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs">{currentProfile.avatar}</span>
                )}
              </div>
              <span className="max-w-[100px] truncate font-medium">{currentProfile.name.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <div className="absolute right-0 mt-1 w-60 bg-[#121520] border border-[#272d45] rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
              <div className="text-[11px] text-slate-400 font-medium px-2 py-1 mb-1 border-b border-[#1e2335]">
                Shared Device Profiles (PIN Sandboxed)
              </div>
              {profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelectProfile(p)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    p.id === currentProfile.id ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' : 'text-slate-300 hover:bg-[#1b2030]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-slate-800 shrink-0">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs">{p.avatar}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{p.name}</p>
                      <p className="text-[10px] text-slate-400">{p.relation}</p>
                    </div>
                  </div>
                  {p.id === currentProfile.id && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Language Segment */}
          <div className="inline-flex rounded-lg bg-[#141724] p-0.5 border border-[#262c42] text-xs">
            <button
              onClick={() => {
                onLanguageChange('te');
                audioService.speak('తెలుగు భాష ఎంపిక చేయబడింది', 'te');
              }}
              className={`px-2 py-1 rounded font-semibold transition-all ${
                language === 'te' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => {
                onLanguageChange('hi');
                audioService.speak('हिंदी भाषा चुनी गई', 'hi');
              }}
              className={`px-2 py-1 rounded font-semibold transition-all ${
                language === 'hi' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => {
                onLanguageChange('en');
                audioService.speak('English selected', 'en');
              }}
              className={`px-2 py-1 rounded font-semibold transition-all ${
                language === 'en' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
