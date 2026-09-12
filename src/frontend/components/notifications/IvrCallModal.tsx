import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, PhoneCall, Volume2, ShieldCheck } from 'lucide-react';
import { audioService } from '../../../backend/services/audioService';

interface IvrCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName: string;
  amountInr: number;
}

export const IvrCallModal: React.FC<IvrCallModalProps> = ({
  isOpen,
  onClose,
  farmerName,
  amountInr
}) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');

  useEffect(() => {
    if (isOpen) {
      setCallState('ringing');
      audioService.playTone('phone_ring');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAnswer = () => {
    setCallState('connected');
    audioService.playTone('click');
    const msg = `नमस्ते ${farmerName}! सुरक्षा किसान बीमा केंद्र से यह सूचना है। आपके क्षेत्र में वर्षा 35 मिलीमीटर से कम दर्ज हुई है। आपका सूखा क्लेम स्वचालित रूप से स्वीकृत कर ₹${amountInr.toLocaleString('en-IN')} का भुगतान आपके ऑफलाइन वॉलेट में भेज दिया गया है। आप सीधे किसी भी बीज भंडार पर इसका उपयोग कर सकते हैं। धन्यवाद!`;
    audioService.speak(msg, 'hi', () => {
      setTimeout(() => {
        setCallState('ended');
      }, 1000);
    });
  };

  const handleHangup = () => {
    audioService.stop();
    setCallState('ended');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
            {callState === 'ringing' ? 'इनकमिंग IVR वॉयस कॉल (Incoming Call)' : 'कॉल जारी है (Call Connected)'}
          </span>
          <h3 className="text-xl font-bold text-white">सुरक्षा किसान (1800-2604)</h3>
          <p className="text-xs text-slate-400">स्वचालित सूखा भुगतान सत्यापन केंद्र</p>
        </div>

        {/* Animated Avatar / Ringing Indicator */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full bg-emerald-500/20 ${callState === 'ringing' ? 'animate-ping' : ''}`} />
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-3xl shadow-xl">
            {callState === 'connected' ? <Volume2 className="w-8 h-8 text-white animate-bounce" /> : <PhoneCall className="w-8 h-8 text-white animate-pulse" />}
          </div>
        </div>

        {callState === 'connected' && (
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs text-emerald-300 leading-relaxed font-medium">
            🔊 &quot;नमस्ते {farmerName}! सूखा क्लेम स्वीकृत: ₹{amountInr.toLocaleString('en-IN')} आपके वॉलेट में स्वतः भेज दिए गए हैं...&quot;
          </div>
        )}

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-6 pt-2">
          {callState === 'ringing' ? (
            <>
              <button
                onClick={handleHangup}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950 transition-all active:scale-90"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={handleAnswer}
                className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950 transition-all active:scale-90 animate-bounce"
              >
                <Phone className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button
              onClick={handleHangup}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950 transition-all active:scale-90"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
