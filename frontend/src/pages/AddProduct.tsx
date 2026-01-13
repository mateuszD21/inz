import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Upload, X, MapPin, Loader2 } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';
import { geocodeLocationWithFallback } from '../services/geocoding';

const categories = [
  'Elektronika',
  'Moda',
  'Dom i Ogród',
  'Sport',
  'Motoryzacja',
  'Książki',
  'Zdrowie i Uroda',
  'Dzieci',
  'Inne',
];

const conditions = [
  'Nowy',
  'Jak nowy',
  'Bardzo dobry',
  'Dobry',
  'Zadowalający'
];

export function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      alert('Możesz dodać maksymalnie 10 zdjęć');
      return;
    }

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({ ...prev, latitude, longitude }));

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const location =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county ||
            'Nieznana lokalizacja';
          setFormData((prev) => ({ ...prev, location }));
        } catch (error) {
          console.error('Błąd podczas pobierania lokalizacji:', error);
          setFormData((prev) => ({ ...prev, location: 'Nieznana lokalizacja' }));
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Błąd geolokalizacji:', error);
        alert('Nie udało się pobrać lokalizacji');
        setLoadingLocation(false);
      }
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Tytuł jest wymagany';
    if (!formData.description.trim()) newErrors.description = 'Opis jest wymagany';
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = 'Podaj prawidłową cenę';
    if (!formData.category) newErrors.category = 'Wybierz kategorię';
    if (!formData.condition) newErrors.condition = 'Wybierz stan';
    if (!formData.location.trim()) newErrors.location = 'Lokalizacja jest wymagana';
    if (images.length === 0) newErrors.images = 'Dodaj przynajmniej jedno zdjęcie';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // konwertuje lokalizacje na wspolrzedne 
    console.log('Geocoding lokalizacji:', formData.location);
    setLoadingLocation(true);
    
    const geocoded = await geocodeLocationWithFallback(formData.location);
    
    let latitude = formData.latitude;
    let longitude = formData.longitude;
    
    if (geocoded) {
      latitude = geocoded.latitude;
      longitude = geocoded.longitude;
      console.log('✅ Geocoding success:', { latitude, longitude });
    } else {
      console.warn('⚠️ Geocoding failed - produkt bez współrzędnych GPS');
    }
    
    // Zaktualizuj formData o współrzędne
    setFormData(prev => ({ ...prev, latitude, longitude }));
    setLoadingLocation(false);

    // Otwórz modal płatności
    setShowPaymentModal(true);
  };

  // Bezpośrednie przekierowanie na stronę główną bez alertu
  const handlePaymentSuccess = (productId: number) => {
    navigate('/');
  };

  // Dane produktu do przekazania do PaymentModal
  const productDataForPayment = {
    title: formData.title,
    description: formData.description,
    price: parseFloat(formData.price),
    category: formData.category,
    condition: formData.condition,
    location: formData.location,
    latitude: formData.latitude,
    longitude: formData.longitude,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Dodaj ogłoszenie</h1>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💳 <strong>Opłata za dodanie ogłoszenia: 10 zł</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Po wypełnieniu formularza przejdziesz do bezpiecznej płatności przez Stripe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tytuł */}
            <div>
              <Label htmlFor="title">Tytuł ogłoszenia *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="np. iPhone 13 Pro Max"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Opis */}
            <div>
              <Label htmlFor="description">Opis *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Opisz swój przedmiot..."
                rows={6}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Cena */}
            <div>
              <Label htmlFor="price">Cena (zł) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
            </div>

            {/* Kategoria i Stan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <Label htmlFor="condition">Stan *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => handleInputChange('condition', value)}
                >
                  <SelectTrigger className={errors.condition ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Wybierz stan" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {cond}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <p className="text-sm text-red-500 mt-1">{errors.condition}</p>
                )}
              </div>
            </div>

            {/* Lokalizacja */}
            <div>
              <Label htmlFor="location">Lokalizacja *</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Wpisz lokalizację"
                  className={errors.location ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Wpisz miasto (np. Warszawa, Lublin) - zostanie automatycznie skonwertowane na współrzędne GPS
              </p>
            </div>

            {/* Zdjęcia */}
            <div>
              <Label>Zdjęcia * (maksymalnie 10)</Label>
              <div className="mt-2">
                <label
                  htmlFor="images"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition ${
                    errors.images ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Kliknij aby dodać zdjęcia lub przeciągnij je tutaj
                    </p>
                  </div>
                  <input
                    id="images"
                    type="file"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
                {errors.images && <p className="text-sm text-red-500 mt-1">{errors.images}</p>}
              </div>

              {/* Podgląd zdjęć */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Przyciski */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Anuluj
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={loadingLocation}
              >
                {loadingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Pobieranie lokalizacji...
                  </>
                ) : (
                  'Przejdź do płatności (10 zł)'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal płatności z przekazanymi zdjęciami */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        productData={productDataForPayment}
        images={images}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}