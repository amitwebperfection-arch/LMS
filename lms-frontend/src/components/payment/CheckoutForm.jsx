import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader } from '../common/Loader';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CheckoutForm = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment/success',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">Total Amount</span>
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      <div>
        <label className="label mb-2 flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Payment Details
        </label>
        <PaymentElement />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="btn btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size="sm" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </button>
      </div>

      <p className="text-xs text-center text-gray-600 dark:text-gray-400">
        Your payment is secured by Stripe
      </p>
    </form>
  );
};

export default CheckoutForm;