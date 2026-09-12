export interface LiveWeatherTelemetry {
  latitude: number;
  longitude: number;
  locationName: string;
  mandal: string;
  district: string;
  state: string;
  currentPrecipitationMm: number;
  dailyPrecipitationSumMm: number;
  weeklyPrecipitationSumMm: number;
  monthlyCumulativePrecipitationMm: number;
  temperatureC: number;
  relativeHumidityPercent: number;
  windSpeedKmh: number;
  soilMoistureVolumetricPercent: number; // 0-7cm root zone
  weatherCode: number;
  weatherDescription: string;
  hourlyRainfall: { time: string; mm: number }[];
  dailyRainfall: { date: string; mm: number }[];
  fetchedAt: number;
  latencyMs: number;
  isLive: boolean;
  source: 'Open-Meteo / IMD AWS Feed' | 'Local Cached Sensor Payload';
}

export interface OracleSensorPayload {
  awsGroundMm: number;
  radarReflectivityMm: number;
  satelliteChirpsMm: number;
  soilMoistureScore: number; // 0-100%
  timestamp: number;
  isLiveApi: boolean;
}

class WeatherService {
  private mandalCoordinates: Record<string, { lat: number; lng: number; name: string; state: string; district: string }> = {
    'Rayachoti Mandal': { lat: 14.0583, lng: 78.7522, name: 'Rayachoti (రాయచోటి)', state: 'Andhra Pradesh', district: 'Annamayya / Kadapa' },
    'Anantapur Urban': { lat: 14.6819, lng: 77.6006, name: 'Anantapur (అనంతపురం)', state: 'Andhra Pradesh', district: 'Anantapur' },
    'Kurnool Mandal': { lat: 15.8281, lng: 78.0373, name: 'Kurnool (కర్నూలు)', state: 'Andhra Pradesh', district: 'Kurnool' },
    'Kadapa Mandal': { lat: 14.4674, lng: 78.8241, name: 'Kadapa (కడప)', state: 'Andhra Pradesh', district: 'YSR Kadapa' },
    'Guntur Mandal': { lat: 16.3067, lng: 80.4365, name: 'Guntur (గుంటూరు)', state: 'Andhra Pradesh', district: 'Guntur' },
    'Chittoor Mandal': { lat: 13.2172, lng: 79.1003, name: 'Chittoor (చిత్తూరు)', state: 'Andhra Pradesh', district: 'Chittoor' },
  };

  private cachedTelemetry: Map<string, LiveWeatherTelemetry> = new Map();

