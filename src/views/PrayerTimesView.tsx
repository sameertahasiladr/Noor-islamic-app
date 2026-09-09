import React, { useState, useMemo } from 'react';
import {
  Clock,
  MapPin,
  Check,
  Plus,
  Minus,
  Calendar,
  Globe,
  Settings2,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  Search,
  Sliders,
  Compass,
  AlertCircle
} from 'lucide-react';
import { CalculationMethod, PrayerTimeData, UserProfile } from '../types';
import {
  CALCULATION_METHODS,
  POPULAR_LOCATIONS,
  calculatePrayerTimes,
  LocationPreset
} from '../services/prayerService';
import { storageService } from '../services/storageService';
import { detectCoordinates } from '../services/locationService';

interface PrayerTimesViewProps {
  profile: UserProfile;
  prayerData: PrayerTimeData;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const PrayerTimesView: React.FC<PrayerTimesViewProps> = ({
  profile,
  prayerData,
  onUpdateProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'monthly' | 'qada' | 'settings'>('today');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatusMsg, setLocationStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [playingAdhan, setPlayingAdhan] = useState(false);

  // Search & custom coordinate states
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [showCustomCoords, setShowCustomCoords] = useState(false);
  const [customCityName, setCustomCityName] = useState(profile.location.city);
  const [customCountryName, setCustomCountryName] = useState(profile.location.country);
  const [customLat, setCustomLat] = useState(profile.location.latitude.toString());
  const [customLng, setCustomLng] = useState(profile.location.longitude.toString());

  // Show status banner temporarily
  const showBanner = (type: 'success' | 'error', text: string) => {
    setLocationStatusMsg({ type, text });
    setTimeout(() => setLocationStatusMsg(null), 3500);
  };

  // Find nearest known city if reverse geocoding is unavailable
  const findNearestCity = (lat: number, lng: number): LocationPreset => {
    let best = POPULAR_LOCATIONS[0];
    let minD = Number.MAX_VALUE;
    for (const loc of POPULAR_LOCATIONS) {
      const d = Math.hypot(loc.latitude - lat, loc.longitude - lng);
      if (d < minD) {
        minD = d;
        best = loc;
      }
    }
    return best;
  };

  // Detect location via native Capacitor GPS or browser Geolocation API with high accuracy
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    const coords = await detectCoordinates();

    if (!coords) {
      setIsDetectingLocation(false);
      showBanner('error', 'Location permission denied or unavailable.');
      return;
    }

    const { latitude: lat, longitude: lng } = coords;
    let detectedCity = 'Current Location';
    let detectedCountry = 'GPS Coordinates';

    try {
      // Attempt reverse geocoding via OpenStreetMap Nominatim with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          detectedCity =
            data.address.city ||
            data.address.town ||
            data.address.municipality ||
            data.address.county ||
            'Detected Location';
          detectedCountry = data.address.country || 'Detected Region';
        }
      }
    } catch {
      // Fallback: check if close to a popular location
      const nearest = findNearestCity(lat, lng);
      const dist = Math.hypot(nearest.latitude - lat, nearest.longitude - lng);
      if (dist < 0.35) {
        detectedCity = nearest.city;
        detectedCountry = nearest.country;
      } else {
        detectedCity = `${lat > 0 ? lat + '°N' : Math.abs(lat) + '°S'}, ${lng > 0 ? lng + '°E' : Math.abs(lng) + '°W'}`;
        detectedCountry = 'Precise GPS';
      }
    }

    setIsDetectingLocation(false);
    const updatedLoc = {
      city: detectedCity,
      country: detectedCountry,
      latitude: lat,
      longitude: lng,
    };

