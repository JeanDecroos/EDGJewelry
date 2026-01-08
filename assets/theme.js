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
   * Cart (AJAX add + drawer refresh)
   * - Keep user on current page when adding to cart
   * - Do NOT auto-open cart drawer
   * - Update header cart count + cart drawer contents in-place
   */
  function initAjaxCart() {
    const root = window.Shopify?.routes?.root || '/';

    function getCartToggleLinks() {
      return document.querySelectorAll('[data-cart-toggle], .header__cart');
    }

    function updateHeaderCartCount(itemCount) {
      getCartToggleLinks().forEach(link => {
        link.textContent = itemCount > 0 ? `cart (${itemCount})` : 'cart';
      });
    }

    function getCurrencyCode(cart) {
      return (
        cart?.currency ||
        window.Shopify?.currency?.active ||
        window.Shopify?.currency?.currency ||
        'EUR'
      );
    }

    function formatMoney(cents, currency) {
      const amount = (Number(cents) || 0) / 100;
      try {
        return new Intl.NumberFormat(document.documentElement.lang || undefined, {
          style: 'currency',
          currency: currency || 'EUR'
        }).format(amount);
      } catch (e) {
        // Fallback: basic formatting
        return `${amount.toFixed(2)} ${currency || ''}`.trim();
      }
    }

    async function fetchCart() {
      const res = await fetch(`${root}cart.js`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'same-origin'
      });
      if (!res.ok) throw new Error('Failed to fetch cart');
      return await res.json();
    }

    function renderDrawerFromCart(cart) {
      const drawer = document.querySelector('[data-cart-drawer]');
      if (!drawer) return;

      const body = drawer.querySelector('.cart-drawer__body');
      if (!body) return;

      const currency = getCurrencyCode(cart);

      if (!cart || !cart.items || cart.item_count === 0) {
        body.innerHTML = '<p class="cart-drawer__empty">your cart is empty</p>';
        const footer = drawer.querySelector('.cart-drawer__footer');
        if (footer) footer.remove();
        return;
      }

      const itemsHtml = cart.items.map(item => {
        const url = item.url || '#';
        const title = (item.product_title || item.title || '').toLowerCase();
        const variantTitle = (item.variant_title && item.variant_title !== 'Default Title')
          ? item.variant_title.toLowerCase()
          : '';

        const imageUrl =
          item.image ||
          item.featured_image?.url ||
          item.featured_image?.src ||
          '';

        const imageAlt =
          item.featured_image?.alt ||
          item.title ||
          '';

        const linePrice = formatMoney(item.final_line_price ?? item.line_price ?? 0, currency);

        // /cart/change expects "id" to be the line item key when using AJAX API
        const key = item.key;
        const qty = Number(item.quantity) || 1;

        return `
          <li class="cart-drawer__item" data-cart-drawer-item data-item-key="${String(key)}">
            <a href="${url}" class="cart-drawer__item-image">
              ${imageUrl ? `<img src="${imageUrl}" alt="${String(imageAlt).replace(/"/g, '&quot;')}" loading="lazy" width="80" height="80">` : ''}
            </a>
            <div class="cart-drawer__item-info">
              <a href="${url}" class="cart-drawer__item-title">${title}</a>
              ${variantTitle ? `<p class="cart-drawer__item-variant">${variantTitle}</p>` : ''}
              <p class="cart-drawer__item-price">${linePrice}</p>
            </div>
            <div class="cart-drawer__item-quantity">
              <form action="${root}cart/change" method="post" data-cart-drawer-qty-form>
                <input type="hidden" name="id" value="${String(key)}">
                <button type="submit" name="quantity" value="${qty - 1}" class="cart-drawer__quantity-btn" aria-label="Decrease quantity">−</button>
                <span class="cart-drawer__quantity-value">${qty}</span>
                <button type="submit" name="quantity" value="${qty + 1}" class="cart-drawer__quantity-btn" aria-label="Increase quantity">+</button>
              </form>
            </div>
            <a href="${root}cart/change?id=${encodeURIComponent(String(key))}&quantity=0" class="cart-drawer__item-remove" data-cart-drawer-remove aria-label="Remove ${String(item.title || '')}">
              remove
            </a>
          </li>
        `;
      }).join('');

      body.innerHTML = `<ul class="cart-drawer__items">${itemsHtml}</ul>`;

      const existingFooter = drawer.querySelector('.cart-drawer__footer');
      if (existingFooter) existingFooter.remove();

      const subtotal = formatMoney(cart.total_price ?? 0, currency);
      const footer = document.createElement('footer');
      footer.className = 'cart-drawer__footer';
      footer.innerHTML = `
        <div class="cart-drawer__subtotal">
          <span>subtotal</span>
          <span>${subtotal}</span>
        </div>
        <p class="cart-drawer__note">shipping calculated at checkout</p>
        <a href="${root}cart" class="cart-drawer__checkout-btn">checkout</a>
      `;
      drawer.querySelector('.cart-drawer__content')?.appendChild(footer);
    }

    async function refreshCartUI() {
      const cart = await fetchCart();
      updateHeaderCartCount(cart.item_count || 0);
      renderDrawerFromCart(cart);
      return cart;
    }

    async function addToCart(form) {
      const formData = new FormData(form);

      const res = await fetch(`${root}cart/add.js`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Failed to add to cart');
      }
    }

    async function changeCartItem(key, quantity) {
      const res = await fetch(`${root}cart/change.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ id: key, quantity }),
        credentials: 'same-origin'
      });

      if (!res.ok) throw new Error('Failed to update cart');
      return await res.json();
    }

    // Intercept add-to-cart forms globally (stay on page, no auto-open)
    document.querySelectorAll('form[action*="/cart/add"]').forEach(form => {
      form.addEventListener('submit', async (e) => {
        // Allow normal behavior if JS-enhanced submitter is explicitly bypassed
        if (form.hasAttribute('data-no-ajax')) return;

        e.preventDefault();

        const submitBtn = e.submitter;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.setAttribute('aria-busy', 'true');
        }

        try {
          await addToCart(form);
          await refreshCartUI();
          // Important: do NOT open the drawer automatically
        } catch (err) {
          console.error('Add to cart failed:', err);
          // Fallback: normal submit (Shopify default)
          form.submit();
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
          }
        }
      });
    });

    // Intercept cart drawer quantity +/- and remove actions to avoid navigation
    const drawer = document.querySelector('[data-cart-drawer]');
    if (drawer) {
      drawer.addEventListener('submit', async (e) => {
        const form = e.target;
        if (!(form instanceof HTMLFormElement)) return;
        if (!form.matches('[data-cart-drawer-qty-form]')) return;

        e.preventDefault();

        const submitBtn = e.submitter;
        const key = form.querySelector('input[name="id"]')?.value;
        const quantity = submitBtn ? parseInt(submitBtn.value, 10) : NaN;

        if (!key || Number.isNaN(quantity)) return;

        try {
          await changeCartItem(key, Math.max(0, quantity));
          await refreshCartUI();
        } catch (err) {
          console.error('Cart drawer update failed:', err);
          // Fallback: allow normal navigation
          form.submit();
        }
      });

      drawer.addEventListener('click', async (e) => {
        const link = e.target?.closest?.('[data-cart-drawer-remove]');
        if (!link) return;

        e.preventDefault();

        try {
          const url = new URL(link.getAttribute('href'), window.location.origin);
          const key = url.searchParams.get('id');
          const quantity = parseInt(url.searchParams.get('quantity') || '0', 10);
          if (!key) return;
          await changeCartItem(key, Math.max(0, quantity));
          await refreshCartUI();
        } catch (err) {
          console.error('Cart drawer remove failed:', err);
          // Fallback: navigate
          window.location.href = link.getAttribute('href');
        }
      });
    }

    // Initial sync (ensures drawer/header count are correct after client-side navigation)
    // Avoid blocking first paint; run soon after init.
    setTimeout(() => {
      refreshCartUI().catch(() => {});
    }, 0);
  }

  /**
   * Mobile Menu
   * Toggle mobile navigation
   */
  function initMobileMenu() {
    const toggle = document.querySelector('[data-mobile-menu-toggle]');
    const menu = document.getElementById('MobileMenu');
    if (!toggle || !menu) return;

    function toggleMenu() {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      const willBeOpen = !isOpen;
      
      toggle.setAttribute('aria-expanded', willBeOpen);
      menu.hidden = !willBeOpen;
      document.body.style.overflow = willBeOpen ? 'hidden' : '';
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMenu();
    });

    // Close menu when clicking on a link
    const menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
        document.body.style.overflow = '';
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
        document.body.style.overflow = '';
      }
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
   * Custom Piece Form File Upload
   * Handle file attachments for custom piece form
   */
  function initCustomPieceFileUpload() {
    const form = document.getElementById('CustomPieceForm');
    const fileInput = document.getElementById('ContactFormAttachment');
    const filePreview = document.getElementById('FilePreview');
    const messageTextarea = document.getElementById('ContactFormMessage');
    
    if (!form || !fileInput || !filePreview) return;

    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const selectedFiles = [];

    function formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    function createFilePreview(file) {
      const preview = document.createElement('div');
      preview.className = 'custom-piece__file-item';
      
      const name = document.createElement('span');
      name.className = 'custom-piece__file-name';
      name.textContent = file.name;
      
      const size = document.createElement('span');
      size.className = 'custom-piece__file-size';
      size.textContent = `(${formatFileSize(file.size)})`;
      
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'custom-piece__file-remove';
      removeBtn.textContent = '×';
      removeBtn.setAttribute('aria-label', 'Remove file');
      
      removeBtn.addEventListener('click', () => {
        const index = selectedFiles.indexOf(file);
        if (index > -1) {
          selectedFiles.splice(index, 1);
        }
        preview.remove();
        updateFileInput();
        updateMessageWithFiles();
      });
      
      preview.appendChild(name);
      preview.appendChild(size);
      preview.appendChild(removeBtn);
      
      return preview;
    }

    function updateFileInput() {
      const dt = new DataTransfer();
      selectedFiles.forEach(file => dt.items.add(file));
      fileInput.files = dt.files;
    }

    function updateMessageWithFiles() {
      if (!messageTextarea || selectedFiles.length === 0) return;
      
      const originalMessage = messageTextarea.value.replace(/\n\n---\nAttached files:.*$/s, '');
      const fileList = selectedFiles.map((file, index) => `${index + 1}. ${file.name} (${formatFileSize(file.size)})`).join('\n');
      const attachmentNote = `\n\n---\nAttached files:\n${fileList}`;
      
      messageTextarea.value = originalMessage + attachmentNote;
    }

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      
      files.forEach(file => {
        // Validate file size
        if (file.size > maxFileSize) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
          return;
        }
        
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          alert(`File "${file.name}" is not a supported format. Please upload images, PDFs, or Word documents.`);
          return;
        }
        
        // Check if file already selected
        if (selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
          return;
        }
        
        selectedFiles.push(file);
        const preview = createFilePreview(file);
        filePreview.appendChild(preview);
      });
      
      updateFileInput();
      updateMessageWithFiles();
    });

    // Update message when user types
    if (messageTextarea) {
      let lastValue = messageTextarea.value;
      messageTextarea.addEventListener('input', () => {
        const currentValue = messageTextarea.value;
        // If user deleted the attachment note, don't re-add it automatically
        if (!currentValue.includes('---\nAttached files:')) {
          lastValue = currentValue;
        } else {
          // Keep the attachment note if files are selected
          if (selectedFiles.length > 0) {
            updateMessageWithFiles();
          }
        }
      });
    }
  }

  /**
   * Phone input (Custom Piece)
   * Country code selector + national number input -> combined into hidden contact[phone]
   */
  function initPhoneInputValidation() {
    const group = document.querySelector('[data-phone-group]');
    if (!group) return;

    const countrySelect = group.querySelector('[data-phone-country]');
    const nationalInput = group.querySelector('[data-phone-national]');
    const combinedHidden = group.querySelector('[data-phone-e164]');

    if (!(countrySelect instanceof HTMLSelectElement)) return;
    if (!(nationalInput instanceof HTMLInputElement)) return;
    if (!(combinedHidden instanceof HTMLInputElement)) return;

    function sanitizeNational(value) {
      return String(value || '')
        .replace(/[^\d().\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function sanitizeCombined(value) {
      return String(value || '')
        .replace(/[^\d+().\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function syncCombined() {
      const national = sanitizeNational(nationalInput.value);
      const selected = countrySelect.selectedOptions?.[0];
      const code =
        (selected?.dataset?.code || '').trim() ||
        String(countrySelect.value || '').split(':')[1] ||
        String(countrySelect.value || '').trim();

      if (!national) {
        combinedHidden.value = '';
        return;
      }

      combinedHidden.value = `${code} ${national}`.trim();
    }

    function tryHydrateFromCombined() {
      const existing = sanitizeCombined(combinedHidden.value);
      if (!existing) return;

      // If it starts with +<digits>, try to match selector values
      const match = existing.match(/^\+(\d{1,4})\s*(.*)$/);
      if (!match) {
        // If it's not in +CC format, treat everything as national
        nationalInput.value = sanitizeNational(existing);
        syncCombined();
        return;
      }

      const fullCode = `+${match[1]}`;
      const rest = match[2] || '';

      // Prefer first option with matching dial code (may be shared by multiple countries like +1)
      const option = Array.from(countrySelect.options).find(o => (o.dataset?.code || o.value).includes(fullCode));
      if (option) option.selected = true;

      nationalInput.value = sanitizeNational(rest);
      syncCombined();
    }

    // Initialize from any pre-filled form/customer value
    tryHydrateFromCombined();

    // Keep hidden value synced
    countrySelect.addEventListener('change', () => {
      syncCombined();
    });
    nationalInput.addEventListener('input', () => {
      syncCombined();
    });
    nationalInput.addEventListener('blur', () => {
      nationalInput.value = sanitizeNational(nationalInput.value);
      syncCombined();
    });

    // Ensure hidden value is up to date at submit time
    const form = combinedHidden.closest('form');
    if (form) {
      form.addEventListener('submit', () => {
        syncCombined();
      });
    }
  }

  /**
   * Phone country code dropdown (Custom UI with SVG flags)
   * Drives the hidden <select data-phone-country> so existing sync logic keeps working.
   */
  function initPhoneCodeDropdown() {
    const group = document.querySelector('[data-phone-group]');
    if (!group) return;

    const countrySelect = group.querySelector('[data-phone-country]');
    const widget = group.querySelector('[data-phone-code]');
    const button = group.querySelector('[data-phone-code-button]');
    const dropdown = group.querySelector('[data-phone-code-dropdown]');
    const search = group.querySelector('[data-phone-code-search]');
    const noResults = group.querySelector('[data-phone-code-no-results]');
    const flag = group.querySelector('[data-phone-flag]');
    const text = group.querySelector('[data-phone-code-text]');
    const options = group.querySelectorAll('[data-phone-code-option]');

    if (!(countrySelect instanceof HTMLSelectElement)) return;
    if (!(widget instanceof HTMLElement)) return;
    if (!(button instanceof HTMLButtonElement)) return;
    if (!(dropdown instanceof HTMLElement)) return;
    if (!(flag instanceof HTMLElement)) return;
    if (!(text instanceof HTMLElement)) return;
    if (search && !(search instanceof HTMLInputElement)) return;
    if (noResults && !(noResults instanceof HTMLElement)) return;
    if (!options.length) return;

    function setFlagByCountry(countryCode) {
      const country = String(countryCode || '').trim().toLowerCase();
      const flagClassPrefix = 'custom-piece__phone-flag--';

      Array.from(flag.classList).forEach(cls => {
        if (cls.startsWith(flagClassPrefix)) flag.classList.remove(cls);
      });

      if (country) flag.classList.add(`${flagClassPrefix}${country}`);
    }

    function open() {
      dropdown.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      if (search) {
        search.value = '';
        filter('');
        search.focus();
      }
    }

    function close() {
      dropdown.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    }

    function toggle() {
      if (dropdown.hidden) open();
      else close();
    }

    function labelFromSelectOption(opt) {
      const code = (opt?.dataset?.code || '').trim() || '';
      const raw = (opt?.textContent || '').trim();
      const name = raw.replace(/\s*\(\s*\+\d+.*?\)\s*$/, '').trim();
      return name && code ? `${name} ${code}` : (name || code || raw);
    }

    function setSelected(country, code, label) {
      const c = String(country || '').toUpperCase();
      const dial = String(code || '').trim();

      const match = Array.from(countrySelect.options).find(o =>
        (o.dataset?.country || '').toUpperCase() === c && (o.dataset?.code || '').trim() === dial
      );
      if (match) match.selected = true;

      text.textContent = label || `${c} ${dial}`.trim();
      setFlagByCountry(c);
      countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Initialize visual state from current select value
    const selectedOpt = countrySelect.selectedOptions?.[0] || countrySelect.options[0];
    const initCountry = (selectedOpt?.dataset?.country || 'BE').toUpperCase();
    const initCode = (selectedOpt?.dataset?.code || '+32').trim();
    setSelected(initCountry, initCode, labelFromSelectOption(selectedOpt));
    close();

    button.addEventListener('click', (e) => {
      e.preventDefault();
      toggle();
    });

    options.forEach(optBtn => {
      optBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const code = optBtn.getAttribute('data-code');
        const country = optBtn.getAttribute('data-country');
        const label = optBtn.getAttribute('data-label');
        if (!code || !country) return;
        setSelected(country, code, label);
        close();
        button.focus();
      });
    });

    function filter(query) {
      const q = String(query || '').trim().toLowerCase();
      let visibleCount = 0;

      options.forEach(btn => {
        const label = (btn.getAttribute('data-label') || btn.textContent || '').toLowerCase();
        const match = !q || label.includes(q);
        const li = btn.closest('li');
        if (li) li.hidden = !match;
        if (match) visibleCount++;
      });

      if (noResults) noResults.hidden = visibleCount !== 0;
    }

    if (search) {
      search.addEventListener('input', () => {
        filter(search.value);
      });

      search.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          close();
          button.focus();
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const firstVisible = Array.from(options).find(btn => !btn.closest('li')?.hidden);
          firstVisible?.focus?.();
        }
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!widget.contains(e.target)) {
        close();
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dropdown.hidden) {
        close();
        button.focus();
      }
    });
  }

  /**
   * Cart Page (AJAX)
   * Handle cart updates via AJAX on desktop
   */
  function initCartPage() {
    const cartSection = document.querySelector('[data-cart-section]');
    if (!cartSection) return;

    const cartForm = cartSection.querySelector('[data-cart-form]');
    const cartContent = cartSection.querySelector('[data-cart-content]');
    if (!cartForm || !cartContent) return;

    // Check if we're on desktop (window width > 768px)
    const isDesktop = window.innerWidth > 768;
    if (!isDesktop) return; // Skip AJAX on mobile, use normal form submission

    // Prevent default form submission
    cartForm.addEventListener('submit', async (e) => {
      const submitButton = e.submitter;
      
      // If it's the checkout button, allow normal submission
      if (submitButton && submitButton.name === 'checkout') {
        return; // Allow normal checkout flow
      }

      // If it's the update button, use AJAX
      if (submitButton && submitButton.name === 'update') {
        e.preventDefault();
        await updateCart();
      }
    });

    // Quantity buttons
    cartSection.querySelectorAll('[data-quantity-increase]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const item = btn.closest('[data-cart-item]');
        const input = item.querySelector('[data-quantity-input]');
        const currentQty = parseInt(input.value) || 0;
        input.value = currentQty + 1;
        await updateCartItem(item);
      });
    });

    cartSection.querySelectorAll('[data-quantity-decrease]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const item = btn.closest('[data-cart-item]');
        const input = item.querySelector('[data-quantity-input]');
        const currentQty = parseInt(input.value) || 0;
        if (currentQty > 1) {
          input.value = currentQty - 1;
          await updateCartItem(item);
        }
      });
    });

    // Quantity input changes
    cartSection.querySelectorAll('[data-quantity-input]').forEach(input => {
      input.addEventListener('change', async () => {
        const item = input.closest('[data-cart-item]');
        await updateCartItem(item);
      });
    });

    // Remove item buttons
    cartSection.querySelectorAll('[data-remove-item]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const item = btn.closest('[data-cart-item]');
        const itemKey = item.dataset.itemKey;
        await removeCartItem(itemKey);
      });
    });

    /**
     * Update a single cart item
     */
    async function updateCartItem(itemElement) {
      const itemKey = itemElement.dataset.itemKey;
      const quantityInput = itemElement.querySelector('[data-quantity-input]');
      const quantity = parseInt(quantityInput.value) || 0;

      if (quantity === 0) {
        await removeCartItem(itemKey);
        return;
      }

      try {
        const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart/change.js`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: itemKey,
            quantity: quantity
          })
        });

        if (!response.ok) throw new Error('Failed to update cart');

        const cart = await response.json();
        await refreshCart(cart);
      } catch (error) {
        console.error('Error updating cart item:', error);
        // Fallback to normal form submission
        cartForm.submit();
      }
    }

    /**
     * Remove a cart item
     */
    async function removeCartItem(itemKey) {
      try {
        const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart/change.js`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: itemKey,
            quantity: 0
          })
        });

        if (!response.ok) throw new Error('Failed to remove item');

        const cart = await response.json();
        await refreshCart(cart);
      } catch (error) {
        console.error('Error removing cart item:', error);
        // Fallback to normal form submission
        window.location.href = `${window.Shopify?.routes?.cart_change_url || '/cart/change'}?id=${itemKey}&quantity=0`;
      }
    }

    /**
     * Update entire cart
     */
    async function updateCart() {
      const formData = new FormData(cartForm);
      const updates = {};

      formData.getAll('updates[]').forEach((quantity, index) => {
        const items = cartForm.querySelectorAll('[data-cart-item]');
        if (items[index]) {
          const itemKey = items[index].dataset.itemKey;
          updates[itemKey] = parseInt(quantity) || 0;
        }
      });

      try {
        const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart/update.js`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ updates })
        });

        if (!response.ok) throw new Error('Failed to update cart');

        const cart = await response.json();
        await refreshCart(cart);
      } catch (error) {
        console.error('Error updating cart:', error);
        // Fallback to normal form submission
        cartForm.submit();
      }
    }

    /**
     * Refresh cart UI with new data
     */
    async function refreshCart(cart) {
      // Update cart count in header
      const cartLinks = document.querySelectorAll('[data-cart-toggle], .header__cart');
      cartLinks.forEach(link => {
        const text = link.textContent.trim();
        const baseText = text.replace(/\s*\(\d+\)\s*$/, '').replace(/^\s*cart\s*/i, 'cart');
        link.textContent = cart.item_count > 0 ? `cart (${cart.item_count})` : 'cart';
      });

      // If cart is empty, reload page to show empty state
      if (cart.item_count === 0) {
        window.location.reload();
        return;
      }

      // Fetch updated cart HTML using section rendering
      try {
        const shopifySection = cartSection.closest('.shopify-section');
        const sectionId = shopifySection?.id?.replace('shopify-section-', '') || 'main-cart';
        
        const response = await fetch(`${window.Shopify?.routes?.root || '/'}?section_id=${sectionId}`);
        if (!response.ok) throw new Error('Failed to fetch cart section');
        
        const text = await response.text();
        const html = document.createElement('div');
        html.innerHTML = text;
        
        const newCartSection = html.querySelector('[data-cart-section]');
        if (newCartSection) {
          const newCartContent = newCartSection.querySelector('[data-cart-content]');
          if (newCartContent) {
            cartContent.innerHTML = newCartContent.innerHTML;
            
            // Re-initialize cart page handlers for new elements
            // Use setTimeout to ensure DOM is updated
            setTimeout(() => {
              initCartPage();
            }, 0);
          }
        } else {
          // Fallback: reload page
          window.location.reload();
        }
      } catch (error) {
        console.error('Error refreshing cart:', error);
        window.location.reload();
      }
    }
  }

  /**
   * Cookie Consent Handler
   * Automatically accept Shopify's cookie consent to prevent popup from showing
   */
  function initCookieConsent() {
    // Function to hide cookie banners
    function hideCookieBanners() {
      // Common selectors for Shopify cookie consent banners
      const selectors = [
        '#shopify-cookie-banner',
        '[data-shopify-cookie-banner]',
        '.shopify-cookie-banner',
        '#cookie-consent-banner',
        '[data-cookie-consent]',
        '.cookie-consent-banner',
        '[id*="cookie"]',
        '[id*="Cookie"]',
        '[class*="cookie-consent"]',
        '[class*="CookieConsent"]'
      ];

      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el.textContent && (
              el.textContent.includes('cookie') || 
              el.textContent.includes('Cookie') ||
              el.textContent.includes('privacy') ||
              el.textContent.includes('Privacy')
            )) {
              el.style.display = 'none';
              el.style.visibility = 'hidden';
              el.style.opacity = '0';
              el.style.height = '0';
              el.style.overflow = 'hidden';
              el.setAttribute('hidden', 'true');
            }
          });
        } catch (e) {
          // Ignore errors for invalid selectors
        }
      });
    }

    // Try to automatically accept cookies if there's an accept button
    function autoAcceptCookies() {
      const acceptButtons = document.querySelectorAll(
        'button[data-cookie-accept], ' +
        'button[id*="accept"], ' +
        'button[class*="accept"], ' +
        'a[data-cookie-accept], ' +
        'a[id*="accept"], ' +
        'a[class*="accept"]'
      );

      acceptButtons.forEach(btn => {
        const text = btn.textContent.toLowerCase();
        if (text.includes('accept') || text.includes('akkoord') || text.includes('ok')) {
          try {
            btn.click();
          } catch (e) {
            // Ignore click errors
          }
        }
      });
    }

    // Run immediately
    hideCookieBanners();
    autoAcceptCookies();

    // Run again after a short delay (in case banner loads asynchronously)
    setTimeout(() => {
      hideCookieBanners();
      autoAcceptCookies();
    }, 100);

    // Also watch for dynamically added elements
    const observer = new MutationObserver(() => {
      hideCookieBanners();
      autoAcceptCookies();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up observer after 5 seconds (banner should be loaded by then)
    setTimeout(() => {
      observer.disconnect();
    }, 5000);
  }

  /**
   * Featured Collection Carousel
   * Horizontal scrolling carousel with navigation buttons
   */
  function initFeaturedCarousel() {
    const carousels = document.querySelectorAll('[data-carousel]');
    if (!carousels.length) return;

    carousels.forEach(carousel => {
      const track = carousel.querySelector('[data-carousel-track]');
      const prevBtn = carousel.closest('.featured-collection__carousel-wrapper')?.querySelector('[data-carousel-prev]');
      const nextBtn = carousel.closest('.featured-collection__carousel-wrapper')?.querySelector('[data-carousel-next]');
      
      if (!track) return;

      const slides = track.querySelectorAll('.featured-collection__slide');
      if (slides.length === 0) return;

      let currentIndex = 0;
      let slidesToShow = 4; // Default desktop
      
      // Calculate slides to show based on viewport
      function updateSlidesToShow() {
        if (window.innerWidth <= 600) {
          slidesToShow = 1;
        } else if (window.innerWidth <= 1024) {
          slidesToShow = 2;
        } else {
          slidesToShow = 4;
        }
      }

      function updateCarousel() {
        updateSlidesToShow();
        const slideWidth = 100 / slidesToShow;
        const maxIndex = Math.max(0, slides.length - slidesToShow);
        currentIndex = Math.min(currentIndex, maxIndex);
        
        const translateX = -(currentIndex * slideWidth);
        track.style.transform = `translateX(${translateX}%)`;
        
        // Update button states
        if (prevBtn) {
          prevBtn.disabled = currentIndex === 0;
        }
        if (nextBtn) {
          nextBtn.disabled = currentIndex >= maxIndex;
        }
      }

      // Navigation handlers
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          const maxIndex = Math.max(0, slides.length - slidesToShow);
          if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
          }
        });
      }

      // Update on resize
      let resizeTimeout;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          updateCarousel();
        }, 150);
      });

      // Initialize
      updateCarousel();

      // Auto-scroll (optional - can be enabled via data attribute)
      if (carousel.dataset.autoScroll === 'true') {
        const autoScrollInterval = parseInt(carousel.dataset.autoScrollInterval) || 5000;
        let autoScrollTimer;
        
        function startAutoScroll() {
          autoScrollTimer = setInterval(() => {
            const maxIndex = Math.max(0, slides.length - slidesToShow);
            if (currentIndex < maxIndex) {
              currentIndex++;
            } else {
              currentIndex = 0; // Loop back to start
            }
            updateCarousel();
          }, autoScrollInterval);
        }

        function stopAutoScroll() {
          clearInterval(autoScrollTimer);
        }

        // Pause on hover
        carousel.addEventListener('mouseenter', stopAutoScroll);
        carousel.addEventListener('mouseleave', startAutoScroll);

        startAutoScroll();
      }
    });
  }

  /**
   * Initialize all modules
   */
  function init() {
    initHeader();
    initScrollReveal();
    initCartDrawer();
    initAjaxCart();
    initMobileMenu();
    initProductGallery();
    initVariantSelector();
    initLocalizationSelector();
    initProductRecommendations();
    initCustomPieceFileUpload();
    initPhoneInputValidation();
    initPhoneCodeDropdown();
    initCartPage();
    initCookieConsent();
    initFeaturedCarousel();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

