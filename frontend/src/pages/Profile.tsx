import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Camera, Save, X, Star, Package, MessageCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, reviewApi, productApi, authApi } from '@/services/api';

export function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Statystyki użytkownika
  const [stats, setStats] = useState({
    productsCount: 0,
    reviewsCount: 0,
    averageRating: 0,
  });
  
  // Opinie użytkownika
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviews, setShowReviews] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const isOwnProfile = !userId || (user && user.id === parseInt(userId));
  const profileUserId = userId ? parseInt(userId) : user?.id;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/logowanie');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  // pobieranie statystyk użytkownika
  useEffect(() => {
    if (profileUserId) {
      fetchUserStats();
    }
  }, [profileUserId]);

  const fetchUserStats = async () => {
    try {
      // pobieranie statystyk opinii
      const reviewStatsResponse = await reviewApi.getUserReviewStats(profileUserId!);
      const reviewStats = reviewStatsResponse.data;
      
      // pobieranie produktow użytkownika
      let productsCount = 0;
      if (isOwnProfile) {
        const productsResponse = await productApi.getMyProducts();
        productsCount = productsResponse.data.length;
      }
      
      // pobieranie opini użytkownika
      const reviewsResponse = await reviewApi.getUserReviews(profileUserId!);
      const userReviews = reviewsResponse.data.reviews;
      
      setStats({
        productsCount,
        reviewsCount: reviewStats.totalReviews,
        averageRating: reviewStats.averageRating,
      });
      
      setReviews(userReviews);
      
    } catch (error) {
      console.error('Błąd pobierania statystyk:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await userApi.updateProfile(formData);
      setSuccess('Profil został zaktualizowany!');
      setIsEditing(false);
      
      // odświeżanie stronę po 1 sekundzie żeby załadować nowe dane
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Błąd aktualizacji profilu');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  // zmiana hasła
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Wszystkie pola są wymagane');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Nowe hasło musi mieć minimum 6 znaków');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Nowe hasła nie są identyczne');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('Nowe hasło musi być inne niż aktualne');
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess('Hasło zostało zmienione!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Zamknij formularz po 2 sekundach
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Błąd zmiany hasła');
    } finally {
      setLoading(false);
    }
  };

  // toggle pokazywania hasła
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isOwnProfile ? 'Mój profil' : `Profil użytkownika ${formData.name}`}
          </h1>
          <p className="text-gray-600 mt-2">
            {isOwnProfile ? 'Zarządzaj swoimi danymi osobowymi' : 'Zobacz informacje o użytkowniku'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lewa kolumna - Avatar i podstawowe info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt={formData.name}
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200">
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isOwnProfile && isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                      <Camera className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <h2 className="mt-4 text-xl font-bold text-gray-900">{formData.name}</h2>
                
                {/* Średnia ocen */}
                {stats.reviewsCount > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    {renderStars(Math.round(stats.averageRating))}
                    <span className="text-sm text-gray-600">
                      ({stats.averageRating.toFixed(1)} • {stats.reviewsCount} {stats.reviewsCount === 1 ? 'opinia' : 'opinii'})
                    </span>
                  </div>
                )}
                
                {isOwnProfile && (
                  <p className="text-gray-600 text-sm mt-1">{formData.email}</p>
                )}
                
                <div className="mt-6 w-full space-y-2">
                  {isOwnProfile && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{formData.email}</span>
                      </div>
                      {formData.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{formData.phone}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {isOwnProfile && !isEditing && (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Edytuj profil
                  </Button>
                )}
                
                {}
                {!isOwnProfile && (
                  <Button
                    onClick={() => navigate(`/wiadomosci/${profileUserId}`)}
                    className="mt-6 w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Wyślij wiadomość
                  </Button>
                )}
              </div>
            </div>

            {/* Statystyki */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statystyki</h3>
              <div className="space-y-3">
                {isOwnProfile && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Ogłoszenia
                    </span>
                    <span className="font-semibold text-gray-900">{stats.productsCount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Opinie
                  </span>
                  <span className="font-semibold text-gray-900">{stats.reviewsCount}</span>
                </div>
                {stats.reviewsCount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Średnia ocen</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      {stats.averageRating.toFixed(1)}
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {}
          <div className="lg:col-span-2">
            {isOwnProfile ? (
              <>
                {}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                      {isEditing ? 'Edytuj dane' : 'Informacje osobiste'}
                    </h2>
                    {isEditing && (
                      <button
                        onClick={handleCancel}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    )}
                  </div>

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
                    {}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Imię i nazwisko
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{formData.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Adres email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{formData.email}</p>
                      )}
                    </div>

                    {/* Telefon */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Numer telefonu
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+48 123 456 789"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">
                          {formData.phone || 'Nie podano'}
                        </p>
                      )}
                    </div>

                    {/* Avatar URL */}
                    {isEditing && (
                      <div>
                        <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-2">
                          URL avatara (opcjonalnie)
                        </label>
                        <input
                          type="url"
                          id="avatar"
                          name="avatar"
                          value={formData.avatar}
                          onChange={handleChange}
                          placeholder="https://example.com/avatar.jpg"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Możesz użyć np. https://i.pravatar.cc/150?img=12
                        </p>
                      </div>
                    )}

                    {isEditing && (
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="h-5 w-5 mr-2" />
                          {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCancel}
                          variant="outline"
                          className="flex-1"
                        >
                          Anuluj
                        </Button>
                      </div>
                    )}
                  </form>
                </div>

                {}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Bezpieczeństwo</h2>
                  
                  {!isChangingPassword ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Chcesz zmienić hasło?
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto"
                          onClick={() => setIsChangingPassword(true)}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Zmień hasło
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      {passwordSuccess && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                          {passwordSuccess}
                        </div>
                      )}

                      {passwordError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                          {passwordError}
                        </div>
                      )}

                      {/* Aktualne hasło */}
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Aktualne hasło *
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Wpisz aktualne hasło"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Nowe hasło */}
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Nowe hasło * (min. 6 znaków)
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Wpisz nowe hasło"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Potwierdź nowe hasło */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                          Potwierdź nowe hasło *
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Wpisz ponownie nowe hasło"
                          />
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Przyciski */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          {loading ? 'Zmieniam...' : 'Zmień hasło'}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setIsChangingPassword(false);
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                            });
                            setPasswordError('');
                            setPasswordSuccess('');
                          }}
                          variant="outline"
                          className="flex-1"
                        >
                          Anuluj
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Opinie ({stats.reviewsCount})
                </h2>
                
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">⭐</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Brak opinii
                    </h3>
                    <p className="text-gray-600">
                      Ten użytkownik nie ma jeszcze żadnych opinii
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
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
                          <p className="text-gray-700 ml-13">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {}
            {isOwnProfile && stats.reviewsCount > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Twoje opinie ({stats.reviewsCount})
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setShowReviews(!showReviews)}
                  >
                    {showReviews ? 'Ukryj' : 'Pokaż'}
                  </Button>
                </div>
                
                {showReviews && (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
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
                          <p className="text-gray-700 ml-13">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}