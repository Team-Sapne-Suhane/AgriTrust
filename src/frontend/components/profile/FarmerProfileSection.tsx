import React, { useState } from 'react';
import { UserProfile, Language, PolicyRecord } from '../../../types';
import { TRANSLATIONS } from '../../translations/translations';
import { walletService } from '../../../backend/services/walletService';
import { audioService } from '../../../backend/services/audioService';
import {
  Home,
  FileText,
  Search,
  HardDrive,
  Layers,
  Info,
  Smartphone,
  ExternalLink,
  CheckCircle2,
  Check,
  User,
  Users,
  ShieldCheck,
  CreditCard,
  Building2,
  MapPin,
  Phone,
  QrCode,
  Lock,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Edit3,
  Calendar,
  History,
  Scale,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

interface FarmerProfileSectionProps {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  language: Language;
  onNavigateToInsurance: () => void;
  activePolicies: PolicyRecord[];
}

export const FarmerProfileSection: React.FC<FarmerProfileSectionProps> = ({
  currentProfile,
  profiles,
  onSelectProfile,
  language,
  onNavigateToInsurance,
  activePolicies
}) => {
  const t = TRANSLATIONS[language];
  const [activeSubTab, setActiveSubTab] = useState<'home' | 'profile' | 'documents' | 'nominee' | 'activities' | 'switch_account'>('home');
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [showPin, setShowPin] = useState(false);

  React.useEffect(() => {
    const handleSubTabChange = (e: CustomEvent) => {
      if (e.detail && ['home', 'profile', 'documents', 'nominee', 'activities', 'switch_account'].includes(e.detail)) {
        setActiveSubTab(e.detail);
      }
    };
    window.addEventListener('set-profile-subtab' as any, handleSubTabChange);
    return () => {
      window.removeEventListener('set-profile-subtab' as any, handleSubTabChange);
    };
  }, []);

  // Active member metrics
  const memberPolicies = activePolicies.filter(p => p.profileId === currentProfile.id);
  const memberBalance = walletService.getProfileBalance(currentProfile.id);
  const memberLedger = walletService.getLedgerForProfile(currentProfile.id);

  const handleMemberSwitch = (p: UserProfile) => {
    onSelectProfile(p);
    audioService.playTone('success');
    setIsSwitchModalOpen(false);
    const greetingName = language === 'te' 
      ? (p.nameTe || p.name) 
      : language === 'hi' 
      ? (p.nameHi || p.name) 
      : p.name;
    const msg = language === 'te'
      ? `ఖాతా మార్చబడింది: ${greetingName} ప్రొఫైల్ సక్రియం చేయబడింది.`
      : language === 'hi'
      ? `खाता बदला गया: ${greetingName} की प्रोफाइल सक्रिय हुई।`
      : `Account switched: Active profile is now ${p.name}.`;
    audioService.speak(msg, language);
  };

  const getLocalizedName = (p: UserProfile) => {
    if (language === 'te') return p.nameTe || p.name;
    if (language === 'hi') return p.nameHi || p.name;
    return p.name;
  };

  const getLocalizedRelation = (p: UserProfile) => {
    if (language === 'te') return p.relationTe || p.relation;
    if (language === 'hi') return p.relationHi || p.relation;
    return p.relation;
  };

  const getLocalizedNomineeRelation = (p: UserProfile) => {
    if (language === 'te') return p.nomineeRelationTe || p.nomineeRelation;
    if (language === 'hi') return p.nomineeRelationHi || p.nomineeRelation;
    return p.nomineeRelation;
  };

  // Compute DOB from age
  const birthYear = 2026 - currentProfile.age;
  const dobStr = `${birthYear}-03-15`;

  return (
    <div className="bg-slate-100 min-h-[85vh] text-slate-800 font-sans py-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-6">
        {/* Left Vertical Sidebar Menu */}
        <aside className="w-full md:w-60 shrink-0 space-y-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xs space-y-1 text-xs">
            <button
              onClick={() => setActiveSubTab('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeSubTab === 'home'
                  ? 'bg-blue-50 text-blue-950 font-bold border-l-4 border-blue-900 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-slate-600" />
              <span>{language === 'te' ? 'హోమ్ (Home)' : language === 'hi' ? 'होम (Home)' : 'Home'}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('profile')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeSubTab === 'profile'
                  ? 'bg-blue-50 text-blue-950 font-bold border-l-4 border-blue-900 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4 text-slate-600" />
              <span>{language === 'te' ? 'నా ప్రొఫైల్ (My Profile)' : language === 'hi' ? 'मेरी प्रोफाइल (My Profile)' : 'My Profile'}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('documents')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeSubTab === 'documents'
                  ? 'bg-blue-50 text-blue-950 font-bold border-l-4 border-blue-900 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>{language === 'te' ? 'జారీ చేసిన పత్రాలు' : language === 'hi' ? 'जारी दस्तावेज़' : 'Issued Documents'}</span>
              </div>
              <span className="px-1.5 py-0.2 bg-blue-100 text-blue-950 font-bold rounded-full text-[10px]">
                4
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('nominee')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeSubTab === 'nominee'
                  ? 'bg-blue-50 text-blue-950 font-bold border-l-4 border-blue-900 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-slate-600" />
              <span>{language === 'te' ? 'నామినీ (Nominee)' : language === 'hi' ? 'नामित (Nominee)' : 'Nominee'}</span>
            </button>

            <button
              onClick={() => setActiveSubTab('activities')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all ${
                activeSubTab === 'activities'
                  ? 'bg-blue-50 text-blue-950 font-bold border-l-4 border-blue-900 shadow-2xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <History className="w-4 h-4 text-slate-600" />
                <span>{language === 'te' ? 'లావాదేవీలు & కార్యకలాపాలు' : language === 'hi' ? 'गतिविधियाँ व लेजर' : 'Activities'}</span>
              </div>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-950 font-bold rounded-full text-[10px]">
                {memberLedger.length}
              </span>
            </button>

            <button
              onClick={() => setIsSwitchModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-all border-t border-slate-100 mt-1"
            >
              <RefreshCw className="w-4 h-4 text-blue-800" />
              <span>{language === 'te' ? 'ఖాతా మార్చండి (Switch)' : language === 'hi' ? 'खाता बदलें (Switch)' : 'Switch Account'}</span>
            </button>

            <button
              onClick={onNavigateToInsurance}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all mt-2"
            >
              <div className="flex items-center gap-2">
                <span>🌾</span>
                <span>{language === 'te' ? 'పంట బీమా నమోదు' : language === 'hi' ? 'फसल बीमा पंजीकरण' : 'Crop Insurance'}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          {/* Top Welcome Title & IT Act Disclaimer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-1">
            <h2 className="text-xl font-black text-blue-950 tracking-tight">
              Welcome, {getLocalizedName(currentProfile)} !
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              AgriStack &lsquo;Issued Documents&rsquo; are at par with original documents as per IT ACT, 2000 &bull; Verified under National AgriStack
            </p>
          </div>

          {/* Section 1: Your Issued Documents Carousel / Cards */}
          {(activeSubTab === 'home' || activeSubTab === 'documents') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide">
                  Your Issued Documents
                </h3>
                <button
                  onClick={() => setActiveSubTab('documents')}
                  className="text-xs font-bold text-blue-800 hover:text-blue-950 hover:underline"
                >
                  VIEW ALL (4)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {/* Document Card 1: Aadhaar Card */}
                <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 shadow-2xs transition-all space-y-3 flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center shrink-0">
                      <span className="text-2xl">🆔</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        Aadhaar Card
                      </h4>
                      <p className="font-mono text-[11px] text-slate-600 font-bold mt-0.5">
                        {currentProfile.aadhaarMasked}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate">Unique Identification Authority of India</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>UIDAI</span>
                    </span>
                  </div>
                </div>

                {/* Document Card 2: AgriStack Farmer ID (FID) */}
                <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 shadow-2xs transition-all space-y-3 flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-center shrink-0">
                      <span className="text-2xl">🌾</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        AgriStack Farmer ID (FID)
                      </h4>
                      <p className="font-mono text-[11px] text-blue-950 font-bold mt-0.5">
                        {currentProfile.agriStackFid}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate">Ministry of Agriculture & Farmers Welfare</span>
                    <span className="text-blue-900 font-bold">AgriStack</span>
                  </div>
                </div>

                {/* Document Card 3: Bhulekh RoR Land Record */}
                <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 shadow-2xs transition-all space-y-3 flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center shrink-0">
                      <span className="text-2xl">📜</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        Revenue Land Title (RoR)
                      </h4>
                      <p className="font-mono text-[11px] text-emerald-950 font-bold mt-0.5">
                        {currentProfile.khasraNo} &bull; {currentProfile.landAreaAcres} Acres
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate">Revenue Dept, {currentProfile.state}</span>
                    <span className="text-emerald-800 font-bold">DILRMP</span>
                  </div>
                </div>

                {/* Document Card 4: PM-KISAN Beneficiary Certificate */}
                <div className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 shadow-2xs transition-all space-y-3 flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-center shrink-0">
                      <span className="text-2xl">🏛️</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">
                        PM-KISAN DBT Certificate
                      </h4>
                      <p className="font-mono text-[11px] text-purple-950 font-bold mt-0.5">
                        {currentProfile.pmKisanId}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate">Direct Benefit Transfer Division</span>
                    <span className="text-purple-800 font-bold">17th DBT OK</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: DigiLocker Profile / User Details Table (Exact match to Screenshot 3) */}
          {(activeSubTab === 'home' || activeSubTab === 'profile') && (
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5">
                  <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wide">
                    User Details
                  </h3>
                </div>

                <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
                  {/* Left: Circular Photo & Verified Badge */}
                  <div className="flex flex-col items-center gap-2.5 shrink-0 mx-auto md:mx-0">
                    <div className="w-28 h-28 rounded-full border-4 border-[#002244]/20 bg-slate-100 flex items-center justify-center text-5xl shadow-md overflow-hidden relative">
                      {currentProfile.photoUrl ? (
                        <img
                          src={currentProfile.photoUrl}
                          alt={currentProfile.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{currentProfile.avatar}</span>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-full font-bold text-xs shadow-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Verified</span>
                    </span>
                  </div>

                  {/* Right: Table of User Details */}
                  <div className="flex-1 w-full divide-y divide-slate-200 text-xs">
                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center">
                      <span className="w-36 text-slate-500 font-semibold">Name</span>
                      <span className="w-8 text-slate-400 font-mono hidden sm:inline">:</span>
                      <span className="font-bold text-slate-900 text-sm">{getLocalizedName(currentProfile)}</span>
                    </div>

                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center">
                      <span className="w-36 text-slate-500 font-semibold">DOB</span>
                      <span className="w-8 text-slate-400 font-mono hidden sm:inline">:</span>
                      <span className="font-mono text-slate-800 font-semibold">{dobStr} ({currentProfile.age} Yrs)</span>
                    </div>

                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center">
                      <span className="w-36 text-slate-500 font-semibold">Gender</span>
                      <span className="w-8 text-slate-400 font-mono hidden sm:inline">:</span>
                      <span className="text-slate-800 font-semibold">{currentProfile.gender === 'M' ? 'Male' : 'Female'}</span>
                    </div>

                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <span className="w-36 text-slate-500 font-semibold">Mobile</span>
                        <span className="w-8 text-slate-400 font-mono hidden sm:inline">:</span>
                        <span className="font-mono text-slate-900 font-bold">{currentProfile.phone}</span>
                      </div>
                      <button className="text-blue-800 hover:text-blue-950 text-xs font-bold flex items-center gap-1 self-start sm:self-auto mt-1 sm:mt-0">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center">
                      <span className="w-36 text-slate-500 font-semibold">Aadhaar (UIDAI)</span>
                      <span className="w-8 text-slate-400 font-mono hidden sm:inline">:</span>
                      <span className="font-mono text-slate-900 font-bold">{currentProfile.aadhaarMasked} (Linked)</span>
                    </div>

                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center">
                      <span className="w-36 text-slate-500 font-semibold">AgriStack FID</span>
                      <span className="w-8 text-slate-400 font-mono hidden sm:inline">:</span>
                      <span className="font-mono text-blue-950 font-bold">{currentProfile.agriStackFid}</span>
                    </div>

                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center">
                      <span className="w-36 text-slate-500 font-semibold">Land Khasra (RoR)</span>
                      <span className="w-8 text-slate-400 font-mono hidden sm:inline">:</span>
                      <span className="font-mono text-emerald-950 font-bold">{currentProfile.khasraNo} &bull; {currentProfile.landAreaAcres} Acres</span>
                    </div>

                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center">
                      <span className="w-36 text-slate-500 font-semibold">DBT Bank Account</span>
                      <span className="w-8 text-slate-400 font-mono hidden sm:inline">:</span>
                      <span className="font-mono text-slate-900 font-bold">{currentProfile.bankName} ({currentProfile.bankAccount}) &bull; APB Linked</span>
                    </div>

                    <div className="py-2.5 flex flex-col sm:flex-row sm:items-center">
                      <span className="w-36 text-slate-500 font-semibold">Email</span>
                      <span className="w-8 text-slate-400 font-mono hidden sm:inline">:</span>
                      <button className="text-blue-800 hover:text-blue-950 font-bold underline">
                        Add Email
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Nominee Details */}
          {(activeSubTab === 'home' || activeSubTab === 'nominee') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-900" />
                  <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wide">
                    Registered Nominee
                  </h3>
                </div>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded font-bold text-[10px]">
                  100% Legal Succession Share
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Nominee Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{currentProfile.nomineeName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Relationship:</span>
                  <span className="font-bold text-purple-950 text-sm">{getLocalizedNomineeRelation(currentProfile)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Status:</span>
                  <span className="font-bold text-emerald-800 flex items-center gap-1 text-xs mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aadhaar e-Sign Verified</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Activities & Passbook Ledger */}
          {(activeSubTab === 'activities') && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-900" />
                  <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wide">
                    Account Activities &amp; Ledger
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  Wallet Balance: ₹{(memberBalance / 100).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="space-y-2">
                {memberLedger.map(tx => {
                  const isCredit = tx.amountPaise > 0;
                  const absAmount = (Math.abs(tx.amountPaise) / 100).toLocaleString('en-IN');
                  const bal = (tx.balanceAfterPaise / 100).toLocaleString('en-IN');
                  const txTitle = language === 'te' ? tx.titleTe : language === 'hi' ? tx.titleHi : tx.title;

                  const d = new Date(tx.timestamp);
                  const dtStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                  const tmStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={tx.txId}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isCredit ? <ArrowDownLeft className="w-4 h-4 stroke-[3]" /> : <ArrowUpRight className="w-4 h-4 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{txTitle}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {tx.txId} &bull; {dtStr}, {tmStr} &bull; {tx.paymentRail}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-black text-sm block ${isCredit ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isCredit ? '+' : '-'} ₹{absAmount}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Bal: ₹{bal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Switch Account Modal (Family Members) */}
      {isSwitchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-lg w-full shadow-2xl p-6 space-y-4 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-blue-900" />
                <div>
                  <h3 className="text-sm font-bold text-[#002244]">
                    {language === 'te' ? 'కుటుంబ సభ్యుల ఖాతాను ఎంచుకోండి' : language === 'hi' ? 'परिवार के सदस्य का खाता चुनें' : 'Switch Family Member Account'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Aadhaar, AgriStack FID and Land Titles update dynamically
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSwitchModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {profiles.filter(p => p.id === 'user_rameshwar' || p.id === 'user_sunita').map(p => {
                const isSelected = p.id === currentProfile.id;
                const pBal = walletService.getProfileBalance(p.id);

                return (
                  <button
                    key={p.id}
                    onClick={() => handleMemberSwitch(p)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-800 ring-2 ring-blue-800/30 font-bold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-slate-300 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{p.avatar}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{getLocalizedName(p)}</h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {getLocalizedRelation(p)} &bull; {p.landAreaAcres} Acres
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-800 block">
                        ₹{(pBal / 100).toLocaleString('en-IN')}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.2 bg-blue-900 text-white rounded text-[9px] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsSwitchModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


