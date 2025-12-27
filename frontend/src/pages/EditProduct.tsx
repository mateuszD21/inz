import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save, X, Image as ImageIcon } from 'lucide-react';
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
    images: [''],
  });

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

      // Sprawdź czy użytkownik jest właścicielem
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
        images: product.images.length > 0 ? product.images : [''],
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

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, ''],
    });
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: newImages.length > 0 ? newImages : [''],
    });
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
      const filteredImages = formData.images.filter(img => img.trim() !== '');
      
      await productApi.update(parseInt(id!), {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        images: filteredImages,
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                rows={6}
                maxLength={1000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Lokalizacja *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="np. Warszawa, Mokotów"
                />
              </div>
            </div>

            {/* Zdjęcia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zdjęcia (URL)
              </label>
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.images.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeImageField(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addImageField}
                className="mt-2"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Dodaj kolejne zdjęcie
              </Button>
              <p className="mt-1 text-xs text-gray-500">
                Możesz użyć linków do zdjęć z Unsplash, Imgur itp.
              </p>
            </div>

            {/* Przyciski */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/moje-ogloszenia')}
                className="flex-1"
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