import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ui/ProductCard';
import { productApi } from '@/services/api';
import { Product } from '@/types';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Elektronika", icon: "📱", count: 0 },
    { name: "Moda", icon: "👕", count: 0 },
    { name: "Dom i Ogród", icon: "🏡", count: 0 },
    { name: "Sport", icon: "⚽", count: 0 },
    { name: "Książki", icon: "📚", count: 0 },
    { name: "Zabawki", icon: "🧸", count: 0 },
    { name: "Motoryzacja", icon: "🚗", count: 0 },
    { name: "Zwierzęta", icon: "🐾", count: 0 }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Błąd pobierania produktów:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat?: number, lon?: number) => {
    if (!lat || !lon) return 'Brak lokalizacji';
    // Przykładowe obliczenie - możesz użyć prawdziwej lokalizacji użytkownika
    const distance = Math.floor(Math.random() * 10) + 1;
    return `${distance} km`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Kupuj i sprzedawaj lokalnie
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Wspieraj lokalną społeczność. Znajdź to, czego szukasz w swojej okolicy.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg p-2 flex flex-col md:flex-row gap-2 shadow-xl">
              <div className="flex-1 flex items-center gap-2 px-3 bg-gray-50 rounded">
                <Search className="h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Czego szukasz?" 
                  className="flex-1 bg-transparent border-none outline-none py-3 text-gray-900"
                />
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 bg-gray-50 rounded">
                <MapPin className="h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Twoja lokalizacja" 
                  className="flex-1 bg-transparent border-none outline-none py-3 text-gray-900"
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Szukaj
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Przeglądaj kategorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <button 
                key={index}
                className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition group"
              >
                <span className="text-4xl">{category.icon}</span>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                    {category.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Polecane oferty w Twojej okolicy
            </h2>
            <Link to="/produkty">
              <Button variant="outline">Zobacz wszystkie</Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Ładowanie produktów...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Brak produktów do wyświetlenia</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  price={`${product.price} zł`}
                  location={product.location}
                  image={product.images[0] || 'https://via.placeholder.com/400x300'}
                  distance={calculateDistance(product.latitude, product.longitude)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Gotowy do sprzedaży?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Dodaj ogłoszenie za darmo i dotrzij do kupujących w Twojej okolicy
          </p>
          <Link to="/dodaj">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
              Dodaj ogłoszenie teraz
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}