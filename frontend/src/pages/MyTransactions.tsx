import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ShoppingCart, Package, CheckCircle, XCircle, Clock, Eye, MessageCircle, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { transactionApi } from '../services/api';
import { Transaction } from '../types';

export function MyTransactions() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [asBuyer, setAsBuyer] = useState<Transaction[]>([]);
  const [asSeller, setAsSeller] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/logowanie');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const response = await transactionApi.getMyTransactions();
      setAsBuyer(response.data.asBuyer);
      setAsSeller(response.data.asSeller);
    } catch (error) {
      console.error('Błąd pobierania transakcji:', error);
    } finally {
      setLoading(false);
    }
  };

  // Akcje dla sprzedającego
  const handleAccept = async (transactionId: number) => {
    setActionLoading(transactionId);
    try {
      await transactionApi.accept(transactionId);
      await fetchTransactions();
      alert('Transakcja zaakceptowana!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Błąd akceptacji transakcji');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (transactionId: number) => {
    if (!window.confirm('Czy na pewno chcesz oznaczyć tę transakcję jako ukończoną? Produkt zostanie oznaczony jako sprzedany.')) {
      return;
    }
    
    setActionLoading(transactionId);
    try {
      await transactionApi.complete(transactionId);
      await fetchTransactions();
      alert('Transakcja ukończona! Produkt został oznaczony jako sprzedany.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Błąd ukończenia transakcji');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (transactionId: number) => {
    if (!window.confirm('Czy na pewno chcesz anulować tę transakcję?')) {
      return;
    }
    
    setActionLoading(transactionId);
    try {
      await transactionApi.cancel(transactionId);
      await fetchTransactions();
      alert('Transakcja anulowana');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Błąd anulowania transakcji');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        text: 'Oczekująca',
        icon: Clock,
        class: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      },
      accepted: {
        text: 'Zaakceptowana',
        icon: CheckCircle,
        class: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      completed: {
        text: 'Ukończona',
        icon: CheckCircle,
        class: 'bg-green-100 text-green-700 border-green-200',
      },
      cancelled: {
        text: 'Anulowana',
        icon: XCircle,
        class: 'bg-red-100 text-red-700 border-red-200',
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border ${badge.class}`}>
        <Icon className="h-4 w-4" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Ładowanie...</p>
      </div>
    );
  }

  const transactions = activeTab === 'buyer' ? asBuyer : asSeller;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moje Transakcje</h1>
            <p className="text-gray-600 mt-2">
              Zarządzaj swoimi zakupami i sprzedażą
            </p>
          </div>
          {/* ✨ NOWY PRZYCISK - Link do wiadomości */}
          <Link to="/wiadomosci">
            <Button variant="outline" className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Wiadomości
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === 'buyer'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Moje zakupy ({asBuyer.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition ${
                activeTab === 'seller'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Package className="h-5 w-5" />
                <span>Moja sprzedaż ({asSeller.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Lista transakcji */}
        {transactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'buyer' ? '🛒' : '📦'}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'buyer' 
                ? 'Nie masz jeszcze żadnych zakupów' 
                : 'Nie masz jeszcze żadnej sprzedaży'}
            </h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'buyer'
                ? 'Przeglądaj ogłoszenia i zacznij kupować!'
                : 'Dodaj swoje pierwsze ogłoszenie i zacznij sprzedawać!'}
            </p>
            <Link to={activeTab === 'buyer' ? '/produkty' : '/dodaj'}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                {activeTab === 'buyer' ? 'Przeglądaj produkty' : 'Dodaj ogłoszenie'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const isBuyer = activeTab === 'buyer';
              const otherUser = isBuyer ? transaction.product.user : transaction.buyer;
              const isActionPending = actionLoading === transaction.id;

              return (
                <div
                  key={transaction.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Zdjęcie produktu */}
                    <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={transaction.product.images[0] || 'https://via.placeholder.com/400x300'}
                        alt={transaction.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Treść */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Link 
                            to={`/produkt/${transaction.product.id}`}
                            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition"
                          >
                            {transaction.product.title}
                          </Link>
                          <p className="text-gray-600 text-sm mt-1">
                            {isBuyer ? 'Sprzedający:' : 'Kupujący:'} {otherUser.name}
                          </p>
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        <span>💰 {transaction.product.price} zł</span>
                        <span>📅 {formatDate(transaction.createdAt)}</span>
                        <span>📍 {transaction.product.location}</span>
                      </div>

                      {/* Info o statusie */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                        {transaction.status === 'pending' && (
                          <p className="text-gray-700">
                            {isBuyer 
                              ? '⏳ Czekaj na odpowiedź sprzedającego'
                              : '👋 Nowy kupujący jest zainteresowany! Zaakceptuj lub anuluj transakcję.'}
                          </p>
                        )}
                        {transaction.status === 'accepted' && (
                          <p className="text-gray-700">
                            {isBuyer
                              ? '✅ Sprzedający zaakceptował transakcję! Możesz się z nim skontaktować.'
                              : '✅ Transakcja zaakceptowana. Po dostarczeniu produktu oznacz jako ukończoną.'}
                          </p>
                        )}
                        {transaction.status === 'completed' && (
                          <p className="text-gray-700">
                            ✅ Transakcja ukończona! {isBuyer && 'Możesz teraz dodać opinię o sprzedającym.'}
                          </p>
                        )}
                        {transaction.status === 'cancelled' && (
                          <p className="text-gray-700">
                            ❌ Transakcja została anulowana
                          </p>
                        )}
                      </div>

                      {/* Akcje */}
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/produkt/${transaction.product.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Zobacz produkt
                          </Button>
                        </Link>

                        {/* ✨ NOWY PRZYCISK - Napisz wiadomość */}
                        <Link to={`/wiadomosci/${otherUser.id}`}>
                          <Button variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Napisz do {isBuyer ? 'sprzedającego' : 'kupującego'}
                          </Button>
                        </Link>

                        {/* ⭐ NOWY PRZYCISK - Dodaj opinię (tylko dla kupującego po ukończeniu) */}
                        {isBuyer && transaction.status === 'completed' && (
                          <Link to={`/opinia/${transaction.id}`}>
                            <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-600 hover:bg-yellow-50">
                              <Star className="h-4 w-4 mr-2" />
                              Dodaj opinię
                            </Button>
                          </Link>
                        )}

                        {/* Akcje dla sprzedającego */}
                        {!isBuyer && (
                          <>
                            {transaction.status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => handleAccept(transaction.id)}
                                  disabled={isActionPending}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {isActionPending ? 'Akceptowanie...' : 'Zaakceptuj'}
                                </Button>
                                <Button
                                  onClick={() => handleCancel(transaction.id)}
                                  disabled={isActionPending}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Anuluj
                                </Button>
                              </>
                            )}

                            {transaction.status === 'accepted' && (
                              <>
                                <Button
                                  onClick={() => handleComplete(transaction.id)}
                                  disabled={isActionPending}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {isActionPending ? 'Oznaczanie...' : 'Oznacz jako ukończone'}
                                </Button>
                                <Button
                                  onClick={() => handleCancel(transaction.id)}
                                  disabled={isActionPending}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Anuluj
                                </Button>
                              </>
                            )}
                          </>
                        )}

                        {/* Akcje dla kupującego */}
                        {isBuyer && transaction.status !== 'completed' && transaction.status !== 'cancelled' && (
                          <Button
                            onClick={() => handleCancel(transaction.id)}
                            disabled={isActionPending}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            {isActionPending ? 'Anulowanie...' : 'Anuluj transakcję'}
                          </Button>
                        )}

                        {/* Dodaj opinię (po ukończonej transakcji) */}
                        {transaction.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            ⭐ Dodaj opinię
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Statystyki */}
        {(asBuyer.length > 0 || asSeller.length > 0) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Oczekujące</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactions.filter(t => t.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Zaakceptowane</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactions.filter(t => t.status === 'accepted').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ukończone</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactions.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Anulowane</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transactions.filter(t => t.status === 'cancelled').length}
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