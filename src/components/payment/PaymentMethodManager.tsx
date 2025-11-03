/**
 * Payment Method Manager Component
 *
 * Manages saved payment methods (credit cards, etc.)
 * Works in both mock and real Stripe mode.
 */

import { useState } from 'react';
import { usePaymentMethods } from '../../hooks/useSubscription';
import { stripeClient } from '../../lib/stripe/stripeClient';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, CreditCard, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function PaymentMethodManager() {
  const { user } = useAuth();
  const { paymentMethods, loading, refetch } = usePaymentMethods();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAddCard, setShowAddCard] = useState(false);
  const isMockMode = stripeClient.isMockMode();

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    const confirmed = window.confirm('Are you sure you want to remove this payment method?');
    if (!confirmed) return;

    setDeleting(paymentMethodId);

    try {
      await stripeClient.deletePaymentMethod(paymentMethodId);
      toast.success('Payment method removed');
      refetch();
    } catch (error) {
      console.error('[PaymentMethod] Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove payment method');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    if (!user) return;

    try {
      await stripeClient.setDefaultPaymentMethod(paymentMethodId, user.id);
      toast.success('Default payment method updated');
      refetch();
    } catch (error) {
      console.error('[PaymentMethod] Set default error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update default payment method');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          {isMockMode && (
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded mt-1 inline-block">
              Mock Mode
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddCard(!showAddCard)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Card
        </button>
      </div>

      {showAddCard && (
        <AddPaymentMethodForm
          onSuccess={() => {
            setShowAddCard(false);
            refetch();
          }}
          onCancel={() => setShowAddCard(false)}
          isMockMode={isMockMode}
        />
      )}

      {!paymentMethods || paymentMethods.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No payment methods</h3>
          <p className="text-sm text-muted-foreground">
            Add a credit card to keep your subscription active.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onDelete={handleDeletePaymentMethod}
              onSetDefault={handleSetDefault}
              isDeleting={deleting === method.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentMethodCard({
  method,
  onDelete,
  onSetDefault,
  isDeleting,
}: {
  method: any;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  isDeleting: boolean;
}) {
  const getBrandIcon = (brand: string) => {
    // In a real app, you'd use brand-specific logos
    return <CreditCard className="w-6 h-6" />;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getBrandIcon(method.card_brand || 'unknown')}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {method.card_brand?.toUpperCase() || 'Card'} •••• {method.card_last4}
              </p>
              {method.is_default && (
                <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                  <CheckCircle2 className="w-3 h-3" />
                  Default
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Expires {method.card_exp_month}/{method.card_exp_year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!method.is_default && (
            <button
              onClick={() => onSetDefault(method.id)}
              className="px-3 py-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
            >
              Set Default
            </button>
          )}
          <button
            onClick={() => onDelete(method.id)}
            disabled={isDeleting}
            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddPaymentMethodForm({
  onSuccess,
  onCancel,
  isMockMode,
}: {
  onSuccess: () => void;
  onCancel: () => void;
  isMockMode: boolean;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to add a payment method');
      return;
    }

    setLoading(true);

    try {
      await stripeClient.createPaymentMethod({
        user_id: user.id,
        card_number: cardNumber,
        exp_month: parseInt(expMonth),
        exp_year: parseInt(expYear),
        cvc: cvc,
      });

      toast.success('Payment method added successfully');
      onSuccess();
    } catch (error) {
      console.error('[PaymentMethod] Add error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-medium">Add New Card</h3>

      {isMockMode && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
          Mock Mode: Use any test card number (e.g., 4242 4242 4242 4242)
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            required
            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <input
              type="text"
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
              placeholder="MM"
              maxLength={2}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="text"
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
              placeholder="YYYY"
              maxLength={4}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CVC</label>
            <input
              type="text"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              placeholder="123"
              maxLength={4}
              required
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Add Card
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
