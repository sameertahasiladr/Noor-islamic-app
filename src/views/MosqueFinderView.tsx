import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  MapPin,
  Search,
  Navigation,
  Phone,
  Locate,
  Loader2,
  Compass,
  RefreshCw,
  Copy,
  Check,
  Building2,
  ExternalLink,
  Map,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { MosqueItem, UserProfile } from '../types';
import { storageService } from '../services/storageService';
import {
  fetchNearbyMosques,
  searchMosquesLive,
  formatDistance,
} from '../services/mosqueService';
import { MosqueMapView } from '../components/MosqueMapView';

interface MosqueFinderViewProps {
  profile: UserProfile;
  onBack: () => void;
  onUpdateProfile?: (p: UserProfile) => void;
}

export const MosqueFinderView: React.FC<MosqueFinderViewProps> = ({
  profile,
  onBack,
  onUpdateProfile,
}) => {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    city: string;
    country: string;
    source: 'gps' | 'profile' | 'custom';
  }>({
    lat: profile.location.latitude || 15.4909,
    lng: profile.location.longitude || 73.8278,
    city: profile.location.city || 'Panaji',
    country: profile.location.country || 'India',
    source: 'profile',
  });

  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [showMap, setShowMap] = useState<boolean>(true);
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(null);

  const [detectingLocation, setDetectingLocation] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [locationStatus, setLocationStatus] = useState<string>('Calibrating location...');
  const [mosques, setMosques] = useState<MosqueItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [customCityInput, setCustomCityInput] = useState<string>('');

  // Primary loader for mosques based on coordinates and radius
  const loadMosques = useCallback(
    async (lat: number, lng: number, city: string, radius: number = 25) => {
      setIsFetching(true);
      try {
        const results = await fetchNearbyMosques(lat, lng, city, radius);
        setMosques(results);
        if (results.length > 0 && !selectedMosqueId) {
          setSelectedMosqueId(results[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch mosques:', err);
      } finally {
        setIsFetching(false);
      }
    },
    [selectedMosqueId]
  );

  // Sync state if external profile location changes
  useEffect(() => {
    if (
      profile.location.latitude &&
      profile.location.longitude &&
      (profile.location.latitude !== userLocation.lat ||
        profile.location.longitude !== userLocation.lng)
    ) {
      setUserLocation({
        lat: profile.location.latitude,
        lng: profile.location.longitude,
        city: profile.location.city || 'Panaji',
        country: profile.location.country || 'India',
        source: 'profile',
      });
      loadMosques(
        profile.location.latitude,
        profile.location.longitude,
        profile.location.city || 'Panaji',
        radiusKm
      );
    }
  }, [profile.location.latitude, profile.location.longitude, profile.location.city, profile.location.country, loadMosques, radiusKm, userLocation.lat, userLocation.lng]);

  // Auto-detect GPS with high precision
  const handleDetectGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('GPS not supported, using current profile location');
      loadMosques(userLocation.lat, userLocation.lng, userLocation.city, radiusKm);
      return;
    }

    setDetectingLocation(true);
    setLocationStatus('Calibrating high-accuracy GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setDetectingLocation(false);
        setLocationStatus('GPS coordinates calibrated accurately');

        // Reverse geocode city name with OpenStreetMap Nominatim
        let detectedCity = userLocation.city;
        let detectedCountry = userLocation.country;
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
            {
              headers: { 'User-Agent': 'NoorIslamicApp/2.0' },
              signal: AbortSignal.timeout(4000),
            }
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            const addr = revData.address || {};
            detectedCity =
              addr.city ||
              addr.town ||
              addr.suburb ||
              addr.municipality ||
              addr.county ||
              userLocation.city;
            detectedCountry = addr.country || userLocation.country;
          }
        } catch {
          // fallback to current
        }

        const newLocation = {
          lat: latitude,
          lng: longitude,
          city: detectedCity,
          country: detectedCountry,
          source: 'gps' as const,
        };

        setUserLocation(newLocation);

        if (onUpdateProfile) {
          const updated = {
            ...profile,
            location: {
              ...profile.location,
              city: detectedCity,
              country: detectedCountry,
              latitude,
              longitude,
            },
          };
          onUpdateProfile(updated);
          storageService.saveProfile(updated);
        }

        loadMosques(latitude, longitude, detectedCity, radiusKm);
      },
      (err) => {
        setDetectingLocation(false);
        setLocationStatus(`GPS unavailable (${err.message}). Using ${userLocation.city}`);
        loadMosques(userLocation.lat, userLocation.lng, userLocation.city, radiusKm);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 30000 }
    );
  }, [loadMosques, onUpdateProfile, profile, radiusKm, userLocation.city, userLocation.country, userLocation.lat, userLocation.lng]);

  // Initial load
  useEffect(() => {
    loadMosques(userLocation.lat, userLocation.lng, userLocation.city, radiusKm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Radius change handler
  const handleRadiusChange = (newRadius: number) => {
    setRadiusKm(newRadius);
    loadMosques(userLocation.lat, userLocation.lng, userLocation.city, newRadius);
  };

  // Handle manual city selection or custom coordinates
  const handleSelectCity = async (cityName: string) => {
    setShowLocationPicker(false);
    setIsFetching(true);
    setLocationStatus(`Searching mosques in ${cityName}...`);

    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        cityName
      )}&format=json&limit=1`;
      const res = await fetch(geoUrl, {
        headers: { 'User-Agent': 'NoorIslamicApp/2.0' },
        signal: AbortSignal.timeout(4500),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);

          setUserLocation({
            lat,
            lng,
            city: cityName,
            country: data[0].display_name.split(',').pop()?.trim() || userLocation.country,
            source: 'custom',
          });

          setLocationStatus(`Location set to ${cityName}`);
          loadMosques(lat, lng, cityName, radiusKm);
          return;
        }
      }
    } catch {
      // ignore
    }

    setUserLocation((prev) => ({ ...prev, city: cityName, source: 'custom' }));
    loadMosques(userLocation.lat, userLocation.lng, cityName, radiusKm);
  };

  // Live search handler
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsFetching(true);
    try {
      const liveResults = await searchMosquesLive(
        searchQuery,
        userLocation.lat,
        userLocation.lng
      );
      if (liveResults.length > 0) {
        setMosques((prev) => {
          const combined = [...liveResults, ...prev];
          const seen = new Set<string>();
          return combined.filter((item) => {
            const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        });
        setSelectedMosqueId(liveResults[0].id);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsFetching(false);
    }
  };

  // Filter mosques by client-side filters
  const filteredMosques = useMemo(() => {
    return mosques.filter((m) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q);

      const matchesFacility =
        selectedFacility === 'All' ||
        (selectedFacility === 'Women Section' && m.hasWomenSection) ||
        m.facilities.some((f) =>
          f.toLowerCase().includes(selectedFacility.toLowerCase())
        );

      return matchesQuery && matchesFacility;
    });
  }, [mosques, searchQuery, selectedFacility]);

  const openNavigation = (m: MosqueItem) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyAddress = (m: MosqueItem) => {
    navigator.clipboard.writeText(`${m.name}\n${m.address}\nGPS: ${m.lat}, ${m.lng}`);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareMosque = async (m: MosqueItem) => {
    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: m.name,
          text: `Masjid: ${m.name} (${formatDistance(m.distanceKm)})\n${m.address}`,
          url: navUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(`${m.name}\n${m.address}\nDirections: ${navUrl}`);
      setSharedId(m.id);
      setTimeout(() => setSharedId(null), 2000);
    }
  };

  // Direct 1-tap Google Maps search for this exact coordinate
  const openGoogleMapsAreaSearch = () => {
    const url = `https://www.google.com/maps/search/masjid/@${userLocation.lat},${userLocation.lng},14z`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 pt-2 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-0.5" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
              showMap
                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
            title="Toggle Map View"
          >
            <Map className="w-3.5 h-3.5" />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>

          <button
            onClick={() => loadMosques(userLocation.lat, userLocation.lng, userLocation.city, radiusKm)}
            disabled={isFetching}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            title="Refresh mosques"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </button>

          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {filteredMosques.length} Masjids
          </span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-zinc-900 to-emerald-950 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-indigo-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              Accurate Mosque Locator • بيوت الله
            </span>
            <h1 className="text-xl sm:text-2xl font-bold font-arabic mt-1">
              إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ
            </h1>
            <p className="text-xs text-zinc-300 mt-1 max-w-lg leading-relaxed">
              "The mosques of Allah are only to be maintained by those who believe in Allah and the Last Day and establish prayer." (At-Tawbah 9:18)
            </p>
          </div>

          <button
            onClick={openGoogleMapsAreaSearch}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 backdrop-blur-md transition-all shrink-0"
            title="Search for masjids on Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Search on Google Maps</span>
          </button>
        </div>
      </div>

      {/* Location Bar with GPS and Change City Trigger */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Location: {userLocation.city}, {userLocation.country}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  userLocation.source === 'gps'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                    : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300'
                }`}
              >
                {userLocation.source === 'gps' ? 'Live GPS Active' : 'Calibrated Location'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              Coordinates: {userLocation.lat.toFixed(4)}° N, {userLocation.lng.toFixed(4)}° E • {locationStatus}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowLocationPicker(true)}
            className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            title="Change city or search location"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Change City</span>
          </button>

          <button
            onClick={handleDetectGPS}
            disabled={detectingLocation}
            className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            title="Detect GPS coordinates accurately"
          >
            {detectingLocation ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Locate className="w-3.5 h-3.5" />
                <span>Auto GPS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* City Change Modal / Popover */}
      {showLocationPicker && (
        <div className="p-4 rounded-2xl bg-indigo-50/90 dark:bg-zinc-800/90 border border-indigo-200 dark:border-indigo-900 shadow-lg animate-in fade-in space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Select or Search City for Mosques
            </span>
            <button
              onClick={() => setShowLocationPicker(false)}
              className="text-xs text-zinc-400 hover:text-zinc-600"
            >
              Cancel
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customCityInput}
              onChange={(e) => setCustomCityInput(e.target.value)}
              placeholder="Enter city or area (e.g. Panaji, Mapusa, Margao, Mumbai, Dubai, London)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customCityInput.trim()) {
                  handleSelectCity(customCityInput.trim());
                }
              }}
            />
            <button
              onClick={() => {
                if (customCityInput.trim()) {
                  handleSelectCity(customCityInput.trim());
                }
              }}
              className="px-3 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold transition-colors"
            >
              Set City
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mr-1 self-center">
              Quick Suggestions:
            </span>
            {['Panaji', 'Mapusa', 'Margao', 'Vasco da Gama', 'Mumbai', 'Delhi', 'Hyderabad', 'Bangalore', 'Dubai', 'London'].map((city) => (
              <button
                key={city}
                onClick={() => handleSelectCity(city)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-950 border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Map View */}
      {showMap && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Map className="w-3.5 h-3.5 text-emerald-600" />
              Live Interactive Map (Showing {filteredMosques.length} Verified Mosques)
            </span>
            <span className="text-[11px] text-zinc-500">
              Radius: {radiusKm} km
            </span>
          </div>
          <MosqueMapView
            userLocation={userLocation}
            mosques={filteredMosques}
            selectedMosqueId={selectedMosqueId}
            onSelectMosque={(m) => setSelectedMosqueId(m.id)}
            height="340px"
          />
        </div>
      )}

      {/* Search & Filter Bar with Radius Selection */}
      <div className="space-y-3">
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mosque by name, street, neighborhood, or city..."
              className="w-full pl-9 pr-20 py-2.5 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100 placeholder:text-zinc-400 shadow-sm"
            />
            <div className="absolute right-2 top-1.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold"
              >
                Search
              </button>
            </div>
          </div>
        </form>

        {/* Radius Selection Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium text-[11px] mr-1">
              Distance Radius:
            </span>
            {[
              { label: '5 km (Walking)', val: 5 },
              { label: '10 km', val: 10 },
              { label: '25 km (Default)', val: 25 },
              { label: '50 km (Regional)', val: 50 },
            ].map((r) => (
              <button
                key={r.val}
                type="button"
                onClick={() => handleRadiusChange(r.val)}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                  radiusKm === r.val
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Facility Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {['All', 'Women Section', 'Daily Prayers', 'Friday Jummah', 'Wudu Area'].map((fac) => (
              <button
                key={fac}
                type="button"
                onClick={() => setSelectedFacility(fac)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] whitespace-nowrap transition-all ${
                  selectedFacility === fac
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {fac}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state indicator */}
      {isFetching && (
        <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span className="font-semibold">
            Locating verified real masjids within {radiusKm} km of {userLocation.city}...
          </span>
        </div>
      )}

      {/* Mosque Cards List */}
      <div className="space-y-3.5">
        {!isFetching && filteredMosques.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-zinc-850 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <MapPin className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              No verified mosques found within {radiusKm} km of {userLocation.city}
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              We only show verified real places of worship. Try expanding your search radius to 50 km, scanning a neighboring city, or search Google Maps directly.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => handleRadiusChange(50)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
              >
                Expand to 50 km Radius
              </button>
              <button
                onClick={openGoogleMapsAreaSearch}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Search Area on Google Maps</span>
              </button>
              <button
                onClick={() => handleSelectCity('Panaji')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors"
              >
                Search Panaji Mosques
              </button>
            </div>
          </div>
        ) : (
          filteredMosques.map((mosque) => {
            const isSelected = mosque.id === selectedMosqueId;

            return (
              <div
                key={mosque.id}
                onClick={() => setSelectedMosqueId(mosque.id)}
                className={`p-5 rounded-2xl bg-white dark:bg-zinc-850 border transition-all space-y-3 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                    : 'border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-indigo-400/60 dark:hover:border-indigo-800/80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {formatDistance(mosque.distanceKm)}
                      </span>

                      {mosque.verified && (
                        <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified Real Mosque</span>
                        </span>
                      )}

                      {mosque.hasWomenSection && (
                        <span className="text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-full">
                          Women Section
                        </span>
                      )}

                      {mosque.denomination && (
                        <span className="text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full capitalize">
                          {mosque.denomination}
                        </span>
                      )}

                      <span className="text-[10px] text-zinc-400 font-medium">
                        {mosque.city}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1.5 flex items-center gap-2">
                      <span>{mosque.name}</span>
                    </h3>

                    {mosque.arabicName && mosque.arabicName !== mosque.name && (
                      <p className="text-sm font-arabic font-semibold text-emerald-800 dark:text-emerald-400">
                        {mosque.arabicName}
                      </p>
                    )}

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="line-clamp-2">{mosque.address}</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openNavigation(mosque);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
                      title="Get direct GPS directions in Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </button>
                  </div>
                </div>

                {/* Facilities tags */}
                {mosque.facilities && mosque.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {mosque.facilities.map((fac) => (
                      <span
                        key={fac}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Footer: Copy, Share, View in Google Maps / OSM */}
                <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyAddress(mosque);
                      }}
                      className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                    >
                      {copiedId === mosque.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Address Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareMosque(mosque);
                      }}
                      className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                    >
                      {sharedId === mosque.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Link Copied</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${mosque.name} ${mosque.address}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Maps</span>
                    </a>

                    {mosque.osmUrl && (
                      <a
                        href={mosque.osmUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        title="View OpenStreetMap record"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>OSM Source</span>
                      </a>
                    )}
                  </div>

                  {mosque.phone && (
                    <a
                      href={`tel:${mosque.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{mosque.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
