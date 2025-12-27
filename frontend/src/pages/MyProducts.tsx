import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { productApi } from '@/services/api';
import { Product } from '@/types';

export function MyProducts() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/logowanie');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMyProducts();
    }
  }, [user]);

  const fetchMyProducts = async () => {
    try {
      const response = await productApi.getMyProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Błąd pobierania ogłoszeń:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to ogłoszenie?')) {
      return;
    }

    try {
      await productApi.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Błąd usuwania ogłoszenia:', error);
      alert('Nie udało się usunąć ogłoszenia');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moje ogłoszenia</h1>
            <p className="text-gray-600 mt-2">
              Zarządzaj swoimi ogłoszeniami ({products.length})
            </p>
          </div>
          <Link to="/dodaj">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Dodaj ogłoszenie
            </Button>
          </Link>
        </div>

        {/* Lista ogłoszeń */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nie masz jeszcze żadnych ogłoszeń
            </h2>
            <p className="text-gray-600 mb-6">
              Dodaj swoje pierwsze ogłoszenie i zacznij sprzedawać!
            </p>
            <Link to="/dodaj">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Dodaj ogłoszenie
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Zdjęcie */}
                  <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/400x300'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Treść */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {product.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              product.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {product.status === 'active' ? 'Aktywne' : 'Nieaktywne'}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {product.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>📍 {product.location}</span>
                          <span>📦 {product.category}</span>
                          <span>⭐ {product.condition}</span>
                          <span>📅 {formatDate(product.createdAt)}</span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-3xl font-bold text-blue-600">
                          {product.price} zł
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Akcje */}
                  <div className="border-t md:border-t-0 md:border-l border-gray-200 p-4 md:w-48 flex md:flex-col gap-2">
                    <Link to={`/produkt/${product.id}`} className="flex-1 md:flex-none">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Podgląd
                      </Button>
                    </Link>
                    <Link to={`/edytuj/${product.id}`} className="flex-1 md:flex-none">
                      <Button variant="outline" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edytuj
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Usuń
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Statystyki */}
        {products.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Aktywne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👁️</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Wyświetlenia</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Łączna wartość</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.reduce((sum, p) => sum + p.price, 0)} zł
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}