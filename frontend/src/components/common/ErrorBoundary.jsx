import React from 'react';

/**
 * Production React Error Boundary
 * Catches JavaScript rendering errors in child components and displays a clean fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg, #090d16)',
          color: 'var(--color-text, #f1f5f9)',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '480px',
            background: 'var(--color-card, #111827)',
            padding: '2.5rem',
            borderRadius: '16px',
            border: '1px solid var(--color-border, #1f2937)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: '700' }}>
              Something went wrong
            </h2>
            <p style={{ color: 'var(--color-text-muted, #94a3b8)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              An unexpected error occurred while rendering this page. Please refresh or navigate back to the home page.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: 'var(--color-primary, #6366f1)',
                  color: '#ffffff',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                ↻ Refresh Page
              </button>
              <a
                href="/login"
                style={{
                  background: 'transparent',
                  color: 'var(--color-text-muted, #94a3b8)',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border, #374151)',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
