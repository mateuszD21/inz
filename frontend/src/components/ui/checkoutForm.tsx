import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from './button';
import { Loader2, CreditCard } from 'lucide-react';

interface CheckoutFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  amount: number;
}

export function CheckoutForm({ onSuccess, onError, amount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Potwierdzenie płatnosci
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Wystąpił błąd podczas płatności');
        onError(error.message || 'Błąd płatności');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log(' Płatność zakończona sukcesem:', paymentIntent.id);
        onSuccess();
      }
    } catch (err: any) {
      console.error('Błąd płatności:', err);
      setErrorMessage('Wystąpił nieoczekiwany błąd');
      onError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info o kwocie */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-900 font-medium">Opłata za ogłoszenie</p>
            <p className="text-xs text-blue-700 mt-1">
              Jednorazowa opłata za publikację ogłoszenia
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-900">
              {(amount / 100).toFixed(2)} zł
            </p>
          </div>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <PaymentElement />
      </div>

      {/* Komunikat błędu */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {/* Informacje o bezpieczeństwie */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <CreditCard className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Bezpieczna płatność
            </p>
            <p className="text-xs text-green-700 mt-1">
              Twoje dane są zabezpieczone przez Stripe. Nie przechowujemy informacji o Twojej karcie.
            </p>
          </div>
        </div>
      </div>

      {/* Przycisk płatności */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Przetwarzanie płatności...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Zapłać {(amount / 100).toFixed(2)} zł
          </>
        )}
      </Button>

      {/* Informacje dodatkowe */}
      <p className="text-xs text-gray-500 text-center">
        Klikając "Zapłać" akceptujesz nasz{' '}
        <a href="#" className="text-blue-600 hover:underline">
          regulamin
        </a>{' '}
        oraz{' '}
        <a href="#" className="text-blue-600 hover:underline">
          politykę prywatności
        </a>
      </p>
    </form>
  );
}