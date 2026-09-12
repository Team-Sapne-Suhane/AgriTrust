import React from 'react';
import { Language } from '../../../types';
import { TRANSLATIONS } from '../../translations/translations';

interface GovFooterProps {
  language: Language;
}

export const GovFooter: React.FC<GovFooterProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <footer className="bg-[#001730] text-slate-300 border-t-4 border-[#ff9933] text-xs">
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 border-b border-slate-800">
        <div>
          <h4 className="text-white font-bold text-sm mb-3 border-b border-slate-700 pb-1">
            {t.footerGovLinks}
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li><a href="#gov" className="hover:text-amber-400">{language === 'hi' ? 'भारत का राष्ट्रीय पोर्टल (india.gov.in)' : 'National Portal of India (india.gov.in)'}</a></li>
            <li><a href="#niti" className="hover:text-amber-400">{language === 'hi' ? 'नीति आयोग (niti.gov.in)' : 'NITI Aayog (niti.gov.in)'}</a></li>
            <li><a href="#agri" className="hover:text-amber-400">{language === 'hi' ? 'कृषि एवं किसान कल्याण मंत्रालय' : 'Ministry of Agriculture & Farmers Welfare'}</a></li>
            <li><a href="#pmfby" className="hover:text-amber-400">{language === 'hi' ? 'प्रधानमंत्री फसल बीमा योजना (PMFBY)' : 'Pradhan Mantri Fasal Bima Yojana'}</a></li>
            <li><a href="#dbt" className="hover:text-amber-400">{language === 'hi' ? 'डीबीटी भारत (dbtbharat.gov.in)' : 'DBT Bharat (dbtbharat.gov.in)'}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3 border-b border-slate-700 pb-1">
            {t.footerSchemeRules}
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li><a href="#imd" className="hover:text-amber-400">{language === 'hi' ? 'भारतीय मौसम विज्ञान विभाग (IMD Grids)' : 'India Meteorological Department (IMD)'}</a></li>
            <li><a href="#isro" className="hover:text-amber-400">{language === 'hi' ? 'इसरो उपग्रह वर्षा अनुमान (ISRO/CHIRPS)' : 'ISRO Satellite Precipitation (SAC)'}</a></li>
            <li><a href="#rules" className="hover:text-amber-400">{language === 'hi' ? 'स्वचालित सूखा विवाद समाधान नियमावली' : 'Parametric Dispute Resolution Rules'}</a></li>
            <li><a href="#dbt" className="hover:text-amber-400">{language === 'hi' ? 'प्रत्यक्ष लाभ अंतरण (DBT) नियम' : 'Direct Benefit Transfer (DBT) Guidelines'}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3 border-b border-slate-700 pb-1">
            {t.footerHelp}
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-300">
            <li>{t.tollFreeLabel} <strong className="text-white font-mono">1800-180-2604</strong></li>
            <li>{t.mKisanSmsLabel} <strong className="text-white font-mono">51969</strong></li>
            <li>{t.emailLabel} <span className="text-amber-300 font-mono">support-fs2604@nic.in</span></li>
            <li>{t.addressLabel}</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm mb-3 border-b border-slate-700 pb-1">
            {t.footerCompliance}
          </h4>
          <div className="space-y-2 text-[11px] text-slate-400">
            <div className="bg-[#002244] p-2 rounded border border-[#0d3b66]">
              <span className="text-emerald-400 font-bold block">GIGW 3.0 Compliant</span>
              <span>{language === 'hi' ? 'भारत सरकार वेबसाइट दिशानिर्देश प्रमाणित' : 'Govt of India Guidelines Compliant'}</span>
            </div>
            <div className="bg-[#002244] p-2 rounded border border-[#0d3b66]">
              <span className="text-cyan-300 font-bold block">STQC Certified &bull; W3C WAI-AA</span>
              <span>{language === 'hi' ? '100% दृष्टि-सुलभ एवं स्क्रीन रीडर संगत' : '100% Accessible & Screen Reader Ready'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* NIC Standard Lower Footer */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-slate-400 space-y-1">
        <p>
          {t.footerManagedBy}
        </p>
        <p>
          {t.footerDevelopedBy}
        </p>
        <p className="text-[10px] text-slate-500 pt-1">
          {t.lastReviewed} | Portal Version: 3.4.0-Gov
        </p>
      </div>

      {/* Lower Tiranga Ribbon */}
      <div className="tiranga-strip w-full" />
    </footer>
  );
};
