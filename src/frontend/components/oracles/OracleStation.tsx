import React, { useState, useEffect } from 'react';
import { OracleFailureMode, ConsensusEvaluation, ReconstructionAuditRecord, PolicyRecord, Language } from '../../../types';
import { TRANSLATIONS } from '../../translations/translations';
import { oracleConsensusEngine } from '../../../backend/services/oracleConsensus';
import { weatherService, LiveWeatherTelemetry } from '../../../backend/services/weatherService';
import { walletService } from '../../../backend/services/walletService';
import { audioService } from '../../../backend/services/audioService';
import { localDb } from '../../../database/services/dbService';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Zap,
  Globe,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Layers,
  LocateFixed,
  Sliders
} from 'lucide-react';

interface OracleStationProps {
  language: Language;
  activePolicies: PolicyRecord[];
  onPayoutTriggered: (policy: PolicyRecord, amountPaise: number) => void;
}

export const OracleStation: React.FC<OracleStationProps> = ({
  language,
  activePolicies,
  onPayoutTriggered
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [activeConsoleTab, setActiveConsoleTab] = useState<'live' | 'simulation'>('live');
  const [selectedMandalKey, setSelectedMandalKey] = useState<string>('Rayachoti Mandal');
  const [telemetry, setTelemetry] = useState<LiveWeatherTelemetry>(() => weatherService.getInitialTelemetry('Rayachoti Mandal'));
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState<boolean>(false);

  // 3-Oracle Feed Values
  const [awsMm, setAwsMm] = useState<number>(48.2);
  const [radarMm, setRadarMm] = useState<number>(49.6);
  const [satMm, setSatMm] = useState<number>(47.1);

  // Failure Mode Injections
  const [awsHealth, setAwsHealth] = useState<OracleFailureMode>('healthy');
  const [radarHealth, setRadarHealth] = useState<OracleFailureMode>('healthy');
  const [satHealth, setSatHealth] = useState<OracleFailureMode>('healthy');

  const [thresholdMm, setThresholdMm] = useState<number>(35);
  const [evaluation, setEvaluation] = useState<ConsensusEvaluation | null>(null);
  const [auditTrail, setAuditTrail] = useState<ReconstructionAuditRecord[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isTriggering, setIsTriggering] = useState<boolean>(false);

  const mandalList = weatherService.getMandalList();

  const fetchLiveWeatherData = async (mandal = selectedMandalKey) => {
    setIsLoadingTelemetry(true);
    audioService.playTone('click');
    try {
      const data = await weatherService.fetchLiveTelemetry(mandal);
      if (data) {
        setTelemetry(data);
        const synthesized = weatherService.synthesizeOracleFeeds(data);
        setAwsMm(synthesized.awsGroundMm);
        setRadarMm(synthesized.radarReflectivityMm);
        setSatMm(synthesized.satelliteChirpsMm);
        setAwsHealth('healthy');
        setRadarHealth('healthy');
        setSatHealth('healthy');
      }
      audioService.playTone('success');
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    fetchLiveWeatherData(selectedMandalKey);
  }, [selectedMandalKey]);

  const runEvaluation = () => {
    try {
      const result = oracleConsensusEngine.evaluateFeeds(selectedMandalKey, thresholdMm, {
        awsGround: { mm: awsMm, status: awsHealth },
        imdRadar: { mm: radarMm, status: radarHealth },
        chirpsSat: { mm: satMm, status: satHealth }
      });
      setEvaluation(result);
      setAuditTrail([...oracleConsensusEngine.getAuditTrail()]);
      return result;
    } catch (e) {
      console.error('Consensus evaluation error:', e);
      return null;
    }
  };

  useEffect(() => {
    runEvaluation();
  }, [awsMm, radarMm, satMm, awsHealth, radarHealth, satHealth, thresholdMm, selectedMandalKey]);

  const handleSimulateDrought = () => {
    setAwsMm(18.2);
    setRadarMm(21.4);
    setSatMm(19.8);
    setAwsHealth('healthy');
    setRadarHealth('healthy');
    setSatHealth('healthy');
    setIsTriggering(true);
    setCountdown(10);
    audioService.playTone('alert');

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setIsTriggering(false);
          activePolicies.forEach(p => {
            const voucher = walletService.issuePayoutVoucher(p);
            localDb.saveVoucher(voucher);
            onPayoutTriggered(p, p.maxPayoutPaise);
          });
          audioService.playTone('success');
          audioService.speak(
            language === 'te'
              ? 'వాతావరణ శాఖ మరియు ఇస్రో ఒరాకిల్ ద్వారా కరువు ధృవీకరించబడింది! 10 సెకన్ల లోపు అర్హులైన రైతులకు ఆటోమేటిక్ DBT చెల్లింపు విడుదల చేయబడింది.'
              : language === 'hi'
              ? 'मौसम विभाग एवं इसरो ऑरेकल द्वारा सूखा सत्यापित! 10 सेकंड के भीतर सभी पात्र किसानों को स्वचालित डीबीटी भुगतान जारी किया गया।'
              : 'IMD & ISRO Drought consensus verified! Automatic DBT payouts disbursed within 10-second SLA.',
            language
          );
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. Official Meteorological Header & Mode Tabs */}
      <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-800 animate-pulse"></span>
              <h2 className="text-base font-bold text-[#002244]">
                {t.imdTitle}
              </h2>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-950 font-mono text-[10px] font-bold rounded-full border border-blue-300">
                IMD-ISRO-ORACLE-v2.6
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {t.imdSubtitle}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveConsoleTab('live')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeConsoleTab === 'live'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.liveModeTab}</span>
            </button>
            <button
              onClick={() => setActiveConsoleTab('simulation')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeConsoleTab === 'simulation'
                  ? 'bg-blue-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.simModeTab}</span>
            </button>
          </div>
        </div>

        {/* Live Telemetry Controls & Location Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <LocateFixed className="w-4 h-4 text-blue-900" />
              <span>{language === 'te' ? 'వాతావరణ కేంద్రం / మండలం:' : language === 'hi' ? 'मौसम ग्रिड / मंडल:' : 'Weather Grid / Mandal:'}</span>
            </div>
            <select
              value={selectedMandalKey}
              onChange={e => setSelectedMandalKey(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 rounded-lg px-3 py-1.5 text-xs font-bold shadow-2xs outline-none focus:border-blue-900 cursor-pointer"
            >
              {mandalList.map(m => (
                <option key={m.key} value={m.key}>
                  {m.name} ({m.district})
                </option>
              ))}
            </select>

            {/* Live Gateway Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{t.liveApiConnected}</span>
              <span className="font-mono text-slate-500 font-normal">({telemetry?.latencyMs || 28}ms)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLiveWeatherData(selectedMandalKey)}
              disabled={isLoadingTelemetry}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-blue-950 font-bold rounded-lg border border-slate-300 text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-900 ${isLoadingTelemetry ? 'animate-spin' : ''}`} />
              <span>{isLoadingTelemetry ? (language === 'te' ? 'డేటా పొందుతోంది...' : language === 'hi' ? 'प्राप्त हो रहा है...' : 'Fetching Live Data...') : t.fetchLiveDataBtn}</span>
            </button>

            <button
              onClick={handleSimulateDrought}
              disabled={isTriggering}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                isTriggering
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-200" />
              <span>{isTriggering ? `${t.droughtCountdown} ${countdown}s` : t.simulateDroughtBtn}</span>
            </button>
          </div>
        </div>

        {/* Live Weather Metrics Summary Bar */}
        {telemetry && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.liveTempLabel}</span>
              </div>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {telemetry.temperatureC}°C
              </span>
              <span className="text-[9px] text-slate-400 font-medium truncate block">
                {(telemetry.weatherDescription || 'Clear').split(' ')[0]}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>{t.liveHumidityLabel}</span>
              </div>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {telemetry.relativeHumidityPercent}%
              </span>
              <span className="text-[9px] text-slate-400 font-medium block">
                Atmospheric RH
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <Wind className="w-3.5 h-3.5 text-teal-500" />
                <span>{t.liveWindLabel}</span>
              </div>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">
                {telemetry.windSpeedKmh} km/h
              </span>
              <span className="text-[9px] text-slate-400 font-medium block">
                10m Surface Wind
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <CloudRain className="w-3.5 h-3.5 text-blue-700" />
                <span>{t.livePrecipLabel}</span>
              </div>
              <span className="text-base font-bold text-blue-950 mt-0.5 block">
                {telemetry.currentPrecipitationMm} mm
              </span>
              <span className="text-[9px] text-slate-400 font-medium block">
                Hourly Gauge
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1 text-slate-500 text-[10px] font-semibold">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>ISRO Soil Moisture</span>
              </div>
              <span className={`text-base font-bold mt-0.5 block ${
                (telemetry.soilMoistureVolumetricPercent || 0) < 20 ? 'text-rose-600 font-extrabold' : 'text-emerald-700'
              }`}>
                {telemetry.soilMoistureVolumetricPercent}%
              </span>
              <span className="text-[9px] text-slate-400 font-medium block">
                Root-Zone (0-7cm)
              </span>
            </div>

            <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200 text-xs">
              <div className="flex items-center gap-1 text-blue-900 text-[10px] font-bold">
                <Activity className="w-3.5 h-3.5 text-blue-900" />
                <span>30-Day Cumulative</span>
              </div>
              <span className="text-base font-black text-blue-950 mt-0.5 block">
                {telemetry.monthlyCumulativePrecipitationMm} mm
              </span>
              <span className="text-[9px] text-blue-800 font-bold block">
                Consensus Index
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Official IMD & ISRO Rainfall Timeseries Chart */}
      <div className="bg-white border border-slate-300 rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
          <div className="flex items-center gap-2">
            <CloudRain className="w-4 h-4 text-blue-900" />
            <span className="text-xs font-bold text-[#002244]">
              {t.timeseriesTitle}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-600">
              {t.currentRainfallLabel} <strong className="text-blue-950 font-black">{evaluation?.consensusMm || awsMm} mm</strong>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-300">
              {t.notifiedThresholdLabel} {thresholdMm} mm
            </span>
          </div>
        </div>

        {/* Visual Graph & Daily Rainfall Bar Chart */}
        <div className="h-44 w-full bg-slate-50 rounded-xl border border-slate-200 relative p-4 flex flex-col justify-between">
          <div className="flex items-end justify-between h-28 gap-1 sm:gap-2 pt-2 px-2">
            {(telemetry?.dailyRainfall || []).map((d, i) => {
              const maxScale = 25;
              const heightPercent = Math.min(100, Math.max(8, (d.mm / maxScale) * 100));
              const isBelowDeficit = d.mm < 5;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.mm}mm
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                      isBelowDeficit ? 'bg-amber-400 group-hover:bg-amber-500' : 'bg-blue-600 group-hover:bg-blue-700'
                    }`}
                  ></div>
                  <span className="text-[9px] font-mono text-slate-600 font-medium truncate">
                    {d.date}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs inline-block"></span>
              <span>Daily Recorded Rainfall (AWS / Radar)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs inline-block"></span>
              <span>Dry Spell / Deficit Threshold</span>
            </span>
            <span className="font-mono font-bold text-slate-700">
              Source: IMD AWS Network &amp; ISRO MOSDAC Telemetry
            </span>
          </div>
        </div>
      </div>

      {/* 3. Three Independent Oracle Feeds (AWS, Radar, Satellite) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Source 1: AWS Ground Automated Station */}
        <div className={`rounded-2xl p-4 border shadow-xs transition-all space-y-3 ${
          awsHealth !== 'healthy' ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-200' : 'bg-white border-slate-300'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-700"></span>
              <span className="text-xs font-bold text-[#002244]">{t.awsSensor}</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded">
              Weight: 35%
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">{t.reportedLabel}</span>
              <span className="font-mono font-black text-sm text-slate-900">{awsMm} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={awsMm}
              onChange={e => setAwsMm(parseFloat(e.target.value) || 0)}
              className="w-full accent-blue-900 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              {t.sensorStateLabel}
            </label>
            <select
              value={awsHealth}
              onChange={e => setAwsHealth(e.target.value as OracleFailureMode)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-blue-900 cursor-pointer"
            >
              <option value="healthy">{t.healthyState}</option>
              <option value="lying_manipulated">{t.lyingState}</option>
              <option value="stale_frozen">{t.staleState}</option>
              <option value="degraded_lossy">{t.degradedState}</option>
            </select>
          </div>
        </div>

        {/* Source 2: IMD Doppler Weather Radar */}
        <div className={`rounded-2xl p-4 border shadow-xs transition-all space-y-3 ${
          radarHealth !== 'healthy' ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-200' : 'bg-white border-slate-300'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-700"></span>
              <span className="text-xs font-bold text-[#002244]">{t.imdRadar}</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-900 px-1.5 py-0.5 rounded">
              Weight: 35%
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">{t.reportedLabel}</span>
              <span className="font-mono font-black text-sm text-slate-900">{radarMm} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={radarMm}
              onChange={e => setRadarMm(parseFloat(e.target.value) || 0)}
              className="w-full accent-indigo-900 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              {t.sensorStateLabel}
            </label>
            <select
              value={radarHealth}
              onChange={e => setRadarHealth(e.target.value as OracleFailureMode)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-indigo-900 cursor-pointer"
            >
              <option value="healthy">{t.healthyState}</option>
              <option value="lying_manipulated">{t.lyingState}</option>
              <option value="stale_frozen">{t.staleState}</option>
              <option value="degraded_lossy">{t.degradedState}</option>
            </select>
          </div>
        </div>

        {/* Source 3: ISRO Satellite (CHIRPS / SAC IR) */}
        <div className={`rounded-2xl p-4 border shadow-xs transition-all space-y-3 ${
          satHealth !== 'healthy' ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-200' : 'bg-white border-slate-300'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-700"></span>
              <span className="text-xs font-bold text-[#002244]">{t.isroSat}</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-900 px-1.5 py-0.5 rounded">
              Weight: 30%
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">{t.reportedLabel}</span>
              <span className="font-mono font-black text-sm text-slate-900">{satMm} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.5"
              value={satMm}
              onChange={e => setSatMm(parseFloat(e.target.value) || 0)}
              className="w-full accent-teal-900 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              {t.sensorStateLabel}
            </label>
            <select
              value={satHealth}
              onChange={e => setSatHealth(e.target.value as OracleFailureMode)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-teal-900 cursor-pointer"
            >
              <option value="healthy">{t.healthyState}</option>
              <option value="lying_manipulated">{t.lyingState}</option>
              <option value="stale_frozen">{t.staleState}</option>
              <option value="degraded_lossy">{t.degradedState}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Oracle Consensus & Settlement Decision */}
      {evaluation && (
        <div className="bg-white border border-slate-300 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#002244]">
                {t.consensusTitle}
              </h3>
              <p className="text-xs text-slate-500">
                Spatial triangulation &bull; Outlier filter &bull; SLA 10-Second Guarantee
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1.5 ${
                evaluation.isTriggered
                  ? 'bg-rose-100 text-rose-900 border border-rose-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}>
                {evaluation.isTriggered ? <AlertTriangle className="w-3.5 h-3.5 stroke-[3]" /> : <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{evaluation.isTriggered ? t.verdictTriggered : t.verdictNormal}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">{t.consensusRainLabel}</span>
              <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">
                {evaluation.consensusMm} mm
              </span>
              <span className="text-[10px] text-slate-400">
                Formula: (35% AWS + 35% Radar + 30% Satellite)
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">{t.disputeRuleLabel}</span>
              <span className="text-xs font-bold text-blue-950 font-mono mt-1 block">
                {evaluation.disputeRuleApplied}
              </span>
              <span className="text-[10px] text-slate-400">
                Byzantine Fault Tolerance Rule
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Cryptographic Audit Hash:</span>
              <span className="text-[10px] font-mono font-bold text-slate-800 break-all mt-1 block">
                {evaluation.auditHash}
              </span>
              <span className="text-[10px] text-emerald-800 font-bold">
                Immutable Ledger Verified
              </span>
            </div>
          </div>

          {evaluation.anomaliesDetected && evaluation.anomaliesDetected.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Anomalies Detected &amp; Isolated:</span>
              </span>
              {evaluation.anomaliesDetected.map((anom, idx) => (
                <p key={idx} className="text-xs text-amber-900 font-mono pl-5">
                  &bull; {anom}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. NIC Cryptographic Reconstruction Trail */}
      <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 space-y-3 shadow-lg font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Terminal className="w-4 h-4" />
            <span className="font-bold">{t.auditTitle}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
            {auditTrail.length} Records Logged
          </span>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-[11px]">
          {auditTrail.slice(-4).reverse().map((record, index) => {
            const isApproved = record.verdict === 'PAYOUT_APPROVED' || (record as any).isTriggered;
            const hashStr = record.hash || (record as any).auditHash || '0x0000000000000000';
            return (
              <div key={record.id || index} className="p-2 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{new Date(record.timestamp || Date.now()).toLocaleTimeString('en-IN')}</span>
                  <span className="text-amber-400 font-bold">[{record.gridId || 'Rayachoti'}]</span>
                  <span className="text-slate-300">Rain: {record.consensusMm}mm</span>
                  <span className={isApproved ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {isApproved ? 'DROUGHT_TRIGGERED' : 'NORMAL_SEASON'}
                  </span>
                </div>
                <span className="text-slate-500 text-[10px]">{hashStr.slice(0, 16)}...</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