    const updatedProfile = { ...profile, location: updatedLoc };
    onUpdateProfile(updatedProfile);
    storageService.updateLocation(updatedLoc);
    setCustomCityName(detectedCity);
    setCustomCountryName(detectedCountry);
    setCustomLat(lat.toString());
    setCustomLng(lng.toString());
    showBanner('success', `Exact GPS position acquired: ${detectedCity}!`);
  };

  const handleSelectCity = (cityItem: LocationPreset) => {
    const updatedLoc = {
      city: cityItem.city,
      country: cityItem.country,
      latitude: cityItem.latitude,
      longitude: cityItem.longitude,
    };
    const updated = { ...profile, location: updatedLoc };
    onUpdateProfile(updated);
    storageService.updateLocation(updatedLoc);
    setCustomCityName(cityItem.city);
    setCustomCountryName(cityItem.country);
    setCustomLat(cityItem.latitude.toString());
    setCustomLng(cityItem.longitude.toString());
    showBanner('success', `Location updated to ${cityItem.city}, ${cityItem.country}!`);
  };

  const handleApplyCustomCoordinates = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat.trim());
    const lng = parseFloat(customLng.trim());

    if (isNaN(lat) || lat < -90 || lat > 90) {
      showBanner('error', 'Latitude must be a valid number between -90 and 90.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      showBanner('error', 'Longitude must be a valid number between -180 and 180.');
      return;
    }

    const updatedLoc = {
      city: customCityName.trim() || 'Custom Coordinates',
      country: customCountryName.trim() || 'Custom Location',
      latitude: lat,
      longitude: lng,
    };

    const updated = { ...profile, location: updatedLoc };
    onUpdateProfile(updated);
    storageService.updateLocation(updatedLoc);
    setShowCustomCoords(false);
    showBanner('success', `Custom coordinates applied accurately!`);
  };

  const handleChangeMethod = (method: CalculationMethod) => {
    const updated = { ...profile, prayerCalculationMethod: method };
    onUpdateProfile(updated);
    storageService.saveProfile(updated);
    showBanner('success', `Calculation authority updated.`);
  };

  const handleChangeAsr = (asr: 'standard' | 'hanafi') => {
    const updated = { ...profile, asrMethod: asr };
    onUpdateProfile(updated);
    storageService.saveProfile(updated);
    showBanner('success', `Asr jurisprudence updated.`);
  };

  const handleChangeHijriAdjustment = (days: number) => {
    const updated = { ...profile, hijriDateAdjustment: days };
    onUpdateProfile(updated);
    storageService.updateHijriAdjustment(days);
  };

  const handlePrayerOffsetChange = (prayer: keyof NonNullable<UserProfile['prayerTimeOffsets']>, delta: number) => {
    const currentOffsets = profile.prayerTimeOffsets || {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    };
    const current = currentOffsets[prayer] || 0;
    const nextVal = Math.max(-30, Math.min(30, current + delta));
    const newOffsets = { ...currentOffsets, [prayer]: nextVal };
    const updated = { ...profile, prayerTimeOffsets: newOffsets };
    onUpdateProfile(updated);
    storageService.updatePrayerOffsets(newOffsets);
  };

  const handleQadaChange = (prayer: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', delta: number) => {
    storageService.updateQada(prayer, delta);
    const updated = storageService.getProfile();
    onUpdateProfile(updated);
  };

  const playAdhanAudio = () => {
    if (playingAdhan) {
      setPlayingAdhan(false);
      return;
    }
    setPlayingAdhan(true);
    const adhanAudio = new Audio('https://cdn.islamic.network/adhan/ar.makkah.mp3');
    adhanAudio.play().catch(() => {
      setPlayingAdhan(false);
    });
    adhanAudio.onended = () => setPlayingAdhan(false);
  };

  // Filtered popular cities
  const filteredCities = useMemo(() => {
    return POPULAR_LOCATIONS.filter((loc) => {
      const q = citySearchQuery.toLowerCase().trim();
      const matchQuery =
        loc.city.toLowerCase().includes(q) || loc.country.toLowerCase().includes(q);
      if (!matchQuery) return false;
      return true;
    });
  }, [citySearchQuery]);

  const prayerRows = [
    { key: 'fajr' as const, name: 'Fajr', time: prayerData.fajr, icon: Sunrise, arabic: 'الفجر', rakat: '2 Sunnah + 2 Fard' },
    { key: 'sunrise' as const, name: 'Sunrise', time: prayerData.sunrise, icon: CloudSun, arabic: 'الشروق', rakat: 'Shurooq / Ishraq' },
    { key: 'dhuhr' as const, name: 'Dhuhr', time: prayerData.dhuhr, icon: Sun, arabic: 'الظهر', rakat: '4 Sunnah + 4 Fard + 2 Sunnah' },
    { key: 'asr' as const, name: 'Asr', time: prayerData.asr, icon: CloudSun, arabic: 'العصر', rakat: '4 Fard' },
    { key: 'maghrib' as const, name: 'Maghrib', time: prayerData.maghrib, icon: Sunset, arabic: 'المغرب', rakat: '3 Fard + 2 Sunnah' },
    { key: 'isha' as const, name: 'Isha', time: prayerData.isha, icon: Moon, arabic: 'العشاء', rakat: '4 Fard + 2 Sunnah + 3 Witr' },
  ];

  // 7 days upcoming schedule using exact profile parameters
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const times = calculatePrayerTimes(
      d,
      profile.location.latitude,
      profile.location.longitude,
      profile.prayerCalculationMethod,
      profile.asrMethod,
      profile.hijriDateAdjustment || 0,
      profile.prayerTimeOffsets,
      profile.highLatitudeRule || 'angleBased'
    );
    return {
      date: d,
      dayName: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateFormatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      times,
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20 pt-2 space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center space-x-1 p-1 bg-zinc-200/60 dark:bg-zinc-800/80 rounded-xl max-w-md mx-auto">
        <button
          onClick={() => setActiveSubTab('today')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'today'
              ? 'bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Daily Schedule
        </button>
        <button
          onClick={() => setActiveSubTab('monthly')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'monthly'
              ? 'bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Weekly Timetable
        </button>
        <button
          onClick={() => setActiveSubTab('qada')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'qada'
              ? 'bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Qada Tracker
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'settings'
              ? 'bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Calibration
        </button>
      </div>

      {locationStatusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            locationStatusMsg.type === 'success'
              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200'
          }`}
        >
          {locationStatusMsg.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{locationStatusMsg.text}</span>
        </div>
      )}

      {/* VIEW 1: TODAY'S PRAYER SCHEDULE */}
      {activeSubTab === 'today' && (
        <div className="space-y-4">
          {/* Location & method bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {profile.location.city}, {profile.location.country}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  GPS: {profile.location.latitude.toFixed(4)}°, {profile.location.longitude.toFixed(4)}° • {profile.prayerCalculationMethod}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-zinc-800 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Acquire exact GPS coordinates from browser"
              >
                <Globe className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-emerald-600' : ''}`} />
                <span>{isDetectingLocation ? 'Locating...' : 'Auto Detect GPS'}</span>
              </button>
              <button
                onClick={() => setActiveSubTab('settings')}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Calibrate coordinates and calculation"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Calibrate</span>
              </button>
            </div>
          </div>

          {/* Countdown Highlight Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-zinc-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
                  Next Obligatory Prayer
                </span>
                <h2 className="text-3xl font-extrabold mt-1 text-white flex items-center gap-3">
                  <span>{prayerData.nextPrayer.name}</span>
                  <span className="text-lg font-normal text-emerald-200/90 font-mono">
                    {prayerData.nextPrayer.time}
                  </span>
                </h2>
                <p className="text-xs text-emerald-100/75 mt-1">
                  {prayerData.hijriDate.formatted} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center shrink-0">
                <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold block">
                  Time Remaining
                </span>
                <span className="text-2xl font-black font-mono tracking-tight text-white block mt-0.5">
                  {prayerData.nextPrayer.remainingFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* Today's 6 Prayer Times List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prayerRows.map((p) => {
              const isNext = prayerData.nextPrayer.name === p.name;
              const Icon = p.icon;
              return (
                <div
                  key={p.key}
                  className={`p-4 rounded-2xl border transition-all ${
                    isNext
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-850 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isNext
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {p.name}
                          </h4>
                          {isNext && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                              NEXT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 font-arabic">{p.arabic}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                        {p.time}
                      </span>
                      <p className="text-[10px] text-zinc-400 block">{p.rakat}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEKLY TIMETABLE */}
      {activeSubTab === 'monthly' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                7-Day Astronomical Timetable
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Calculated for {profile.location.city} ({profile.prayerCalculationMethod})
              </p>
            </div>
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-850 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-3 font-bold">Day</th>
                  <th className="p-3 font-bold">Fajr</th>
                  <th className="p-3 font-bold">Sunrise</th>
                  <th className="p-3 font-bold">Dhuhr</th>
                  <th className="p-3 font-bold">Asr</th>
                  <th className="p-3 font-bold">Maghrib</th>
                  <th className="p-3 font-bold">Isha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                {next7Days.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 ${
                      idx === 0 ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-bold' : ''
                    }`}
                  >
                    <td className="p-3 font-sans font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap">
                      {row.dayName} <span className="text-[10px] text-zinc-400 font-normal">({row.dateFormatted})</span>
                    </td>
                    <td className="p-3 text-zinc-700 dark:text-zinc-300">{row.times.fajr}</td>
                    <td className="p-3 text-zinc-400">{row.times.sunrise}</td>
                    <td className="p-3 text-zinc-700 dark:text-zinc-300">{row.times.dhuhr}</td>
                    <td className="p-3 text-zinc-700 dark:text-zinc-300">{row.times.asr}</td>
                    <td className="p-3 text-zinc-700 dark:text-zinc-300">{row.times.maghrib}</td>
                    <td className="p-3 text-zinc-700 dark:text-zinc-300">{row.times.isha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: QADA TRACKER */}
      {activeSubTab === 'qada' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Missed Prayers (Qada) Tracker
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Track your missed obligatory prayers accurately. Every count is saved locally and synchronized to your Google Cloud Firestore account. Tap (+) when you miss a prayer, and (-) once you make it up.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((pKey) => {
              const namesMap = { fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
              const arabicMap = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' };
              const count = profile.qadaPrayers ? profile.qadaPrayers[pKey] || 0 : 0;
              return (
                <div
                  key={pKey}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs text-zinc-400 font-arabic block">
                      {arabicMap[pKey]}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {namesMap[pKey]}
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                      {count} missed to make up
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQadaChange(pKey, -1)}
                      disabled={count <= 0}
                      className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40"
                      title="Made up 1 prayer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {count}
                    </span>
                    <button
                      onClick={() => handleQadaChange(pKey, 1)}
                      className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-colors"
                      title="Add 1 missed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: CALIBRATION & ACCURACY SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="space-y-4">
          {/* Location & GPS Section */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Exact Geographic Location
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Current: {profile.location.city}, {profile.location.country} ({profile.location.latitude.toFixed(4)}°, {profile.location.longitude.toFixed(4)}°)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isDetectingLocation}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Globe className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLocation ? 'Locating...' : 'GPS Auto-Detect'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomCoords(!showCustomCoords)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{showCustomCoords ? 'Hide Manual' : 'Custom Lat/Lng'}</span>
                </button>
              </div>
            </div>

            {/* Custom Coordinates Form */}
            {showCustomCoords && (
              <form
                onSubmit={handleApplyCustomCoordinates}
                className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in"
              >
                <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  Enter Exact Coordinates
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 block mb-1">
                      City / Area Name
                    </label>
                    <input
                      type="text"
                      value={customCityName}
                      onChange={(e) => setCustomCityName(e.target.value)}
                      placeholder="e.g. My Town"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 block mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={customCountryName}
                      onChange={(e) => setCustomCountryName(e.target.value)}
                      placeholder="e.g. United Kingdom"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 block mb-1">
                      Latitude (-90 to +90)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={customLat}
                      onChange={(e) => setCustomLat(e.target.value)}
                      placeholder="e.g. 51.5074"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 block mb-1">
                      Longitude (-180 to +180)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={customLng}
                      onChange={(e) => setCustomLng(e.target.value)}
                      placeholder="e.g. -0.1278"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Save & Recalculate
                  </button>
                </div>
              </form>
            )}

            {/* City search box & selector */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  placeholder="Search 50+ global cities (e.g. London, Makkah, Dubai, Chicago, Karachi)..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {filteredCities.map((loc) => (
                  <button
                    key={loc.city}
                    onClick={() => handleSelectCity(loc)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      profile.location.city === loc.city
                        ? 'bg-emerald-700 text-white font-bold shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {loc.city}, {loc.country}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hijri Lunar Calendar Adjustment */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-amber-500" />
                  Hijri Lunar Moon-Sighting Adjustment
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Calibrate by ±1 or ±2 days to match your regional crescent sighting committee.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                {prayerData.hijriDate.formatted}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {[-2, -1, 0, 1, 2].map((d) => (
                <button
                  key={d}
                  onClick={() => handleChangeHijriAdjustment(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    (profile.hijriDateAdjustment || 0) === d
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  {d > 0 ? `+${d} Day` : d < 0 ? `${d} Day` : 'Standard (0)'}
                </button>
              ))}
            </div>
          </div>

          {/* Prayer Time Minute-by-Minute Offsets (Local Mosque Calibration) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              Local Mosque Minute Offsets (± Minutes)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Align Noor times perfectly with your local neighborhood masjid's timetable.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((pKey) => {
                const namesMap = { fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha' };
                const currentOffset = (profile.prayerTimeOffsets && profile.prayerTimeOffsets[pKey]) || 0;
                return (
                  <div
                    key={pKey}
                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {namesMap[pKey]}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePrayerOffsetChange(pKey, -1)}
                        className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center hover:bg-zinc-300 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-7 text-center font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {currentOffset > 0 ? `+${currentOffset}` : currentOffset}m
                      </span>
                      <button
                        onClick={() => handlePrayerOffsetChange(pKey, 1)}
                        className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center hover:bg-zinc-300 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculation Method Selection */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-emerald-600" />
              Prayer Calculation Authority
            </h3>
            <div className="space-y-2">
              {CALCULATION_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    profile.prayerCalculationMethod === m.id
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="radio"
                      name="calculationMethod"
                      checked={profile.prayerCalculationMethod === m.id}
                      onChange={() => handleChangeMethod(m.id)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {m.name}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        Fajr: {m.fajrAngle}° • Isha: {m.ishaAngle ? `${m.ishaAngle}°` : `${m.ishaMinutes} mins after Maghrib`}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Asr Jurisprudence Selection */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Asr Jurisprudence (Madhab)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChangeAsr('standard')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  profile.asrMethod === 'standard'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  Standard (Shafi'i, Maliki, Hanbali)
                </span>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Shadow length equals object height (1x)
                </span>
              </button>

              <button
                onClick={() => handleChangeAsr('hanafi')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  profile.asrMethod === 'hanafi'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold'
                    : 'border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  Hanafi School
                </span>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  Shadow length equals twice object height (2x)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
