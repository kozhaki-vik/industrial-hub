import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import Settings from './views/Settings';
import SplashScreen from './components/SplashScreen';
import RustPathModal from './components/RustPathModal';
import { ThemeProvider } from './contexts/ThemeContext';
import { getConfigKey, setConfigKey } from './services/store';
import { autoDetectRustPath } from './services/rustPath';

// New Views
import Conveyors from './views/Conveyors';
import Monuments from './views/Monuments';
import Electricity from './views/Electricity';
import Gamma from './views/Gamma';
import Graphics from './views/Graphics';
import Servers from './views/Servers';
import Binds from './views/Binds';
import Developer from './views/Developer';
import { GammaProvider } from './contexts/GammaContext';
import { initAnalytics } from './services/analytics';
import ErrorBoundary from './components/ErrorBoundary';

import { NetworkProvider, useNetwork } from './contexts/NetworkContext';

function RouteTracker() {
  const location = useLocation();
  const { sendTelemetry } = useNetwork();
  
  useEffect(() => {
    sendTelemetry({ 
      route: location.pathname,
      timestamp: Date.now()
    });
  }, [location.pathname, sendTelemetry]);
  
  return null;
}

import { NotificationProvider } from './contexts/NotificationContext';
import ToastContainer from './components/ToastContainer';

function App() {
  const [isStarting, setIsStarting] = useState(true);
  const [showRustModal, setShowRustModal] = useState(false);

  useEffect(() => {
    initAnalytics();
  }, []);

  const handleSplashComplete = async () => {
    setIsStarting(false);
    
    // Check if Rust path is configured on launch
    const path = getConfigKey('rustPath');
    if (!path) {
      const detected = await autoDetectRustPath();
      if (detected) {
        setConfigKey('rustPath', detected);
      } else {
        setShowRustModal(true);
      }
    }
  };

  return (
    <ThemeProvider>
      <NotificationProvider>
        {isStarting && <SplashScreen onComplete={handleSplashComplete} />}
        
        {!isStarting && (
          <NetworkProvider>
            <GammaProvider>
              <ErrorBoundary>
                <HashRouter>
                  <RouteTracker />
                  <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 transition-colors duration-300 animate-main-fade-in">
                    <Header />
                    <main className="max-w-6xl mx-auto px-6 py-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/conveyors" element={<Conveyors />} />
                      <Route path="/monuments" element={<Monuments />} />
                      <Route path="/electricity" element={<Electricity />} />
                      <Route path="/graphics" element={<Graphics />} />
                      <Route path="/servers" element={<Servers />} />
                      <Route path="/binds" element={<Binds />} />
                      <Route path="/developer" element={<Developer />} />
                      <Route path="/gamma" element={<Gamma />} />
                    </Routes>
                  </main>
                </div>
                <RustPathModal isOpen={showRustModal} onClose={() => setShowRustModal(false)} />
                <ToastContainer />
              </HashRouter>
              </ErrorBoundary>
            </GammaProvider>
          </NetworkProvider>
        )}
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
