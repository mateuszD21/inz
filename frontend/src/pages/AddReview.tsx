import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { reviewApi } from '../services/api';

export function AddReview() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/logowanie');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user && transactionId) {
      checkCanReview();
    }
  }, [user, transactionId]);

  const checkCanReview = async () => {
    try {
      const response = await reviewApi.canReview(parseInt(transactionId!));
      
      if (response.data.canReview) {
        setCanReview(true);
      } else {
        setCanReview(false);
        setErrorMessage(response.data.reason || 'Nie możesz dodać opinii');
      }
    } catch (error: any) {
      console.error('Błąd sprawdzania uprawnień:', error);
      setErrorMessage('Nie możesz dodać opinii dla tej transakcji');
    } finally {
      setCheckingPermission(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Wybierz ocenę');
      return;
    }

    setLoading(true);
    try {
      await reviewApi.create({
        transactionId: parseInt(transactionId!),
        rating,
        comment: comment.trim() || undefined,
      });

      alert('Opinia została dodana!');
      navigate('/transakcje');
    } catch (error: any) {
      console.error('Błąd dodawania opinii:', error);
      alert(error.response?.data?.error || 'Nie udało się dodać opinii');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nie można dodać opinii
            </h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <Link to="/transakcje">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Wróć do transakcji
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/transakcje">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="h-5 w-5" />
              Wróć do transakcji
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Dodaj opinię</h1>
          <p className="text-gray-600 mt-2">
            Oceń sprzedającego i podziel się swoją opinią
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ocena <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-lg font-semibold text-gray-700">
                    {rating} / 5
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Kliknij na gwiazdki aby wybrać ocenę
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Komentarz (opcjonalnie)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Opisz swoje doświadczenia z tym sprzedającym..."
                rows={5}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length} / 500 znaków
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Wskazówka:</strong> Bądź uczciwy i konstruktywny w swojej opinii. 
                Pomaga to innym użytkownikom i buduje zaufanie w społeczności.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={loading || rating === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Dodawanie...' : 'Dodaj opinię'}
              </Button>
              <Link to="/transakcje" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Anuluj
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}