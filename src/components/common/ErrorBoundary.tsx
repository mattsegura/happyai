import { Component, ReactNode } from 'react';
import { handleError } from '../../lib/errorHandler';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 *
 * Catches React rendering errors and shows a fallback UI
 * Automatically reports errors to Sentry
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to database
    handleError(error, {
      component: 'ErrorBoundary',
      action: 'react_render_error',
      metadata: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught error:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-950/30">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>

            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Something went wrong
            </h1>

            <p className="mb-6 text-muted-foreground">
              We've been notified and are working to fix the issue. Please try refreshing the page.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 rounded-lg border border-border bg-muted p-4 text-left">
                <summary className="cursor-pointer font-semibold text-foreground">
                  Error Details (Dev Mode)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
