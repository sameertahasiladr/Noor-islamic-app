import { MosqueItem } from '../types';
import { NEARBY_MOSQUES } from '../data/mosques';

/**
 * Calculates great-circle distance between two coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Format distance in human-readable units (meters if < 1km, km otherwise)
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Check if a Photon feature represents an authentic place of worship/mosque
 * and not a railway station, shop, or commercial business
 */
function isValidPhotonMosque(f: any): boolean {
  const p = f?.properties;
  if (!p) return false;

  const key = (p.osm_key || '').toLowerCase();
  const value = (p.osm_value || '').toLowerCase();
  const type = (p.type || '').toLowerCase();
  const name = (p.name || '').toLowerCase();

  // Exclude non-mosque POIs
  const excludedKeys = ['railway', 'station', 'highway', 'shop', 'commercial', 'office', 'tourism', 'restaurant', 'fast_food', 'leisure'];
  if (excludedKeys.includes(key)) return false;
  if (['station', 'bus_stop', 'tram_stop', 'platform', 'fuel', 'bank'].includes(value)) return false;

  // Exclude by name if it clearly is a store/business/transport
  if (/station|railway|junction|shop|store|restaurant|hotel|bunder/i.test(name) && !/masjid|mosque/i.test(name)) {
    return false;
  }

  // Accept valid tags
  if (key === 'amenity' && (value === 'place_of_worship' || value === 'mosque')) return true;
  if (key === 'building' && value === 'mosque') return true;
  if (type === 'place_of_worship') return true;

  // Accept if name contains clear Islamic mosque keywords
  if (/masjid|mosque|جامع|مسجد|jama masjid|jami masjid|eidgah|markaz|idgah/i.test(name)) {
    return true;
  }

  return false;
}

/**
 * Fetch verified real mosques around coordinates using high-reliability multi-source strategy:
 * 1. Photon (OpenStreetMap real-time POI search with strict verification)
 * 2. Overpass API (Deep OpenStreetMap query with tags for amenities, women's sections, and denomination)
 * 3. Nominatim (Specific geographic city POI search)
 * 4. Holy sanctuary data if user is in Makkah / Madinah
 */
