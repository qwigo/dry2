/**
 * Global XSS Prevention for DRY2 Components
 * This script runs immediately to prevent script execution in slot content
 * before custom elements are even defined.
 */

(function() {
  'use strict';
  
  console.log('🛡️ XSS Prevention: Initializing global script protection');
  
  // Function to sanitize element and remove dangerous content
  function sanitizeElement(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    
    // Remove script tags
    const scripts = element.querySelectorAll('script');
    scripts.forEach(script => {
      console.log('🛡️ XSS Prevention: Removing script:', script.outerHTML);
      script.remove();
    });
    
    // Remove dangerous event handlers
    const dangerousAttrs = [
      'onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur',
      'onchange', 'onsubmit', 'onreset', 'onselect', 'onunload', 'onabort'
    ];
    
    const allElements = [element, ...element.querySelectorAll('*')];
    allElements.forEach(el => {
      dangerousAttrs.forEach(attr => {
        if (el.hasAttribute(attr)) {
          console.log(`🛡️ XSS Prevention: Removing ${attr} from ${el.tagName}`);
          el.removeAttribute(attr);
        }
      });
    });
  }
  
  // Set up global MutationObserver to catch dangerous content being added
  const globalObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      // Check for added nodes
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Sanitize any added element that contains scripts or dangerous content
          if (node.tagName) {
            console.log('🛡️ XSS Prevention: Checking added node:', node.tagName);
            sanitizeElement(node);
          }
        }
      });
    });
  });
  
  // Start observing the document
  globalObserver.observe(document, {
    childList: true,
    subtree: true
  });
  
  // Sanitize any existing components and dangerous content when script loads
  function sanitizeExistingComponents() {
    // Check all elements for dangerous content
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      const scripts = element.querySelectorAll('script');
      if (scripts.length > 0 || element.tagName === 'SCRIPT') {
        console.log('🛡️ XSS Prevention: Sanitizing existing element with scripts:', element.tagName);
        sanitizeElement(element);
      }
    });
    
    // Also specifically check DRY components
    const dryComponents = document.querySelectorAll('[class*="dry-"], dry-card, dry-button, dry-accordion');
    dryComponents.forEach(component => {
      console.log('🛡️ XSS Prevention: Sanitizing DRY component:', component.tagName);
      sanitizeElement(component);
    });
  }
  
  // Run sanitization immediately and after DOM is ready
  sanitizeExistingComponents();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sanitizeExistingComponents);
  }
  
  // Also run a delayed check in case components are added dynamically
  setTimeout(sanitizeExistingComponents, 100);
  setTimeout(sanitizeExistingComponents, 500);
  
  console.log('🛡️ XSS Prevention: Global protection active');
})(); 