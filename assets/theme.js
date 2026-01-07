/**
 * Theme JS - Minimalist Luxury Jewelry Theme
 * 
 * Only essential interactions:
 * - Header scroll compression
 * - Scroll reveal animations
 * - Cart drawer toggle
 * - Product gallery thumbnails
 * - Mobile menu toggle
 */

(function() {
  'use strict';

  /**
   * Header Scroll Behavior
   * Adds 'is-scrolled' class when page is scrolled
   */
  function initHeader() {
    const header = document.querySelector('[data-header]');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY;
      
      if (scrollY > 50) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }

      lastScrollY = scrollY;
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateHeader();
  }

  /**
   * Scroll Reveal
   * Subtle fade-in animation for product cards using IntersectionObserver
   */
  function initScrollReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      elements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add staggered delay based on position in grid
            const siblings = Array.from(entry.target.parentElement.children);
            const index = siblings.indexOf(entry.target);
            const delay = (index % 4) * 50; // Stagger by column position

            setTimeout(() => {
              entry.target.classList.add('is-revealed');
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
      }
    );

    elements.forEach(el => observer.observe(el));
  }

  /**
   * Cart Drawer
   * Toggle cart drawer visibility
   */
  function initCartDrawer() {
    const drawer = document.querySelector('[data-cart-drawer]');
    if (!drawer) return;

    const toggleButtons = document.querySelectorAll('[data-cart-toggle]');
    const closeButtons = document.querySelectorAll('[data-cart-drawer-close]');

    function openDrawer(e) {
      e.preventDefault();
      drawer.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.hidden = true;
      document.body.style.overflow = '';
    }

    toggleButtons.forEach(btn => {
      btn.addEventListener('click', openDrawer);
    });

    closeButtons.forEach(btn => {
      btn.addEventListener('click', closeDrawer);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.hidden) {
        closeDrawer();
      }
    });
  }

  /**
   * Mobile Menu
   * Toggle mobile navigation
   */
  function initMobileMenu() {
    const toggle = document.querySelector('[data-mobile-menu-toggle]');
    const menu = document.getElementById('MobileMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      
      toggle.setAttribute('aria-expanded', !isOpen);
      menu.hidden = isOpen;
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });
  }

  /**
   * Product Gallery Thumbnails
   * Switch active image on thumbnail click
   */
  function initProductGallery() {
    const thumbnails = document.querySelectorAll('[data-thumbnail]');
    if (!thumbnails.length) return;

    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        const mediaId = thumbnail.dataset.mediaId;
        const gallery = thumbnail.closest('.main-product__media');
        
        if (!gallery) return;

        // Update thumbnails
        gallery.querySelectorAll('[data-thumbnail]').forEach(t => {
          t.classList.toggle('is-active', t.dataset.mediaId === mediaId);
        });

        // Update gallery images
        gallery.querySelectorAll('.main-product__media-item').forEach(item => {
          item.classList.toggle('is-active', item.dataset.mediaId === mediaId);
        });
      });
    });
  }

  /**
   * Product Variant Selector
   * Update variant ID when options change
   */
  function initVariantSelector() {
    const form = document.querySelector('.main-product__form');
    if (!form) return;

    const selects = form.querySelectorAll('[data-option-select]');
    const variantInput = form.querySelector('input[name="id"]');
    
    // Get product variants from JSON
    const productSection = form.closest('[data-section-type="main-product"]');
    const jsonElement = productSection?.nextElementSibling;
    
    if (!jsonElement || jsonElement.tagName !== 'SCRIPT') return;
    
    let variants;
    try {
      variants = JSON.parse(jsonElement.textContent);
    } catch (e) {
      return;
    }

    function updateVariant() {
      const selectedOptions = Array.from(selects).map(select => select.value);
      
      const matchingVariant = variants.find(variant => {
        return variant.options.every((option, index) => option === selectedOptions[index]);
      });

      if (matchingVariant && variantInput) {
        variantInput.value = matchingVariant.id;
      }
    }

    selects.forEach(select => {
      select.addEventListener('change', updateVariant);
    });
  }

  /**
   * Localization Selector
   * Toggle country/currency dropdown
   */
  function initLocalizationSelector() {
    const selectors = document.querySelectorAll('.header__selector');
    
    selectors.forEach(selector => {
      const button = selector.querySelector('.header__selector-button');
      const dropdown = selector.querySelector('.header__dropdown');
      
      if (!button || !dropdown) return;

      button.addEventListener('click', () => {
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', !isOpen);
        dropdown.hidden = isOpen;
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!selector.contains(e.target)) {
          button.setAttribute('aria-expanded', 'false');
          dropdown.hidden = true;
        }
      });
    });
  }

  /**
   * Product Recommendations
   * Fetch and render product recommendations
   */
  function initProductRecommendations() {
    const section = document.querySelector('[data-section-type="product-recommendations"]');
    if (!section) return;

    const productId = section.dataset.productId;
    const limit = section.dataset.limit || 4;
    
    if (!productId) return;

    const url = `${window.Shopify?.routes?.root || '/'}recommendations/products?product_id=${productId}&limit=${limit}&section_id=${section.closest('.shopify-section')?.id?.replace('shopify-section-', '')}`;

    fetch(url)
      .then(response => response.text())
      .then(text => {
        const html = document.createElement('div');
        html.innerHTML = text;
        
        const recommendations = html.querySelector('.product-recommendations__inner');
        if (recommendations) {
          section.innerHTML = '';
          section.appendChild(recommendations);
          
          // Re-init scroll reveal for new elements
          initScrollReveal();
        }
      })
      .catch(err => {
        console.error('Error loading recommendations:', err);
      });
  }

  /**
   * Initialize all modules
   */
  function init() {
    initHeader();
    initScrollReveal();
    initCartDrawer();
    initMobileMenu();
    initProductGallery();
    initVariantSelector();
    initLocalizationSelector();
    initProductRecommendations();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