export async function fetchNearbyMosques(
  lat: number,
  lng: number,
  cityName: string = '',
  radiusKm: number = 25
): Promise<MosqueItem[]> {
  const results: MosqueItem[] = [];

  const isDuplicate = (newLat: number, newLng: number, newName: string): boolean => {
    const cleanNew = newName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const existing of results) {
      const dist = calculateDistanceKm(existing.lat, existing.lng, newLat, newLng);
      // If within 80 meters, it is the same physical building
      if (dist < 0.08) return true;
      // If within 250 meters with matching name
      const cleanExisting = existing.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (dist < 0.35 && (cleanNew.includes(cleanExisting) || cleanExisting.includes(cleanNew))) {
        return true;
      }
    }
    return false;
  };

  const addMosque = (m: MosqueItem) => {
    if (m.distanceKm > radiusKm) return;
    if (!isDuplicate(m.lat, m.lng, m.name)) {
      results.push(m);
    }
  };

  // 1. Photon API search (Ultra-fast, global OpenStreetMap POI index)
  const fetchPhoton = async () => {
    try {
      const queries = ['masjid', 'mosque'];
      await Promise.all(
        queries.map(async (q) => {
          const pUrl = `https://photon.komoot.io/api/?q=${q}&lat=${lat}&lon=${lng}&limit=40`;
          const res = await fetch(pUrl, { signal: AbortSignal.timeout(5000) });
          if (!res.ok) return;
          const data = await res.json();
          if (data && Array.isArray(data.features)) {
            for (const f of data.features) {
              if (!isValidPhotonMosque(f)) continue;

              const coords = f.geometry?.coordinates;
              if (!coords || coords.length < 2) continue;

              const mLng = coords[0];
              const mLat = coords[1];
              const dist = calculateDistanceKm(lat, lng, mLat, mLng);

              if (dist <= radiusKm) {
                const rawName = f.properties?.name || (q === 'mosque' ? 'Mosque' : 'Masjid');
                const street = f.properties?.street || '';
                const locality = f.properties?.locality || f.properties?.district || '';
                const city = f.properties?.city || cityName || 'Local Area';
                const state = f.properties?.state || '';

                const fullAddr = [street, locality, city, state].filter(Boolean).join(', ') || rawName;

                addMosque({
                  id: `pho_${f.properties?.osm_id || Math.random().toString(36).slice(2, 9)}`,
                  name: rawName,
                  arabicName: /مسجد|جامع/.test(rawName) ? rawName : 'مسجد',
                  address: fullAddr,
                  city: city || cityName || 'Local Area',
                  distanceKm: dist,
                  facilities: ['Daily Prayers', 'Friday Jummah', 'Wudu Area'],
                  lat: mLat,
                  lng: mLng,
                  hasWomenSection: true,
                  verified: true,
                  osmUrl: f.properties?.osm_id ? `https://www.openstreetmap.org/${f.properties?.osm_type === 'W' ? 'way' : 'node'}/${f.properties?.osm_id}` : undefined,
                });
              }
            }
          }
        })
      );
    } catch (err) {
      console.warn('Photon mosque fetch notice:', err);
    }
  };

  // 2. Overpass API query (Authentic OSM elements with rich attributes)
  const fetchOverpass = async () => {
    try {
      const radiusMeters = Math.min(radiusKm * 1000, 35000);
      const query = `[out:json][timeout:12];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
  relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
  node["building"="mosque"](around:${radiusMeters},${lat},${lng});
  way["building"="mosque"](around:${radiusMeters},${lat},${lng});
  node["amenity"="place_of_worship"]["name"~"Masjid|Mosque|Jama|Jami|Madani|Noor|Bilal|Quba|Markaz|Idgah|Eidgah|Sunni|Shia",i](around:${radiusMeters},${lat},${lng});
  way["amenity"="place_of_worship"]["name"~"Masjid|Mosque|Jama|Jami|Madani|Noor|Bilal|Quba|Markaz|Idgah|Eidgah|Sunni|Shia",i](around:${radiusMeters},${lat},${lng});
);
out center 40;`;

      const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
      ];

      for (const endpoint of endpoints) {
        try {
          const url = `${endpoint}?data=${encodeURIComponent(query)}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(9000) });
          if (!res.ok) continue;

          const data = await res.json();
          if (data && Array.isArray(data.elements)) {
            for (const el of data.elements) {
              const tags = el.tags || {};
              const mLat = el.lat ?? el.center?.lat;
              const mLng = el.lon ?? el.center?.lon;
              if (mLat == null || mLng == null) continue;

              const dist = calculateDistanceKm(lat, lng, mLat, mLng);
              if (dist <= radiusKm) {
                const name =
                  tags.name ||
                  tags['name:en'] ||
                  tags['name:ur'] ||
                  tags['name:ar'] ||
                  tags.official_name ||
                  (tags['addr:street'] ? `Masjid on ${tags['addr:street']}` : (tags['addr:suburb'] ? `Masjid in ${tags['addr:suburb']}` : 'Masjid (Local)'));

                const street = tags['addr:street'] || tags['addr:housenumber'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street'] || ''}`.trim() : '';
                const suburb = tags['addr:suburb'] || tags['addr:district'] || '';
                const city = tags['addr:city'] || cityName || 'Local Area';
                const fullAddr = [street, suburb, city].filter(Boolean).join(', ') || name;

                const hasWomen = tags.female === 'yes' || tags['female:prayer_room'] === 'yes' || tags['wheelchair'] === 'yes';
                const facilities: string[] = ['Daily Prayers', 'Friday Jummah', 'Wudu Area'];
                if (hasWomen) facilities.push('Women Section');
                if (tags.air_conditioning === 'yes') facilities.push('Air Conditioned');
                if (tags.wheelchair === 'yes') facilities.push('Wheelchair Access');

                addMosque({
                  id: `ovp_${el.type || 'n'}_${el.id}`,
                  name,
                  arabicName: tags['name:ar'] || 'مسجد',
                  address: fullAddr,
                  city: city || cityName || 'Local Area',
                  distanceKm: dist,
                  capacity: tags.capacity ? parseInt(tags.capacity, 10) : undefined,
                  facilities,
                  lat: mLat,
                  lng: mLng,
                  phone: tags.phone || tags['contact:phone'],
                  hasWomenSection: hasWomen,
                  denomination: tags.denomination || undefined,
                  openingHours: tags.opening_hours || undefined,
                  verified: true,
                  osmUrl: `https://www.openstreetmap.org/${el.type || 'node'}/${el.id}`,
                });
              }
            }
            // If we got results from first endpoint, break
            if (data.elements.length > 0) break;
          }
        } catch {
          // try next endpoint
        }
      }
    } catch (err) {
      console.warn('Overpass mosque fetch notice:', err);
    }
  };

  // 3. Nominatim Area Search (If city is specified or as secondary source)
  const fetchNominatim = async () => {
    if (!cityName) return;
    try {
      const searchTerms = [`masjid in ${cityName}`, `mosque in ${cityName}`];
      for (const term of searchTerms) {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&format=json&addressdetails=1&limit=20`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'NoorIslamicApp/2.0' },
          signal: AbortSignal.timeout(4500),
        });
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const mLat = parseFloat(item.lat);
            const mLng = parseFloat(item.lon);
            if (isNaN(mLat) || isNaN(mLng)) continue;

            const isAmenity = item.class === 'amenity' && (item.type === 'place_of_worship' || item.type === 'mosque');
            const hasMosqueName = /masjid|mosque|جامع|مسجد/i.test(item.name || item.display_name || '');
            if (!isAmenity && !hasMosqueName) continue;

            const dist = calculateDistanceKm(lat, lng, mLat, mLng);
            if (dist <= radiusKm) {
              const rawName = item.name || item.display_name?.split(',')[0]?.trim() || 'Masjid';
              const city = item.address?.city || item.address?.town || item.address?.suburb || cityName;

              addMosque({
                id: `nom_${item.place_id || Math.random().toString(36).slice(2, 9)}`,
                name: rawName,
                arabicName: 'مسجد',
                address: item.display_name || `${rawName}, ${city}`,
                city: city || cityName,
                distanceKm: dist,
                facilities: ['Daily Prayers', 'Friday Jummah', 'Wudu Area'],
                lat: mLat,
                lng: mLng,
                hasWomenSection: true,
                verified: true,
                osmUrl: item.osm_id ? `https://www.openstreetmap.org/${item.osm_type || 'node'}/${item.osm_id}` : undefined,
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn('Nominatim mosque fetch notice:', err);
    }
  };

  // Run all sources in parallel
  await Promise.allSettled([fetchPhoton(), fetchOverpass(), fetchNominatim()]);

  // Check if near holy sanctuaries (Makkah or Madinah)
  for (const holy of NEARBY_MOSQUES) {
    const dist = calculateDistanceKm(lat, lng, holy.lat, holy.lng);
    if (dist <= radiusKm) {
      addMosque({
        ...holy,
        distanceKm: dist,
        verified: true,
      });
    }
  }

  // Strictly sort by nearest distance
  results.sort((a, b) => a.distanceKm - b.distanceKm);

  return results;
}

