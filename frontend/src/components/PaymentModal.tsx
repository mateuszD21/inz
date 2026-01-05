import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productData: any;
  images: File[];
  onSuccess: (productId: number) => void;
}

function PaymentForm({ 
  clientSecret, 
  onSuccess, 
  onError 
}: { 
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Wystąpił błąd podczas płatności');
        onError(error.message || 'Płatność nie powiodła się');
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Wystąpił nieoczekiwany błąd');
      onError(err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 hover:bg-blue-700 py-3"
      >
        {processing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Przetwarzanie...
          </>
        ) : (
          'Zapłać 10 zł'
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Płatność jest bezpieczna i szyfrowana przez Stripe
      </p>
    </form>
  );
}

export function PaymentModal({ isOpen, onClose, productData, images, onSuccess }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (isOpen && !clientSecret) {
      createPaymentIntent();
    }
  }, [isOpen]);

  const createPaymentIntent = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ productData }),
      });

      if (!response.ok) {
        throw new Error('Nie udało się utworzyć płatności');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (err: any) {
      setError(err.message || 'Błąd podczas tworzenia płatności');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setConfirming(true);
    
    console.log('=== PAYMENT SUCCESS START ===');
    console.log('paymentIntentId:', paymentIntentId);
    console.log('images count:', images.length);

    try {
      const token = localStorage.getItem('token');
      
      // KROK 1: Potwierdź płatność i stwórz produkt (BEZ zdjęć)
      console.log('📝 Tworzenie produktu...');
      const confirmResponse = await fetch('http://localhost:3000/api/payments/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentIntentId }),
      });
      
      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        console.error('❌ Błąd tworzenia produktu:', errorData);
        throw new Error(errorData.error || 'Nie udało się potwierdzić płatności');
      }

      const confirmData = await confirmResponse.json();
      const productId = confirmData.product.id;
      console.log('✅ Produkt utworzony, ID:', productId);

      // KROK 2: Upload zdjęć przez /api/upload/images (TAK JAK W EDYCJI)
      if (images && images.length > 0) {
        console.log('📸 Wysyłanie zdjęć przez /api/upload/images...', images.length);
        
        const uploadFormData = new FormData();
        images.forEach((image) => {
          uploadFormData.append('images', image);
        });

        const uploadResponse = await fetch('http://localhost:3000/api/upload/images', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          console.error('⚠️ Błąd uploadu zdjęć:', uploadError);
          throw new Error('Błąd podczas przesyłania zdjęć');
        }

        const uploadData = await uploadResponse.json();
        console.log('✅ Zdjęcia przesłane:', uploadData);

        // KROK 3: Zaktualizuj produkt z URLami zdjęć
        const imageUrls = uploadData.urls.map((url: string) => `http://localhost:3000${url}`);
        console.log('🔗 Aktualizacja produktu z URLami:', imageUrls);
        
        const updateResponse = await fetch(`http://localhost:3000/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...productData,
            images: imageUrls,
          }),
        });

        if (!updateResponse.ok) {
          const updateError = await updateResponse.json();
          console.warn('⚠️ Błąd aktualizacji zdjęć:', updateError);
          // Nie rzucamy błędu - produkt już istnieje
        } else {
          console.log('✅ Produkt zaktualizowany ze zdjęciami');
        }
      }

      setSuccess(true);
      console.log('🎉 Wszystko zakończone pomyślnie!');
      
      setTimeout(() => {
        onSuccess(productId);
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error('❌ Payment confirmation error:', err);
      setError(err.message || 'Błąd podczas potwierdzania płatności');
    } finally {
      setConfirming(false);
    }
  };

  const handleClose = () => {
    setClientSecret('');
    setPaymentIntentId('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
    },
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Opłata za ogłoszenie</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">
              {productData.title}
            </h3>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Opłata za dodanie ogłoszenia</span>
              <span className="text-lg font-bold text-blue-600">10 zł</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              📸 Zdjęć do przesłania: {images.length}
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 mb-4">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Błąd płatności</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Płatność pomyślna!</p>
                <p className="text-sm text-green-700">
                  Twoje ogłoszenie zostało dodane. Za chwilę zostaniesz przekierowany...
                </p>
              </div>
            </div>
          )}

          {confirming && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-gray-600">Potwierdzanie płatności i dodawanie zdjęć...</p>
              </div>
            </div>
          )}

          {clientSecret && !success && !confirming && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={setError}
              />
            </Elements>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
              💳 Bezpieczna płatność
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Płatności obsługiwane przez Stripe</li>
              <li>• Dane karty są w pełni zaszyfrowane</li>
              <li>• Nie przechowujemy danych karty</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}