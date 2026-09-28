// Global scroll lock manager with reference counting
// Prevents background page scrolling while modals are open,
// without interfering with normal tab/section navigation.

let activeModalCount = 0;
let originalBodyOverflow = '';

export function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  if (activeModalCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  activeModalCount++;
}

export function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  activeModalCount = Math.max(0, activeModalCount - 1);
  if (activeModalCount === 0) {
    document.body.style.overflow = originalBodyOverflow || '';
  }
}
