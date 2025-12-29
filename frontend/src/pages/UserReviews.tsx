import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { reviewApi } from '../services/api';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

interface UserReviewsProps {
  userId: number;
}

export function UserReviews({ userId }: UserReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      const response = await reviewApi.getUserReviews(userId);
      setReviews(response.data.reviews);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Błąd pobierania opinii:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Ładowanie opinii...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statystyki */}
      {stats.totalReviews > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex gap-1 mt-2">
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </div>
            <div className="border-l pl-4">
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalReviews}
              </p>
              <p className="text-sm text-gray-600">
                {stats.totalReviews === 1 ? 'opinia' : 'opinii'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista opinii */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
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
            <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
              {/* Header opinii */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.reviewer.avatar ? (
                    <img
                      src={review.reviewer.avatar}
                      alt={review.reviewer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
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

              {/* Komentarz */}
              {review.comment && (
                <p className="text-gray-700">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}