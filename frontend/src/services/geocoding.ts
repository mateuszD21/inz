interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  importance: number;
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}


export async function geocodeLocation(location: string): Promise<GeocodingResult | null> {
  if (!location || location.trim().length === 0) {
    return null;
  }

  try {
    const query = location.includes('Poland') ? location : `${location}, Poland`;
    
    // Nominatim API endpoint
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json` +
      `&limit=1` +
      `&addressdetails=1`;

    console.log(' Geocoding request:', query);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LokalMarket-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NominatimResult[] = await response.json();

    if (data.length === 0) {
      console.warn(' Nie znaleziono lokalizacji dla:', location);
      return null;
    }

    const result = data[0];
    
    console.log(' Geocoding success:', {
      location,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
    });

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
    };
  } catch (error) {
    console.error(' Geocoding error:', error);
    return null;
  }
}

/* fallback */
const POLISH_CITIES_FALLBACK = [
  { name: 'Warszawa', lat: 52.2297, lon: 21.0122 },
  { name: 'Kraków', lat: 50.0647, lon: 19.9450 },
  { name: 'Łódź', lat: 51.7592, lon: 19.4560 },
  { name: 'Wrocław', lat: 51.1079, lon: 17.0385 },
  { name: 'Poznań', lat: 52.4064, lon: 16.9252 },
  { name: 'Gdańsk', lat: 54.3520, lon: 18.6466 },
  { name: 'Szczecin', lat: 53.4285, lon: 14.5528 },
  { name: 'Bydgoszcz', lat: 53.1235, lon: 18.0084 },
  { name: 'Lublin', lat: 51.2465, lon: 22.5684 },
  { name: 'Katowice', lat: 50.2649, lon: 19.0238 },
  { name: 'Białystok', lat: 53.1325, lon: 23.1688 },
  { name: 'Gdynia', lat: 54.5189, lon: 18.5305 },
  { name: 'Częstochowa', lat: 50.8118, lon: 19.1203 },
  { name: 'Radom', lat: 51.4027, lon: 21.1471 },
  { name: 'Sosnowiec', lat: 50.2862, lon: 19.1040 },
  { name: 'Toruń', lat: 53.0138, lon: 18.5984 },
  { name: 'Kielce', lat: 50.8661, lon: 20.6286 },
  { name: 'Rzeszów', lat: 50.0412, lon: 21.9991 },
  { name: 'Gliwice', lat: 50.2945, lon: 18.6714 },
  { name: 'Zabrze', lat: 50.3249, lon: 18.7855 },
];


export async function geocodeLocationWithFallback(location: string): Promise<GeocodingResult | null> {
  // Najpierw spróbuj Nominatim
  const result = await geocodeLocation(location);
  
  if (result) {
    return result;
  }

  // Fallback: szukaj w lokalnej liście
  console.log(' Fallback: Szukam w lokalnej liście miast...');
  
  const normalizedLocation = location.toLowerCase().trim();
  const city = POLISH_CITIES_FALLBACK.find(
    c => c.name.toLowerCase() === normalizedLocation
  );

  if (city) {
    console.log(' Znaleziono w lokalnej liście:', city.name);
    return {
      latitude: city.lat,
      longitude: city.lon,
      displayName: `${city.name}, Polska`,
    };
  }

  console.warn(' Nie znaleziono lokalizacji nigdzie:', location);
  return null;
}