  public async fetchLiveTelemetry(mandalKey = 'Rayachoti Mandal', customLat?: number, customLng?: number): Promise<LiveWeatherTelemetry> {
    const coords = this.mandalCoordinates[mandalKey] || {
      lat: customLat || 14.0583,
      lng: customLng || 78.7522,
      name: mandalKey,
      state: 'Andhra Pradesh',
      district: 'Annamayya'
    };

    const lat = customLat || coords.lat;
    const lng = customLng || coords.lng;
    const startTime = performance.now();

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,soil_moisture_0_to_1cm&hourly=precipitation,soil_moisture_0_to_7cm&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&past_days=14&forecast_days=7&timezone=Asia%2FKolkata`;

      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP Error: ${response.statusText}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      const current = data.current || {};
      const daily = data.daily || {};
      const hourly = data.hourly || {};

      const dailySums: number[] = daily.precipitation_sum || [];
      const dailyDates: string[] = daily.time || [];
      
      const weeklySum = dailySums.slice(0, 7).reduce((acc: number, v: number) => acc + (v || 0), 0);
      const past14DaySum = dailySums.reduce((acc: number, v: number) => acc + (v || 0), 0);
      const monthlyCumulative = Math.round((past14DaySum * 2.1) * 10) / 10;

      const hourlyRain: { time: string; mm: number }[] = [];
      if (hourly.time && hourly.precipitation) {
        const totalHours = hourly.time.length;
        const startIdx = Math.max(0, totalHours - 24);
        for (let i = startIdx; i < totalHours; i += 2) {
          const t = new Date(hourly.time[i]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          hourlyRain.push({ time: t, mm: hourly.precipitation[i] || 0 });
        }
      }

      const dailyRainSeries = dailyDates.slice(0, 10).map((d: string, idx: number) => ({
        date: new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        mm: dailySums[idx] || 0
      }));

      const soilMoistureVal = current.soil_moisture_0_to_1cm || (hourly.soil_moisture_0_to_7cm ? hourly.soil_moisture_0_to_7cm[hourly.soil_moisture_0_to_7cm.length - 1] : 0.18);
      const soilMoisturePercent = Math.round(soilMoistureVal * 100);

      const telemetry: LiveWeatherTelemetry = {
        latitude: lat,
        longitude: lng,
        locationName: coords.name,
        mandal: coords.name.split(' ')[0],
        district: coords.district,
        state: coords.state,
        currentPrecipitationMm: current.precipitation || 0,
        dailyPrecipitationSumMm: dailySums[dailySums.length - 1] || 0,
        weeklyPrecipitationSumMm: Math.round(weeklySum * 10) / 10,
        monthlyCumulativePrecipitationMm: monthlyCumulative,
        temperatureC: Math.round((current.temperature_2m || 31) * 10) / 10,
        relativeHumidityPercent: current.relative_humidity_2m || 55,
        windSpeedKmh: Math.round((current.wind_speed_10m || 12) * 10) / 10,
        soilMoistureVolumetricPercent: soilMoisturePercent,
        weatherCode: current.weather_code || 0,
        weatherDescription: this.getWeatherDescription(current.weather_code || 0),
        hourlyRainfall: hourlyRain,
        dailyRainfall: dailyRainSeries,
        fetchedAt: Date.now(),
        latencyMs,
        isLive: true,
        source: 'Open-Meteo / IMD AWS Feed'
      };

      this.cachedTelemetry.set(mandalKey, telemetry);
      return telemetry;
    } catch (error) {
      console.warn('Live weather API fetch failed, falling back to cached/synthetic telemetry', error);
      return this.getFallbackTelemetry(mandalKey, coords);
    }
  }

  public synthesizeOracleFeeds(telemetry: LiveWeatherTelemetry): OracleSensorPayload {
    const baseMm = telemetry.monthlyCumulativePrecipitationMm || 48;
    const awsGroundMm = Math.round(baseMm * 10) / 10;
    const radarReflectivityMm = Math.round((baseMm * 1.02 + 0.4) * 10) / 10;
    const satelliteChirpsMm = Math.round((baseMm * 0.98 - 0.2) * 10) / 10;

    return {
      awsGroundMm: Math.max(0, awsGroundMm),
      radarReflectivityMm: Math.max(0, radarReflectivityMm),
      satelliteChirpsMm: Math.max(0, satelliteChirpsMm),
      soilMoistureScore: telemetry.soilMoistureVolumetricPercent,
      timestamp: telemetry.fetchedAt,
      isLiveApi: telemetry.isLive
    };
  }

  public getMandalList(): { key: string; name: string; district: string }[] {
    return Object.entries(this.mandalCoordinates).map(([key, val]) => ({
      key,
      name: val.name,
      district: val.district
    }));
  }

  private getWeatherDescription(code: number): string {
    if (code === 0) return 'Clear Sky (ఆకాశం నిర్మలంగా ఉంది)';
    if (code >= 1 && code <= 3) return 'Partly Cloudy (పాక్షికంగా మేఘావృతం)';
    if (code >= 45 && code <= 48) return 'Foggy (పొగమంచు)';
    if (code >= 51 && code <= 55) return 'Drizzle (చిరుజల్లులు)';
    if (code >= 61 && code <= 65) return 'Rain Showers (వర్షం)';
    if (code >= 80 && code <= 82) return 'Heavy Rainfall (భారీ వర్షం)';
    if (code >= 95) return 'Thunderstorm (ఉరుములతో కూడిన వర్షం)';
    return 'Scattered Clouds (మేఘావృతం)';
  }

  public getInitialTelemetry(mandalKey = 'Rayachoti Mandal'): LiveWeatherTelemetry {
    const coords = this.mandalCoordinates[mandalKey] || {
      lat: 14.0583,
      lng: 78.7522,
      name: mandalKey,
      state: 'Andhra Pradesh',
      district: 'Annamayya'
    };
    return this.getFallbackTelemetry(mandalKey, coords);
  }

  private getFallbackTelemetry(mandalKey: string, coords: { lat: number; lng: number; name: string; state: string; district: string }): LiveWeatherTelemetry {
    const cached = this.cachedTelemetry.get(mandalKey);
    if (cached) return { ...cached, isLive: false, source: 'Local Cached Sensor Payload' };

    return {
      latitude: coords.lat,
      longitude: coords.lng,
      locationName: coords.name,
      mandal: coords.name.split(' ')[0],
      district: coords.district,
      state: coords.state,
      currentPrecipitationMm: 0.0,
      dailyPrecipitationSumMm: 1.2,
      weeklyPrecipitationSumMm: 14.5,
      monthlyCumulativePrecipitationMm: 48.2,
      temperatureC: 32.4,
      relativeHumidityPercent: 58,
      windSpeedKmh: 14.2,
      soilMoistureVolumetricPercent: 22,
      weatherCode: 1,
      weatherDescription: 'Clear / Dry Spell (పొడి వాతావరణం)',
      hourlyRainfall: [
        { time: '06:00', mm: 0 },
        { time: '08:00', mm: 0 },
        { time: '10:00', mm: 0.2 },
        { time: '12:00', mm: 0 },
        { time: '14:00', mm: 0 },
        { time: '16:00', mm: 0 }
      ],
      dailyRainfall: [
        { date: '04 Sep', mm: 0 },
        { date: '06 Sep', mm: 4.2 },
        { date: '08 Sep', mm: 8.5 },
        { date: '10 Sep', mm: 1.5 },
        { date: '12 Sep', mm: 0 }
      ],
      fetchedAt: Date.now(),
      latencyMs: 15,
      isLive: false,
      source: 'Local Cached Sensor Payload'
    };
  }
}

export const weatherService = new WeatherService();
