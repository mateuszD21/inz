import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, X, Image as ImageIcon, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { productApi } from '@/services/api';

export function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      navigate('/logowanie');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchProduct();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const response = await productApi.getById(parseInt(id!));
      const product = response.data;

      // sprawdzanie czy uzytkownik jest wlascielem ogloszenia
      if (product.userId !== user?.id) {
        navigate('/moje-ogloszenia');
        return;
      }

      setFormData({
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        condition: product.condition,
        location: product.location,
        images: product.images.length > 0 ? product.images : [],
      });
    } catch (error) {
      console.error('Błąd pobierania produktu:', error);
      setError('Nie udało się pobrać danych produktu');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length + formData.images.length > 10) {
      setError('Możesz dodać maksymalnie 10 zdjęć');
      return;
    }
    setImageFiles([...imageFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const uploadImages = async () => {
  if (imageFiles.length === 0) return [];

  setUploadingImages(true);

  try {
    const uploadFormData = new FormData();
    imageFiles.forEach((file) => {
      uploadFormData.append('images', file);
    });

    const response = await fetch('http://localhost:3000/api/upload/images', {
      method: 'POST',
      body: uploadFormData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) throw new Error('Błąd uploadu');

    const data = await response.json();
    return data.urls.map((url: string) => `http://localhost:3000${url}`);
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
    setSaving(true);

    // Walidacja
    if (parseFloat(formData.price) <= 0) {
      setError('Cena musi być większa niż 0');
      setSaving(false);
      return;
    }

    try {
      // Upload nowych zdjęć jeśli są
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await uploadImages();
      }
      
      // Połącz istniejące zdjęcia z nowo uploadowanymi
      const allImages = [...formData.images, ...uploadedImageUrls];

      await productApi.update(parseInt(id!), {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        images: allImages,
      });

      setSuccess('Ogłoszenie zostało zaktualizowane!');
      setTimeout(() => {
        navigate('/moje-ogloszenia');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Błąd aktualizacji ogłoszenia');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Edytuj ogłoszenie</h1>
          <p className="text-gray-600 mt-2">Zaktualizuj informacje o swoim produkcie</p>
        </div>

        {/* Formularz */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="Opisz szczegółowo swój produkt..."
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
              </div>
            </div>

            {/* Zdjęcia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zdjęcia produktu
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Dodaj zdjęcia z komputera. Możesz mieć maksymalnie 10 zdjęć (max 5MB każde).
              </p>

              {/* Istniejące zdjęcia */}
              {formData.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Obecne zdjęcia:</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Zdjęcie ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nowe pliki do uploadu */}
              {imageFiles.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Nowe zdjęcia do dodania:</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Nowe ${index + 1}`}
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
                </div>
              )}

              {/* Input do wyboru nowych plików - Z DRAG & DROP */}
              {(formData.images.length + imageFiles.length) < 10 && (
                <div>
                  <label
                    onDrop={(e) => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files);
                      if (files.length + imageFiles.length + formData.images.length > 10) {
                        setError('Możesz dodać maksymalnie 10 zdjęć');
                        return;
                      }
                      setImageFiles([...imageFiles, ...files as File[]]);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                  >
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
                      disabled={(formData.images.length + imageFiles.length) >= 10}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Przyciski */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={saving || uploadingImages}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 text-lg"
              >
                <Save className="h-5 w-5 mr-2" />
                {uploadingImages ? 'Przesyłanie zdjęć...' : saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/moje-ogloszenia')}
                className="px-8"
              >
                Anuluj
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}