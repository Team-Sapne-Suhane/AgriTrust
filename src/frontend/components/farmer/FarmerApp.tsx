import React, { useState, useEffect } from 'react';
import { Crop, RegionGrid, DeclarativeProduct, UserProfile, PolicyRecord, Language, NetworkMode } from '../../../types';
import { DEFAULT_CROPS, DEFAULT_GRIDS } from '../../../database/seeds/initialData';
import { TRANSLATIONS } from '../../translations/translations';
import { audioService } from '../../../backend/services/audioService';
import { policyEngine } from '../../../backend/services/policyEngine';
import { networkShaper } from '../../../backend/services/wireBudget';
import { walletService } from '../../../backend/services/walletService';
import { localDb } from '../../../database/services/dbService';
import { Volume2, CheckCircle2, ShieldCheck, ShieldAlert, AlertCircle, ArrowRight, ArrowLeft, Lock, Zap, Store, QrCode, FileText, Check, Award, BadgeCheck, Search, Filter, MapPin, Navigation, LocateFixed, Loader2, RefreshCw, X, Globe, Radio, ArrowDownLeft, ArrowUpRight, Clock, Calendar, Landmark, History, Hash } from 'lucide-react';

interface FarmerAppProps {
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  currentProfile: UserProfile;
  networkMode: NetworkMode;
  onPolicyBound: (policy: PolicyRecord) => void;
  onTriggerSimulation: (policy: PolicyRecord) => void;
  activePolicies: PolicyRecord[];
}

