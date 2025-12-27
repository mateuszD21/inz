import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ui/ProductCard';
import { productApi } from '@/services/api';
import { Product } from '@/types';

export function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtry
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { name: "Wszystkie", value: "" },
    { name: "Elektronika", value: "Elektronika" },
    { name: "Moda", value: "Moda" },
    { name: "Dom i Ogród", value: "Dom i Ogród" },
    { name: "Sport", value: "Sport" },
    { name: "Książki", value: "Książki" },
    { name: "Zabawki", value: "Zabawki" },
    { name: "Motoryzacja", value: "Motoryzacja" },
    { name: "Zwierzęta", value: "Zwierzęta" }
  ];

  const conditions = [
    { name: "Wszystkie", value: "" },
    { name: "Nowy", value: "Nowy" },
    { name: "Jak nowy", value: "Jak nowy" },
    { name: "Bardzo dobry", value: "Bardzo dobry" },
    { name: "Dobry", value: "Dobry" },
    { name: "Zadowalający", value: "Zadowalający" }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, locationQuery, selectedCategory, selectedCondition, priceRange]);

  useEffect(() => {
    // Sync with URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    setSearchParams(params);
  }, [searchQuery, locationQuery, selectedCategory]);

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

  const filterProducts = () => {
    let filtered = [...products];

    // Filtrowanie po nazwie/opisie
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Filtrowanie po lokalizacji
    if (locationQuery) {
      const location = locationQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.location.toLowerCase().includes(location)
      );
    }

    // Filtrowanie po kategorii
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Filtrowanie po stanie
    if (selectedCondition) {
      filtered = filtered.filter(
        (product) => product.condition === selectedCondition
      );
    }

    // Filtrowanie po cenie
    filtered = filtered.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterProducts();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setSelectedCategory('');
    setSelectedCondition('');
    setPriceRange([0, 20000]);
    setSearchParams(new URLSearchParams());
  };

  const calculateDistance = (lat?: number, lon?: number) => {
    if (!lat || !lon) return 'Brak lokalizacji';
    const distance = Math.floor(Math.random() * 10) + 1;
    return `${distance} km`;
  };

  const activeFiltersCount = [
    searchQuery,
    locationQuery,
    selectedCategory,
    selectedCondition,
    priceRange[0] > 0 || priceRange[1] < 20000
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header z wyszukiwaniem */}
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="space-y-3">
            {/* Główne wyszukiwanie */}
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Czego szukasz? (np. iPhone, rower, sofa...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-gray-900"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <MapPin className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Lokalizacja (np. Mokotów, Śródmieście...)"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-gray-900"
                />
                {locationQuery && (
                  <button
                    type="button"
                    onClick={() => setLocationQuery('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filtry
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Kategorie - szybki wybór */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === category.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </form>

          {/* Rozwinięte filtry */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stan produktu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stan
                  </label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {conditions.map((condition) => (
                      <option key={condition.value} value={condition.value}>
                        {condition.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zakres cen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cena: {priceRange[0]} zł - {priceRange[1]} zł
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Od"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Do"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 20000])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Przyciski akcji */}
                <div className="flex items-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="flex-1"
                  >
                    Wyczyść
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Zastosuj
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wyniki */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info o wynikach */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedCategory || 'Wszystkie ogłoszenia'}
            </h1>
            <p className="text-gray-600 mt-1">
              Znaleziono {filteredProducts.length} {filteredProducts.length === 1 ? 'ogłoszenie' : 'ogłoszeń'}
            </p>
          </div>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-700"
            >
              <X className="h-4 w-4 mr-2" />
              Wyczyść wszystkie filtry
            </Button>
          )}
        </div>

        {/* Aktywne filtry */}
        {(searchQuery || locationQuery || selectedCategory) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {searchQuery && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                <span>Szukasz: "{searchQuery}"</span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-blue-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {locationQuery && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                <MapPin className="h-3 w-3" />
                <span>{locationQuery}</span>
                <button
                  onClick={() => setLocationQuery('')}
                  className="hover:text-blue-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {selectedCategory && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                <span>{selectedCategory}</span>
                <button
                  onClick={() => setSelectedCategory('')}
                  className="hover:text-blue-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Lista produktów */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Ładowanie produktów...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nie znaleziono ogłoszeń
            </h2>
            <p className="text-gray-600 mb-6">
              Spróbuj zmienić kryteria wyszukiwania lub usuń niektóre filtry
            </p>
            <Button onClick={clearFilters} variant="outline">
              Wyczyść filtry
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
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
    </div>
  );
}