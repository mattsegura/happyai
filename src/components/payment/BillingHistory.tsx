/**
 * Billing History Component
 *
 * Displays past invoices and payment history.
 * Works in both mock and real Stripe mode.
 */

import { useInvoices } from '../../hooks/useSubscription';
import { stripeClient } from '../../lib/stripe/stripeClient';
import { formatCurrency } from '../../lib/types/payment';
import { Loader2, FileText, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function BillingHistory() {
  const { invoices, loading } = useInvoices();
  const isMockMode = stripeClient.isMockMode();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">asdf</h3>
        <p className="text-sm text-muted-foreground">
          Your billing history will appear here once you have active subscriptions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Billing History</h2>
        {isMockMode && (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
            Mock Mode
          </span>
        )}
      </div>

      <div className="space-y-3">
        {invoices.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} isMockMode={isMockMode} />
        ))}
      </div>
    </div>
  );
}

function InvoiceCard({ invoice, isMockMode }: { invoice: any; isMockMode: boolean }) {
  const getStatusIcon = () => {
    switch (invoice.status) {
      case 'paid':
        return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'open':
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'void':
      case 'uncollectible':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = () => {
    switch (invoice.status) {
      case 'paid':
        return 'Paid';
      case 'open':
        return 'Pending';
      case 'void':
        return 'Voided';
      case 'uncollectible':
        return 'Failed';
      default:
        return invoice.status;
    }
  };

  const handleDownloadPDF = () => {
    if (isMockMode) {
      alert('PDF download not available in mock mode');
      return;
    }

    if (invoice.invoice_pdf) {
      window.open(invoice.invoice_pdf, '_blank');
    } else if (invoice.hosted_invoice_url) {
      window.open(invoice.hosted_invoice_url, '_blank');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {formatCurrency(invoice.amount_paid || invoice.amount_due, invoice.currency || 'usd')}
              </p>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  invoice.status === 'paid'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : invoice.status === 'open'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}
              >
                {getStatusLabel()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(invoice.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {invoice.status === 'paid' && (invoice.invoice_pdf || invoice.hosted_invoice_url) && (
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            {isMockMode ? 'View' : 'Download'}
          </button>
        )}
      </div>
    </div>
  );
}
