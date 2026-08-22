import { getConfigKey, setConfigKey } from './store';

export const trackButtonClick = (buttonName) => {
  if (!buttonName) return;
  const stats = getConfigKey('buttonStats') || {};
  
  // Normalize button name (trim, max length 50)
  let name = buttonName.trim().substring(0, 50);
  if (!name) return;
  
  stats[name] = (stats[name] || 0) + 1;
  setConfigKey('buttonStats', stats);
};

export const getButtonStats = () => {
  return getConfigKey('buttonStats') || {};
};

let isInitialized = false;

export const initAnalytics = () => {
  if (isInitialized) return;
  isInitialized = true;

  // Save first launch date if not exists
  const firstLaunch = getConfigKey('firstLaunchDate');
  if (!firstLaunch) {
    setConfigKey('firstLaunchDate', new Date().toISOString());
  }

  // Global click listener to track buttons
  window.addEventListener('click', (e) => {
    // Find closest button or element with role="button"
    const btn = e.target.closest('button, [role="button"]');
    if (btn) {
      // Try to get a meaningful name for the button
      const name = btn.getAttribute('aria-label') || btn.title || btn.innerText || btn.id;
      if (name) {
        // Strip out newlines and multiple spaces
        const cleanName = name.replace(/\s+/g, ' ').trim();
        if (!cleanName) return;

        // Extract context (Route + closest container heading)
        let context = window.location.pathname === '/' ? '/dashboard' : window.location.pathname;
        const container = btn.closest('[role="dialog"], .rounded-2xl, .rounded-xl, .bg-white');
        if (container) {
          const heading = container.querySelector('h1, h2, h3');
          if (heading && heading.innerText) {
            let hText = heading.innerText.replace(/\s+/g, ' ').trim();
            if (hText.length > 25) hText = hText.substring(0, 25) + '...';
            context += ` | ${hText}`;
          }
        }

        const finalName = `[${context}] ${cleanName}`;
        trackButtonClick(finalName);
      }
    }
  });
};