export const FarmerApp: React.FC<FarmerAppProps> = ({
  language,
  onLanguageChange,
  currentProfile,
  networkMode,
  onPolicyBound,
  onTriggerSimulation,
  activePolicies
}) => {
  const t = TRANSLATIONS[language];
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCrop, setSelectedCrop] = useState<Crop>(DEFAULT_CROPS[0]);
  const [selectedAcreage, setSelectedAcreage] = useState<number>(currentProfile.landAreaAcres || 2);
  const [hasTenancyLease, setHasTenancyLease] = useState<boolean>(false);
  const [leasedAcres, setLeasedAcres] = useState<number>(6);
  const [leaseFid, setLeaseFid] = useState<string>('AGRI-LSE-AP-99214');
  const [isLeaseModalOpen, setIsLeaseModalOpen] = useState<boolean>(false);
  const [fraudWarning, setFraudWarning] = useState<string | null>(null);

  useEffect(() => {
    setSelectedAcreage(currentProfile.landAreaAcres || 2);
    setHasTenancyLease(false);
    setFraudWarning(null);
  }, [currentProfile.id, currentProfile.landAreaAcres]);

  const maxAllowedAcreage = (currentProfile.landAreaAcres || 2) + (hasTenancyLease ? leasedAcres : 0);

  const handleSelectAcreage = (acres: number) => {
    const clamped = Math.round(acres * 10) / 10;
    if (clamped > maxAllowedAcreage) {
      setFraudWarning(
        language === 'te'
          ? `ఎంపిక చేసిన విస్తీర్ణం (${clamped} ఎకరాలు) ధృవీకరించబడిన RoR పరిమితి (${maxAllowedAcreage.toFixed(1)} ఎకరాలు) కంటే ఎక్కువ. దయచేసి కౌలు ఒప్పందాన్ని జోడించండి.`
          : language === 'hi'
          ? `चयनित रकबा (${clamped} एकड़) आपके सत्यापित भू-अभिलेख RoR सीलिंग (${maxAllowedAcreage.toFixed(1)} एकड़) से अधिक है। अतिरिक्त रकबे के लिए कृपया बटाई/पट्टा (Tenancy Lease) जोड़ें।`
          : `Selected acreage (${clamped} Acres) exceeds verified AgriStack RoR ceiling (${maxAllowedAcreage.toFixed(1)} Acres). To insure extra land, attach a verified Tenancy Lease FID.`
      );
      audioService.playTone('alert');
      return;
    }
    setFraudWarning(null);
    setSelectedAcreage(clamped);
    audioService.playTone('click');
  };

  const [availableGrids, setAvailableGrids] = useState<RegionGrid[]>(DEFAULT_GRIDS);
  const [selectedGrid, setSelectedGrid] = useState<RegionGrid>(DEFAULT_GRIDS[0]);
  const [cropCategory, setCropCategory] = useState<string>('all');
  const [cropSearch, setCropSearch] = useState<string>('');

  // Automatic Location Detection & Nearby Weather Grid Mapping State
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'success' | 'denied' | 'error'>('idle');
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearestDistanceKm, setNearestDistanceKm] = useState<number | null>(null);
  const [filterNearbyOnly, setFilterNearbyOnly] = useState<boolean>(false);
  const [locationModalData, setLocationModalData] = useState<{
    isOpen: boolean;
    state: string;
    district: string;
    mandal: string;
    distanceKm: number;
    detectedLang: Language;
    lat: number;
    lng: number;
  } | null>(null);
  
  // Beneficiary Digital Consent & Mandate State (PM-SKP e-Mandate)
  const [consentAadhaarDbt, setConsentAadhaarDbt] = useState<boolean>(true);
  const [consentParametricRule, setConsentParametricRule] = useState<boolean>(true);
  const [isBinding, setIsBinding] = useState<boolean>(false);

  // Offline Spend Modal state
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const [selectedVoucherForSpend, setSelectedVoucherForSpend] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState<string>(
    language === 'hi' 
      ? 'सरकारी इफको / एनएफएल किसान सेवा केंद्र (Govt Agro Kendra)' 
      : language === 'te'
      ? 'ప్రభుత్వ ఇఫ్కో / రైతు సేవా కేంద్రం (Govt Agro Kendra)'
      : 'Govt IFFCO / NFL Kisan Seva Kendra (Kendra-04)'
  );
  const [itemType, setItemType] = useState<string>(
    language === 'hi' 
      ? 'प्रमाणित रबी सरसों बीज 5kg (Certified Seeds)' 
      : language === 'te'
      ? 'ధృవీకరించబడిన విత్తనాలు 5kg (Certified Seeds)'
      : 'Certified Rabi Mustard Seeds 5kg'
  );

  // Passbook & Transaction Ledger State
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [isPassbookModalOpen, setIsPassbookModalOpen] = useState(false);
  const [walletTick, setWalletTick] = useState<number>(0);

  useEffect(() => {
    const unsub = walletService.subscribe(() => {
      setWalletTick(t => t + 1);
    });
    return unsub;
  }, []);

  // Latest bound policy for current user
  const userPolicies = activePolicies.filter(p => p.profileId === currentProfile.id);
  const latestPolicy = userPolicies[0];

  const getPersonalizedStepAudio = (currentStep: number) => {
    const localizedName = language === 'te' ? (currentProfile.nameTe || currentProfile.name) : language === 'hi' ? (currentProfile.nameHi || currentProfile.name) : currentProfile.name;
    const firstName = currentProfile.name.split(' ')[0] || currentProfile.name;
    if (language === 'hi') {
      switch (currentStep) {
        case 1:
          return `नमस्ते ${localizedName} जी! अपनी मुख्य फसल चुनिए जिसके लिए आप सूखा बीमा लेना चाहते हैं।`;
        case 2:
          return 'आप कितने एकड़ में खेती कर रहे हैं? और अपना गाँव या मौसम ग्रिड चुनिए।';
        case 3:
          return 'ध्यान से सुनिए: यदि आपके क्षेत्र में कुल बारिश 35 मिलीमीटर से कम होती है, तो कंपनी बिना किसी फॉर्म या सर्वेक्षक के तुरंत आपके खाते में पूरा भुगतान भेज देगी।';
        case 4:
          return 'बधाई हो! आपकी पॉलिसी पंजीकृत और सुरक्षित हो गई है। सूखा पड़ते ही डीबीटी भुगतान सीधे आपके फोन वॉलेट में आ जाएगा।';
        default:
          return '';
      }
    } else if (language === 'te') {
      switch (currentStep) {
        case 1:
          return `నమస్కారం ${localizedName} గారూ! కరువు రక్షణ కోసం మీ ప్రధాన పంటను ఎంచుకోండి.`;
        case 2:
          return 'మీరు ఎన్ని ఎకరాల్లో సాగు చేస్తున్నారు? మీ విస్తీర్ణం మరియు వాతావరణ కేంద్రాన్ని ఎంచుకోండి.';
        case 3:
          return 'జాగ్రత్తగా వినండి: మీ ప్రాంతంలో వర్షపాతం 35 మి.మీ కంటే తక్కువగా నమోదైతే, ఎలాంటి సర్వేయర్ లేకుండా నేరుగా 10 సెకన్లలో పరిహారం మీ వాలెట్‌కు చేరుతుంది.';
        case 4:
          return 'అభినందనలు! మీ పాలసీ ఆఫ్ లైన్‌లో విజయవంతంగా నమోదైంది. కరువు రాగానే DBT సహాయం నేరుగా మీ ఫోన్ వాలెట్‌కు వస్తుంది.';
        default:
          return '';
      }
    } else {
      switch (currentStep) {
        case 1:
          return `Welcome ${firstName}! Please select the primary crop you want to protect with automatic drought insurance.`;
        case 2:
          return 'How many acres are you cultivating? Select your acreage and regional weather grid cell.';
        case 3:
          return 'Listen carefully: If cumulative rainfall in your grid drops below 35 millimeters, compensation is credited directly to your mobile wallet within 10 seconds.';
        case 4:
          return 'Congratulations! Your policy is registered and signed offline. If drought strikes, funds will arrive directly in your wallet.';
        default:
          return '';
      }
    }
  };

  // Narration on step change
  useEffect(() => {
    const text = getPersonalizedStepAudio(step);
    if (text) {
      audioService.speak(text, language);
    }
  }, [step, language, currentProfile.id]);

  // Handle Home Click (e.g. from Ashoka Emblem logo)
  useEffect(() => {
    const handleGoHome = () => {
      setStep(1);
    };
    window.addEventListener('go-home', handleGoHome);
    return () => window.removeEventListener('go-home', handleGoHome);
  }, []);

  const handleSelectCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    audioService.playTone('click');
    const msg = language === 'hi' 
      ? `${crop.nameHi} चुनी गई। सूखा सीमा ${crop.droughtThresholdMm} मिलीमीटर है।`
      : language === 'te'
      ? `${crop.nameEn} ఎంపిక చేయబడింది. కరువు పరిమితి ${crop.droughtThresholdMm} మి.మీ.`
      : `${crop.nameEn} selected. Drought trigger threshold is ${crop.droughtThresholdMm} millimeters.`;
    audioService.speak(msg, language);
  };


  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      setLocationMessage(
        language === 'hi'
          ? 'आपके ब्राउज़र में GPS स्थान सेवा समर्थित नहीं है।'
          : 'Geolocation is not supported by your browser.'
      );
      audioService.playTone('alert');
      return;
    }

    setIsLocating(true);
    setLocationStatus('locating');
    setLocationMessage(
      language === 'hi' ? 'GPS स्थान की पहचान की जा रही है...' : 'Detecting GPS location...'
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserCoords({ latitude: userLat, longitude: userLng });

        let placeName = 'स्थानीय ब्लॉक';
        let placeNameEn = 'Local Mandal';
        let district = 'कृषि परिक्षेत्र';
        let districtEn = 'Agri Zone';
        let state = 'भारत';
        let stateEn = 'India';

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLat}&lon=${userLng}&zoom=12&addressdetails=1`,
            {
              signal: controller.signal,
              headers: { 'Accept': 'application/json' }
            }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            district = addr.state_district || addr.county || addr.district || addr.city || addr.town || 'स्थानीय';
            districtEn = addr.city || addr.county || addr.state_district || addr.town || 'Local District';
            state = addr.state || 'भारत';
            stateEn = addr.state || 'India';
            placeName = addr.suburb || addr.neighbourhood || addr.village || addr.municipality || addr.town || district;
            placeNameEn = addr.suburb || addr.neighbourhood || addr.village || addr.municipality || addr.town || districtEn;
          }
        } catch {
          // offline or timeout, graceful fallback
        }

        const cleanCode = districtEn.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'AWS';

        // Create 3 hyper-local grid stations within 2 to 15 km of user's coordinates
        const localGrids: RegionGrid[] = [
          {
            id: `grid_local_01_${Date.now()}`,
            code: `${cleanCode}-AWS-01`,
            mandal: `${placeName} (${placeNameEn})`,
            district: districtEn,
            state: stateEn,
            normalSeasonalMm: 110,
            latitude: +(userLat + 0.015).toFixed(4),
            longitude: +(userLng + 0.012).toFixed(4)
          },
          {
            id: `grid_local_02_${Date.now()}`,
            code: `${cleanCode}-RAD-02`,
            mandal: `${district} Agromet Radar (${districtEn} Agro AWS)`,
            district: districtEn,
            state: stateEn,
            normalSeasonalMm: 125,
            latitude: +(userLat - 0.045).toFixed(4),
            longitude: +(userLng + 0.035).toFixed(4)
          },
          {
            id: `grid_local_03_${Date.now()}`,
            code: `${cleanCode}-ISRO-03`,
            mandal: `${district} Block Grid (${districtEn} Tehsil Grid)`,
            district: districtEn,
            state: stateEn,
            normalSeasonalMm: 115,
            latitude: +(userLat + 0.075).toFixed(4),
            longitude: +(userLng - 0.065).toFixed(4)
          }
        ];

        const combined = [...localGrids, ...DEFAULT_GRIDS];
        setAvailableGrids(combined);
        setSelectedGrid(localGrids[0]);
        const distKm = getDistanceFromLatLonInKm(userLat, userLng, localGrids[0].latitude, localGrids[0].longitude);
        setNearestDistanceKm(distKm);
        setFilterNearbyOnly(true);
        setLocationStatus('success');
        setIsLocating(false);

        let activeLang = language;
        const stateLower = (stateEn || '').toLowerCase();
        const districtLower = (districtEn || '').toLowerCase();
        
        // Auto-detect regional language based on location (Andhra Pradesh / Telangana -> Telugu)
        if (
          stateLower.includes('andhra') || 
          stateLower.includes('telangana') || 
          districtLower.includes('anantapur') || 
          districtLower.includes('kurnool') || 
          districtLower.includes('guntur') || 
          districtLower.includes('kadapa') ||
          districtLower.includes('chittoor')
        ) {
          activeLang = 'te';
          if (onLanguageChange) {
            onLanguageChange('te');
          }
        } else if (
          stateLower.includes('uttar pradesh') || 
          stateLower.includes('madhya pradesh') || 
          stateLower.includes('rajasthan') || 
          stateLower.includes('bihar') || 
          stateLower.includes('haryana') || 
          stateLower.includes('delhi')
        ) {
          activeLang = 'hi';
          if (onLanguageChange) {
            onLanguageChange('hi');
          }
        }

        setLocationModalData({
          isOpen: true,
          state: stateEn,
          district: districtEn,
          mandal: localGrids[0].mandal,
          distanceKm: distKm,
          detectedLang: activeLang,
          lat: +userLat.toFixed(4),
          lng: +userLng.toFixed(4)
        });

        audioService.playTone('success');
        const announcement = activeLang === 'te'
          ? `GPS స్థానం ధృవీకరించబడింది! సమీప వాతావరణ కేంద్రం ${localGrids[0].mandal} (${districtEn}, ${stateEn}) ఎంపిక చేయబడింది, ఇది కేవలం ${distKm} కి.మీ దూరంలో ఉంది. ప్రాంతీయ భాష తెలుగు ఎంపిక చేయబడింది.`
          : activeLang === 'hi'
          ? `GPS स्थान सत्यापित! निकटतम स्थानीय मौसम केंद्र ${localGrids[0].mandal} (${districtEn}, ${stateEn}) चुना गया, जो केवल ${distKm} किलोमीटर दूर है।`
          : `GPS location verified! Nearest local weather station ${localGrids[0].mandal} (${districtEn}, ${stateEn}) selected, only ${distKm} kilometers away.`;
        audioService.speak(announcement, activeLang);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied');
          setLocationMessage(
            language === 'hi'
              ? 'स्थान अनुमति अस्वीकृत की गई। आप नीचे दी गई सूची से अपना मौसम ग्रिड मैन्युअल रूप से चुन सकते हैं।'
              : 'Location access was denied. You can select your state weather grid cell manually below.'
          );
        } else {
          setLocationStatus('error');
          setLocationMessage(
            language === 'hi'
              ? 'स्थान प्राप्त करने में विफल। कृपया नीचे दी गई सूची से ग्रिड चुनें।'
              : 'Could not acquire GPS position. Please select a grid manually below.'
          );
        }
        audioService.playTone('alert');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleBindPolicy = async () => {
    if (!consentAadhaarDbt || !consentParametricRule) {
      audioService.playTone('alert');
      audioService.speak(
        language === 'hi' 
          ? 'कृपया आगे बढ़ने के लिए दोनों डिजिटल सहमति बॉक्स स्वीकार करें।' 
          : 'Please accept both digital mandate declarations to proceed.',
        language
      );
      return;
    }

    setIsBinding(true);
    audioService.playTone('click');

    const premiumPaise = selectedCrop.basePremiumPaisePerAcre * selectedAcreage;
    const maxPayoutPaise = selectedCrop.maxPayoutPaisePerAcre * selectedAcreage;
    const clientTxUuid = `GOV_DBT_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newPolicy: PolicyRecord = {
      id: `PM-SKP-${Date.now().toString().slice(-6)}`,
      clientTxUuid,
      profileId: currentProfile.id,
      farmerName: currentProfile.name,
      farmerPhone: currentProfile.phone,
      productId: 'prod_paddy_monsoon_2026',
      productName: `${language === 'hi' ? selectedCrop.nameHi : selectedCrop.nameEn} ${language === 'hi' ? 'सूखा सुरक्षा 2026' : 'Drought Shield 2026'}`,
      cropId: selectedCrop.id,
      gridId: selectedGrid.id,
      acreage: selectedAcreage,
      premiumPaidPaise: premiumPaise,
      maxPayoutPaise: maxPayoutPaise,
      thresholdMm: selectedCrop.droughtThresholdMm,
      boundOffline: networkMode === 'offline',
      boundTimestamp: Date.now(),
      comprehensionScore: 100,
      status: networkMode === 'offline' ? 'bound_offline' : 'synced'
    };

    networkShaper.serializePolicyToWire(newPolicy);
    await localDb.savePolicy(newPolicy);
    walletService.recordPolicyPurchase(newPolicy, premiumPaise);
    onPolicyBound(newPolicy);
    setStep(4);
    setIsBinding(false);
    audioService.playTone('success');
  };

  const handleSpendAtAgroShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucherForSpend) return;
    try {
      walletService.spendVoucherOffline(selectedVoucherForSpend, merchantName, 1200000);
      audioService.playTone('success');
      audioService.speak(
        language === 'hi'
          ? 'सरकारी बीज केंद्र पर वाउचर सफलतापूर्वक सत्यापित हुआ। खाद एवं बीज वितरण पूर्ण।'
          : 'Govt Agro Center voucher verified. Seed and fertilizer distribution completed.',
        language
      );
      setIsMerchantModalOpen(false);
      setSelectedVoucherForSpend(null);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const currentVouchers = walletService.getVouchersForProfile(currentProfile.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Official Beneficiary Card */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl overflow-hidden shrink-0">
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
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">{currentProfile.name}</h2>
              <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded border border-emerald-300 font-bold flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.beneficiaryVerified}</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {t.registeredPhone} <strong className="text-slate-800 font-mono">{currentProfile.phone}</strong> &bull; {t.relationLabel} <strong>{currentProfile.relation}</strong>
            </p>
          </div>
        </div>

        {/* Listen Screen Button */}
        <button
          onClick={() => {
            const text = getPersonalizedStepAudio(step);
            if (text) audioService.speak(text, language);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#002244] hover:bg-[#0b3c6d] text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
        >
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>{t.listenPrompt}</span>
        </button>
      </div>

      {/* Official Government 4-Step Tab Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
        <button
          onClick={() => setStep(1)}
          className={`py-2.5 px-3 rounded-lg border transition-all ${
            step === 1 ? 'bg-[#0b3c6d] text-white border-[#002244] shadow-xs' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.step1}
        </button>
        <button
          onClick={() => setStep(2)}
          className={`py-2.5 px-3 rounded-lg border transition-all ${
            step === 2 ? 'bg-[#0b3c6d] text-white border-[#002244] shadow-xs' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.step2}
        </button>
        <button
          onClick={() => setStep(3)}
          className={`py-2.5 px-3 rounded-lg border transition-all ${
            step === 3 ? 'bg-[#0b3c6d] text-white border-[#002244] shadow-xs' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.step3}
        </button>
        <button
          onClick={() => setStep(4)}
          className={`py-2.5 px-3 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
            step === 4 ? 'bg-[#0b3c6d] text-white border-[#002244] shadow-xs' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>{t.step4}</span>
          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-mono font-bold">
            {walletService.getLedgerForProfile(currentProfile.id).length}
          </span>
        </button>
      </div>

      {/* Step 1: Crop Selection */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Starting Page Quick Location & Regional Language Auto-Detection Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-[#002244] to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/20 text-amber-400 shrink-0">
                <Navigation className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    {language === 'te' 
                      ? '📍 GPS ద్వారా మీ స్థానిక ప్రాంతం & భాషను గుర్తించండి' 
                      : language === 'hi' 
                      ? '📍 GPS द्वारा अपना स्थानीय क्षेत्र व क्षेत्रीय भाषा पहचानें' 
                      : '📍 Auto-Detect Your Location & Regional Language'}
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px] font-bold">
                    ISRO / AgriStack
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  {language === 'te'
                    ? 'మీ స్థానాన్ని ధృవీకరించడం ద్వారా సమీప వాతావరణ కేంద్రం (AWS) మరియు మీ ప్రాంతీయ భాష (తెలుగు / ఆంధ్రప్రదేశ్) స్వయంచాలకంగా సెట్ చేయబడుతుంది.'
                    : language === 'hi'
                    ? 'स्थान सत्यापित करते ही निकटतम मौसम केंद्र (AWS) और आपकी क्षेत्रीय भाषा स्वतः लागू हो जाएगी।'
                    : 'Instantly identifies your state, sets your regional language (e.g. Telugu for Andhra Pradesh), and links local weather stations.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoDetectLocation}
              disabled={isLocating}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 ${
                isLocating
                  ? 'bg-amber-400 text-amber-950 animate-pulse'
                  : locationStatus === 'success'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{language === 'te' ? 'గుర్తిస్తోంది...' : language === 'hi' ? 'GPS खोजा जा रहा है...' : 'Detecting GPS...'}</span>
                </>
              ) : locationStatus === 'success' ? (
                <>
                  <LocateFixed className="w-4 h-4" />
                  <span>{language === 'te' ? 'ప్రాంతం ధృవీకరించబడింది (వివరాలు)' : language === 'hi' ? 'GPS सत्यापित (पॉप-अप देखें)' : 'Location Verified (View Info)'}</span>
                </>
              ) : (
                <>
                  <LocateFixed className="w-4 h-4" />
                  <span>{language === 'te' ? 'స్వయంచాలకంగా గుర్తించండి (GPS)' : language === 'hi' ? 'स्थान स्वतः पहचानें (GPS)' : 'Auto-Detect Location (GPS)'}</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs space-y-4">
            <div className="bg-[#f8fafc] border-b border-slate-300 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wide">
                    {language === 'te' 
                      ? 'అధికారిక పంటను ఎంచుకోండి (15 పంటలు అందుబాటులో ఉన్నాయి)' 
                      : language === 'hi' 
                      ? 'अधिसूचित फसल का चयन करें (15 फसलें उपलब्ध)' 
                      : 'Select Authorized Crop (15 Crops Available)'}
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-bold rounded border border-blue-200">
                    PM-SKP 2026
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'te'
                    ? 'చిరుధాన్యాలు, ఖరీఫ్, రబీ, పప్పులు మరియు నూనెగింజల కోసం ఆటోమేటిక్ వాతావరణ ఆధారిత బీమా'
                    : language === 'hi'
                    ? 'श्री अन्न मिलेट्स, खरीफ, रबी, दालें एवं तिलहन हेतु स्वचालित मौसम-आधारित बीमा'
                    : 'Automatic weather index insurance for Millets, Kharif, Rabi, Pulses & Oilseeds'}
                </p>
              </div>

              {/* Quick Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cropSearch}
                  onChange={e => setCropSearch(e.target.value)}
                  placeholder={
                    language === 'te'
                      ? 'పంటను శోధించండి (ఉదా. వరి, పత్తి, సజ్జలు)...'
                      : language === 'hi'
                      ? 'फसल खोजें (उदा. बाजरा, सोयाबीन)...'
                      : 'Search crop (e.g. Bajra, Wheat)...'
                  }
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-900 shadow-2xs"
                />
                {cropSearch && (
                  <button
                    onClick={() => setCropSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="px-5 space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                <span className="text-slate-500 text-[11px] font-semibold mr-1 flex items-center gap-1 shrink-0">
                  <Filter className="w-3 h-3 text-slate-400" />
                  <span>{language === 'te' ? 'వర్గం:' : language === 'hi' ? 'श्रेणी:' : 'Category:'}</span>
                </span>
                {[
                  { id: 'all', labelHi: 'सभी फसलें', labelTe: 'అన్ని పంటలు (15)', labelEn: 'All (15)' },
                  { id: 'millet', labelHi: 'श्री अन्न (मिलेट्स)', labelTe: 'శ్రీ అన్న (చిరుధాన్యాలు)', labelEn: 'Millets (Shri Anna)' },
                  { id: 'kharif', labelHi: 'खरीफ मुख्य', labelTe: 'ఖరీఫ్ ప్రధాన పంటలు', labelEn: 'Kharif Staples' },
                  { id: 'rabi', labelHi: 'रबी फसलें', labelTe: 'రబీ పంటలు', labelEn: 'Rabi Crops' },
                  { id: 'pulse_oilseed', labelHi: 'दालें व तिलहन', labelTe: 'పప్పుధాన్యాలు & నూనెగింజలు', labelEn: 'Pulses & Oilseeds' },
                  { id: 'commercial', labelHi: 'नकदी फसलें', labelTe: 'వాణిజ్య పంటలు', labelEn: 'Cash Crops' }
                ].map(cat => {
                  const isCatActive = cropCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCropCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        isCatActive
                          ? 'bg-[#002244] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {language === 'te' ? cat.labelTe : language === 'hi' ? cat.labelHi : cat.labelEn}
                    </button>
                  );
                })}
              </div>

              {/* Crops Grid */}
              {(() => {
                const filtered = DEFAULT_CROPS.filter(crop => {
                  const matchesCategory = cropCategory === 'all' || crop.category === cropCategory;
                  const matchesSearch =
                    !cropSearch ||
                    crop.nameHi.toLowerCase().includes(cropSearch.toLowerCase()) ||
                    crop.nameEn.toLowerCase().includes(cropSearch.toLowerCase()) ||
                    (crop.nameTe && crop.nameTe.toLowerCase().includes(cropSearch.toLowerCase())) ||
                    (crop.season && crop.season.toLowerCase().includes(cropSearch.toLowerCase()));
                  return matchesCategory && matchesSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-sm font-semibold">
                        {language === 'te'
                          ? 'ఎలాంటి పంటలు కనుగొనబడలేదు.'
                          : language === 'hi'
                          ? 'कोई फसल नहीं मिली।'
                          : 'No crops found matching search.'}
                      </p>
                      <button
                        onClick={() => {
                          setCropCategory('all');
                          setCropSearch('');
                        }}
                        className="mt-2 text-xs text-blue-900 font-bold underline"
                      >
                        {language === 'te' ? 'అన్ని పంటలను చూడండి' : language === 'hi' ? 'सभी फसलें देखें' : 'View all crops'}
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filtered.map(crop => {
                      const isSelected = selectedCrop.id === crop.id;
                      const displayName = language === 'te' ? (crop.nameTe || crop.nameEn) : language === 'hi' ? crop.nameHi : crop.nameEn;
                      const subName = language === 'te' ? crop.nameEn : language === 'hi' ? crop.nameEn : crop.nameHi;

                      return (
                        <button
                          key={crop.id}
                          onClick={() => handleSelectCrop(crop)}
                          className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                            isSelected
                              ? 'bg-blue-50/90 border-blue-800 ring-2 ring-blue-800/30 shadow-xs'
                              : 'bg-white border-slate-300 hover:border-slate-400 hover:shadow-2xs'
                          }`}
                        >
                          <div className="space-y-2 w-full">
                            <div className="flex items-start justify-between gap-2">
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs group-hover:scale-105 transition-transform">
                                {crop.imageUrl ? (
                                  <img
                                    src={crop.imageUrl}
                                    alt={crop.nameEn}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-full h-full items-center justify-center text-2xl ${
                                    crop.imageUrl ? 'hidden' : 'flex'
                                  }`}
                                >
                                  {crop.icon}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                {crop.season && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                    {crop.season}
                                  </span>
                                )}
                                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                                  {crop.category.replace('_', ' & ')}
                                </span>
                              </div>
                            </div>

                            <div className="pt-0.5">
                              <div className="font-bold text-sm text-slate-900 leading-tight">
                                {displayName}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {subName}
                              </div>
                            </div>

                            {/* Metrics Pill Grid */}
                            <div className="pt-1.5 grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                              <div className="p-1.5 bg-blue-50/70 border border-blue-100 rounded">
                                <span className="text-[9px] text-blue-900 block font-sans font-bold">
                                  {language === 'te' ? 'కరువు పరిమితి:' : language === 'hi' ? 'सूखा सीमा:' : 'Threshold:'}
                                </span>
                                <span className="font-bold text-blue-950">&lt; {crop.droughtThresholdMm} mm</span>
                              </div>

                              <div className="p-1.5 bg-emerald-50/70 border border-emerald-100 rounded">
                                <span className="text-[9px] text-emerald-900 block font-sans font-bold">
                                  {language === 'te' ? 'హామీ మొత్తం / ఎకరం:' : language === 'hi' ? 'कवर / एकड़:' : 'Max Cover:'}
                                </span>
                                <span className="font-bold text-emerald-950">
                                  ₹{(crop.maxPayoutPaisePerAcre / 100).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5 font-sans">
                            <span>{language === 'te' ? 'ప్రీమియం (DBT సబ్సిడీ):' : language === 'hi' ? 'प्रीमियम (DBT सब्सिडी):' : 'Subsidized Premium:'}</span>
                            <span className="font-bold text-slate-900 font-mono">
                              ₹{crop.basePremiumPaisePerAcre / 100}/{language === 'te' ? 'ఎకరం' : language === 'hi' ? 'एकड़' : 'acre'}
                            </span>
                          </div>

                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

            {/* Selected Crop Summary & Navigation Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 pb-5">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <div className="w-8 h-8 rounded-md overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
                  {selectedCrop.imageUrl ? (
                    <img
                      src={selectedCrop.imageUrl}
                      alt={selectedCrop.nameEn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base">{selectedCrop.icon}</span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-900">
                    {language === 'hi' ? selectedCrop.nameHi : selectedCrop.nameEn}
                  </span>
                  <span className="text-slate-500 ml-1.5 text-[11px]">
                    ({language === 'hi' ? 'सूखा सीमा' : 'Threshold'}: &lt; {selectedCrop.droughtThresholdMm}mm •{' '}
                    {language === 'hi' ? 'कवर' : 'Cover'}: ₹{(selectedCrop.maxPayoutPaisePerAcre / 100).toLocaleString('en-IN')}/एकड़)
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#002244] hover:bg-[#0b3c6d] text-white rounded-lg font-bold text-xs transition-colors shadow-xs"
              >
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Step 2: Acreage & Regional Grid */}
      {step === 2 && (
        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
          <div className="bg-[#f8fafc] border-b border-slate-300 px-5 py-3">
            <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wide">
              {t.step2Title}
            </h3>
          </div>

          <div className="p-6 space-y-5">
            {/* National AgriStack & State Bhulekh Digital Land Title Verification */}
            <div className="bg-gradient-to-r from-blue-50/90 via-slate-50 to-emerald-50/80 border border-slate-300 rounded-xl p-4 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#002244] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    🏛️
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#002244] uppercase tracking-wide flex items-center gap-1.5">
                      <span>{language === 'hi' ? 'राष्ट्रीय एग्रीस्टैक एवं राज्य भूलेख सत्यापन' : 'National AgriStack & State Bhulekh RoR Sync'}</span>
                      <span className="px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded text-[9px] font-mono font-bold">DILRMP-API</span>
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {language === 'hi'
                        ? 'डिजिटल लैंड रिकॉर्ड्स (खसरा/खतौनी) एवं ISRO भुवन उपग्रह द्वारा 100% सत्यापित'
                        : 'Verified against State Revenue Land Records (Khata/Khasra) & ISRO Bhuvan Mask'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLeaseModalOpen(true)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                      hasTenancyLease
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-white hover:bg-slate-100 text-blue-900 border-blue-300 shadow-2xs'
                    }`}
                  >
                    <span>{hasTenancyLease ? `✓ ${language === 'hi' ? 'बटाई पट्टा संलग्न (+6 एकड़)' : 'Tenancy Lease (+6 Ac)'}` : `+ ${language === 'hi' ? 'बटाई / पट्टा भूमि जोड़ें' : 'Attach Leased Title'}`}</span>
                  </button>

                  <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'hi' ? 'भू-अभिलेख सत्यापित (RoR Matched)' : '100% RoR Title Verified'}</span>
                  </span>
                </div>
              </div>

              {/* 4 Land Record Cross-Check Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    {language === 'hi' ? 'खसरा / खतौनी संख्या:' : 'Khasra / Plot No:'}
                  </span>
                  <strong className="text-slate-900 font-mono text-[11px] truncate block">
                    {currentProfile.khasraNo || '412/08A (Plot 2)'}
                  </strong>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    {language === 'hi' ? 'PM-KISAN अधिकृत RoR:' : 'AgriStack RoR Title:'}
                  </span>
                  <strong className="text-slate-900 font-mono text-[11px] block">
                    {(currentProfile.landAreaAcres || 2).toFixed(2)} एकड़ ({((currentProfile.landAreaAcres || 2) * 0.4047).toFixed(2)} Ha)
                  </strong>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    {language === 'hi' ? 'ISRO भुवन उपग्रह मास्क:' : 'ISRO Satellite Mask:'}
                  </span>
                  <strong className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                    <span>🌾 {language === 'hi' ? 'सक्रिय कृषि भूमि (NDVI)' : 'Active Cropland (NDVI)'}</span>
                  </strong>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    {language === 'hi' ? 'बीमा योग्य सीमा (Anti-Fraud):' : 'Insurable Ceiling Cap:'}
                  </span>
                  <strong className="text-blue-950 font-mono text-[11px] block">
                    ≤ {maxAllowedAcreage.toFixed(2)} एकड़ ({hasTenancyLease ? 'Owned + Leased' : 'RoR Locked'})
                  </strong>
                </div>
              </div>

              {/* Anti-Fraud Shield Notice */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-white/90 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-[#002244] shrink-0" />
                <span>
                  {language === 'hi'
                    ? `धोखाधड़ी निवारण: एग्रीस्टैक मानकों के अनुसार आप अपनी सत्यापित भू-अभिलेख RoR सीमा (अधिकतम ${maxAllowedAcreage.toFixed(1)} एकड़) तक ही बीमा करा सकते हैं। इससे फर्जी (Ghost) क्लेम शून्य हो जाते हैं।`
                    : `Anti-Fraud Shield: Under AgriStack norms, insurable acreage is strictly capped to your verified RoR title (max ${maxAllowedAcreage.toFixed(1)} Acres). Ghost & over-insurance claims are completely blocked.`}
                </span>
              </div>
            </div>

            {/* Anti-Fraud Validation Alert if attempted overflow */}
            {fraudWarning && (
              <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 text-xs text-rose-900 flex items-start gap-2 shadow-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-rose-950">
                    {language === 'hi' ? '⚠️ एंटी-फ्रॉड सीमा उल्लंघन (Anti-Fraud Policy Rejection)' : '⚠️ Anti-Fraud Land Ceiling Protection'}
                  </p>
                  <p className="text-[11px] text-rose-800">{fraudWarning}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLeaseModalOpen(true)}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold shrink-0 hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'पट्टा जोड़ें' : 'Add Lease FID'}
                </button>
              </div>
            )}

            {/* Clean & Dynamic Acreage Selection */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800 block">
                      {t.plotAcreage}
                    </label>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-950 text-[10px] font-bold rounded-full border border-blue-200">
                      {language === 'hi' ? `सीलिंग: ${maxAllowedAcreage.toFixed(1)} एकड़` : `Max Cap: ${maxAllowedAcreage.toFixed(1)} Acres`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'hi' 
                      ? `सत्यापित भूलेख के अंतर्गत रकबा चुनें (0.5 से ${maxAllowedAcreage.toFixed(1)} एकड़)` 
                      : `Select acreage within verified title (0.5 to ${maxAllowedAcreage.toFixed(1)} Acres)`}
                  </p>
                </div>

                {/* Compact Custom Stepper */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 shrink-0 self-start sm:self-auto">
                  <span className="text-[11px] font-bold text-slate-600 mr-1">
                    {language === 'hi' ? 'कस्टम रकबा:' : 'Custom:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectAcreage(Math.max(0.5, selectedAcreage - 0.5))}
                    className="w-6 h-6 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shadow-2xs cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0.5"
                    max={maxAllowedAcreage}
                    step="0.5"
                    value={selectedAcreage || ''}
                    onChange={e => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val)) {
                        handleSelectAcreage(val);
                      } else if (e.target.value === '') {
                        setSelectedAcreage(0);
                      }
                    }}
                    onBlur={() => {
                      if (selectedAcreage <= 0) setSelectedAcreage(0.5);
                      if (selectedAcreage > maxAllowedAcreage) setSelectedAcreage(maxAllowedAcreage);
                    }}
                    className="w-12 text-center font-bold text-slate-900 border border-slate-300 rounded py-0.5 text-xs bg-white font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSelectAcreage(Math.min(maxAllowedAcreage, (selectedAcreage || 0) + 0.5))}
                    className="w-6 h-6 rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shadow-2xs cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-xs font-bold text-slate-700">{t.acres}</span>
                </div>
              </div>

              {/* Dynamic Balanced Presentable Tiles tailored to maxAllowedAcreage */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {(() => {
                  const options = maxAllowedAcreage <= 2
                    ? [0.5, 1, 1.5, 2].filter(a => a <= maxAllowedAcreage)
                    : maxAllowedAcreage <= 5
                    ? [1, 2, 3, 4, maxAllowedAcreage].filter((v, i, a) => a.indexOf(v) === i && v <= maxAllowedAcreage)
                    : [1, 2, 4, 6, maxAllowedAcreage].filter((v, i, a) => a.indexOf(v) === i && v <= maxAllowedAcreage);

                  return options.map(acres => {
                    const isSelected = selectedAcreage === acres;
                    const isFullPlot = acres === maxAllowedAcreage;
                    const premium = ((selectedCrop.basePremiumPaisePerAcre * acres) / 100);
                    const maxCover = ((selectedCrop.maxPayoutPaisePerAcre * acres) / 100);
                    return (
                      <button
                        key={acres}
                        type="button"
                        onClick={() => handleSelectAcreage(acres)}
                        className={`p-3 rounded-xl border text-center transition-all relative cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 border-[#002244] text-[#002244] ring-2 ring-blue-800/30 shadow-xs'
                            : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {isFullPlot && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.2 bg-emerald-600 text-white font-bold rounded-full text-[9px] shadow-xs whitespace-nowrap">
                            {language === 'hi' ? '★ संपूर्ण RoR रकबा' : '★ 100% Full RoR'}
                          </span>
                        )}
                        <div className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                          {acres} {t.acres}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-1 font-medium">
                          ₹{premium.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-bold font-mono mt-0.5">
                          {language === 'hi' ? 'कवर' : 'Cover'} ₹{(maxCover / 1000).toFixed(0)}k
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Clean Active Selection Summary Strip */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                <span className="flex items-center gap-2 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  <span>{language === 'hi' ? 'चयनित रकबा:' : 'Selected Land:'}</span>
                  <strong className="text-slate-900 font-bold">{selectedAcreage} {t.acres}</strong>
                  {selectedAcreage === maxAllowedAcreage && (
                    <span className="px-2 py-0.2 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded">
                      {language === 'hi' ? 'पूर्ण भूलेख' : 'Full Plot'}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>{language === 'hi' ? 'कुल प्रीमियम:' : 'Premium:'} <strong className="text-slate-900">₹{Math.round((selectedCrop.basePremiumPaisePerAcre * selectedAcreage) / 100).toLocaleString('en-IN')}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>{language === 'hi' ? 'गारंटीड सूखा सुरक्षा:' : 'Max Claim Cover:'} <strong className="text-emerald-700 font-bold">₹{Math.round((selectedCrop.maxPayoutPaisePerAcre * selectedAcreage) / 100).toLocaleString('en-IN')}</strong></span>
                </div>
              </div>
            </div>

            {/* Authorized IMD / State Weather Grid Cell with Auto-Location Detection */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800">
                      {t.selectGrid}
                    </label>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-bold rounded border border-blue-200">
                      IMD / ISRO 2026
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {language === 'hi'
                      ? 'निकटतम मौसम केंद्र स्वतः पहचानें या सूची से चयन करें'
                      : 'Auto-detect nearest AWS weather station or select from authorized list'}
                  </p>
                </div>

                {/* Auto-Detect Location Button (GPS / Geolocation) */}
                <button
                  type="button"
                  onClick={handleAutoDetectLocation}
                  disabled={isLocating}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-xs shrink-0 self-start sm:self-auto ${
                    isLocating
                      ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                      : locationStatus === 'success'
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
                      : 'bg-[#002244] hover:bg-[#0b3c6d] text-white border-[#002244]'
                  }`}
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'hi' ? 'GPS खोजा जा रहा है...' : 'Detecting GPS...'}</span>
                    </>
                  ) : locationStatus === 'success' ? (
                    <>
                      <LocateFixed className="w-3.5 h-3.5 text-emerald-200" />
                      <span>{language === 'hi' ? 'GPS सत्यापित (पुनः जांचें)' : 'GPS Verified (Re-detect)'}</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'hi' ? 'स्थान स्वतः पहचानें (GPS)' : 'Auto-Detect Location (GPS)'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Location Detection Feedback Banner */}
              {locationStatus === 'success' && userCoords && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {language === 'te' ? 'GPS స్థానం ధృవీకరించబడింది' : language === 'hi' ? 'GPS स्थान सत्यापित' : 'GPS Location Auto-Detected'}
                        </span>
                        <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                          {userCoords.latitude.toFixed(4)}° N, {userCoords.longitude.toFixed(4)}° E
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-800 mt-0.5">
                        {language === 'te'
                          ? `సమీప అధికారిక వాతావరణ కేంద్రం: ${selectedGrid.mandal} (${selectedGrid.district}, ${selectedGrid.state}) — దూరం: ~${nearestDistanceKm} km`
                          : language === 'hi'
                          ? `निकटतम अधिकृत मौसम केंद्र: ${selectedGrid.mandal} (${selectedGrid.district}, ${selectedGrid.state}) — दूरी: लगभग ${nearestDistanceKm} km`
                          : `Nearest Authorized AWS Station: ${selectedGrid.mandal} (${selectedGrid.district}, ${selectedGrid.state}) — Distance: ~${nearestDistanceKm} km`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLocationModalData(prev => prev ? { ...prev, isOpen: true } : {
                        isOpen: true,
                        state: selectedGrid.state,
                        district: selectedGrid.district,
                        mandal: selectedGrid.mandal,
                        distanceKm: nearestDistanceKm || 12,
                        detectedLang: language,
                        lat: +userCoords.latitude.toFixed(4),
                        lng: +userCoords.longitude.toFixed(4)
                      })}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{language === 'te' ? 'ప్రాంతీయ వివరాలు' : language === 'hi' ? 'स्थान व भाषा पॉप-अप' : 'View Location Info'}</span>
                    </button>
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold font-mono">
                      AUTO-LINKED
                    </span>
                  </div>
                </div>
              )}

              {locationStatus === 'denied' && (
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5 flex items-center gap-2 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {locationMessage || (language === 'hi' 
                      ? 'स्थान अनुमति अस्वीकृत। कृपया नीचे दी गई सूची से अपना मौसम मंडल चुनें।' 
                      : 'Location permission denied. Please choose your weather grid manually below.')}
                  </span>
                </div>
              )}

              {/* Proximity View Filter (when location is detected) */}
              {userCoords && (
                <div className="flex items-center justify-between gap-2 text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFilterNearbyOnly(true)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        filterNearbyOnly
                          ? 'bg-[#002244] text-white border-[#002244] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{language === 'hi' ? 'केवल निकटवर्ती केंद्र (< 25 km)' : 'Nearby Stations (< 25 km)'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterNearbyOnly(false)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        !filterNearbyOnly
                          ? 'bg-[#002244] text-white border-[#002244] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{language === 'hi' ? 'सभी राष्ट्रीय ग्रिड (All)' : 'All National Grids'}</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                    {language === 'hi' ? 'निकटतम से व्यवस्थित' : 'Ranked by distance'}
                  </span>
                </div>
              )}

              {/* Grids Grid (Sorted by Distance) */}
              {(() => {
                const sortedGrids = [...availableGrids].map(grid => {
                  const distance = userCoords
                    ? getDistanceFromLatLonInKm(userCoords.latitude, userCoords.longitude, grid.latitude, grid.longitude)
                    : null;
                  return { grid, distance };
                }).sort((a, b) => {
                  if (a.distance === null || b.distance === null) return 0;
                  return a.distance - b.distance;
                });

                const displayList = filterNearbyOnly && userCoords
                  ? sortedGrids.filter(item => item.distance !== null && item.distance <= 40)
                  : sortedGrids;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayList.map(({ grid, distance }, idx) => {
                      const isSelected = selectedGrid.id === grid.id;
                      const isNearest = idx === 0 && distance !== null;

                      return (
                        <button
                          key={grid.id}
                          onClick={() => {
                            setSelectedGrid(grid);
                            audioService.playTone('click');
                            audioService.speak(`${grid.mandal} ${language === 'hi' ? 'ग्रिड चुना गया' : 'grid selected'}`, language);
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? 'bg-blue-50/90 border-[#002244] ring-2 ring-blue-800/20 shadow-xs'
                              : 'bg-white border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#002244]' : 'text-slate-400'}`} />
                              <span className="font-bold text-xs text-slate-900">{grid.mandal}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isNearest && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-300">
                                  {language === 'hi' ? 'निकटतम केंद्र' : 'Nearest AWS'}
                                </span>
                              )}
                              <span className="text-[10px] font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                                {grid.code}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 mt-1 pl-5">
                            {grid.district}, {grid.state}
                            {distance !== null && (
                              <span className="text-slate-700 font-mono text-[11px] ml-1.5 font-bold">
                                (&sim;{distance} km {language === 'hi' ? 'दूर' : 'away'})
                              </span>
                            )}
                          </p>

                          <div className="flex items-center justify-between mt-1 pl-5 text-[11px]">
                            <span className="text-[#0b3c6d] font-semibold">
                              {t.normalRainfall} {grid.normalSeasonalMm} mm
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {grid.latitude}°N, {grid.longitude}°E
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300"
              >
                {t.backBtn}
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#002244] hover:bg-[#0b3c6d] text-white rounded-lg font-bold text-xs transition-colors"
              >
                <span>{t.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Official Policy Review, Guarantees & Beneficiary Digital e-Mandate */}
      {step === 3 && (
        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs space-y-6">
          <div className="bg-[#f8fafc] border-b border-slate-300 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#002244] uppercase tracking-wide">
                  {language === 'hi' ? 'पॉलिसी सारांश एवं लाभार्थी डिजिटल सहमति' : 'Policy Summary & Beneficiary e-Mandate'}
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded border border-emerald-300">
                  PM-SKP DBT 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi'
                  ? 'नीति आयोग एवं कृषि मंत्रालय द्वारा समर्थित स्वचालित प्रत्यक्ष लाभ अंतरण (DBT)'
                  : 'Automated Direct Benefit Transfer (DBT) supported by Ministry of Agriculture'}
              </p>
            </div>

            <button
              onClick={() => {
                const termsText = language === 'hi'
                  ? `पॉलिसी सारांश: फसल ${selectedCrop.nameHi}, रकबा ${selectedAcreage} एकड़, मौसम केंद्र ${selectedGrid.mandal}। यदि कुल वर्षा ${selectedCrop.droughtThresholdMm} मिलीमीटर से कम होती है, तो कंपनी बिना किसी सर्वेक्षक के आपके खाते में पूर्ण दावा राशि स्वतः भेज देगी।`
                  : `Policy Summary: Crop ${selectedCrop.nameEn}, Plot ${selectedAcreage} Acres, Weather Station ${selectedGrid.mandal}. If total seasonal rainfall drops below ${selectedCrop.droughtThresholdMm} millimeters, your claim will be auto-credited to your account in 10 seconds without any surveyor.`;
                audioService.speak(termsText, language);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002244] hover:bg-[#0b3c6d] text-white rounded-lg text-xs font-bold transition-colors shrink-0"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'शर्तें सुनें' : 'Listen Mandate'}</span>
            </button>
          </div>

          <div className="px-6 space-y-5">
            {/* Beneficiary & Policy Snapshot */}
            <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
                  {selectedCrop.imageUrl ? (
                    <img src={selectedCrop.imageUrl} alt={selectedCrop.nameEn} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{selectedCrop.icon}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-slate-900">
                      {language === 'hi' ? selectedCrop.nameHi : selectedCrop.nameEn}
                    </strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                      {selectedAcreage} {t.acres}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {language === 'hi' ? 'मौसम ग्रिड:' : 'Weather Grid:'}{' '}
                    <strong className="text-slate-800">{selectedGrid.mandal} ({selectedGrid.district}, {selectedGrid.state})</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-[10px] text-slate-500 block">{language === 'hi' ? 'पंजीकृत लाभार्थी:' : 'Beneficiary:'}</span>
                  <strong className="text-slate-900 font-medium">{currentProfile.name}</strong>
                </div>
              </div>
            </div>

            {/* Financial Metrics 3-Box Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5">
                <span className="text-slate-600 block text-[11px] font-bold">
                  {language === 'hi' ? 'किसान का अंशदान (प्रीमियम):' : 'Farmer Subsidized Premium:'}
                </span>
                <span className="text-xl font-bold text-slate-900 font-mono block mt-0.5">
                  ₹{((selectedCrop.basePremiumPaisePerAcre * selectedAcreage) / 100).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-blue-900 font-semibold mt-1 block">
                  {language === 'hi' ? '✓ 80% DBT सरकारी सब्सिडी प्राप्त' : '✓ 80% Govt DBT Subsidized'}
                </span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
                <span className="text-slate-600 block text-[11px] font-bold">
                  {language === 'hi' ? 'गारंटीड सूखा सुरक्षा (Claim):' : 'Guaranteed Drought Cover:'}
                </span>
                <span className="text-xl font-bold text-emerald-800 font-mono block mt-0.5">
                  ₹{((selectedCrop.maxPayoutPaisePerAcre * selectedAcreage) / 100).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-800 font-semibold mt-1 block">
                  {language === 'hi' ? '100% डीबीटी सीधे बैंक/वॉलेट में' : '100% Direct DBT Disbursal'}
                </span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
                <span className="text-slate-600 block text-[11px] font-bold">
                  {language === 'hi' ? 'स्वचालित सूखा ट्रिगर सीमा:' : 'Drought Trigger Threshold:'}
                </span>
                <span className="text-xl font-bold text-amber-900 font-mono block mt-0.5">
                  &lt; {selectedCrop.droughtThresholdMm} mm
                </span>
                <span className="text-[10px] text-amber-900 font-semibold mt-1 block">
                  {language === 'hi' ? 'IMD / ISRO रडार आधारित गणना' : 'Certified IMD / ISRO Oracle'}
                </span>
              </div>
            </div>

            {/* 4 Official Pillar Guarantees */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#002244]" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  {language === 'hi' ? 'प्रधानमंत्री स्वचालित सुरक्षा के 4 मुख्य स्तंभ' : '4 Pillars of Parametric DBT Assurance'}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">
                      {language === 'hi' ? 'शून्य कागजी कार्रवाई एवं सर्वेक्षक-मुक्त' : 'Zero Paperwork & Zero Loss-Assessors'}
                    </strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      {language === 'hi'
                        ? 'दावा करने हेतु किसी फॉर्म या फील्ड सर्वेक्षक की आवश्यकता नहीं।'
                        : 'No claims forms or surveyor field inspection visits required.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <Award className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">
                      {language === 'hi' ? 'द्वि-स्तरीय उपग्रह व वर्षामापी सत्यापन' : 'Dual Satellite & AWS Oracle Verification'}
                    </strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      {language === 'hi'
                        ? 'मौसम निगरानी IMD ऑटोमैटिक वेदर स्टेशन एवं ISRO द्वारा।'
                        : 'Weather data audited independently by IMD AWS and ISRO.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">
                      {language === 'hi' ? '10 सेकंड में स्वतः डीबीटी भुगतान' : 'Instant 10-Second DBT Payout'}
                    </strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      {language === 'hi'
                        ? 'सूखा ट्रिगर होते ही राशि सीधे फोन वॉलेट / खाते में आ जाएगी।'
                        : 'Payout credited automatically to your wallet upon drought trigger.'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <Store className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-semibold">
                      {language === 'hi' ? 'ऑफ़लाइन खर्च योग्य किसान पासबुक' : 'Offline Spendable Kisan Passbook'}
                    </strong>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                      {language === 'hi'
                        ? 'इंटरनेट न होने पर भी अधिकृत दुकानों पर बीज/खाद हेतु स्वीकार्य।'
                        : 'Usable at authorized agro kendras even with 0 internet.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Beneficiary Digital Declaration & e-Mandate Gate */}
            <div className="bg-emerald-50/60 border-2 border-emerald-200 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-800" />
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  {language === 'hi' ? 'लाभार्थी डिजिटल घोषणा एवं ई-सहमति (Digital e-Mandate)' : 'Beneficiary Digital e-Mandate & Consent'}
                </h4>
              </div>

              <div className="space-y-2.5 text-xs text-slate-800">
                <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-emerald-200 hover:border-emerald-300 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={consentAadhaarDbt}
                    onChange={e => setConsentAadhaarDbt(e.target.checked)}
                    className="w-4 h-4 rounded text-[#138808] focus:ring-emerald-500 mt-0.5 cursor-pointer"
                  />
                  <span className="leading-snug">
                    <strong className="text-slate-900 block font-semibold">
                      {language === 'hi' ? 'आधार डीबीटी स्वतः भुगतान सहमति (Aadhaar DBT Auto-Credit):' : 'Aadhaar DBT Direct Credit Authorization:'}
                    </strong>
                    <span className="text-[11px] text-slate-600">
                      {language === 'hi'
                        ? 'मैं अधिकृत करता/करती हूँ कि वर्षा सीमा पार होने पर दावा राशि सीधे मेरे पंजीकृत आधार खाते / किसान पासबुक में स्वतः भेजी जाए।'
                        : 'I authorize Government DBT to automatically disburse parametric claims directly into my linked account/wallet upon drought trigger.'}
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-emerald-200 hover:border-emerald-300 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={consentParametricRule}
                    onChange={e => setConsentParametricRule(e.target.checked)}
                    className="w-4 h-4 rounded text-[#138808] focus:ring-emerald-500 mt-0.5 cursor-pointer"
                  />
                  <span className="leading-snug">
                    <strong className="text-slate-900 block font-semibold">
                      {language === 'hi' ? 'स्वचालित मौसम सूचकांक नियम स्वीकृति (Parametric Rule Acceptance):' : 'Automated Weather Oracle Rule Acceptance:'}
                    </strong>
                    <span className="text-[11px] text-slate-600">
                      {language === 'hi'
                        ? `मैं समझता/समझती हूँ कि यह पॉलिसी मौसम केंद्र (${selectedGrid.mandal}) के वर्षा सूचकांक (< ${selectedCrop.droughtThresholdMm}mm) पर आधारित है एवं किसी व्यक्तिगत कागजी सर्वे की आवश्यकता नहीं है।`
                        : `I understand that coverage is strictly index-based (< ${selectedCrop.droughtThresholdMm}mm at ${selectedGrid.mandal} AWS) and requires no physical surveyor inspection.`}
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 pb-5">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300"
              >
                {t.backBtn}
              </button>

              <button
                onClick={handleBindPolicy}
                disabled={!consentAadhaarDbt || !consentParametricRule || isBinding}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs transition-all ${
                  consentAadhaarDbt && consentParametricRule && !isBinding
                    ? 'bg-[#138808] hover:bg-[#0f6606] text-white shadow-xs'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isBinding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'hi' ? 'पॉलिसी पंजीकृत की जा रही है...' : 'Binding Policy...'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'पॉलिसी अधिकृत करें एवं पासबुक जारी करें' : 'Authorize Policy & Issue Passbook'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Official Digital Kisan Passbook & Spendable Offline Wallet */}
      {step === 4 && (
        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs space-y-6 p-6">
          {/* Official Government Certificate Header with Ashoka Pillar */}
          <div className="border-2 border-slate-300 rounded-xl p-5 bg-gradient-to-b from-slate-50 to-white relative">
            <div className="flex items-center justify-between border-b border-slate-300 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src="/emblem.jpg"
                  alt="State Emblem of India"
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#002244] uppercase font-serif">
                    {t.step4Title}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-600">
                    {t.certNumber} <strong className="text-slate-900">{latestPolicy?.id}</strong> &bull; DBT Tx: {latestPolicy?.clientTxUuid}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                {t.signedProof}
              </span>
            </div>

            {/* Certificate Details */}
            {latestPolicy && (
              <div className="space-y-3 pt-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-800">
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t.beneficiaryName}</span>
                    <strong className="text-slate-900">{latestPolicy.farmerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t.cropAndArea}</span>
                    <strong>{latestPolicy.productName} ({latestPolicy.acreage} {t.acres})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t.droughtLimit}</span>
                    <strong className="text-amber-800">&lt; {latestPolicy.thresholdMm} mm</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t.guaranteedCover}</span>
                    <strong className="text-emerald-700 text-sm">₹{(latestPolicy.maxPayoutPaise / 100).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 rounded-lg px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700 font-mono">
                  <span>
                    🏛️ {language === 'hi' ? 'राजस्व खसरा संख्या:' : 'Revenue Khasra No:'} <strong className="text-[#002244]">412/08A</strong>
                  </span>
                  <span>
                    {language === 'hi' ? 'एग्रीस्टैक RoR आईडी:' : 'AgriStack RoR Ref:'} <strong className="text-slate-900">ROR-DILRMP-2026-994</strong>
                  </span>
                  <span className="text-emerald-800 font-bold font-sans flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'hi' ? 'भूलेख 100% सत्यापित' : '100% Title Audited'}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Offline Spendable Passbook & Voucher Card */}
          <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-[#002244] flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-blue-900" />
                    <span>{t.walletTitle}</span>
                  </h4>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-[10px] font-bold border border-emerald-300">
                    NPCI / DBT Direct
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">{t.walletSubtitle}</p>
              </div>
              <div className="text-right bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">{t.walletBalanceLabel}</span>
                <span className="text-2xl font-black text-emerald-700 font-mono">
                  ₹{(walletService.getProfileBalance(currentProfile.id) / 100).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Active Spendable Offline Vouchers */}
            {currentVouchers.length > 0 ? (
              <div className="space-y-3 pt-1">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-blue-900" />
                  <span>{language === 'te' ? 'ఉపయోగించదగిన ఆఫ్‌లైన్ వోచర్లు:' : language === 'hi' ? 'सक्रिय खर्च योग्य ऑफलाइन वाउचर:' : 'Active Spendable Offline Vouchers:'}</span>
                </div>
                {currentVouchers.map(v => (
                  <div key={v.id} className="bg-white border border-slate-300 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-[#002244]" />
                        <span className="text-[11px] font-mono text-slate-600">{v.id}</span>
                      </div>
                      <p className="text-base font-bold text-emerald-800 mt-1">
                        ₹{(v.amountPaise / 100).toLocaleString('en-IN')} ({t.voucherDesc})
                      </p>
                      <p className="text-xs font-mono text-slate-700 mt-0.5">
                        {t.voucherCodeLabel} <strong className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-[#002244]">{v.voucherCode}</strong>
                      </p>
                    </div>

                    {v.status === 'active' ? (
                      <button
                        onClick={() => {
                          setSelectedVoucherForSpend(v.id);
                          setIsMerchantModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#002244] hover:bg-[#0b3c6d] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Store className="w-4 h-4 text-amber-400" />
                        <span>{t.spendOfflineBtn}</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded border border-slate-300 font-semibold">
                        {t.redeemedLabel}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
                {t.noVouchers}
              </div>
            )}

            {/* Official Passbook & Transaction Ledger (Detailed Timeline) */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[#002244] uppercase tracking-wide flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-blue-900" />
                    <span>{t.passbookLedgerTitle}</span>
                  </h4>
                  <p className="text-[10px] text-slate-500">{t.passbookLedgerSubtitle}</p>
                </div>

                {/* Filter Tabs */}
                <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-300 text-[10px] font-semibold">
                  <button
                    onClick={() => setLedgerFilter('all')}
                    className={`px-2.5 py-1 rounded transition-all ${
                      ledgerFilter === 'all'
                        ? 'bg-[#002244] text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.filterAll} ({walletService.getLedgerForProfile(currentProfile.id).length})
                  </button>
                  <button
                    onClick={() => setLedgerFilter('credit')}
                    className={`px-2.5 py-1 rounded transition-all ${
                      ledgerFilter === 'credit'
                        ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.filterCredits}
                  </button>
                  <button
                    onClick={() => setLedgerFilter('debit')}
                    className={`px-2.5 py-1 rounded transition-all ${
                      ledgerFilter === 'debit'
                        ? 'bg-rose-800 text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.filterDebits}
                  </button>
                </div>
              </div>

              {/* Transaction Chronological Feed */}
              {(() => {
                const allLedger = walletService.getLedgerForProfile(currentProfile.id);
                const filtered = allLedger.filter(tx => {
                  if (ledgerFilter === 'credit') return tx.amountPaise > 0;
                  if (ledgerFilter === 'debit') return tx.amountPaise < 0;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-6 text-center text-xs text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                      {t.noTransactions}
                    </div>
                  );
                }

                return (
                  <div className="space-y-2.5">
                    {filtered.map(tx => {
                      const isCredit = tx.amountPaise > 0;
                      const absAmountInr = (Math.abs(tx.amountPaise) / 100).toLocaleString('en-IN');
                      const balInr = (tx.balanceAfterPaise / 100).toLocaleString('en-IN');
                      const txTitle = language === 'te' ? tx.titleTe : language === 'hi' ? tx.titleHi : tx.title;
                      
                      const d = new Date(tx.timestamp);
                      const formattedDate = d.toLocaleDateString(
                        language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
                        { day: '2-digit', month: 'short', year: 'numeric' }
                      );
                      const formattedTime = d.toLocaleTimeString(
                        language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
                        { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }
                      );

                      // Relative Time Tag
                      const diffSec = Math.floor((Date.now() - tx.timestamp) / 1000);
                      const diffMin = Math.floor(diffSec / 60);
                      const diffHour = Math.floor(diffMin / 60);
                      const diffDay = Math.floor(diffHour / 24);
                      const relStr = diffSec < 45
                        ? (language === 'te' ? 'ఇప్పుడే' : language === 'hi' ? 'अभी-अभी' : 'Just now')
                        : diffMin < 60
                        ? (language === 'te' ? `${diffMin}ని క్రితం` : language === 'hi' ? `${diffMin} मि. पूर्व` : `${diffMin}m ago`)
                        : diffHour < 24
                        ? (language === 'te' ? `${diffHour}గంటల క్రితం` : language === 'hi' ? `${diffHour} घंटे पूर्व` : `${diffHour}h ago`)
                        : diffDay === 1
                        ? (language === 'te' ? 'నిన్న' : language === 'hi' ? 'कल' : 'Yesterday')
                        : (language === 'te' ? `${diffDay} రోజుల క్రితం` : language === 'hi' ? `${diffDay} दिन पूर्व` : `${diffDay}d ago`);

                      return (
                        <div
                          key={tx.txId}
                          className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-3.5 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          {/* Left: Icon, Date, Title, Rail & Proof */}
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                                isCredit
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-rose-50 border-rose-200 text-rose-700'
                              }`}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                              ) : (
                                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                              )}
                            </div>

                            <div className="space-y-1">
                              {/* Title & Category Badge */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-slate-900 text-xs">{txTitle}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                    tx.category === 'payout'
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : tx.category === 'subsidy'
                                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                      : tx.category === 'premium'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-purple-100 text-purple-900 border border-purple-300'
                                  }`}
                                >
                                  {tx.category === 'payout'
                                    ? (language === 'te' ? 'కరువు పరిహారం' : language === 'hi' ? 'सूखा डीबीटी' : 'Drought DBT')
                                    : tx.category === 'subsidy'
                                    ? (language === 'te' ? 'ప్రభుత్వ సబ్సిడీ' : language === 'hi' ? 'सरकारी सब्सिडी' : 'Govt Subsidy')
                                    : tx.category === 'premium'
                                    ? (language === 'te' ? 'ప్రీమియం చెల్లింపు' : language === 'hi' ? 'प्रीमियम कटौती' : 'Premium')
                                    : (language === 'te' ? 'విత్తన కేంద్రం' : language === 'hi' ? 'बीज केंद्र खर्च' : 'Kendra Spend')}
                                </span>
                              </div>

                              {/* Date & Time with Rail Badge */}
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                                <span className="flex items-center gap-1 text-slate-700 font-medium">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span>{formattedDate}</span>
                                </span>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1 text-slate-700">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{formattedTime}</span>
                                </span>
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[9px] font-sans font-bold">
                                  {relStr}
                                </span>
                              </div>

                              {/* Technical Proof & IDs */}
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                                <span className="text-slate-600">
                                  {t.txnIdLabel} <strong className="text-slate-800">{tx.txId}</strong>
                                </span>
                                <span>&bull;</span>
                                <span className="text-slate-500">Ref: {tx.referenceId}</span>
                                <span>&bull;</span>
                                <span className="px-1 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                                  {tx.paymentRail}
                                </span>
                                <span className="text-emerald-700 font-sans font-bold flex items-center gap-0.5">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>ED25519 OK</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Amount & Running Balance */}
                          <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 shrink-0 flex flex-col justify-center">
                            <span
                              className={`text-base font-black font-mono tracking-tight ${
                                isCredit ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              {isCredit ? '+' : '-'} ₹{absAmountInr}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {language === 'te' ? 'నిల్వ:' : language === 'hi' ? 'शेष:' : 'Bal:'} ₹{balInr}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300"
            >
              {t.enrollAnother}
            </button>

            {latestPolicy && (
              <button
                onClick={() => onTriggerSimulation(latestPolicy)}
                className="px-5 py-2 bg-[#cc6600] hover:bg-[#b35900] text-white rounded-lg text-xs font-bold transition-colors"
              >
                {t.triggerSimulationBtn} &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Govt Agro Kendra Spend Modal */}
      {isMerchantModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3">
              <span className="text-2xl">🏪</span>
              <div>
                <h3 className="text-sm font-bold text-[#002244]">{t.kendraTitle}</h3>
                <p className="text-[11px] text-slate-500">{t.kendraSubtitle}</p>
              </div>
            </div>
            
            <form onSubmit={handleSpendAtAgroShop} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">{t.kendraNameLabel}</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={e => setMerchantName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">{t.kendraItemLabel}</label>
                <input
                  type="text"
                  value={itemType}
                  onChange={e => setItemType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 outline-none"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between text-slate-900 font-bold">
                <span>{t.kendraTotalLabel}</span>
                <span className="text-emerald-800 text-sm">₹12,000</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMerchantModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  {t.kendraCancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#002244] hover:bg-[#0b3c6d] text-white rounded-lg text-xs font-bold"
                >
                  {t.kendraConfirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location & Regional Language Auto-Detection Pop-up Modal */}
      {locationModalData && locationModalData.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-emerald-600 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 relative overflow-hidden text-slate-800">
            {/* Top Banner Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-300">
                  <LocateFixed className="w-5 h-5 text-emerald-700 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#002244] leading-tight">
                    {locationModalData.detectedLang === 'te'
                      ? '📍 GPS స్థానం & ప్రాంతీయ భాష గుర్తించబడింది'
                      : locationModalData.detectedLang === 'hi'
                      ? '📍 GPS स्थान एवं क्षेत्रीय भाषा स्वतः पहचानी गई'
                      : '📍 GPS Location & Regional Language Detected'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    ISRO Bhuvan &amp; National AgriStack Geo-Fencing
                  </p>
                </div>
              </div>

              <button
                onClick={() => setLocationModalData(prev => prev ? { ...prev, isOpen: false } : null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors text-xs font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Detected Location Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-900" />
                  <span>
                    {locationModalData.detectedLang === 'te'
                      ? 'గుర్తించబడిన భౌగోళిక ప్రాంతం:'
                      : locationModalData.detectedLang === 'hi'
                      ? 'पहचाना गया भौगोलिक क्षेत्र:'
                      : 'Identified Geo Region:'}
                  </span>
                </span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-700 text-[10px] font-bold">
                  {locationModalData.lat}&deg; N, {locationModalData.lng}&deg; E
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">
                    {locationModalData.detectedLang === 'te' ? 'రాష్ట్రం (State):' : 'राज्य (State):'}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {locationModalData.state}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">
                    {locationModalData.detectedLang === 'te' ? 'జిల్లా (District):' : 'ज़िला (District):'}
                  </span>
                  <span className="font-bold text-slate-900 text-sm">
                    {locationModalData.district}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-800 shrink-0" />
                  <div>
                    <span className="text-[10px] text-blue-800 font-bold block">
                      {locationModalData.detectedLang === 'te' ? 'సమీప IMD వాతావరణ కేంద్రం:' : 'निकटतम मौसम केंद्र (Nearest AWS):'}
                    </span>
                    <span className="font-bold text-blue-950">
                      {locationModalData.mandal}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  &sim;{locationModalData.distanceKm} km
                </span>
              </div>
            </div>

            {/* Regional Language Auto-Switch Notice */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  {locationModalData.detectedLang === 'te'
                    ? 'ప్రాంతీయ భాష స్వయంచాలకంగా మార్చబడింది'
                    : locationModalData.detectedLang === 'hi'
                    ? 'क्षेत्रीय भाषा स्वतः सक्रिय की गई'
                    : 'Regional Language Automatically Configured'}
                </h4>
                <span className="ml-auto px-2 py-0.5 bg-emerald-700 text-white font-bold text-[10px] rounded-full">
                  {locationModalData.detectedLang === 'te' ? 'తెలుగు (Telugu)' : 'हिन्दी (Hindi)'}
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {locationModalData.detectedLang === 'te'
                  ? 'మీ స్థానం ఆంధ్రప్రదేశ్ / తెలంగాణ ప్రాంతంగా గుర్తించబడినందున, పోర్టల్ మరియు ఆడియో వాయిస్ సహాయం తెలుగులోకి మార్చబడ్డాయి.'
                  : locationModalData.detectedLang === 'hi'
                  ? 'आपकी स्थिति हिंदी भाषी क्षेत्र में पाई गई है, अतः पोर्टल और वॉयस सहायता स्वतः हिंदी में सेट कर दी गई है।'
                  : 'Based on your detected location, the portal and vernacular voice assistance have been set to your regional language.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                onClick={() => {
                  if (onLanguageChange) onLanguageChange(locationModalData.detectedLang);
                  setLocationModalData(prev => prev ? { ...prev, isOpen: false } : null);
                  audioService.playTone('click');
                }}
                className="w-full sm:flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition-colors text-center"
              >
                {locationModalData.detectedLang === 'te'
                  ? 'తెలుగులో కొనసాగించండి (Continue)'
                  : locationModalData.detectedLang === 'hi'
                  ? 'हिन्दी में जारी रखें (Continue)'
                  : 'Continue in English'}
              </button>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (onLanguageChange) onLanguageChange('hi');
                    setLocationModalData(prev => prev ? { ...prev, isOpen: false } : null);
                    audioService.speak('हिंदी भाषा सक्रिय की गई', 'hi');
                  }}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300"
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => {
                    if (onLanguageChange) onLanguageChange('en');
                    setLocationModalData(prev => prev ? { ...prev, isOpen: false } : null);
                    audioService.speak('English selected', 'en');
                  }}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300"
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access DBT Passbook Modal */}
      {isPassbookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border-2 border-slate-300 rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-900 via-[#002244] to-emerald-950 text-white p-5 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 text-emerald-400">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
                    <span>{t.passbookLedgerTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    {currentProfile.name} &bull; {currentProfile.phone} &bull; Aadhaar Linked
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPassbookModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Balance & Filters Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  {t.walletBalanceLabel}
                </span>
                <span className="text-xl font-black text-emerald-700 font-mono">
                  ₹{(walletService.getProfileBalance(currentProfile.id) / 100).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-300 text-[10px] font-semibold shadow-2xs">
                <button
                  onClick={() => setLedgerFilter('all')}
                  className={`px-3 py-1 rounded transition-all ${
                    ledgerFilter === 'all'
                      ? 'bg-[#002244] text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.filterAll} ({walletService.getLedgerForProfile(currentProfile.id).length})
                </button>
                <button
                  onClick={() => setLedgerFilter('credit')}
                  className={`px-3 py-1 rounded transition-all ${
                    ledgerFilter === 'credit'
                      ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.filterCredits}
                </button>
                <button
                  onClick={() => setLedgerFilter('debit')}
                  className={`px-3 py-1 rounded transition-all ${
                    ledgerFilter === 'debit'
                      ? 'bg-rose-800 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.filterDebits}
                </button>
              </div>
            </div>

            {/* Scrollable Transaction Feed */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {(() => {
                const allLedger = walletService.getLedgerForProfile(currentProfile.id);
                const filtered = allLedger.filter(tx => {
                  if (ledgerFilter === 'credit') return tx.amountPaise > 0;
                  if (ledgerFilter === 'debit') return tx.amountPaise < 0;
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      {t.noTransactions}
                    </div>
                  );
                }

                return filtered.map(tx => {
                  const isCredit = tx.amountPaise > 0;
                  const absAmountInr = (Math.abs(tx.amountPaise) / 100).toLocaleString('en-IN');
                  const balInr = (tx.balanceAfterPaise / 100).toLocaleString('en-IN');
                  const txTitle = language === 'te' ? tx.titleTe : language === 'hi' ? tx.titleHi : tx.title;

                  const d = new Date(tx.timestamp);
                  const formattedDate = d.toLocaleDateString(
                    language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
                    { day: '2-digit', month: 'short', year: 'numeric' }
                  );
                  const formattedTime = d.toLocaleTimeString(
                    language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
                    { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }
                  );

                  return (
                    <div
                      key={tx.txId}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-4 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                            isCredit
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">{txTitle}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                isCredit
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}
                            >
                              {isCredit ? '+ DBT CREDIT' : '- DEBIT'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1 text-slate-700">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formattedDate}</span>
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1 text-slate-700">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{formattedTime}</span>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono pt-0.5">
                            <span className="text-slate-600 font-semibold">{tx.txId}</span>
                            <span>&bull;</span>
                            <span className="px-1 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-200">
                              {tx.paymentRail}
                            </span>
                            <span className="text-emerald-700 font-sans font-bold flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 shrink-0 flex flex-col justify-center">
                        <span
                          className={`text-base font-black font-mono tracking-tight ${
                            isCredit ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isCredit ? '+' : '-'} ₹{absAmountInr}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {language === 'te' ? 'నిల్వ:' : language === 'hi' ? 'शेष:' : 'Bal:'} ₹{balInr}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsPassbookModalOpen(false)}
                className="px-5 py-2 bg-[#002244] hover:bg-[#0b3c6d] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'te' ? 'మూసివేయండి (Close)' : language === 'hi' ? 'बंद करें (Close)' : 'Close Passbook'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tenancy & Leased Land (Batai) AgriStack Modal */}
      {isLeaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-[#002244] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold">
                    {language === 'hi' ? 'एग्रीस्टैक ई-भूमि पट्टा व बटाई पंजीकरण (Tenancy RoR)' : 'AgriStack e-Bhoomi Tenancy Registry'}
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    {language === 'hi' ? 'अतिरिक्त काश्तकारी भूमि हेतु कानूनी पट्टा सत्यापन' : 'Digital Land Lease Verification for Extra Acreage'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLeaseModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-slate-700 space-y-1">
                <span className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-900" />
                  <span>{language === 'hi' ? 'स्वामित्व एवं काश्तकारी नियम (AgriStack Norms):' : 'AgriStack Land Title Regulations:'}</span>
                </span>
                <p className="text-[11px] text-slate-600">
                  {language === 'hi'
                    ? `आपके नाम पर ${currentProfile.landAreaAcres} एकड़ स्वामित्व RoR दर्ज है। यदि आप पड़ोसी या पट्टादाता से अतिरिक्त भूमि किराए/बटाई पर खेती कर रहे हैं, तो अधिकृत पट्टा अनुबंध FID जोड़कर बीमा रकबा बढ़ाया जा सकता है।`
                    : `You hold ${(currentProfile.landAreaAcres || 2).toFixed(1)} Acres owned RoR title. If cultivating additional leased/tenant land, attach an authorized State Tenancy FID to expand your insurable limit.`}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'hi' ? 'ई-पट्टा / बटाई अनुबंध संख्या (Tenancy Lease FID):' : 'State Tenancy Agreement FID (e-Bhoomi):'}
                  </label>
                  <input
                    type="text"
                    value={leaseFid}
                    onChange={e => setLeaseFid(e.target.value)}
                    placeholder="e.g. AGRI-LSE-AP-99214"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-xs text-slate-900 outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    {language === 'hi' ? 'अतिरिक्त काश्तकारी रकबा (Leased Acreage to Add):' : 'Additional Leased Land Area:'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[2, 4, 6].map(ac => (
                      <button
                        key={ac}
                        type="button"
                        onClick={() => setLeasedAcres(ac)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          leasedAcres === ac
                            ? 'bg-blue-950 text-white border-blue-950 shadow-xs'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        +{ac} {t.acres}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>{language === 'hi' ? 'स्वयं का RoR रकबा:' : 'Owned RoR Area:'}</span>
                    <span className="font-bold text-slate-900 font-mono">{(currentProfile.landAreaAcres || 2).toFixed(1)} {t.acres}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{language === 'hi' ? 'सत्यापित पट्टा रकबा:' : 'Verified Leased Area:'}</span>
                    <span className="font-bold text-blue-900 font-mono">+{leasedAcres}.0 {t.acres}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1 text-xs">
                    <span>{language === 'hi' ? 'नया कुल बीमा योग्य रकबा:' : 'New Insurable Ceiling:'}</span>
                    <span className="font-black text-emerald-700 font-mono">{((currentProfile.landAreaAcres || 2) + leasedAcres).toFixed(1)} {t.acres}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              {hasTenancyLease && (
                <button
                  type="button"
                  onClick={() => {
                    setHasTenancyLease(false);
                    setSelectedAcreage(currentProfile.landAreaAcres || 2);
                    setIsLeaseModalOpen(false);
                    audioService.playTone('alert');
                  }}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'पट्टा हटाएं (Reset to Owned RoR)' : 'Remove Lease'}
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsLeaseModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasTenancyLease(true);
                    setSelectedAcreage((currentProfile.landAreaAcres || 2) + leasedAcres);
                    setIsLeaseModalOpen(false);
                    setFraudWarning(null);
                    audioService.playTone('success');
                  }}
                  className="px-4 py-1.5 bg-[#002244] hover:bg-[#0b3c6d] text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'पट्टा सत्यापित करें व रकबा अनलॉक करें' : 'Verify & Unlock Acreage'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
