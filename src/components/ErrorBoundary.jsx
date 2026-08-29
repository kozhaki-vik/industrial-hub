import React from 'react';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (window.electronAPI && window.electronAPI.app && window.electronAPI.app.reportError) {
      window.electronAPI.app.reportError(`ErrorBoundary Crash: ${error.stack || error.message}\n\nComponent Stack:\n${errorInfo.componentStack}`).catch(() => {});
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0f172a', // slate-950
          color: '#f1f5f9', // slate-100
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: '#1e293b', // slate-800
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid #334155' // slate-700
          }}>
            <h1 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {this.props.t('error_boundary_title')}
            </h1>
            <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
              {this.props.t('error_boundary_desc')}
            </p>
            <div style={{
              backgroundColor: '#020617', // slate-950
              padding: '1rem',
              borderRadius: '0.5rem',
              overflowX: 'auto',
              marginBottom: '1.5rem',
              textAlign: 'left',
              color: '#f87171', // red-400
              fontSize: '0.875rem'
            }}>
              <code>{this.state.error && this.state.error.toString()}</code>
            </div>
            <button
              onClick={() => { window.location.hash = '#/'; window.location.reload(); }}
              style={{
                backgroundColor: '#f97316', // orange-500
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
            >
              {this.props.t('error_boundary_btn')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);
