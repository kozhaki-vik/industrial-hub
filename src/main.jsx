import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

// --- Global Error Handlers ---
const reportToBackend = (errorText) => {
  if (window.electronAPI && window.electronAPI.app && window.electronAPI.app.reportError) {
    window.electronAPI.app.reportError(errorText).catch(() => {});
  } else {
    console.error("Backend error reporting unavailable:", errorText);
  }
};

window.addEventListener('error', (event) => {
  // Capture critical resource load errors (scripts, stylesheets)
  if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
    const src = event.target.src || event.target.href || event.target.tagName;
    reportToBackend(`Resource load error: Failed to load ${src}`);
  } else if (!event.target || event.target === window) {
    // JS error
    const msg = event.error ? (event.error.stack || event.error.message) : event.message;
    reportToBackend(`Uncaught UI Error: ${msg}`);
  }
}, true); // Use capture phase to catch resource errors which do not bubble

window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason ? (event.reason.stack || event.reason.message || String(event.reason)) : 'Unknown rejection';
  reportToBackend(`Unhandled UI Promise Rejection: ${msg}`);
});
// -----------------------------

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
