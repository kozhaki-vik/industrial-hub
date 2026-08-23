/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getConfigKey, setConfigKey } from '../services/store';
import { setDisplayGamma, resetDisplayGamma, getDisplays } from '../services/gamma';
import { registerGlobalHook, unregisterGlobalHook } from '../services/hook';
import { mapToVirtualKeyCode } from '../utils/keyboardMap';

const GammaContext = createContext();

export function useGamma() {
  return useContext(GammaContext);
}

export function GammaProvider({ children }) {
  const [gammaBind, setGammaBind] = useState(getConfigKey('gammaBind') || '');
  const [isNightVision, setIsNightVision] = useState(false);
  const [displays, setDisplays] = useState([]);
  const [selectedDisplay, setSelectedDisplay] = useState(getConfigKey('selectedGammaDisplay') || '');
  const [nightVisionLevel, setNightVisionLevel] = useState(getConfigKey('gammaLevel') || 200);

  // Initialization: fetch monitors
  useEffect(() => {
    getDisplays().then(monitors => {
      setDisplays(monitors);
      let target = getConfigKey('selectedGammaDisplay');
      if (monitors.length > 0 && (!target || !monitors.includes(target))) {
        target = monitors[0];
        setSelectedDisplay(target);
        setConfigKey('selectedGammaDisplay', target);
      }
    });
  }, []);

  // Update config when bind changes
  useEffect(() => {
    setConfigKey('gammaBind', gammaBind);
  }, [gammaBind]);

  // Handle hotkey logic globally
  useEffect(() => {
    let isActive = true;
    const toggleGamma = () => {
      setIsNightVision(prev => {
        if (!prev) setDisplayGamma(nightVisionLevel, selectedDisplay);
        else resetDisplayGamma(selectedDisplay);
        return !prev;
      });
    };

    const setupHook = async () => {
      const vkCode = mapToVirtualKeyCode(gammaBind);
      if (vkCode) {
        await registerGlobalHook(vkCode, () => {
          if (isActive) toggleGamma();
        });
      } else {
        await unregisterGlobalHook();
      }
    };
    
    setupHook();
    
    return () => {
      isActive = false;
      unregisterGlobalHook();
    };
  }, [gammaBind, selectedDisplay, nightVisionLevel]);

  const handleSetGammaBind = (bind) => {
    setGammaBind(bind);
  };

  const handleSetSelectedDisplay = (disp) => {
    setSelectedDisplay(disp);
    setConfigKey('selectedGammaDisplay', disp);
    resetDisplayGamma(selectedDisplay); // Reset old monitor just in case
    if (isNightVision) setDisplayGamma(nightVisionLevel, disp);
  };

  const handleSetNightVisionLevel = (level) => {
    setNightVisionLevel(level);
    setConfigKey('gammaLevel', level);
    if (isNightVision) {
      setDisplayGamma(level, selectedDisplay);
    }
  };

  const enableGamma = () => {
    setDisplayGamma(nightVisionLevel, selectedDisplay);
    setIsNightVision(true);
  };

  const disableGamma = () => {
    resetDisplayGamma(selectedDisplay);
    setIsNightVision(false);
  };

  const value = {
    gammaBind,
    setGammaBind: handleSetGammaBind,
    isNightVision,
    enableGamma,
    disableGamma,
    displays,
    selectedDisplay,
    setSelectedDisplay: handleSetSelectedDisplay,
    nightVisionLevel,
    setNightVisionLevel: handleSetNightVisionLevel
  };

  return (
    <GammaContext.Provider value={value}>
      {children}
    </GammaContext.Provider>
  );
}
