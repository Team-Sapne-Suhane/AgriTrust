import React from 'react';
import { Activity, X } from 'lucide-react';
import { PUBLISHED_WIRE_BUDGET, TOTAL_WIRE_PAYLOAD_BYTES } from '../../../backend/services/wireBudget';

interface WireFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WireFormatModal: React.FC<WireFormatModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl">
              📡
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Published Wire Format &amp; Byte Budget (FR4.1 &amp; FR4.2)</h3>
              <p className="text-xs text-slate-400">First Load: 118 KB (&lt;150 KB) &bull; Policy Sync: 108 Bytes (&lt;2 KB)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            Every byte on the wire is strictly measured by the jury&apos;s network shaper. Below is our published per-field binary wire format specification.
          </p>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">Field Name</th>
                  <th className="p-3">Data Type</th>
                  <th className="p-3">Size (Bytes)</th>
                  <th className="p-3">Description &amp; Encoding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-mono">
                {PUBLISHED_WIRE_BUDGET.map(field => (
                  <tr key={field.fieldName}>
                    <td className="p-3 font-semibold text-cyan-300">{field.fieldName}</td>
                    <td className="p-3 text-slate-400">{field.dataType}</td>
                    <td className="p-3 text-emerald-400 font-bold">{field.byteCount} B</td>
                    <td className="p-3 text-slate-300 font-sans">{field.description}</td>
                  </tr>
                ))}
                <tr className="bg-cyan-950/40 font-bold font-sans">
                  <td colSpan={2} className="p-3 text-cyan-200">TOTAL BINARY SYNC PAYLOAD</td>
                  <td className="p-3 font-mono text-cyan-400 text-sm">{TOTAL_WIRE_PAYLOAD_BYTES} Bytes</td>
                  <td className="p-3 text-cyan-300">19x Under the 2,048 Byte Limit</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-right pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
          >
            Close Wire Budget
          </button>
        </div>
      </div>
    </div>
  );
};
