import { useMemo } from 'react';

export function useClanNetwork(rawWs, isDevAdminActive, activeDevGuildIdRef, guildIdRef) {
  // Transparent WebSocket wrapper that ensures all proxy calls carry the active Discord guild ID
  const ws = useMemo(() => {
    if (!rawWs) return null;
    return new Proxy(rawWs, {
      get(target, prop) {
        if (prop === 'send') {
          return (dataStr) => {
            try {
              const parsed = typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
              if (parsed && parsed.type === 'clan' && parsed.action === 'proxy') {
                const activeGid = parsed.targetGuildId || (isDevAdminActive ? activeDevGuildIdRef.current : undefined) || guildIdRef.current;
                if (activeGid && !parsed.targetGuildId) {
                  parsed.targetGuildId = activeGid;
                }
              }
              return target.send(typeof parsed === 'string' ? parsed : JSON.stringify(parsed));
            } catch (e) {
              return target.send(dataStr);
            }
          };
        }
        const val = target[prop];
        if (typeof val === 'function') {
          return val.bind(target);
        }
        return val;
      }
    });
  }, [rawWs, isDevAdminActive, activeDevGuildIdRef, guildIdRef]);

  return ws;
}
