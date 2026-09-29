import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import Settings from './views/Settings';
import SplashScreen from './components/SplashScreen';
import RustPathModal from './components/RustPathModal';
import InitialSetupModal from './components/InitialSetupModal';
import ReleaseNotesModal from './components/ReleaseNotesModal';
import ConfirmModal from './components/ConfirmModal';
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
import ClanManager from './views/ClanManager';
import { GammaProvider } from './contexts/GammaContext';
import { initAnalytics } from './services/analytics';
import ErrorBoundary from './components/ErrorBoundary';
import FeedbackButton from './components/FeedbackButton';

import { NetworkProvider, useNetwork } from './contexts/NetworkContext';

function RouteTracker() {
  const location = useLocation();
  const { sendTelemetry } = useNetwork();
  
  useEffect(() => {
    sendTelemetry({ 
      route: location.pathname,
      timestamp: Date.now()
    });

    // Track visited tabs for onboarding glow
    import('./services/store').then(({ addVisitedTab }) => {
      addVisitedTab(location.pathname);
    });
  }, [location.pathname, sendTelemetry]);
  
  return null;
}

function AppMain() {
  const location = useLocation();
  const isClan = location.pathname === '/clan';

  return (
    <div className={`min-h-screen bg-[#F8F9FA] dark:bg-slate-950 transition-colors duration-300 animate-main-fade-in ${isClan ? 'h-screen overflow-hidden flex flex-col' : ''}`}>
      <Header />
      <main className={`w-full mx-auto px-6 ${isClan ? 'max-w-[1780px] flex-1 py-4 min-h-0 overflow-hidden flex flex-col' : 'max-w-6xl py-8'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/conveyors" element={<Conveyors />} />
          <Route path="/monuments" element={<Navigate to="/" replace />} />
          <Route path="/electricity" element={<Navigate to="/" replace />} />
          <Route path="/graphics" element={<Graphics />} />
          <Route path="/servers" element={<Servers />} />
          <Route path="/binds" element={<Binds />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/gamma" element={<Gamma />} />
          <Route path="/clan" element={<ClanManager />} />
        </Routes>
      </main>
    </div>
  );
}

import { NotificationProvider } from './contexts/NotificationContext';
import ToastContainer from './components/ToastContainer';

function App() {
  const [isStarting, setIsStarting] = useState(true);
  const [showRustModal, setShowRustModal] = useState(false);
  const [showInitialSetupModal, setShowInitialSetupModal] = useState(false);
  useEffect(() => {
    initAnalytics();
  }, []);

  const checkRustPath = async () => {
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

  const handleSplashComplete = async () => {
    setIsStarting(false);
    
    const initialSetupDone = localStorage.getItem('industrial-hub-initial-setup') || getConfigKey('initialSetupCompleted');
    if (!initialSetupDone) {
      setShowInitialSetupModal(true);
      return;
    }
    
    await checkRustPath();
  };

  const handleInitialSetupComplete = async () => {
    setShowInitialSetupModal(false);
    await checkRustPath();
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
                  <AppMain />
                  <FeedbackButton />
                  <InitialSetupModal 
                    isOpen={showInitialSetupModal} 
                    onComplete={handleInitialSetupComplete} 
                  />
                  <ReleaseNotesModal />
                  <RustPathModal isOpen={showRustModal} onClose={() => setShowRustModal(false)} />
                  <ToastContainer />
                  <ConfirmModal />
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
