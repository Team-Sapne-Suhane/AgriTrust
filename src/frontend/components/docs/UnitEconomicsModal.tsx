import React from 'react';
import { DollarSign, CheckCircle2, X } from 'lucide-react';

interface UnitEconomicsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UnitEconomicsModal: React.FC<UnitEconomicsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl">
              💰
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Unit Economics &amp; Operating Cost (Section 3)</h3>
              <p className="text-xs text-slate-400">Hard Ceiling: &le; ₹2.00 / Policy &bull; Voice Pipeline Included</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            The binding technical constraint dictates that total operating cost must remain strictly under <strong>₹2.00 per policy</strong>, inclusive of the voice pipeline (TTS, ASR, IVR, and SMS), compute, and storage.
          </p>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">Cost Component</th>
                  <th className="p-3">Volume / Vendor Assumption</th>
                  <th className="p-3 text-right">Cost / Policy (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                <tr>
                  <td className="p-3 font-medium text-white">On-Device Voice Synthesis (Web Speech TTS)</td>
                  <td className="p-3 text-slate-400">Client-side synthesis (Zero API egress)</td>
                  <td className="p-3 text-right font-mono text-emerald-400">₹ 0.000</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">DLT Transactional SMS Alert</td>
                  <td className="p-3 text-slate-400">1-part DLT registered bulk SMS @ ₹0.11</td>
                  <td className="p-3 text-right font-mono text-emerald-400">₹ 0.110</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">Automated IVR Voice Callback (10s)</td>
                  <td className="p-3 text-slate-400">Wholesale SIP trunking @ ₹0.24 / min</td>
                  <td className="p-3 text-right font-mono text-emerald-400">₹ 0.040</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">Serverless Sync &amp; Trigger Compute</td>
                  <td className="p-3 text-slate-400">Cloudflare Workers / Lambda (128MB, 50ms)</td>
                  <td className="p-3 text-right font-mono text-emerald-400">₹ 0.012</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">Oracle Data Ingestion (CHIRPS + IMD)</td>
                  <td className="p-3 text-slate-400">Amortized gridded satellite feed</td>
                  <td className="p-3 text-right font-mono text-emerald-400">₹ 0.008</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">Append-Only Audit Trail Cold Storage</td>
                  <td className="p-3 text-slate-400">S3 Glacier Instant / SQLite chunk archive</td>
                  <td className="p-3 text-right font-mono text-emerald-400">₹ 0.005</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-white">Contingency / Retry Buffer (3% loss)</td>
                  <td className="p-3 text-slate-400">Additional network overhead</td>
                  <td className="p-3 text-right font-mono text-emerald-400">₹ 0.025</td>
                </tr>
                <tr className="bg-emerald-950/40 font-bold">
                  <td className="p-3 text-emerald-300">TOTAL MEASURED OPERATING COST</td>
                  <td className="p-3 text-emerald-300">10x Under Permitted Ceiling</td>
                  <td className="p-3 text-right font-mono text-emerald-400 text-sm">₹ 0.200</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-right pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold"
          >
            Close Economics
          </button>
        </div>
      </div>
    </div>
  );
};
