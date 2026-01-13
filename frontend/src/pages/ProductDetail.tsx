import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, Share2, ChevronLeft, ChevronRight, Phone, Mail, MessageCircle, Clock, Shield, ShoppingCart, CheckCircle, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { productApi, transactionApi, reviewApi } from '../services/api';
import { Product } from '../types';
import { useAuth } from '../contexts/AuthContext';

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const [sellerReviews, setSellerReviews] = useState<any[]>([]);
  const [sellerStats, setSellerStats] = useState({
    totalReviews: 0,
    averageRating: 0,
  });
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  const [buyingInProgress, setBuyingInProgress] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyError, setBuyError] = useState('');

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const response = await productApi.getById(productId);
      const productData = response.data;
      setProduct(productData);
      
      await fetchSellerReviews(productData.user.id);
    } catch (error) {
      console.error('Błąd pobierania produktu:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerReviews = async (sellerId: number) => {
    try {
      // Pobierz statystyki
      const statsResponse = await reviewApi.getUserReviewStats(sellerId);
      setSellerStats(statsResponse.data);
      
      // Pobierz opinie
      const reviewsResponse = await reviewApi.getUserReviews(sellerId);
      setSellerReviews(reviewsResponse.data.reviews);
    } catch (error) {
      console.error('Błąd pobierania opinii:', error);
    }
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link skopiowany do schowka!');
    }
  };

  const handleBuyProduct = async () => {
    if (!isAuthenticated) {
      alert('Musisz być zalogowany żeby kupić produkt');
      return;
    }

    if (!product) return;

 
    if (user?.id === product.user.id) {
      alert('Nie możesz kupić własnego produktu!');
      return;
    }

    setBuyingInProgress(true);
    setBuyError('');

    try {
      const response = await transactionApi.create(
        product.id,
        `Cześć! Jestem zainteresowany produktem "${product.title}". Chciałbym go kupić.`
      );

      console.log('Transaction created:', response.data);
      
      setBuySuccess(true);
      
      setTimeout(() => {
        setBuySuccess(false);
      }, 3000);

    } catch (error: any) {
      console.error('Błąd kupna:', error);
      setBuyError(error.response?.data?.error || 'Nie udało się rozpocząć transakcji');
    } finally {
      setBuyingInProgress(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl text-gray-600 mb-4">Produkt nie został znaleziony</p>
        <Link to="/">
          <Button>Powrót do strony głównej</Button>
        </Link>
      </div>
    );
  }

  const isOwnProduct = user?.id === product.user.id;
  const isProductSold = product.status === 'sold';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Strona główna
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{product.category}</span>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Main Image */}
              <div className="relative aspect-[4/3] bg-gray-100">
                <img
                  src={product.images[currentImageIndex] || 'https://via.placeholder.com/800x600'}
                  alt={product.title}
                  className="w-full h-full object-contain"
                />
                
                {/* Status Badge */}
                {isProductSold && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-lg shadow-lg">
                    Sprzedane
                  </div>
                )}
                
                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg transition"
                  >
                    <Heart
                      className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-lg transition"
                  >
                    <Share2 className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        index === currentImageIndex
                          ? 'border-blue-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Opis</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Szczegóły</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Kategoria</p>
                  <p className="font-semibold text-gray-900">{product.category}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Stan</p>
                  <p className="font-semibold text-gray-900">{product.condition}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Lokalizacja</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {product.location}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Data dodania</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(product.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* opinie o sprzedajacym */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Opinie o sprzedającym
                </h2>
              </div>

              {sellerStats.totalReviews === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">⭐</div>
                  <p className="text-gray-600">
                    Ten sprzedawca nie ma jeszcze żadnych opinii
                  </p>
                </div>
              ) : (
                <>
                  {/* podsumowanie  */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {sellerStats.averageRating.toFixed(1)}
                        </div>
                        <div className="flex justify-center mb-2">
                          {renderStars(Math.round(sellerStats.averageRating), 'lg')}
                        </div>
                        <p className="text-sm text-gray-600">
                          na podstawie {sellerStats.totalReviews} {sellerStats.totalReviews === 1 ? 'opinii' : 'opinii'}
                        </p>
                      </div>
                      
                      <div className="flex-1 w-full">
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = sellerReviews.filter(r => r.rating === rating).length;
                            const percentage = sellerStats.totalReviews > 0 
                              ? (count / sellerStats.totalReviews) * 100 
                              : 0;
                            
                            return (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 w-8">{rating}</span>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-400 h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-8">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista ostatnich opinii */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">
                      Ostatnie opinie ({sellerReviews.length > 3 && !showAllReviews ? '3' : sellerReviews.length})
                    </h3>
                    
                    {(showAllReviews ? sellerReviews : sellerReviews.slice(0, 3)).map((review) => (
                      <div 
                        key={review.id} 
                        className="border-b pb-4 last:border-b-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {review.reviewer.avatar ? (
                              <img
                                src={review.reviewer.avatar}
                                alt={review.reviewer.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                {review.reviewer.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {review.reviewer.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </p>
                            </div>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 ml-13 text-sm">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                    
                    {/* Przycisk Pokaż więcej/mniej */}
                    {sellerReviews.length > 3 && (
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="w-full py-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        {showAllReviews 
                          ? '↑ Pokaż mniej' 
                          : `↓ Pokaż wszystkie (${sellerReviews.length})`
                        }
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              {}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Cena</p>
                <p className="text-4xl font-bold text-blue-600">{product.price} zł</p>
              </div>

              {}
              {buySuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <p className="font-semibold">Transakcja rozpoczęta!</p>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Sprzedający został powiadomiony. Możesz teraz napisać wiadomość.
                  </p>
                </div>
              )}

              {buyError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{buyError}</p>
                </div>
              )}

              {}
              <div className="border-t pt-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Sprzedający</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    {product.user.avatar ? (
                      <img
                        src={product.user.avatar}
                        alt={product.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-600">
                        {product.user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{product.user.name}</p>
                    {sellerStats.totalReviews > 0 ? (
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(Math.round(sellerStats.averageRating), 'sm')}
                        <span className="text-xs text-gray-600">
                          {sellerStats.averageRating.toFixed(1)} ({sellerStats.totalReviews} {sellerStats.totalReviews === 1 ? 'opinia' : 'opinii'})
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Brak opinii</p>
                    )}
                  </div>
                </div>
              </div>

              {}
              <div className="space-y-3">
                {isOwnProduct ? (
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-blue-800">To jest Twoje ogłoszenie</p>
                  </div>
                ) : isProductSold ? (
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Produkt został już sprzedany</p>
                  </div>
                ) : (
                  <>
                    {/* przycisk kup*/}
                    <Button 
                      onClick={handleBuyProduct}
                      disabled={buyingInProgress || buySuccess}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 font-semibold"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {buyingInProgress ? 'Rozpoczywanie...' : buySuccess ? 'Transakcja rozpoczęta!' : 'Kup teraz'}
                    </Button>
                    
                    {/* Przycisk wiadomości */}
                    <Button 
                      onClick={() => navigate(`/wiadomosci/${product.user.id}`)}
                      variant="outline" 
                      className="w-full text-lg py-6"
                      disabled={!isAuthenticated}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Wyślij wiadomość
                    </Button>

                  </>
                )}
              </div>

              {}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm mb-1">
                      Bezpieczne transakcje
                    </p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Spotkaj się w bezpiecznym miejscu</li>
                      <li>• Sprawdź produkt przed zakupem</li>
                      <li>• Nie wysyłaj pieniędzy z góry</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}