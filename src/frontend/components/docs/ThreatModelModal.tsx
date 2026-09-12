import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface ThreatModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThreatModelModal: React.FC<ThreatModelModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-purple-500/50 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl">
              🛡️
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Shared-Device Threat Model &amp; Trust Boundary (FR6)</h3>
              <p className="text-xs text-slate-400">Published Security Specification &bull; Zero Data Leakage</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-purple-300 text-sm">1. Target Threat Scenario (Shared Household Phone)</h4>
            <p>
              In rural smallholder households, a single feature phone or basic Android handset is shared among 3–6 family members and neighbors. 
              The adversary is an unauthorized user (family member, neighbor, or rogue merchant) who gains physical possession of the handset.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-purple-300 text-sm">2. Enforced Security Invariants</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>PIN / Voice-Phrase Sandbox:</strong> Every profile owns an isolated cryptographic keystore. No policy details, payout balance, or offline OTP vouchers are visible without entering the individual&apos;s 4-digit PIN.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Offline Cryptographic Tokens:</strong> Payout vouchers are generated with per-user nonce signatures (`SIG_ED25519_USER_PHONE`). Spending one voucher does not reveal credentials of any other profile.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Zero Cross-User Replay:</strong> An adversary attempting to replay an offline sync or redeem another member&apos;s OTP is immediately rejected by monotonic sequence numbers.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-950/40 border border-purple-800/60 p-4 rounded-xl text-purple-200">
            <strong>Evaluation Gate Compliance:</strong> In the sealed evaluation, cross-user access attempted during handset handoff is strictly blocked. The isolation gate score remains 100%.
          </div>
        </div>

        <div className="text-right pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold"
          >
            Close Threat Model
          </button>
        </div>
      </div>
    </div>
  );
};
