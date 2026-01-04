import { useState } from 'react';
import { MapPin, Loader2, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { geocodeLocationWithFallback } from '@/services/geocoding'; // ✨ NOWE

interface LocationFilterProps {
  onLocationChange: (location: LocationData | null) => void;
}

export interface LocationData {
  city?: string;
  latitude?: number;
  longitude?: number;
  radius: number;
}

const RADIUS_OPTIONS = [10, 25, 50, 100, 200];

export function LocationFilter({ onLocationChange }: LocationFilterProps) {
  const [cityInput, setCityInput] = useState<string>(''); // ✨ Zmiana: input zamiast select
  const [radius, setRadius] = useState<number>(50);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingGeocode, setLoadingGeocode] = useState(false); // ✨ NOWE
  const [locationError, setLocationError] = useState<string>('');
  const [activeLocation, setActiveLocation] = useState<{
    city?: string;
    latitude: number;
    longitude: number;
    displayName?: string;
  } | null>(null);

  // ✨ NOWA FUNKCJA - Geocoduj wpisane miasto
  const handleCitySearch = async () => {
    if (!cityInput || cityInput.trim().length === 0) {
      setLocationError('Wpisz nazwę miejscowości');
      return;
    }

    setLoadingGeocode(true);
    setLocationError('');

    try {
      const result = await geocodeLocationWithFallback(cityInput);

      if (result) {
        setActiveLocation({
          city: cityInput,
          latitude: result.latitude,
          longitude: result.longitude,
          displayName: result.displayName,
        });

        onLocationChange({
          city: cityInput,
          latitude: result.latitude,
          longitude: result.longitude,
          radius,
        });

        setLocationError('');
      } else {
        setLocationError('Nie znaleziono tej lokalizacji. Spróbuj wpisać inaczej.');
        setActiveLocation(null);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationError('Wystąpił błąd podczas wyszukiwania lokalizacji.');
      setActiveLocation(null);
    } finally {
      setLoadingGeocode(false);
    }
  };

  // ✨ NOWA FUNKCJA - Obsługa Enter w input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCitySearch();
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    
    if (activeLocation) {
      onLocationChange({
        city: activeLocation.city,
        latitude: activeLocation.latitude,
        longitude: activeLocation.longitude,
        radius: newRadius,
      });
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Twoja przeglądarka nie obsługuje geolokalizacji');
      return;
    }

    setLoadingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoadingLocation(false);
        setCityInput(''); // Wyczyść input
        
        setActiveLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        onLocationChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radius,
        });
      },
      (error) => {
        setLoadingLocation(false);
        
        let errorMessage = 'Nie udało się pobrać lokalizacji';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Odmówiono dostępu do lokalizacji. Włącz geolokalizację w ustawieniach przeglądarki.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informacje o lokalizacji są niedostępne.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Przekroczono limit czasu pobierania lokalizacji.';
            break;
        }
        
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleClear = () => {
    setCityInput('');
    setRadius(50);
    setLocationError('');
    setActiveLocation(null);
    onLocationChange(null);
  };

  return (
    <div className="space-y-4">
      {/* Nagłówek */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Filtruj po lokalizacji
        </h3>
        {activeLocation && (
          <button
            onClick={handleClear}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Wyczyść
          </button>
        )}
      </div>

      {/* Przycisk geolokalizacji */}
      <div>
        <Button
          onClick={handleUseMyLocation}
          disabled={loadingLocation}
          variant="outline"
          className="w-full justify-center"
        >
          {loadingLocation ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Pobieranie lokalizacji...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              Użyj mojej lokalizacji
            </>
          )}
        </Button>
        
        {locationError && (
          <p className="mt-2 text-xs text-red-600">{locationError}</p>
        )}
      </div>

      {/* Separator */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">lub wpisz miasto</span>
        </div>
      </div>

      {/* ✨ NOWY INPUT - Wpisywanie miasta zamiast dropdown */}
      <div>
        <label htmlFor="city-input" className="block text-sm font-medium text-gray-700 mb-2">
          Miejscowość
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="city-input"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="np. Warszawa, Lublin, Gdańsk..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            onClick={handleCitySearch}
            disabled={loadingGeocode || !cityInput}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loadingGeocode ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Szukaj'
            )}
          </Button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Wpisz miasto i kliknij "Szukaj" lub naciśnij Enter
        </p>
      </div>

      {/* Komunikat o znalezionej lokalizacji */}
      {activeLocation && activeLocation.displayName && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✓ Znaleziono: {activeLocation.displayName}
          </p>
        </div>
      )}

      {/* Wybór promienia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Promień: {radius} km
        </label>
        
        {/* Przyciski szybkiego wyboru */}
        <div className="flex flex-wrap gap-2 mb-3">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => handleRadiusChange(r)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                radius === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
        
        {/* Suwak */}
        <input
          type="range"
          min="5"
          max="200"
          step="5"
          value={radius}
          onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 km</span>
          <span>200 km</span>
        </div>
      </div>

      {/* Informacja o aktywnym filtrze */}
      {activeLocation && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            ✓ Szukasz w promieniu <strong>{radius} km</strong> od{' '}
            <strong>{activeLocation.city || 'Twojej lokalizacji'}</strong>
          </p>
        </div>
      )}
    </div>
  );
}