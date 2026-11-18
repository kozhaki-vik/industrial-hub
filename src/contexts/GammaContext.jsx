/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getConfigKey, setConfigKey } from '../services/store';
import { setDisplayGamma, resetDisplayGamma, getDisplays } from '../services/gamma';
import { registerGlobalShortcut, unregisterGlobalShortcut } from '../services/hotkeyService';

const GammaContext = createContext();

export function useGamma() {
  return useContext(GammaContext);
}

export function GammaProvider({ children }) {
  const [gammaBind, setGammaBind] = useState(getConfigKey('gammaBind') || '');
  const [isNightVision, setIsNightVision] = useState(false);
  const [displays, setDisplays] = useState([]);
  const [selectedDisplay, setSelectedDisplay] = useState(getConfigKey('selectedGammaDisplay') || '');
  const nightVisionLevel = 100;

  const isNightVisionRef = useRef(false);
  const selectedDisplayRef = useRef(selectedDisplay);
  const lastToggleTimeRef = useRef(0);

  // Keep refs strictly synchronized
  useEffect(() => {
    isNightVisionRef.current = isNightVision;
  }, [isNightVision]);

  useEffect(() => {
    selectedDisplayRef.current = selectedDisplay;
  }, [selectedDisplay]);

  // Initialization: fetch monitors & sort them naturally (DISPLAY1, DISPLAY2)
  useEffect(() => {
    getDisplays().then(monitors => {
      if (!Array.isArray(monitors)) return;
      const sorted = [...monitors].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      setDisplays(sorted);
      let target = getConfigKey('selectedGammaDisplay');
      if (sorted.length > 0 && (!target || !sorted.includes(target))) {
        target = sorted[0];
        setSelectedDisplay(target);
        selectedDisplayRef.current = target;
        setConfigKey('selectedGammaDisplay', target);
      }
    });
  }, []);

  // Update config when bind changes
  useEffect(() => {
    setConfigKey('gammaBind', gammaBind);
  }, [gammaBind]);

  // Pure toggle function with debounce and outside-updater side effects
  const toggleGamma = useCallback(() => {
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 300) {
      return; // Debounce double-invocations or OS repeat
    }
    lastToggleTimeRef.current = now;

    const nextState = !isNightVisionRef.current;
    const targetDisplay = selectedDisplayRef.current;

    if (nextState) {
      setDisplayGamma(100, targetDisplay);
    } else {
      resetDisplayGamma(targetDisplay);
    }
    setIsNightVision(nextState);
  }, []);

  // Handle hotkey registration globally - depends ONLY on gammaBind, NOT on selectedDisplay
  useEffect(() => {
    let isActive = true;

    const setupShortcut = async () => {
      const bind = gammaBind && typeof gammaBind === 'string' ? gammaBind.trim() : gammaBind;
      if (bind) {
        await registerGlobalShortcut(bind, () => {
          if (isActive) toggleGamma();
        });
      } else {
        await unregisterGlobalShortcut();
      }
    };
    
    setupShortcut();
    
    return () => {
      isActive = false;
      unregisterGlobalShortcut();
    };
  }, [gammaBind, toggleGamma]);

  const handleSetGammaBind = (bind) => {
    setGammaBind(bind);
  };

  const handleSetSelectedDisplay = useCallback((disp) => {
    if (!disp || disp === selectedDisplayRef.current) return;
    const oldDisp = selectedDisplayRef.current;

    selectedDisplayRef.current = disp;
    setSelectedDisplay(disp);
    setConfigKey('selectedGammaDisplay', disp);

    // If night vision is currently active, transition smoothly:
    // clear old monitor and apply to new monitor
    if (isNightVisionRef.current) {
      if (oldDisp) {
        resetDisplayGamma(oldDisp);
      }
      setDisplayGamma(100, disp);
    } else if (oldDisp) {
      // Ensure old display calibration is reset
      resetDisplayGamma(oldDisp);
    }
  }, []);

  const enableGamma = useCallback(() => {
    const disp = selectedDisplayRef.current || selectedDisplay;
    setDisplayGamma(100, disp);
    setIsNightVision(true);
  }, [selectedDisplay]);

  const disableGamma = useCallback(() => {
    const disp = selectedDisplayRef.current || selectedDisplay;
    resetDisplayGamma(disp);
    setIsNightVision(false);
  }, [selectedDisplay]);

  const value = {
    gammaBind,
    setGammaBind: handleSetGammaBind,
    isNightVision,
    enableGamma,
    disableGamma,
    displays,
    selectedDisplay,
    setSelectedDisplay: handleSetSelectedDisplay,
    nightVisionLevel
  };

  return (
    <GammaContext.Provider value={value}>
      {children}
    </GammaContext.Provider>
  );
}
