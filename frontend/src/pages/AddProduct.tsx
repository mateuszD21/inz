import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, X, Image as ImageIcon, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { productApi } from '@/services/api';

export function AddProduct() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    images: [] as string[],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const categories = [
    'Elektronika',
    'Moda',
    'Dom i Ogród',
    'Sport',
    'Książki',
    'Zabawki',
    'Motoryzacja',
    'Zwierzęta',
  ];

  const conditions = [
    'Nowy',
    'Jak nowy',
    'Bardzo dobry',
    'Dobry',
    'Zadowalający',
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/logowanie', { state: { from: { pathname: '/dodaj' } } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 10) {
      setError('Możesz dodać maksymalnie 10 zdjęć');
      return;
    }
    setImageFiles([...imageFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:3000/api/upload/image', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) throw new Error('Błąd uploadu');

        const data = await response.json();
        uploadedUrls.push(`http://localhost:3000${data.url}`);
      }

      return uploadedUrls;
    } catch (error) {
      console.error('Błąd uploadu zdjęć:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Walidacja
    if (parseFloat(formData.price) <= 0) {
      setError('Cena musi być większa niż 0');
      return;
    }

    if (!formData.category) {
      setError('Wybierz kategorię');
      return;
    }

    if (!formData.condition) {
      setError('Wybierz stan produktu');
      return;
    }

    console.log('=== SUBMITTING PRODUCT ===');
    console.log('Form data:', formData);
    console.log('Image files:', imageFiles);
    console.log('Token:', localStorage.getItem('token'));

    setLoading(true);

    try {
      // Upload zdjęć jeśli są
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        console.log('Uploading images...');
        uploadedImageUrls = await uploadImages();
        console.log('Uploaded URLs:', uploadedImageUrls);
      }
      
      const productData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        images: uploadedImageUrls,
      };

      console.log('Sending product data:', productData);
      
      const response = await productApi.create(productData);
      console.log('Response:', response);

      setSuccess('Ogłoszenie zostało dodane!');
      setTimeout(() => {
        navigate(`/produkt/${response.data.id}`);
      }, 1500);
    } catch (err: any) {
      console.error('ERROR:', err);
      console.error('Response:', err.response);
      setError(err.response?.data?.error || 'Błąd dodawania ogłoszenia');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dodaj ogłoszenie</h1>
          <p className="text-gray-600 mt-2">
            Wypełnij formularz, aby dodać nowe ogłoszenie
          </p>
        </div>

        {/* Formularz */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span className="text-xl">✅</span>
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span className="text-xl">❌</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informacja */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Wskazówki</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Dodaj szczegółowy opis - zwiększ szanse na sprzedaż</li>
                <li>• Dodaj kilka zdjęć z różnych perspektyw</li>
                <li>• Ustaw uczciwą cenę</li>
                <li>• Podaj dokładną lokalizację</li>
              </ul>
            </div>

            {/* Tytuł */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tytuł ogłoszenia *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="np. iPhone 14 Pro - stan idealny"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100 znaków
              </p>
            </div>

            {/* Kategoria i Stan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoria *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Wybierz kategorię</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Stan *
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Wybierz stan</option>
                  {conditions.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Opis */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Opis *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={8}
                maxLength={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Opisz szczegółowo swój produkt:
- Stan i wiek produktu
- Ewentualne ślady użytkowania
- Co zawiera zestaw
- Powód sprzedaży
- Dodatkowe informacje"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/1000 znaków
              </p>
            </div>

            {/* Cena i Lokalizacja */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Cena (zł) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Podaj cenę w złotych polskich
                </p>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Lokalizacja *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="np. Warszawa, Mokotów"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Miasto i dzielnica
                </p>
              </div>
            </div>

            {/* Zdjęcia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zdjęcia produktu
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Dodaj zdjęcia z komputera. Możesz dodać maksymalnie 10 zdjęć (max 5MB każde).
              </p>

              {/* Input do wyboru plików */}
              <div className="mb-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Kliknij aby wybrać</span> lub przeciągnij pliki
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP (max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    disabled={imageFiles.length >= 10}
                  />
                </label>
              </div>

              {/* Podgląd wybranych plików */}
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Regulamin */}
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Akceptuję{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  regulamin serwisu
                </a>{' '}
                i potwierdzam, że ogłoszenie jest zgodne z prawem
              </label>
            </div>

            {/* Przyciski */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={loading || uploadingImages}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {uploadingImages ? 'Przesyłanie zdjęć...' : loading ? 'Dodawanie...' : 'Dodaj ogłoszenie'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="px-8"
              >
                Anuluj
              </Button>
            </div>
          </form>
        </div>

        {/* Dodatkowe informacje */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-3">📋 Co dalej?</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li>1. Po dodaniu ogłoszenia zostanie ono opublikowane natychmiast</li>
            <li>2. Możesz je edytować lub usunąć w zakładce "Moje ogłoszenia"</li>
            <li>3. Kupujący będą mogli skontaktować się z Tobą przez formularz</li>
            <li>4. Pamiętaj o bezpiecznych transakcjach - spotkaj się w publicznym miejscu</li>
          </ol>
        </div>
      </div>
    </div>
  );
}