/**
 * Live search for mosques by textual query (name, street, neighborhood, city)
 */
export async function searchMosquesLive(
  query: string,
  userLat: number,
  userLng: number
): Promise<MosqueItem[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  const results: MosqueItem[] = [];
  const seenKeys = new Set<string>();

  const isDuplicate = (lat: number, lng: number, name: string) => {
    const key = `${name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)}_${Math.round(lat * 100)}_${Math.round(lng * 100)}`;
    if (seenKeys.has(key)) return true;
    seenKeys.add(key);
    return false;
  };

  // 1. Search Photon by query
  try {
    const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ + ' masjid')}&lat=${userLat}&lon=${userLng}&limit=25`;
    const res = await fetch(pUrl, { signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.features)) {
        for (const f of data.features) {
          if (!isValidPhotonMosque(f)) continue;
          const coords = f.geometry?.coordinates;
          if (!coords || coords.length < 2) continue;

          const mLng = coords[0];
          const mLat = coords[1];
          const rawName = f.properties?.name || 'Masjid';
          if (isDuplicate(mLat, mLng, rawName)) continue;

          const dist = calculateDistanceKm(userLat, userLng, mLat, mLng);
          const city = f.properties?.city || f.properties?.locality || f.properties?.district || 'Area';
          const street = f.properties?.street || '';
          const fullAddr = [street, city, f.properties?.state].filter(Boolean).join(', ') || rawName;

          results.push({
            id: `search_pho_${f.properties?.osm_id || Math.random().toString(36).slice(2, 9)}`,
            name: rawName,
            arabicName: 'مسجد',
            address: fullAddr,
            city,
            distanceKm: dist,
            facilities: ['Daily Prayers', 'Friday Jummah', 'Wudu Area'],
            lat: mLat,
            lng: mLng,
            hasWomenSection: true,
            verified: true,
            osmUrl: f.properties?.osm_id ? `https://www.openstreetmap.org/node/${f.properties?.osm_id}` : undefined,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Live search Photon notice:', err);
  }

  // 2. Search Nominatim by query
  try {
    const nUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQ + ' masjid')}&format=json&addressdetails=1&limit=20`;
    const res = await fetch(nUrl, {
      headers: { 'User-Agent': 'NoorIslamicApp/2.0' },
      signal: AbortSignal.timeout(4500),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          const mLat = parseFloat(item.lat);
          const mLng = parseFloat(item.lon);
          if (isNaN(mLat) || isNaN(mLng)) continue;

          const rawName = item.name || item.display_name?.split(',')[0]?.trim() || 'Masjid';
          if (isDuplicate(mLat, mLng, rawName)) continue;

          const dist = calculateDistanceKm(userLat, userLng, mLat, mLng);
          const city = item.address?.city || item.address?.town || item.address?.suburb || 'Area';

          results.push({
            id: `search_nom_${item.place_id || Math.random().toString(36).slice(2, 9)}`,
            name: rawName,
            arabicName: 'مسجد',
            address: item.display_name || `${rawName}, ${city}`,
            city,
            distanceKm: dist,
            facilities: ['Daily Prayers', 'Friday Jummah', 'Wudu Area'],
            lat: mLat,
            lng: mLng,
            hasWomenSection: true,
            verified: true,
            osmUrl: item.osm_id ? `https://www.openstreetmap.org/node/${item.osm_id}` : undefined,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Live search Nominatim notice:', err);
  }

  results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results;
}
