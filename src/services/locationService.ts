import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { POPULAR_LOCATIONS, LocationPreset } from './prayerService';
import { UserProfile } from '../types';
import { storageService } from './storageService';
import { saveUserProfileToFirestore } from './firebase';

export interface DetectedLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

/**
 * Requests device GPS permissions properly on Android / Native and Web
 */
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Capacitor.isNativePlatform()) {
    try {
      const check = await Geolocation.checkPermissions();
      if (check.location === 'granted') {
        return true;
      }
      const req = await Geolocation.requestPermissions({ permissions: ['location'] });
      return req.location === 'granted';
    } catch (e) {
      console.warn('[LocationService] Native permission check/request failed:', e);
      return false;
    }
  }
  return true;
};

/**
 * Calculates distance to find closest known preset city
 */
export const findNearestPresetCity = (lat: number, lng: number): LocationPreset => {
  let best = POPULAR_LOCATIONS[0];
  let minDistance = Infinity;

  for (const loc of POPULAR_LOCATIONS) {
    const dLat = (loc.latitude - lat) * (Math.PI / 180);
    const dLng = (loc.longitude - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(loc.latitude * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = 6371 * c;

    if (distanceKm < minDistance) {
      minDistance = distanceKm;
      best = loc;
    }
  }
  return best;
};

/**
 * Requests device GPS coordinates via native Capacitor Geolocation on Android
 * or standard Web Geolocation API on browsers
 */
export const detectCoordinates = async (): Promise<{ latitude: number; longitude: number } | null> => {
  // If running on native Android/iOS
  if (Capacitor.isNativePlatform()) {
    try {
      await requestLocationPermission();
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      });
      return {
        latitude: parseFloat(pos.coords.latitude.toFixed(4)),
        longitude: parseFloat(pos.coords.longitude.toFixed(4)),
      };
    } catch (err: any) {
      console.warn('[LocationService] Native Geolocation error:', err?.message || err);
      // fallback to navigator below
    }
  }

  // Web Browser fallback
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: parseFloat(pos.coords.latitude.toFixed(4)),
          longitude: parseFloat(pos.coords.longitude.toFixed(4)),
        });
      },
      (err) => {
        console.info('[LocationService] Geolocation unavailable or dismissed:', err?.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000,
      }
    );
  });
};

/**
 * Reverse geocodes coordinates to human-readable City & Country
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<{ city: string; country: string }> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const city =
          data.address.city ||
          data.address.town ||
          data.address.municipality ||
          data.address.village ||
          data.address.suburb ||
          data.address.county ||
          '';
        const country = data.address.country || '';
        if (city && country) {
          return { city, country };
        }
        if (city) return { city, country: country || 'Detected Region' };
        if (country) return { city: data.name || 'Local Area', country };
      }
    }
  } catch {
    // Network or timeout failure, fallback below
  }

  // Fallback to nearest popular city if close (< 120km)
  const nearest = findNearestPresetCity(lat, lng);
  const dLat = (nearest.latitude - lat) * (Math.PI / 180);
  const dLng = (nearest.longitude - lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat * (Math.PI / 180)) *
      Math.cos(nearest.latitude * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  if (distanceKm < 120) {
    return { city: nearest.city, country: nearest.country };
  }

  const latStr = lat >= 0 ? `${lat.toFixed(2)}°N` : `${Math.abs(lat).toFixed(2)}°S`;
  const lngStr = lng >= 0 ? `${lng.toFixed(2)}°E` : `${Math.abs(lng).toFixed(2)}°W`;
  return {
    city: `${latStr}, ${lngStr}`,
    country: 'Precise GPS',
  };
};

/**
 * Detects current user location coordinates and city/country
 */
export const detectLocation = async (): Promise<DetectedLocation | null> => {
  const coords = await detectCoordinates();
  if (!coords) return null;

  const { city, country } = await reverseGeocode(coords.latitude, coords.longitude);
  return {
    city,
    country,
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
};

type LocationChangeCallback = (loc: DetectedLocation) => void;
const listeners = new Set<LocationChangeCallback>();

export const subscribeToLocationDetection = (cb: LocationChangeCallback): (() => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

const notifyLocationDetected = (loc: DetectedLocation) => {
  listeners.forEach((cb) => {
    try {
      cb(loc);
    } catch (e) {
      console.warn('Location listener error:', e);
    }
  });
};

/**
 * Automatically detects location and applies it directly to profile, storage & Firestore
 */
export const autoDetectAndApplyLocation = async (
  profile: UserProfile,
  onProfileUpdated?: (updated: UserProfile) => void
): Promise<DetectedLocation | null> => {
  try {
    const detected = await detectLocation();
    if (!detected) return null;

    const newLoc = {
      city: detected.city,
      country: detected.country,
      latitude: detected.latitude,
      longitude: detected.longitude,
    };

    const updatedProfile: UserProfile = {
      ...profile,
      location: newLoc,
    };

    storageService.saveProfile(updatedProfile, !updatedProfile.isGuest);
    storageService.updateLocation(newLoc);

    if (!updatedProfile.isGuest && updatedProfile.id && updatedProfile.id !== 'guest_default') {
      saveUserProfileToFirestore(updatedProfile.id, { location: newLoc }).catch((err) => {
        console.warn('Auto location sync to Firestore note:', err);
      });
    }

    if (onProfileUpdated) {
      onProfileUpdated(updatedProfile);
    }

    notifyLocationDetected(detected);

    return detected;
  } catch (err) {
    console.warn('Auto location detection error:', err);
    return null;
  }
};
