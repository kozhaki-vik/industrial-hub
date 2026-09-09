/**
 * Form validation and auto-scroll utilities for Industrial Hub.
 * Finds unfilled required inputs, highlights them in red with a subtle shake,
 * and smoothly scrolls the active view/tab directly to the first missing field from the top.
 */

/**
 * Highlights an element with error styling and smoothly scrolls it into view.
 * Automatically clears the error highlight on the next user interaction.
 *
 * @param {HTMLElement} element - The DOM element to highlight and scroll to
 * @param {boolean} [shouldFocus=true] - Whether to focus the element
 */
export function scrollToAndHighlight(element, shouldFocus = true) {
  if (!element || typeof element.getBoundingClientRect !== 'function') return;

  // Add visual error highlight
  element.classList.add('input-error-highlight');

  // Smoothly scroll the container or window so this element is centered
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  });

  // Focus the element after a tiny delay for smooth animation
  if (shouldFocus && typeof element.focus === 'function') {
    setTimeout(() => {
      try {
        element.focus({ preventScroll: true });
      } catch (e) {}
    }, 150);
  }

  // Auto-remove highlight when user starts typing or changes value
  const clearHandler = () => {
    element.classList.remove('input-error-highlight');
    element.removeEventListener('input', clearHandler);
    element.removeEventListener('change', clearHandler);
  };
  element.addEventListener('input', clearHandler);
  element.addEventListener('change', clearHandler);
}

/**
 * Checks a form or container for empty required fields.
 * If invalid fields are found:
 * - Highlights all of them.
 * - Smoothly scrolls the viewport/tab to the FIRST invalid element (from top to bottom).
 * - Focuses the first invalid element.
 *
 * @param {HTMLFormElement|HTMLElement|React.RefObject|string} target - Form or container element, ref, or selector
 * @returns {boolean} True if all required fields are filled, false if any required field is empty
 */
export function validateForm(target) {
  let root = null;
  if (!target) return true;

  if (typeof target === 'string') {
    root = document.querySelector(target);
  } else if (target && 'current' in target) {
    root = target.current;
  } else if (target instanceof HTMLElement) {
    root = target;
  } else if (target && target.target && target.target instanceof HTMLElement) {
    root = target.target;
  }

  if (!root) return true;

  // Find all required fields
  const candidates = Array.from(
    root.querySelectorAll(
      'input[required], textarea[required], select[required], [data-required="true"]'
    )
  );

  // Filter for unfilled/empty fields
  const invalidElements = candidates.filter((el) => {
    // Ignore disabled or hidden elements
    if (el.disabled) return false;
    if (el.offsetParent === null && el.type !== 'hidden') {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
    }

    if (el.type === 'checkbox' || el.type === 'radio') {
      return !el.checked;
    }

    const val = el.value !== undefined ? el.value : el.getAttribute('data-value');
    return !val || String(val).trim().length === 0;
  });

  if (invalidElements.length === 0) {
    return true;
  }

  // Sort invalid elements by their vertical position in document (top to bottom)
  invalidElements.sort((a, b) => {
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();
    return rectA.top - rectB.top;
  });

  // Highlight all invalid fields
  invalidElements.forEach((el, index) => {
    // Only scroll & focus the first (top-most) element
    if (index === 0) {
      scrollToAndHighlight(el, true);
    } else {
      scrollToAndHighlight(el, false);
    }
  });

  return false;
}
