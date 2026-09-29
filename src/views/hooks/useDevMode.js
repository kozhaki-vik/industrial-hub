import { useState, useRef, useEffect } from 'react';
import { getConfigKey } from '../../services/store';

export function useDevMode() {
  const [devAdminMode, setDevAdminMode] = useState(() => getConfigKey('devAdminModeEnabled') === true);
  const isDevAdminActive = devAdminMode || getConfigKey('devAdminModeEnabled') === true;
  const activeDevGuildIdRef = useRef(getConfigKey('devActiveGuildId') || null);
  const [isDevAuthenticated, setIsDevAuthenticated] = useState(false);
  const [devGuilds, setDevGuilds] = useState([]);
  const [devShowServerGrid, setDevShowServerGrid] = useState(false);
  const [isGuildDropdownOpen, setIsGuildDropdownOpen] = useState(false);
  const [guildSearchQuery, setGuildSearchQuery] = useState('');
  const [loadingDevGuilds, setLoadingDevGuilds] = useState(false);

  useEffect(() => {
    const checkDevMode = async () => {
      let enabled = getConfigKey('devAdminModeEnabled') === true;
      if (!enabled && window.electronAPI?.store) {
        try {
          const val = await window.electronAPI.store.get('devAdminModeEnabled');
          if (val === true) setDevAdminMode(true);
        } catch (e) { console.error('[Auto-caught Error]', e); }
      }
    };
    checkDevMode();
  }, []);

  return {
    devAdminMode,
    setDevAdminMode,
    isDevAdminActive,
    activeDevGuildIdRef,
    isDevAuthenticated,
    setIsDevAuthenticated,
    devGuilds,
    setDevGuilds,
    devShowServerGrid,
    setDevShowServerGrid,
    isGuildDropdownOpen,
    setIsGuildDropdownOpen,
    guildSearchQuery,
    setGuildSearchQuery,
    loadingDevGuilds,
    setLoadingDevGuilds
  };
}
