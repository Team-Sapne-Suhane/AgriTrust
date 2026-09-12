import React, { useState, useEffect } from 'react';
import { Language, NetworkMode, UserProfile, PolicyRecord, DeclarativeProduct } from '../types';
import { DEFAULT_PROFILES } from '../database/seeds/initialData';
import { TRANSLATIONS } from './translations/translations';
import { GovHeader } from './components/layout/GovHeader';
import { GovFooter } from './components/layout/GovFooter';
import { FarmerApp } from './components/farmer/FarmerApp';
import { FarmerProfileSection } from './components/profile/FarmerProfileSection';
import { PolicyStudio } from './components/policy-studio/PolicyStudio';
import { OracleStation } from './components/oracles/OracleStation';
import { DatabaseInspector } from './components/database/DatabaseInspector';
import { H8StressTest } from './components/h8-demo/H8StressTest';
import { UssdSimulator } from './components/ussd/UssdSimulator';
import { IvrCallModal } from './components/notifications/IvrCallModal';
import { SmsToast } from './components/notifications/SmsToast';
import { ThreatModelModal } from './components/docs/ThreatModelModal';
import { UnitEconomicsModal } from './components/docs/UnitEconomicsModal';
import { WireFormatModal } from './components/docs/WireFormatModal';
import { networkShaper } from '../backend/services/wireBudget';
import { audioService } from '../backend/services/audioService';
import { localDb } from '../database/services/dbService';

class TabErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Tab render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white border border-rose-300 rounded-2xl p-6 text-center space-y-4 max-w-xl mx-auto my-8 shadow-md">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h3 className="text-base font-bold text-slate-900">Module Loading Error</h3>
          <p className="text-xs text-slate-600">
            {this.state.error?.message || 'An unexpected rendering error occurred in this module.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-950 text-white rounded-lg text-xs font-bold shadow hover:bg-blue-900 transition-all cursor-pointer"
          >
            Reload Module
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  const [networkMode, setNetworkMode] = useState<NetworkMode>('online');
  const [language, setLanguage] = useState<Language>('hi');
  const [profiles, setProfiles] = useState<UserProfile[]>(DEFAULT_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(DEFAULT_PROFILES[0]);
  const [activeTab, setActiveTab] = useState<string>('farmer');

  // Enforce profile list sync on reload / HMR to eliminate any cached old profiles
  useEffect(() => {
    setProfiles(DEFAULT_PROFILES);
    setCurrentProfile(prev => {
      const match = DEFAULT_PROFILES.find(p => p.id === prev.id);
      return match || DEFAULT_PROFILES[0];
    });
  }, []);
  
  // Policies initialized from local IndexedDB/LocalStorage database
  const [policies, setPolicies] = useState<PolicyRecord[]>(localDb.getPoliciesFromLocalStorage());

  // Modals state
  const [isThreatModalOpen, setIsThreatModalOpen] = useState(false);
  const [isEconomicsModalOpen, setIsEconomicsModalOpen] = useState(false);
  const [isWireModalOpen, setIsWireModalOpen] = useState(false);

  // Notification states
  const [ivrCallData, setIvrCallData] = useState<{ isOpen: boolean; farmerName: string; amountInr: number }>({
    isOpen: false,
    farmerName: '',
    amountInr: 0
  });
  const [smsMessage, setSmsMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = localDb.subscribe(() => {
      setPolicies(localDb.getPoliciesFromLocalStorage());
    });
    return () => unsubscribe();
  }, []);

  const handleNetworkChange = (mode: NetworkMode) => {
    setNetworkMode(mode);
    networkShaper.setMode(mode);
    audioService.playTone('click');
  };

  const handlePolicyBound = (newPolicy: PolicyRecord) => {
    setPolicies(prev => [newPolicy, ...prev.filter(p => p.id !== newPolicy.id)]);
    setSmsMessage(
      language === 'hi'
        ? `[भारत सरकार | DBT ALERT] प्रिय ${newPolicy.farmerName}, आपकी ${newPolicy.productName} पॉलिसी पंजीकृत हो चुकी है। वर्षा < ${newPolicy.thresholdMm}mm होने पर ₹${(newPolicy.maxPayoutPaise / 100).toLocaleString('en-IN')} का भुगतान स्वतः आपके खाते में आएगा।`
        : `[GOVT OF INDIA | DBT ALERT] Dear ${newPolicy.farmerName}, your ${newPolicy.productName} policy is registered. Upon deficit < ${newPolicy.thresholdMm}mm, ₹${(newPolicy.maxPayoutPaise / 100).toLocaleString('en-IN')} will be automatically credited.`
    );
  };

  const handlePayoutTriggered = (policy: PolicyRecord, amountPaise: number) => {
    const amountInr = amountPaise / 100;
    setIvrCallData({
      isOpen: true,
      farmerName: policy.farmerName,
      amountInr
    });
    setSmsMessage(
      language === 'hi'
        ? `[डीबीटी भारत अलर्ट] सूखा सत्यापन पूर्ण! ₹${amountInr.toLocaleString('en-IN')} की सूखा क्षतिपूर्ति राशि सीधे आपके फोन वॉलेट में भेज दी गई है। OTP से सरकारी बीज केंद्र पर उपयोग करें।`
        : `[DBT BHARAT ALERT] Drought deficit confirmed! ₹${amountInr.toLocaleString('en-IN')} compensation credited directly to your mobile wallet. Use OTP at authorized Govt Agro Kendra.`
    );
  };

  const handleTriggerIvrCallDirect = (farmerName: string, amountInr: number) => {
    setIvrCallData({
      isOpen: true,
      farmerName,
      amountInr
    });
    setSmsMessage(
      language === 'hi'
        ? `[H+8 आपातकालीन डीबीटी] सूखा सत्यापन पूर्ण! ₹${amountInr.toLocaleString('en-IN')} का त्वरित भुगतान जारी किया गया।`
        : `[H+8 EMERGENCY DBT] Drought verified! ₹${amountInr.toLocaleString('en-IN')} compensation disbursed instantly.`
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-900 selection:text-white pb-12">
      {/* Streamlined Government Header */}
      <GovHeader
        networkMode={networkMode}
        onNetworkChange={handleNetworkChange}
        language={language}
        onLanguageChange={setLanguage}
        currentProfile={currentProfile}
        profiles={profiles}
        onSelectProfile={setCurrentProfile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenThreatModal={() => setIsThreatModalOpen(true)}
        onOpenEconomicsModal={() => setIsEconomicsModalOpen(true)}
        onOpenWireModal={() => setIsWireModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <TabErrorBoundary>
          {activeTab === 'farmer' && (
            <FarmerApp
              language={language}
              onLanguageChange={setLanguage}
              currentProfile={currentProfile}
              networkMode={networkMode}
              onPolicyBound={handlePolicyBound}
              onTriggerSimulation={() => {
                setActiveTab('oracles');
              }}
              activePolicies={policies}
            />
          )}

          {activeTab === 'profile' && (
            <FarmerProfileSection
              currentProfile={currentProfile}
              profiles={profiles}
              onSelectProfile={setCurrentProfile}
              language={language}
              onNavigateToInsurance={() => setActiveTab('farmer')}
              activePolicies={policies}
            />
          )}

          {activeTab === 'policy_studio' && (
            <PolicyStudio
              language={language}
              onProductCreated={() => {
                setActiveTab('farmer');
              }}
            />
          )}

          {activeTab === 'oracles' && (
            <OracleStation
              language={language}
              activePolicies={policies}
              onPayoutTriggered={handlePayoutTriggered}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseInspector
              language={language}
              onSyncOutbox={() => {
                setSmsMessage(
                  language === 'hi'
                    ? 'आउटबॉक्स पूरी तरह से एनआईसी केंद्रीय लेजर के साथ समन्वित हो गया है।'
                    : 'Sync Outbox fully reconciled with NIC Central Server Ledger.'
                );
              }}
            />
          )}

          {activeTab === 'h8_stress' && (
            <H8StressTest
              language={language}
              currentProfile={currentProfile}
              profiles={profiles}
              onTriggerIvrCall={handleTriggerIvrCallDirect}
            />
          )}

          {activeTab === 'ussd' && (
            <UssdSimulator
              currentProfile={currentProfile}
              language={language}
            />
          )}
        </TabErrorBoundary>
      </main>

      {/* Clean Floating Quick Shortcuts Pill */}
      <div className="fixed bottom-4 inset-x-0 z-30 max-w-xl mx-auto px-4 pointer-events-none">
        <div className="bg-[#002244]/95 backdrop-blur-md text-white border border-slate-700/80 rounded-full px-3 py-1.5 shadow-xl flex items-center justify-between gap-1 text-[11px] pointer-events-auto">
          <span className="font-bold text-amber-400 px-2 hidden sm:inline text-[10px]">
            {language === 'hi' ? '🇮🇳 मूल्यांकन शॉर्टकट:' : '🇮🇳 Shortcuts:'}
          </span>
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => {
                handleNetworkChange('offline');
                setActiveTab('farmer');
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-100 rounded-full font-semibold transition-colors whitespace-nowrap text-[10px]"
            >
              1. {language === 'hi' ? 'ऑफलाइन पंजीकरण' : 'Offline Enroll'}
            </button>
            <button
              onClick={() => setActiveTab('policy_studio')}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-100 rounded-full font-semibold transition-colors whitespace-nowrap text-[10px]"
            >
              2. {language === 'hi' ? 'शून्य-कोड' : '0-Code'}
            </button>
            <button
              onClick={() => setActiveTab('oracles')}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-100 rounded-full font-semibold transition-colors whitespace-nowrap text-[10px]"
            >
              3. {language === 'hi' ? 'सूखा ट्रिगर' : 'Trigger'}
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-100 rounded-full font-semibold transition-colors whitespace-nowrap text-[10px]"
            >
              4. {language === 'hi' ? 'डेटाबेस' : 'DB'}
            </button>
            <button
              onClick={() => setActiveTab('h8_stress')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-semibold transition-colors whitespace-nowrap text-[10px]"
            >
              5. {language === 'hi' ? 'H+8' : 'H+8'}
            </button>
          </div>
        </div>
      </div>

      {/* Official Government Footer */}
      <GovFooter language={language} />

      {/* Modals & Notifications */}
      <IvrCallModal
        isOpen={ivrCallData.isOpen}
        onClose={() => setIvrCallData(prev => ({ ...prev, isOpen: false }))}
        farmerName={ivrCallData.farmerName}
        amountInr={ivrCallData.amountInr}
      />

      <SmsToast
        message={smsMessage}
        onClose={() => setSmsMessage(null)}
      />

      <ThreatModelModal
        isOpen={isThreatModalOpen}
        onClose={() => setIsThreatModalOpen(false)}
      />

      <UnitEconomicsModal
        isOpen={isEconomicsModalOpen}
        onClose={() => setIsEconomicsModalOpen(false)}
      />

      <WireFormatModal
        isOpen={isWireModalOpen}
        onClose={() => setIsWireModalOpen(false)}
      />
    </div>
  );
};

export default App;
