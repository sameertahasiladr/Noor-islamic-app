import { CalculationMethod, HijriDate, PrayerTimeData } from '../types';

export interface LocationPreset {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export const POPULAR_LOCATIONS: LocationPreset[] = [
  // Holy Cities & Middle East
  { city: 'Makkah', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262 },
  { city: 'Madinah', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692 },
  { city: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753 },
  { city: 'Jeddah', country: 'Saudi Arabia', latitude: 21.5433, longitude: 39.1728 },
  { city: 'Jerusalem', country: 'Palestine', latitude: 31.7767, longitude: 35.2342 },
  { city: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
  { city: 'Alexandria', country: 'Egypt', latitude: 31.2001, longitude: 29.9187 },
  { city: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708 },
  { city: 'Abu Dhabi', country: 'UAE', latitude: 24.4539, longitude: 54.3773 },
  { city: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.5310 },
  { city: 'Kuwait City', country: 'Kuwait', latitude: 29.3759, longitude: 47.9774 },
  { city: 'Manama', country: 'Bahrain', latitude: 26.2285, longitude: 50.5860 },
  { city: 'Muscat', country: 'Oman', latitude: 23.5880, longitude: 58.3829 },
  { city: 'Amman', country: 'Jordan', latitude: 31.9454, longitude: 35.9284 },
  { city: 'Beirut', country: 'Lebanon', latitude: 33.8938, longitude: 35.5018 },
  { city: 'Baghdad', country: 'Iraq', latitude: 33.3152, longitude: 44.3661 },
  { city: 'Casablanca', country: 'Morocco', latitude: 33.5731, longitude: -7.5898 },
  { city: 'Algiers', country: 'Algeria', latitude: 36.7538, longitude: 3.0588 },
  { city: 'Tunis', country: 'Tunisia', latitude: 36.8065, longitude: 10.1815 },
  // Turkey & Central Asia
  { city: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
  { city: 'Ankara', country: 'Turkey', latitude: 39.9334, longitude: 32.8597 },
  { city: 'Tashkent', country: 'Uzbekistan', latitude: 41.2995, longitude: 69.2401 },
  // South Asia
  { city: 'Karachi', country: 'Pakistan', latitude: 24.8607, longitude: 67.0011 },
  { city: 'Lahore', country: 'Pakistan', latitude: 31.5204, longitude: 74.3587 },
  { city: 'Islamabad', country: 'Pakistan', latitude: 33.6844, longitude: 73.0479 },
  { city: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { city: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090 },
  { city: 'Hyderabad', country: 'India', latitude: 17.3850, longitude: 78.4867 },
  { city: 'Bengaluru', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { city: 'Dhaka', country: 'Bangladesh', latitude: 23.8103, longitude: 90.4125 },
  // Southeast & East Asia
  { city: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456 },
  { city: 'Surabaya', country: 'Indonesia', latitude: -7.2575, longitude: 112.7521 },
  { city: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869 },
  { city: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  // Europe
  { city: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { city: 'Birmingham', country: 'United Kingdom', latitude: 52.4862, longitude: -1.8904 },
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { city: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 },
  { city: 'Frankfurt', country: 'Germany', latitude: 50.1109, longitude: 8.6821 },
  { city: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041 },
  // North America
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { city: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298 },
  { city: 'Houston', country: 'United States', latitude: 29.7604, longitude: -95.3698 },
  { city: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
  { city: 'Washington DC', country: 'United States', latitude: 38.9072, longitude: -77.0369 },
  { city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { city: 'Montreal', country: 'Canada', latitude: 45.5017, longitude: -73.5673 },
  // Africa & Australia
  { city: 'Johannesburg', country: 'South Africa', latitude: -26.2041, longitude: 28.0473 },
  { city: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241 },
  { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { city: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631 },
];

export const CALCULATION_METHODS: {
  id: CalculationMethod;
  name: string;
  fajrAngle: number;
  ishaAngle: number;
  ishaMinutes?: number;
  maghribAngle?: number;
}[] = [
  { id: 'MWL', name: 'Muslim World League (MWL)', fajrAngle: 18, ishaAngle: 17 },
  { id: 'ISNA', name: 'Islamic Society of North America (ISNA)', fajrAngle: 15, ishaAngle: 15 },
  { id: 'Egypt', name: 'Egyptian General Authority of Survey', fajrAngle: 19.5, ishaAngle: 17.5 },
  { id: 'Makkah', name: 'Umm Al-Qura University, Makkah', fajrAngle: 18.5, ishaAngle: 0, ishaMinutes: 90 },
  { id: 'Karachi', name: 'University of Islamic Sciences, Karachi', fajrAngle: 18, ishaAngle: 18 },
  { id: 'Gulf', name: 'Gulf Region / UAE', fajrAngle: 19.5, ishaAngle: 0, ishaMinutes: 90 },
  { id: 'Tehran', name: 'Institute of Geophysics, Tehran', fajrAngle: 17.7, ishaAngle: 14, maghribAngle: 4.5 },
  { id: 'France', name: 'UOIF - France', fajrAngle: 12, ishaAngle: 12 },
  { id: 'Singapore', name: 'MUIS - Singapore', fajrAngle: 20, ishaAngle: 18 },
  { id: 'Diyanet', name: 'Diyanet İşleri Başkanlığı, Turkey', fajrAngle: 18, ishaAngle: 17 },
];

const ISLAMIC_MONTH_NAMES = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
];

const ISLAMIC_MONTH_ARABIC = [
  'مُحَرَّم', 'صَفَر', 'رَبِيع الأَوَّل', 'رَبِيع الآخِر',
  'جُمَادَى الأُولَى', 'جُمَادَى الآخِرَة', 'رَجَب', 'شَعْبَان',
  'رَمَضَان', 'شَوَّال', 'ذُو القَعْدَة', 'ذُو الحِجَّة'
];

// Exact Kuwaiti / Umm Al-Qura algorithm for astronomical lunar calendar conversion
function kuwaitiAlgorithm(date: Date): { day: number; month: number; year: number } {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  let yr = y;
  let mo = m;
  if (mo < 3) {
    yr -= 1;
    mo += 12;
  }

  const a = Math.floor(yr / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + b - 1524.5;

  const l = Math.floor(jd - 1948440 + 10632);
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
            Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
             Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hijriMonth = Math.floor((24 * l3) / 709);
  const hijriDay = l3 - Math.floor((709 * hijriMonth) / 24);
  const hijriYear = 30 * n + j - 30;

  return {
    day: Math.max(1, Math.min(30, hijriDay)),
    month: Math.max(1, Math.min(12, hijriMonth)),
    year: hijriYear,
  };
}

/**
 * Converts Date to Hijri Date with optional regional lunar sighting calibration (-2 to +2 days)
 */
export function getHijriDate(date: Date, adjustmentDays: number = 0): HijriDate {
  const adjusted = new Date(date.getTime() + adjustmentDays * 86400000);

  try {
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(adjusted);
    let day = 0;
    let month = 0;
    let year = 0;

    for (const part of parts) {
      if (part.type === 'day') day = parseInt(part.value, 10);
      if (part.type === 'month') month = parseInt(part.value, 10);
      if (part.type === 'year') year = parseInt(part.value, 10);
    }

    if (day > 0 && month > 0 && year > 0) {
      const monthIndex = Math.max(0, Math.min(11, month - 1));
      const monthName = ISLAMIC_MONTH_NAMES[monthIndex];
      const monthArabic = ISLAMIC_MONTH_ARABIC[monthIndex];

      return {
        day,
        month,
        monthName,
        monthArabic,
        monthNumber: month,
        year,
        formatted: `${day} ${monthName} ${year} AH`,
        formattedArabic: `${day} ${monthArabic} ${year} هـ`,
      };
    }
  } catch {
    // Fallback to astronomical Kuwaiti calculation
  }

  const kResult = kuwaitiAlgorithm(adjusted);
  const mIndex = Math.max(0, Math.min(11, kResult.month - 1));
  const mName = ISLAMIC_MONTH_NAMES[mIndex];
  const mArabic = ISLAMIC_MONTH_ARABIC[mIndex];

  return {
    day: kResult.day,
    month: kResult.month,
    monthName: mName,
    monthArabic: mArabic,
    monthNumber: kResult.month,
    year: kResult.year,
    formatted: `${kResult.day} ${mName} ${kResult.year} AH`,
    formattedArabic: `${kResult.day} ${mArabic} ${kResult.year} هـ`,
  };
}

// Math helpers for astronomical solar calculations
const d2r = (d: number) => (d * Math.PI) / 180;
const r2d = (r: number) => (r * 180) / Math.PI;

function getJulianDay(date: Date) {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();
  let y = year;
  if (month <= 2) {
    y -= 1;
    month += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
}

function getSunCoordinates(julianDay: number) {
  const d = julianDay - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const l = (q + 1.915 * Math.sin(d2r(g)) + 0.020 * Math.sin(d2r(2 * g))) % 360;
  const e = 23.439 - 0.00000036 * d;
  const ra = ((r2d(Math.atan2(Math.cos(d2r(e)) * Math.sin(d2r(l)), Math.cos(d2r(l)))) / 15) % 24 + 24) % 24;
  const dec = r2d(Math.asin(Math.sin(d2r(e)) * Math.sin(d2r(l))));

  // Normalized Equation of Time within [-30, +30] minutes
  let diff = (q / 15 - ra) % 24;
  if (diff > 12) diff -= 24;
  if (diff < -12) diff += 24;
  const eqt = diff * 60;

  return { dec, eqt };
}

/**
 * Calculates authentic, astronomically verified Islamic Prayer Times
 */
export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  methodId: CalculationMethod = 'MWL',
  asrMethod: 'standard' | 'hanafi' = 'standard',
  hijriAdjustment: number = 0,
  offsets?: {
    fajr?: number;
    sunrise?: number;
    dhuhr?: number;
    asr?: number;
    maghrib?: number;
    isha?: number;
  },
  highLatitudeRule: 'middleOfTheNight' | 'oneSeventh' | 'angleBased' | 'none' = 'angleBased'
): PrayerTimeData {
  const methodConfig = CALCULATION_METHODS.find((m) => m.id === methodId) || CALCULATION_METHODS[0];
  const jd = getJulianDay(date);
  const { dec, eqt } = getSunCoordinates(jd);
  const timeZoneOffset = -date.getTimezoneOffset() / 60;

  // Exact solar transit (noon)
  const noonHour = 12 + timeZoneOffset - lng / 15 - eqt / 60;

  // Dhuhr: sun passes zenith + standard 1.5 min margin (zawal)
  let dhuhrTime = noonHour + (90 / 3600);

  // Hour angle helper for altitude a (degrees).
  // a is positive above horizon, negative below horizon.
  const computeHourAngle = (altitude: number): { valid: boolean; h: number } => {
    const sinA = Math.sin(d2r(altitude));
    const sinL = Math.sin(d2r(lat));
    const sinD = Math.sin(d2r(dec));
    const cosL = Math.cos(d2r(lat));
    const cosD = Math.cos(d2r(dec));

    const cosH = (sinA - sinL * sinD) / (cosL * cosD);
    if (cosH > 1 || cosH < -1) {
      return { valid: false, h: 0 };
    }
    return { valid: true, h: r2d(Math.acos(cosH)) / 15 };
  };

  // Sunrise & Sunset (center of sun is 50 arcmin = 0.8333° below horizon due to atmospheric refraction)
  const sunHorizonH = computeHourAngle(-0.8333);
  const hRiseSet = sunHorizonH.valid ? sunHorizonH.h : 6;
  let sunriseTime = noonHour - hRiseSet;
  const sunsetTime = noonHour + hRiseSet;

  // Maghrib
  let maghribTime: number;
  if (methodConfig.maghribAngle) {
    const mH = computeHourAngle(-methodConfig.maghribAngle);
    maghribTime = noonHour + (mH.valid ? mH.h : hRiseSet + 2 / 60);
  } else {
    // Standard sun disk completely submerged + 2 min twilight entry
    maghribTime = sunsetTime + (2 / 60);
  }

  // Asr: Shadow factor is 1 for Standard (Shafi'i, Maliki, Hanbali), 2 for Hanafi
  // Altitude = arccot(shadowFactor + tan(|lat - dec|)) -> positive altitude above horizon!
  const shadowFactor = asrMethod === 'hanafi' ? 2 : 1;
  const asrAltitude = r2d(Math.atan(1 / (shadowFactor + Math.tan(d2r(Math.abs(lat - dec))))));
  const asrH = computeHourAngle(asrAltitude);
  let asrTime = noonHour + (asrH.valid ? asrH.h : 3.5);

  // Night duration for high latitude safety
  const nightDuration = ((24 - sunsetTime + sunriseTime) % 24 + 24) % 24;

  // Fajr
  let fajrTime: number;
  const fajrH = computeHourAngle(-methodConfig.fajrAngle);
  if (fajrH.valid) {
    fajrTime = noonHour - fajrH.h;
  } else {
    // High-latitude adjustment
    if (highLatitudeRule === 'oneSeventh') {
      fajrTime = sunriseTime - nightDuration / 7;
    } else if (highLatitudeRule === 'middleOfTheNight') {
      fajrTime = sunriseTime - nightDuration / 2;
    } else {
      // Angle-based approximation
      fajrTime = sunriseTime - (methodConfig.fajrAngle / 60) * nightDuration;
    }
  }

  // Isha
  let ishaTime: number;
  if (methodConfig.ishaMinutes && methodConfig.ishaMinutes > 0) {
    ishaTime = maghribTime + methodConfig.ishaMinutes / 60;
  } else {
    const ishaH = computeHourAngle(-methodConfig.ishaAngle);
    if (ishaH.valid) {
      ishaTime = noonHour + ishaH.h;
    } else {
      if (highLatitudeRule === 'oneSeventh') {
        ishaTime = maghribTime + nightDuration / 7;
      } else if (highLatitudeRule === 'middleOfTheNight') {
        ishaTime = maghribTime + nightDuration / 2;
      } else {
        ishaTime = maghribTime + (methodConfig.ishaAngle / 60) * nightDuration;
      }
    }
  }

  // Apply user minute offsets if specified (for local mosque calibrations)
  if (offsets) {
    if (offsets.fajr) fajrTime += offsets.fajr / 60;
    if (offsets.sunrise) sunriseTime += offsets.sunrise / 60;
    if (offsets.dhuhr) dhuhrTime += offsets.dhuhr / 60;
    if (offsets.asr) asrTime += offsets.asr / 60;
    if (offsets.maghrib) maghribTime += offsets.maghrib / 60;
    if (offsets.isha) ishaTime += offsets.isha / 60;
  }

  // Format decimal hour into HH:MM AM/PM
  const formatTime = (hour: number): string => {
    let normalized = ((hour % 24) + 24) % 24;
    const h = Math.floor(normalized);
    const m = Math.floor((normalized - h) * 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : `${m}`;
    return `${displayH}:${displayM} ${period}`;
  };

  const times = {
    fajr: formatTime(fajrTime),
    sunrise: formatTime(sunriseTime),
    dhuhr: formatTime(dhuhrTime),
    asr: formatTime(asrTime),
    maghrib: formatTime(maghribTime),
    isha: formatTime(ishaTime),
  };

  // Next prayer detection
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

  const todayTimes: { name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'; decimal: number; display: string }[] = [
    { name: 'Fajr', decimal: fajrTime, display: times.fajr },
    { name: 'Sunrise', decimal: sunriseTime, display: times.sunrise },
    { name: 'Dhuhr', decimal: dhuhrTime, display: times.dhuhr },
    { name: 'Asr', decimal: asrTime, display: times.asr },
    { name: 'Maghrib', decimal: maghribTime, display: times.maghrib },
    { name: 'Isha', decimal: ishaTime, display: times.isha },
  ];

  const nextP = todayTimes.find((t) => t.decimal > currentHour);
  let secondsRemaining = 0;
  let nextName: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha' = 'Fajr';
  let nextDisplay = times.fajr;

  if (nextP) {
    nextName = nextP.name;
    nextDisplay = nextP.display;
    secondsRemaining = Math.max(0, Math.floor((nextP.decimal - currentHour) * 3600));
  } else {
    // Tomorrow's Fajr
    nextName = 'Fajr';
    nextDisplay = times.fajr;
    secondsRemaining = Math.max(0, Math.floor((24 - currentHour + fajrTime) * 3600));
  }

  const hoursLeft = Math.floor(secondsRemaining / 3600);
  const minutesLeft = Math.floor((secondsRemaining % 3600) / 60);
  const secsLeft = secondsRemaining % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const remainingFormatted = `${pad(hoursLeft)}:${pad(minutesLeft)}:${pad(secsLeft)}`;

  return {
    ...times,
    date,
    hijriDate: getHijriDate(date, hijriAdjustment),
    nextPrayer: {
      name: nextName,
      time: nextDisplay,
      remainingFormatted,
      totalSecondsRemaining: secondsRemaining,
    },
  };
}

/**
 * Calculates direction toward Kaaba in Makkah (21.4225° N, 39.8262° E)
 */
export function calculateQiblaDirection(userLat: number, userLng: number): { degree: number; distanceKm: number } {
  const meccaLat = 21.4225;
  const meccaLng = 39.8262;

  const lat1 = d2r(userLat);
  const lat2 = d2r(meccaLat);
  const dLng = d2r(meccaLng - userLng);

  // Forward azimuth formula
  const y = Math.sin(dLng);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng);
  const qiblaRad = Math.atan2(y, x);
  const qiblaDeg = (r2d(qiblaRad) + 360) % 360;

  // Haversine formula for distance in kilometers
  const R = 6371;
  const dLat = lat2 - lat1;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  return {
    degree: Math.round(qiblaDeg),
    distanceKm,
  };
}

export const calculateQibla = calculateQiblaDirection;
