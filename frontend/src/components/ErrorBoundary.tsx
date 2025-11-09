import { Component, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Wrapper component to provide translation hook to class component
function ErrorBoundaryContent({ hasError, error, onReset }: { hasError: boolean; error: Error | null; onReset: () => void }) {
  const { t } = useTranslation();

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-bg-secondary) px-4">
        <div className="max-w-md w-full bg-(--color-bg-primary) rounded shadow-lg p-8 text-center">
          <div className="text-(--color-error-500) text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-(--color-text-primary) mb-2">{t('errorBoundary.title')}</h1>
          <p className="text-light mb-6">
            {error?.message || t('errors.unexpectedError')}
          </p>
          <div className="space-y-3">
            <button
              onClick={onReset}
              className="w-full px-4 py-2 bg-(--color-primary-600) text-white rounded hover:bg-(--color-primary-700) focus:outline-none focus:ring-2 focus:ring-(--color-primary-500)"
            >
              {t('errorBoundary.tryAgain')}
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 border border-(--color-border-default) text-(--color-text-primary) rounded hover:bg-(--color-bg-secondary) focus:outline-none focus:ring-2 focus:ring-(--color-border-medium)"
            >
              {t('errorBoundary.goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorBoundaryContent
          hasError={this.state.hasError}
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}
