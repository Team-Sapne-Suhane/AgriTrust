import React from 'react';
import { NetworkMode, Language, UserProfile } from '../../../types';
import { TRANSLATIONS } from '../../translations/translations';
import { audioService } from '../../../backend/services/audioService';
import { ChevronDown, Check, Wifi, Globe, Shield, Activity } from 'lucide-react';

interface GovHeaderProps {
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

export const GovHeader: React.FC<GovHeaderProps> = ({
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
  const t = TRANSLATIONS[language];

  const renderNetworkShaper = () => (
    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[10px] sm:text-[11px] font-medium shrink-0">
      <button
        onClick={() => onNetworkChange('online')}
        className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
          networkMode === 'online' ? 'bg-[#002244] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span className="sm:hidden">100M</span>
        <span className="hidden sm:inline">100 Mbps</span>
      </button>
      <button
        onClick={() => onNetworkChange('degraded_2g')}
        className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
          networkMode === 'degraded_2g' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span className="sm:hidden">2G</span>
        <span className="hidden sm:inline">2G (40k)</span>
      </button>
      <button
        onClick={() => onNetworkChange('offline')}
        className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
          networkMode === 'offline' ? 'bg-rose-600 text-white font-bold shadow-xs animate-pulse' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <span className="sm:hidden">{language === 'hi' ? 'ऑफ' : 'Off'}</span>
        <span className="hidden sm:inline">{language === 'hi' ? 'ऑफलाइन' : 'Offline Cut'}</span>
      </button>
    </div>
  );

  const renderLanguageSwitcher = () => (
    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 font-bold text-[10px] sm:text-[11px] shrink-0">
      <button
        onClick={() => {
          onLanguageChange('te');
          audioService.speak('తెలుగు భాష ఎంపిక చేయబడింది', 'te');
        }}
        className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
          language === 'te' ? 'bg-[#002244] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        తెలుగు
      </button>
      <button
        onClick={() => {
          onLanguageChange('hi');
          audioService.speak('हिंदी भाषा सक्रिय की गई', 'hi');
        }}
        className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
          language === 'hi' ? 'bg-[#002244] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        हिन्दी
      </button>
      <button
        onClick={() => {
          onLanguageChange('en');
          audioService.speak('English selected', 'en');
        }}
        className={`px-1.5 sm:px-2 py-0.5 rounded transition-all ${
          language === 'en' ? 'bg-[#002244] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        EN
      </button>
    </div>
  );

  const renderProfileDropdown = () => (
    <div className="relative group shrink-0">
      <button
        onClick={() => {
          onTabChange('profile');
          window.dispatchEvent(new CustomEvent('set-profile-subtab', { detail: 'profile' }));
          audioService.playTone('click');
        }}
        title={language === 'te' ? 'రైతు ప్రొఫైల్ చూడండి' : language === 'hi' ? 'किसान प्रोफाइल देखें' : 'View Farmer Profile'}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
      >
        <div className="w-6 h-6 rounded-full bg-[#002244] text-white flex items-center justify-center text-xs font-bold border border-slate-300 overflow-hidden shrink-0">
          {currentProfile.photoUrl ? (
            <img src={currentProfile.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{currentProfile.avatar}</span>
          )}
        </div>
        <span className="max-w-[100px] sm:max-w-[160px] md:max-w-none truncate text-[11px] font-bold text-[#002244]">
          {language === 'te' ? (currentProfile.nameTe || currentProfile.name) : language === 'hi' ? (currentProfile.nameHi || currentProfile.name) : currentProfile.name}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:rotate-180" />
      </button>

      {/* Profile Popover Box */}
      <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex flex-col items-center text-center pb-3 pt-1 border-b border-slate-100">
          <div className="relative mb-2">
            <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-[#002244]/20 flex items-center justify-center text-2xl shadow-xs overflow-hidden">
              {currentProfile.photoUrl ? (
                <img src={currentProfile.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span>{currentProfile.avatar}</span>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center" title="Aadhaar Verified">
              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
            </div>
          </div>
          <h4 className="text-sm font-bold text-[#002244]">
            {language === 'te' ? (currentProfile.nameTe || currentProfile.name) : language === 'hi' ? (currentProfile.nameHi || currentProfile.name) : currentProfile.name}
          </h4>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {language === 'te' ? (currentProfile.relationTe || currentProfile.relation) : language === 'hi' ? (currentProfile.relationHi || currentProfile.relation) : currentProfile.relation} • {currentProfile.village}
          </p>

          <button
            onClick={() => {
              onTabChange('profile');
              window.dispatchEvent(new CustomEvent('set-profile-subtab', { detail: 'profile' }));
              audioService.playTone('click');
            }}
            className="mt-2.5 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 text-[11px] font-semibold rounded-full shadow-2xs transition-all"
          >
            {language === 'te' ? 'ఖాతా సెట్టింగ్‌లు నిర్వహించండి' : language === 'hi' ? 'खाता सेटिंग्स प्रबंधित करें' : 'Manage your Account Settings'}
          </button>
        </div>

        <div className="py-2 space-y-1">
          <button
            onClick={() => {
              onTabChange('profile');
              window.dispatchEvent(new CustomEvent('set-profile-subtab', { detail: 'profile' }));
              audioService.playTone('click');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#002244] flex items-center gap-2.5 transition-colors"
          >
            <span className="text-sm">👤</span>
            <span>{language === 'te' ? 'నా ప్రొఫైల్ (My Profile)' : language === 'hi' ? 'मेरी प्रोफाइल (My Profile)' : 'My Profile'}</span>
          </button>

          <button
            onClick={() => {
              onTabChange('profile');
              window.dispatchEvent(new CustomEvent('set-profile-subtab', { detail: 'nominee' }));
              audioService.playTone('click');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#002244] flex items-center gap-2.5 transition-colors"
          >
            <span className="text-sm">👥</span>
            <span>{language === 'te' ? 'నామినీ వివరాలు (Nominee)' : language === 'hi' ? 'नामिनी विवरण (Nominee)' : 'Nominee'}</span>
          </button>

          <button
            onClick={() => {
              onTabChange('profile');
              window.dispatchEvent(new CustomEvent('set-profile-subtab', { detail: 'activities' }));
              audioService.playTone('click');
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#002244] flex items-center gap-2.5 transition-colors"
          >
            <span className="text-sm">📋</span>
            <span>{language === 'te' ? 'కార్యకలాపాలు (Activities)' : language === 'hi' ? 'गतिविधियां (Activities)' : 'Activities'}</span>
          </button>

          <div className="pt-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>{language === 'te' ? 'ఖాతా మార్పిడి (Switch Account)' : language === 'hi' ? 'खाता बदलें (Switch Account)' : 'Switch Account'}</span>
              <span className="text-[9px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">Family</span>
            </div>
            <div className="space-y-0.5 mt-0.5">
              {profiles.filter(p => p.id === 'user_rameshwar' || p.id === 'user_sunita').map(p => {
                const pName = language === 'te' ? (p.nameTe || p.name) : language === 'hi' ? (p.nameHi || p.name) : p.name;
                const pRel = language === 'te' ? (p.relationTe || p.relation) : language === 'hi' ? (p.relationHi || p.relation) : p.relation;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectProfile(p);
                      audioService.playTone('success');
                      const greetingName = language === 'te' ? (p.nameTe || p.name) : language === 'hi' ? (p.nameHi || p.name) : p.name;
                      const msg = language === 'te' ? `ఖాతా మార్చబడింది: ${greetingName}` : language === 'hi' ? `खाता बदला गया: ${greetingName}` : `Switched to ${p.name}`;
                      audioService.speak(msg, language);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      p.id === currentProfile.id ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs overflow-hidden shrink-0">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span>{p.avatar}</span>
                        )}
                      </div>
                      <div className="truncate">
                        <span className="truncate block leading-tight">{pName}</span>
                        <span className="text-[9px] text-slate-400 font-normal block truncate">{pRel}</span>
                      </div>
                    </div>
                    {p.id === currentProfile.id && <Check className="w-3.5 h-3.5 text-blue-800 stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-2 mt-1">
          <button
            onClick={() => {
              audioService.playTone('click');
              onTabChange('farmer');
              window.dispatchEvent(new CustomEvent('go-home'));
            }}
            className="w-full text-center py-1.5 text-rose-600 hover:bg-rose-50 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>🚪</span>
            <span>{language === 'te' ? 'లాగ్ అవుట్ (Log Out)' : language === 'hi' ? 'लॉग आउट (Log Out)' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSchemeLogo = () => (
    <div className="pl-1.5 sm:pl-3 border-l border-slate-200 shrink-0 flex items-center">
      <img
        src="/left-logo.png"
        alt="Department / Scheme Logo"
        className="h-8 sm:h-10 w-auto object-contain transition-transform duration-200 hover:scale-105"
      />
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs w-full">
      {/* 1. Main Clean Government Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2">
        {/* Brand & Top Controls Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Official Brand Identity with Ashoka Emblem Image - Click to return to Home Screen */}
          <button
            onClick={() => {
              onTabChange('farmer');
              window.dispatchEvent(new CustomEvent('go-home'));
              audioService.playTone('click');
            }}
            title={language === 'te' ? 'హోమ్ స్క్రీన్‌కు వెళ్లండి' : language === 'hi' ? 'मुख्य पृष्ठ (होम) पर जाएं' : 'Go to Home Screen'}
            aria-label={language === 'te' ? 'హోమ్ స్క్రీన్‌కు వెళ్లండి' : language === 'hi' ? 'मुख्य पृष्ठ (होम) पर जाएं' : 'Go to Home Screen'}
            className="flex items-center gap-2 sm:gap-3 text-left group cursor-pointer focus:outline-none rounded-lg p-1 -m-1 transition-all hover:bg-slate-100/70 min-w-0 flex-1"
          >
            <div className="flex items-center justify-center pr-2 sm:pr-2.5 border-r border-slate-200 group-hover:border-blue-300 transition-colors shrink-0">
              <img
                src="/emblem.jpg"
                alt="State Emblem of India (Ashoka Pillar)"
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xs sm:text-sm md:text-[15px] font-bold text-[#002244] group-hover:text-blue-900 transition-colors tracking-tight font-serif leading-tight">
                  {t.portalTitle}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.2 bg-amber-50 text-amber-900 rounded border border-amber-200 shrink-0">
                  FS-2604
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium group-hover:text-slate-700 transition-colors leading-tight line-clamp-1 sm:line-clamp-none">
                {t.portalSubtitle}
              </p>
            </div>
          </button>

          {/* Desktop Right Controls (>= lg) */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs shrink-0">
            {renderNetworkShaper()}
            {/* Quick Metrics */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px]">
              <button
                onClick={onOpenWireModal}
                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 font-semibold"
              >
                Wire: <strong className="font-mono text-blue-950">108 B</strong>
              </button>
              <button
                onClick={onOpenEconomicsModal}
                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 font-semibold"
              >
                Cost: <strong className="font-mono text-emerald-800">₹0.20</strong>
              </button>
            </div>
            {renderProfileDropdown()}
            {renderLanguageSwitcher()}
            {renderSchemeLogo()}
          </div>

          {/* Mobile/Tablet Right Controls (< lg) */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            {renderProfileDropdown()}
            {renderSchemeLogo()}
          </div>
        </div>

        {/* Mobile / Tablet Quick Utility Row (< lg) */}
        <div className="flex lg:hidden items-center justify-between gap-2 pt-2 mt-1.5 border-t border-slate-100 text-xs">
          {renderNetworkShaper()}
          {renderLanguageSwitcher()}
        </div>
      </div>

      {/* 2. Sleek Government Navigation Bar */}
      <nav className="bg-[#0b3c6d] text-white">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 flex items-center gap-1 overflow-x-auto text-xs font-semibold py-0.5 no-scrollbar scroll-smooth">
          <button
            onClick={() => onTabChange('farmer')}
            className={`py-2 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'farmer'
                ? 'bg-[#002244] border-amber-400 text-white font-bold'
                : 'border-transparent text-slate-200 hover:bg-[#124b85] hover:text-white'
            }`}
          >
            <span>🌾</span>
            <span>{t.tabFarmer}</span>
          </button>

          <button
            onClick={() => onTabChange('profile')}
            className={`py-2 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'profile'
                ? 'bg-[#002244] border-amber-400 text-white font-bold'
                : 'border-transparent text-slate-200 hover:bg-[#124b85] hover:text-white'
            }`}
          >
            <span>👤</span>
            <span>{t.tabProfile}</span>
          </button>

          <button
            onClick={() => onTabChange('policy_studio')}
            className={`py-2 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'policy_studio'
                ? 'bg-[#002244] border-amber-400 text-white font-bold'
                : 'border-transparent text-slate-200 hover:bg-[#124b85] hover:text-white'
            }`}
          >
            <span>🏛️</span>
            <span>{t.tabPolicyStudio}</span>
          </button>

          <button
            onClick={() => onTabChange('oracles')}
            className={`py-2 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'oracles'
                ? 'bg-[#002244] border-amber-400 text-white font-bold'
                : 'border-transparent text-slate-200 hover:bg-[#124b85] hover:text-white'
            }`}
          >
            <span>🛰️</span>
            <span>{t.tabOracles}</span>
          </button>

          <button
            onClick={() => onTabChange('database')}
            className={`py-2 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'database'
                ? 'bg-[#002244] border-amber-400 text-white font-bold'
                : 'border-transparent text-slate-200 hover:bg-[#124b85] hover:text-white'
            }`}
          >
            <span>🗄️</span>
            <span>{t.tabDatabase}</span>
          </button>

          <button
            onClick={() => onTabChange('h8_stress')}
            className={`py-2 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'h8_stress'
                ? 'bg-[#800000] border-amber-400 text-white font-bold'
                : 'border-transparent text-amber-200 hover:bg-[#800000]/60'
            }`}
          >
            <span>⚠️</span>
            <span>{t.tabH8}</span>
          </button>

          <button
            onClick={() => onTabChange('ussd')}
            className={`py-2 px-3 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ussd'
                ? 'bg-[#002244] border-amber-400 text-white font-bold'
                : 'border-transparent text-slate-200 hover:bg-[#124b85] hover:text-white'
            }`}
          >
            <span>📱</span>
            <span>{t.tabUssd}</span>
          </button>
        </div>
      </nav>

      {/* Subtle Tiranga Underline */}
      <div className="tiranga-line w-full" />
    </header>
  );
};
