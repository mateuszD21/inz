import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Shield, Clock, Users, Package, TrendingUp, Heart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ui/ProductCard';
import { productApi } from '@/services/api';
import { Product } from '@/types';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const navigate = useNavigate();

  const categories = [
    { name: "Elektronika", icon: "📱" },
    { name: "Moda", icon: "👕" },
    { name: "Dom i Ogród", icon: "🏡" },
    { name: "Sport", icon: "⚽" },
    { name: "Książki", icon: "📚" },
    { name: "Zabawki", icon: "🧸" },
    { name: "Motoryzacja", icon: "🚗" },
    { name: "Zwierzęta", icon: "🐾" }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productApi.getAll();
      const activeProducts = response.data.filter((product: Product) => product.status === 'active');
      setProducts(activeProducts.slice(0, 6));
    } catch (error) {
      console.error('Błąd pobierania produktów:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    navigate(`/produkty?${params.toString()}`);
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/produkty?category=${encodeURIComponent(categoryName)}`);
  };

  const calculateDistance = (lat?: number, lon?: number) => {
    if (!lat || !lon) return '';
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
            <form onSubmit={handleSearch} className="bg-white rounded-lg p-2 flex flex-col md:flex-row gap-2 shadow-xl">
              <div className="flex-1 flex items-center gap-2 px-3 bg-gray-50 rounded">
                <Search className="h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Czego szukasz?" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none py-3 text-gray-900"
                />
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 bg-gray-50 rounded">
                <MapPin className="h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Twoja lokalizacja" 
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none py-3 text-gray-900"
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Szukaj
              </Button>
            </form>
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
                onClick={() => handleCategoryClick(category.name)}
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

      {/* Latest Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Najnowsze oferty
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
      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Dlaczego warto wybrać nas?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Bezpieczeństwo</h3>
              <p className="text-gray-600">
                System weryfikacji użytkowników i bezpieczne transakcje
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lokalne ogłoszenia</h3>
              <p className="text-gray-600">
                Znajdź produkty w swojej okolicy i oszczędź na dostawie
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Szybko i łatwo</h3>
              <p className="text-gray-600">
                Dodaj ogłoszenie w mniej niż minutę
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* sekcja jak to działa */}
      <section id="jak-dziala" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Jak to działa?
            </h2>
            <p className="text-xl text-gray-600">
              Proste kroki do udanej transakcji
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Zarejestruj się
              </h3>
              <p className="text-gray-600">
                Stwórz darmowe konto w kilka sekund
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Dodaj ogłoszenie
              </h3>
              <p className="text-gray-600">
                Wypełnij formularz i dodaj zdjęcia swojego produktu
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Kontakt z kupującym
              </h3>
              <p className="text-gray-600">
                Odpowiadaj na wiadomości i negocjuj cenę
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sprzedaj!
              </h3>
              <p className="text-gray-600">
                Spotkaj się z kupującym i sfinalizuj transakcję
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/rejestracja">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Zacznij teraz
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/*sekcja o nas */}
      <section id="o-nas" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Lewa strona - Tekst */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                O nas
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Jesteśmy platformą lokalnych ogłoszeń, która łączy sprzedających z kupującymi w całej Polsce. 
                Nasza misja to ułatwienie bezpiecznych i wygodnych transakcji między sąsiadami.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Od 2024 roku pomagamy tysiącom użytkowników znaleźć to, czego szukają - od mebli, 
                przez elektronikę, aż po pojazdy i nieruchomości.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Bezpieczeństwo przede wszystkim</h4>
                    <p className="text-gray-600">System weryfikacji i ocen użytkowników</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Lokalna społeczność</h4>
                    <p className="text-gray-600">Wspieramy handel lokalny i redukcję kosztów dostawy</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Prosta obsługa</h4>
                    <p className="text-gray-600">Intuicyjny interfejs dostępny na wszystkich urządzeniach</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prawa strona - Statystyki */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg shadow-md p-6 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-2">1000+</div>
                <div className="text-gray-600">Aktywnych użytkowników</div>
              </div>
              <div className="bg-gray-50 rounded-lg shadow-md p-6 text-center">
                <Package className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-2">5000+</div>
                <div className="text-gray-600">Ogłoszeń</div>
              </div>
              <div className="bg-gray-50 rounded-lg shadow-md p-6 text-center">
                <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-2">3000+</div>
                <div className="text-gray-600">Transakcji</div>
              </div>
              <div className="bg-gray-50 rounded-lg shadow-md p-6 text-center">
                <Heart className="h-12 w-12 text-red-600 mx-auto mb-3" />
                <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-gray-600">Zadowolenia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Gotowy do sprzedaży?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Dodaj ogłoszenie za darmo i dotrzej do kupujących w Twojej okolicy
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