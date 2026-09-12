import React, { useState, useEffect } from 'react';
import { UserProfile, Language } from '../../../types';
import { audioService } from '../../../backend/services/audioService';
import { walletService } from '../../../backend/services/walletService';
import {
  Phone,
  Delete,
  PhoneCall,
  PhoneOff,
  Smartphone,
  Radio,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  MessageSquare,
  Zap,
  RefreshCw,
  WifiOff,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle
} from 'lucide-react';

interface UssdSimulatorProps {
  currentProfile: UserProfile;
  language: Language;
}

export const UssdSimulator: React.FC<UssdSimulatorProps> = ({ currentProfile, language }) => {
  const [dialedNumber, setDialedNumber] = useState('*144#');
  const [inSession, setInSession] = useState(false);
  const [ussdScreen, setUssdScreen] = useState<'main' | 'crops' | 'status' | 'payout' | 'confirmed'>('main');
  const [inputChoice, setInputChoice] = useState('');
  const [screenText, setScreenText] = useState('');
  const [sessionDuration, setSessionDuration] = useState(0);
  const [smsReceipt, setSmsReceipt] = useState<string | null>(null);
  const [lastPacket, setLastPacket] = useState<string>('GSM_03.38_IDLE');

  // Timer for active USSD session
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inSession) {
      timer = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      setSessionDuration(0);
    }
    return () => clearInterval(timer);
  }, [inSession]);

  const handleDial = (overrideNumber?: string) => {
    const num = (overrideNumber || dialedNumber || '*144#').trim();
    setInSession(true);
    setUssdScreen('main');
    audioService.playTone('phone_ring');
    setLastPacket(`MAP_PROCESS_UNSTRUCTURED_SS_REQ: ${num || '*144#'}`);
    setScreenText(
      language === 'hi'
        ? `[mKisan सुरक्षा 2G पोर्टल]\nनमस्ते ${currentProfile.name.split(' ')[0]} जी!\n-----------------------\n1. त्वरित फसल बीमा पंजीकरण\n2. वर्षा सूचकांक स्थिति (Live)\n3. डीबीटी बैलेंस एवं वाउचर\n4. किसान वाणी वॉयस कॉल\n0. बाहर निकलें`
        : `[mKisan Suraksha 2G Portal]\nWelcome ${currentProfile.name.split(' ')[0]}!\n-----------------------\n1. Instant Crop Registration\n2. Live Rainfall Index\n3. DBT Balance & Voucher\n4. Vernacular IVR Callback\n0. Exit`
    );
  };

  const handleQuickDial = (choice: string) => {
    setDialedNumber('*144#');
    setInSession(true);
    audioService.playTone('click');
    processChoice(choice, 'main');
  };

  const processChoice = (choice: string, currentScreen: string) => {
    if (currentScreen === 'main') {
      if (choice === '1') {
        setUssdScreen('crops');
        setLastPacket('GSM_SS_CONTINUE: REQ_CROP_SELECTION');
        setScreenText(
          language === 'hi'
            ? `फसल चुनें (राप्ताडू ग्रिड):\n1. धान (धान्य) - सीमा 35mm\n2. गेहूं (रबी) - सीमा 30mm\n3. कपास - सीमा 42mm\n4. बाजरा (श्री अन्न) - सीमा 25mm\n5. सोयाबीन - सीमा 38mm\n6. सरसों - सीमा 28mm\n0. मुख्य मेनू पर जाएं`
            : `Select Crop (Anantapur):\n1. Paddy (Threshold: 35mm)\n2. Wheat (Threshold: 30mm)\n3. Cotton (Threshold: 42mm)\n4. Bajra (Millet: 25mm)\n5. Soybean (Threshold: 38mm)\n6. Mustard (Threshold: 28mm)\n0. Back to Main`
        );
      } else if (choice === '2') {
        setUssdScreen('status');
        setLastPacket('GSM_SS_CONTINUE: AWS_LIVE_QUERY_ANANTAPUR');
        setScreenText(
          language === 'hi'
            ? `वर्षा सूचकांक (राप्ताडू ग्रिड):\nकुल वर्षा: 48mm / 110mm\nसूखा ट्रिगर: <35mm\nस्थिति: सामान्य वर्षा (No Drought)\n0. मुख्य मेनू पर जाएं`
            : `Rainfall Index (Anantapur):\nCumulative: 48mm / 110mm\nDrought Trigger: <35mm\nStatus: NORMAL_MONSOON\n0. Back to Main`
        );
      } else if (choice === '3') {
        setUssdScreen('payout');
        const bal = walletService.getProfileBalance(currentProfile.id);
        const vouchers = walletService.getVouchersForProfile(currentProfile.id);
        const latestOtp = vouchers[0]?.voucherCode || 'SKP-7829-AGRO';
        setLastPacket('GSM_SS_CONTINUE: WALLET_OFFLINE_OTP_QUERY');
        setScreenText(
          language === 'hi'
            ? `डीबीटी किसान वॉलेट:\nखाता शेष: ₹${bal > 0 ? bal / 100 : '12,000'}\nसक्रिय वाउचर OTP: ${latestOtp}\nसरकारी बीज केंद्र पर मान्य।\n0. मुख्य मेनू पर जाएं`
            : `DBT Farmer Wallet:\nBalance: Rs.${bal > 0 ? bal / 100 : '12,000'}\nActive Voucher OTP: ${latestOtp}\nValid at Govt Agro Kendras.\n0. Back to Main`
        );
      } else if (choice === '4') {
        setLastPacket('GSM_SS_END: IVR_VOICE_CALL_SCHEDULED');
        audioService.speak(
          language === 'hi'
            ? `नमस्ते ${currentProfile.name}! आपका सुरक्षा किसान खाता सक्रिय है। वर्षा 35 मिलीमीटर से कम होने पर डीबीटी सहायता सीधे आपके फोन पर आ जाएगी।`
            : `Hello ${currentProfile.name}! Your Suraksha Kisan account is active. DBT relief triggers automatically if rainfall drops below 35mm.`,
          language
        );
        setScreenText(
          language === 'hi'
            ? `[आईवीआर वॉयस कॉल कनेक्टेड]\nसरकारी किसान वाणी से कॉल जारी है...\nकृपया लाउडस्पीकर पर सुनें।`
            : `[IVR Voice Callback Active]\nConnecting automated Kisan Vani call...\nListening on speaker.`
        );
      } else {
        setInSession(false);
        setLastPacket('MAP_RELEASE_COMPLETE');
      }
    } else if (currentScreen === 'crops') {
      const cropMap: Record<string, { en: string; hi: string; prem: number; cov: number }> = {
        '1': { en: 'Paddy', hi: 'धान', prem: 180, cov: 12000 },
        '2': { en: 'Wheat', hi: 'गेहूं', prem: 150, cov: 10500 },
        '3': { en: 'Cotton', hi: 'कपास', prem: 240, cov: 15000 },
        '4': { en: 'Bajra (Shri Anna)', hi: 'बाजरा (श्री अन्न)', prem: 120, cov: 9000 },
        '5': { en: 'Soybean', hi: 'सोयाबीन', prem: 200, cov: 13500 },
        '6': { en: 'Mustard', hi: 'सरसों', prem: 140, cov: 10000 }
      };

      if (cropMap[choice]) {
        setUssdScreen('confirmed');
        const selected = cropMap[choice];
        setLastPacket(`GSM_SS_END: POLICY_REGISTERED_CROP_${selected.en.toUpperCase()}`);
        setScreenText(
          language === 'hi'
            ? `सफल! 2G यूएसएसडी द्वारा पॉलिसी पंजीकृत।\nफसल: ${selected.hi}\nप्रीमियम: ₹${selected.prem} (DBT सब्सिडी)\nकवर: ₹${selected.cov.toLocaleString('en-IN')}\nएसएमएस रसीद भेजी गई।\n0 दबाकर समाप्त करें।`
            : `Success! Policy registered via 2G USSD.\nCrop: ${selected.en}\nPremium: Rs.${selected.prem} (Subsidized)\nCover: Rs.${selected.cov.toLocaleString('en-IN')}\nSMS receipt sent.\nPress 0 to exit.`
        );
        audioService.playTone('success');
        setSmsReceipt(
          language === 'hi'
            ? `[VK-GOVMIS] प्रिय ${currentProfile.name}, आपकी ${selected.hi} PM-SKP फसल सुरक्षा पॉलिसी *144# द्वारा पंजीकृत हो गई है। कवर: ₹${selected.cov.toLocaleString('en-IN')}। सहायता कोड: SKP-${Math.floor(1000 + Math.random() * 9000)}। - कृषि मंत्रालय, भारत सरकार`
            : `[VK-GOVMIS] Dear ${currentProfile.name}, your ${selected.en} PM-SKP insurance policy was registered via USSD *144#. Coverage: Rs.${selected.cov.toLocaleString('en-IN')}. Voucher Code: SKP-${Math.floor(1000 + Math.random() * 9000)}. - Ministry of Agriculture, Govt of India`
        );
      } else {
        setUssdScreen('main');
        setLastPacket('GSM_SS_CONTINUE: RETURN_TO_ROOT');
        setScreenText(
          language === 'hi'
            ? `[mKisan सुरक्षा 2G पोर्टल]\n1. त्वरित फसल बीमा पंजीकरण\n2. वर्षा सूचकांक स्थिति (Live)\n3. डीबीटी बैलेंस एवं वाउचर\n4. किसान वाणी वॉयस कॉल\n0. बाहर निकलें`
            : `[mKisan Suraksha 2G Portal]\n1. Instant Crop Registration\n2. Live Rainfall Index\n3. DBT Balance & Voucher\n4. Vernacular IVR Callback\n0. Exit`
        );
      }
    } else {
      setUssdScreen('main');
      setLastPacket('GSM_SS_CONTINUE: RETURN_TO_ROOT');
      setScreenText(
        language === 'hi'
          ? `[mKisan सुरक्षा 2G पोर्टल]\n1. त्वरित फसल बीमा पंजीकरण\n2. वर्षा सूचकांक स्थिति (Live)\n3. डीबीटी बैलेंस एवं वाउचर\n4. किसान वाणी वॉयस कॉल\n0. बाहर निकलें`
          : `[mKisan Suraksha 2G Portal]\n1. Instant Crop Registration\n2. Live Rainfall Index\n3. DBT Balance & Voucher\n4. Vernacular IVR Callback\n0. Exit`
      );
    }
  };

  const handleSendChoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChoice.trim()) return;
    audioService.playTone('click');
    processChoice(inputChoice.trim(), ussdScreen);
    setInputChoice('');
  };

  const pressKey = (key: string) => {
    audioService.playTone('click');
    if (!inSession) {
      setDialedNumber(prev => (prev === '*144#' ? key : prev + key));
    } else {
      processChoice(key, ussdScreen);
    }
  };

  const endSession = () => {
    setInSession(false);
    setUssdScreen('main');
    setInputChoice('');
    setDialedNumber('*144#');
    setLastPacket('MAP_RELEASE_COMPLETE');
    audioService.playTone('click');
  };

  return (
    <div className="space-y-6">
      {/* Official Government Header Banner */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-900 text-white rounded-lg shadow-xs">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#002244]">
                  {language === 'hi'
                    ? 'mKisan 2G यूएसएसडी एवं बेसिक फोन गेटवे (*144#)'
                    : 'mKisan 2G USSD & Basic Phone Gateway (*144#)'}
                </h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded border border-emerald-300">
                  {language === 'hi' ? 'शून्य इंटरनेट आवश्यक' : 'Zero Data Pack'}
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded border border-blue-300">
                  Govt Shortcode: *144#
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {language === 'hi'
                  ? 'भारत सरकार दूरसंचार विभाग एवं कृषि मंत्रालय — बेसिक फीचर फोन (JioBharat/Nokia) हेतु त्वरित *144# लघु कोड'
                  : 'DoT & Ministry of Agriculture — Zero-data GSM SS7 signaling shortcode (*144#) for feature phones'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>BSNL / Airtel mKisan Gateway</span>
            </div>
          </div>
        </div>

        {/* Why USSD is critical for Inclusion (PRD Context) */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-start gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">
                {language === 'hi' ? '1. इंटरनेट व स्मार्टफोन की आवश्यकता नहीं' : '1. Zero Internet or Smartphone'}
              </span>
              <span className="text-slate-600 text-[11px]">
                {language === 'hi'
                  ? '₹999 वाले JioBharat / Nokia 105 फीचर फोन पर सीधे GSM SS7 सिग्नलिंग पर *144# डायल करें।'
                  : 'Operates over GSM SS7 signaling layer on low-cost feature phones via *144#.'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-start gap-2">
            <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">
                {language === 'hi' ? '2. तत्काल 1-कीप्रेस पंजीकरण व वाउचर' : '2. Instant 1-Keypress Registration'}
              </span>
              <span className="text-slate-600 text-[11px]">
                {language === 'hi'
                  ? 'किसान 1 दबाकर तुरंत फसल बीमा पॉलिसी और डीबीटी बीज वाउचर कोड प्राप्त कर सकते हैं।'
                  : 'Press 1 for instant crop policy enrollment and offline voucher OTP generation.'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg flex items-start gap-2">
            <Volume2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">
                {language === 'hi' ? '3. निरक्षर किसानों के लिए वॉयस IVR' : '3. Vernacular Voice IVR'}
              </span>
              <span className="text-slate-600 text-[11px]">
                {language === 'hi'
                  ? '4 दबाने पर किसान वाणी वॉयस कॉल द्वारा स्थानीय भाषा में पूरी जानकारी बोली जाती है।'
                  : 'Press 4 for automated regional language speech explaining drought thresholds.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Side-by-Side Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sleek Realistic Feature Phone Chassis (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[330px] bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#020617] border-[5px] border-slate-700/80 rounded-[46px] p-4 shadow-2xl space-y-3 relative">
            {/* Top Phone Speaker, Front Sensor & Emblem Notch */}
            <div className="flex flex-col items-center gap-1.5 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600/70" />
                <div className="w-14 h-1.5 bg-slate-700 rounded-full shadow-inner" />
                <div className="w-2 h-2 rounded-full bg-emerald-950 border border-emerald-600/50" />
              </div>
              <div className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                mKisan 2G • भारत
              </div>
            </div>

            {/* Backlit Feature Phone LCD Screen (Retro-Modern High Contrast) */}
            <div className="bg-[#07131e] border-2 border-[#1e3a5f] rounded-2xl p-3 text-slate-100 font-mono shadow-inner min-h-[220px] flex flex-col justify-between relative overflow-hidden">
              {/* Subtle Screen Scanline Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent pointer-events-none" />

              {/* Carrier & Battery Status Bar */}
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 border-b border-[#1e3a5f]/80 pb-1 mb-1 relative z-10">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                  <span>BSNL 2G</span>
                </span>
                <span className="text-amber-300 font-sans text-[10px]">🇮🇳 *144#</span>
                <span className="text-slate-300">🔋 98%</span>
              </div>

              {/* Active Session Content or Idle Dial Screen */}
              {inSession ? (
                <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-emerald-300 font-bold bg-[#0a1e2f] px-2 py-0.5 rounded border border-emerald-800/60">
                      <span>USSD SESSION ACTIVE</span>
                      <span className="text-amber-300">⏱️ 00:{sessionDuration < 10 ? `0${sessionDuration}` : sessionDuration}</span>
                    </div>
                    <pre className="whitespace-pre-wrap leading-tight text-[11px] text-emerald-300 font-medium font-mono pt-1 max-h-[125px] overflow-y-auto">
                      {screenText}
                    </pre>
                  </div>

                  <form onSubmit={handleSendChoice} className="pt-2 flex gap-1.5 items-center">
                    <input
                      type="text"
                      value={inputChoice}
                      onChange={e => setInputChoice(e.target.value)}
                      placeholder={language === 'hi' ? 'उत्तर (1, 2, 3...)' : 'Reply (1, 2, 3...)'}
                      className="flex-1 bg-[#020b14] border border-emerald-500/60 rounded px-2 py-1 text-xs text-emerald-200 font-bold outline-none focus:border-emerald-400 font-mono shadow-inner text-center"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded text-xs transition-colors shadow-xs"
                    >
                      {language === 'hi' ? 'भेजें' : 'SEND'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between py-4 text-center relative z-10">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {language === 'hi' ? 'राष्ट्रीय mKisan 2G सेवा' : 'Govt mKisan 2G Service'}
                  </div>
                  <div className="py-2 text-3xl font-black text-amber-400 tracking-wider font-mono flex items-center justify-center gap-1">
                    <span>{dialedNumber || '*144#'}</span>
                    <span className="w-2.5 h-6 bg-amber-400 inline-block animate-pulse" />
                  </div>
                  <div className="text-[10px] text-emerald-400 font-sans">
                    {language === 'hi'
                      ? 'डायल करने के लिए हरा CALL बटन दबाएं'
                      : 'Press green CALL button to start'}
                  </div>
                </div>
              )}

              {/* Bottom Screen Indicator */}
              <div className="text-[9px] text-slate-500 text-center border-t border-[#1e3a5f]/60 pt-1 mt-1 relative z-10">
                mKisan DoT Gateway • 03.38 Phase 2+
              </div>
            </div>

            {/* Hardware Controls & Navigation Ring */}
            <div className="space-y-2 pt-1">
              {/* Softkey & D-Pad Control Row */}
              <div className="grid grid-cols-3 gap-2 items-center">
                {/* Left Action Softkey: CALL / SEND */}
                {!inSession ? (
                  <button
                    onClick={() => handleDial()}
                    className="py-2.5 bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center shadow-lg transition-transform border border-emerald-500/50"
                  >
                    <PhoneCall className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] leading-tight">{language === 'hi' ? 'कॉल' : 'CALL'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => processChoice(inputChoice || '1', ussdScreen)}
                    className="py-2.5 bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center shadow-lg transition-transform border border-emerald-500/50"
                  >
                    <CheckCircle2 className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] leading-tight">{language === 'hi' ? 'चुनें (OK)' : 'SELECT'}</span>
                  </button>
                )}

                {/* Central 4-Way Navigation D-Pad with OK Key */}
                <div className="flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-b from-slate-700 to-slate-800 border-2 border-slate-600 shadow-md flex items-center justify-center relative">
                    <button
                      onClick={() => {
                        audioService.playTone('click');
                        if (inSession) processChoice('1', ussdScreen);
                      }}
                      className="w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-950 active:scale-90 text-amber-400 font-bold text-[9px] flex items-center justify-center border border-slate-600 shadow-inner"
                    >
                      OK
                    </button>
                    <div className="absolute top-1 text-slate-400 text-[8px] pointer-events-none">▲</div>
                    <div className="absolute bottom-1 text-slate-400 text-[8px] pointer-events-none">▼</div>
                    <div className="absolute left-1 text-slate-400 text-[8px] pointer-events-none">◀</div>
                    <div className="absolute right-1 text-slate-400 text-[8px] pointer-events-none">▶</div>
                  </div>
                </div>

                {/* Right Action Softkey: END / CLEAR */}
                {!inSession ? (
                  <button
                    onClick={() => {
                      setDialedNumber('');
                      setInputChoice('');
                      audioService.playTone('click');
                    }}
                    className="py-2.5 bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 active:scale-95 text-slate-200 font-bold rounded-xl text-xs flex flex-col items-center justify-center shadow-lg transition-transform border border-slate-600"
                  >
                    <Delete className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] leading-tight">{language === 'hi' ? 'हटाएं' : 'CLEAR'}</span>
                  </button>
                ) : (
                  <button
                    onClick={endSession}
                    className="py-2.5 bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white font-bold rounded-xl text-xs flex flex-col items-center justify-center shadow-lg transition-transform border border-rose-500/50"
                  >
                    <PhoneOff className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] leading-tight">{language === 'hi' ? 'समाप्त' : 'END'}</span>
                  </button>
                )}
              </div>

              {/* 12-Key Alphanumeric Tactile Keypad */}
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { key: '1', sub: '.,' },
                  { key: '2', sub: 'ABC' },
                  { key: '3', sub: 'DEF' },
                  { key: '4', sub: 'GHI' },
                  { key: '5', sub: 'JKL' },
                  { key: '6', sub: 'MNO' },
                  { key: '7', sub: 'PQRS' },
                  { key: '8', sub: 'TUV' },
                  { key: '9', sub: 'WXYZ' },
                  { key: '*', sub: '⚙️' },
                  { key: '0', sub: '␣' },
                  { key: '#', sub: '↵' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => pressKey(item.key)}
                    className="py-1.5 bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 active:from-slate-950 active:to-slate-900 text-white font-bold text-sm rounded-xl border border-slate-700/80 shadow-sm flex flex-col items-center justify-center transition-all active:scale-95 font-mono"
                  >
                    <span className="leading-tight">{item.key}</span>
                    <span className="text-[8px] text-slate-400 font-sans font-normal leading-none">
                      {item.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Telecom Gateway, Quick Actions & Live SMS Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Quick Demo Shortcuts Card */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-xs text-[#002244] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'hi'
                    ? '1-क्लिक त्वरित USSD परीक्षण (Evaluation Shortcuts)'
                    : '1-Click Interactive Evaluation Shortcuts'}
                </span>
              </span>
              <span className="text-[11px] text-slate-500">
                {language === 'hi' ? 'सीधे *144# डायल करें' : 'Fast Dial *144#'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => handleQuickDial('1')}
                className="p-3 bg-blue-50/70 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors flex items-start gap-2.5 group"
              >
                <span className="px-2 py-1 bg-blue-900 text-white font-bold text-xs rounded font-mono">
                  1
                </span>
                <div>
                  <span className="font-bold text-xs text-blue-950 block group-hover:text-blue-700">
                    {language === 'hi' ? 'फसल बीमा पंजीकरण' : 'Register Crop Policy'}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {language === 'hi' ? 'धान/कपास के लिए 2G पंजीकरण' : 'Instant 2G registration'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleQuickDial('2')}
                className="p-3 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-left transition-colors flex items-start gap-2.5 group"
              >
                <span className="px-2 py-1 bg-emerald-800 text-white font-bold text-xs rounded font-mono">
                  2
                </span>
                <div>
                  <span className="font-bold text-xs text-emerald-950 block group-hover:text-emerald-700">
                    {language === 'hi' ? 'लाइव वर्षा सूचकांक जांचें' : 'Check Live Rainfall'}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {language === 'hi' ? 'AWS व IMD ग्रिड वर्षा डेटा' : 'Query IMD/AWS Grid rain'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleQuickDial('3')}
                className="p-3 bg-amber-50/70 hover:bg-amber-100 border border-amber-200 rounded-lg text-left transition-colors flex items-start gap-2.5 group"
              >
                <span className="px-2 py-1 bg-amber-800 text-white font-bold text-xs rounded font-mono">
                  3
                </span>
                <div>
                  <span className="font-bold text-xs text-amber-950 block group-hover:text-amber-700">
                    {language === 'hi' ? 'डीबीटी वाउचर OTP देखें' : 'View DBT Voucher OTP'}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {language === 'hi' ? 'सरकारी बीज केंद्र पर रिडीम कोड' : 'Govt Agro Kendra redeem code'}
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleQuickDial('4')}
                className="p-3 bg-purple-50/70 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors flex items-start gap-2.5 group"
              >
                <span className="px-2 py-1 bg-purple-800 text-white font-bold text-xs rounded font-mono">
                  4
                </span>
                <div>
                  <span className="font-bold text-xs text-purple-950 block group-hover:text-purple-700">
                    {language === 'hi' ? 'आईवीआर वॉयस कॉल सुनें' : 'Trigger Vernacular Voice'}
                  </span>
                  <span className="text-[11px] text-slate-600 block">
                    {language === 'hi' ? 'हिंदी किसान वाणी ऑडियो' : 'Hindi Kisan Vani speech'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Live GSM Signaling Telemetry Card */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-xs text-[#002244] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-900" />
                <span>
                  {language === 'hi'
                    ? '2G यूएसएसडी सिग्नलिंग एवं टेलीमेट्री कंसोल (GSM 03.38)'
                    : '2G USSD Signaling & Telemetry Console (GSM 03.38)'}
                </span>
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold rounded border border-slate-300">
                Phase 2+ MAP Protocol
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-500">
                  {language === 'hi' ? 'नेटवर्क चैनल' : 'Bearer Channel'}
                </div>
                <div className="text-xs font-bold text-slate-900 font-mono">GSM SDCCH</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-500">
                  {language === 'hi' ? 'डेटा खपत' : 'Data Used'}
                </div>
                <div className="text-xs font-bold text-emerald-700 font-mono">0.00 KB (Zero)</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-500">
                  {language === 'hi' ? 'प्रतिक्रिया समय' : 'Round-Trip SLA'}
                </div>
                <div className="text-xs font-bold text-blue-800 font-mono">&lt; 380 ms</div>
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-[10px] text-slate-500">
                  {language === 'hi' ? 'सत्र स्थिति' : 'Session State'}
                </div>
                <div
                  className={`text-xs font-bold font-mono ${
                    inSession ? 'text-emerald-700 animate-pulse' : 'text-slate-600'
                  }`}
                >
                  {inSession ? 'ACTIVE' : 'STANDBY'}
                </div>
              </div>
            </div>

            {/* Live Wire Packet Inspector */}
            <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                <span>GATEWAY: BSNL-AP-HYD-USSD-GW-04</span>
                <span className="text-emerald-400">STATUS: 200_OK</span>
              </div>
              <div className="text-emerald-300 truncate">
                <span className="text-slate-500">LAST_PACKET &gt; </span>
                {lastPacket}
              </div>
              <div className="text-slate-400 text-[10px]">
                {language === 'hi'
                  ? 'यह प्रोटोकॉल भारत में 100% 2G कवरेज पर बिना किसी ऐप के *144# द्वारा कार्य करता है।'
                  : 'Zero-byte protocol functions reliably across 100% 2G rural towers without any client software.'}
              </div>
            </div>
          </div>

          {/* Live Simulated SMS Receipt Card */}
          <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-bold text-xs text-[#002244] uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-900" />
                <span>
                  {language === 'hi'
                    ? 'पुश एसएमएस रसीद फीड (160-कैरेक्टर GSM फॉलबैक)'
                    : 'Push SMS Receipt Feed (160-char GSM Fallback)'}
                </span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                {language === 'hi' ? 'डीबीटी पंजीकृत' : 'DBT Registered'}
              </span>
            </div>

            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-950 text-[11px]">
                <span>SENDER: VK-GOVMIS (Govt of India)</span>
                <span className="text-[10px] text-slate-500">Just Now</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-sans text-xs">
                {smsReceipt ||
                  (language === 'hi'
                    ? `[VK-GOVMIS] प्रिय ${currentProfile.name}, आपकी PM-SKP फसल सुरक्षा पॉलिसी *144# द्वारा पंजीकृत है। आपातकालीन सहायता कोड: SKP-9842। - कृषि मंत्रालय, भारत सरकार`
                    : `[VK-GOVMIS] Dear ${currentProfile.name}, your PM-SKP crop insurance policy is registered via *144#. Emergency voucher: SKP-9842. - Ministry of Agriculture, Govt of India`)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


