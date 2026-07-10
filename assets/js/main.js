(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const config = Object.assign({
    webhookUrl: "",
    thankYouUrl: "thank-you.html",
    whatsappUrl: "",
    calendlyUrl: "",
    requestTimeoutMs: 12000
  }, window.LABOR_CONFIG || {});

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "msclkid"];
  const personalDomains = new Set([
    "gmail.com", "googlemail.com", "hotmail.com", "hotmail.com.mx", "outlook.com", "outlook.com.mx",
    "live.com", "live.com.mx", "yahoo.com", "yahoo.com.mx", "icloud.com", "me.com", "msn.com",
    "aol.com", "protonmail.com", "proton.me", "gmx.com", "mail.com"
  ]);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function initYear() {
    $$('[data-current-year]').forEach((element) => {
      element.textContent = String(new Date().getFullYear());
    });
  }

  function initHeader() {
    const header = $('[data-header]');
    const floatingCta = $('.floating-cta');
    if (!header) return;

    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
      if (floatingCta) {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const progress = total > 0 ? window.scrollY / total : 0;
        floatingCta.classList.toggle('is-visible', progress > 0.16 && progress < 0.94);
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  function initScrollProgress() {
    const bar = $('[data-scroll-progress]');
    if (!bar) return;
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const value = total > 0 ? (window.scrollY / total) * 100 : 0;
      bar.style.width = `${clamp(value, 0, 100)}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  }

  function initSmoothAnchors() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      event.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 82;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      closeMobileMenu();
    });
  }

  function closeMobileMenu() {
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-mobile-menu]');
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }

  function initMobileMenu() {
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-mobile-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
      document.body.classList.toggle('menu-open', !open);
    });
  }

  function splitTextElement(element) {
    if (!element || element.dataset.splitReady === '1') return;
    element.dataset.splitReady = '1';
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent || parent.closest('[aria-hidden="true"]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let index = 0;
    nodes.forEach((node) => {
      const fragment = document.createDocumentFragment();
      const parts = node.nodeValue.split(/(\s+)/);
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }
        const outer = document.createElement('span');
        const inner = document.createElement('span');
        outer.className = 'split-word';
        outer.style.setProperty('--word-index', String(index));
        inner.textContent = part;
        outer.appendChild(inner);
        fragment.appendChild(outer);
        index += 1;
      });
      node.parentNode.replaceChild(fragment, node);
    });
  }

  function initReveals() {
    $$('[data-split]').forEach(splitTextElement);
    const elements = $$('.reveal, .split-title');
    elements.forEach((element) => {
      const delay = Number(element.dataset.delay || 0);
      if (delay) element.style.setProperty('--delay', `${delay}ms`);
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
    window.setTimeout(() => {
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.1) element.classList.add('is-visible');
      });
    }, 1100);
  }

  function initCursor() {
    if (reduceMotion || coarsePointer) return;
    const dot = $('.cursor-dot');
    const ring = $('.cursor-ring');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    }, { passive: true });

    const loop = () => {
      dotX += (mouseX - dotX) * 0.36;
      dotY += (mouseY - dotY) * 0.36;
      ringX += (mouseX - ringX) * 0.13;
      ringY += (mouseY - ringY) * 0.13;
      dot.style.transform = `translate3d(${dotX}px,${dotY}px,0) translate(-50%,-50%)`;
      ring.style.transform = `translate3d(${ringX}px,${ringY}px,0) translate(-50%,-50%)`;
      window.requestAnimationFrame(loop);
    };
    loop();

    document.addEventListener('mouseover', (event) => {
      if (event.target.closest('a,button,input,select,textarea,label,[data-tilt]')) document.body.classList.add('cursor-active');
    });
    document.addEventListener('mouseout', (event) => {
      if (event.target.closest('a,button,input,select,textarea,label,[data-tilt]')) document.body.classList.remove('cursor-active');
    });
  }

  function initParallax() {
    if (reduceMotion || coarsePointer) return;
    const elements = $$('[data-parallax]');
    if (!elements.length) return;
    let ticking = false;
    const update = () => {
      const viewportCenter = window.innerHeight / 2;
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
        const factor = Number(element.dataset.parallax || 0.05);
        const offset = (rect.top + rect.height / 2 - viewportCenter) * factor;
        element.style.transform = `translate3d(0,${(-offset).toFixed(1)}px,0)`;
      });
      ticking = false;
    };
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    requestUpdate();
  }

  function initTilt() {
    if (reduceMotion || coarsePointer) return;
    $$('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1100px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translate3d(${x * 5}px,${y * 5}px,0)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg) translate3d(0,0,0)';
      });
    });
  }

  function initMagnetic() {
    if (reduceMotion || coarsePointer) return;
    $$('.magnetic').forEach((element) => {
      element.addEventListener('mousemove', (event) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        element.style.transform = `translate3d(${x * 0.1}px,${y * 0.12}px,0)`;
      });
      element.addEventListener('mouseleave', () => {
        element.style.transform = '';
      });
    });
  }

  function initHeroPointer() {
    if (reduceMotion || coarsePointer) return;
    const visual = $('[data-hero-visual]');
    if (!visual) return;
    const cards = $$('.photo-card, .floating-proof, .shape-square', visual);
    visual.addEventListener('mousemove', (event) => {
      const rect = visual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cards.forEach((card, index) => {
        if (card.matches('[data-tilt]')) return;
        const factor = 5 + index * 2;
        card.style.translate = `${x * factor}px ${y * factor}px`;
      });
    });
    visual.addEventListener('mouseleave', () => cards.forEach((card) => { card.style.translate = ''; }));
  }

  function initAccordion() {
    $$('[data-accordion]').forEach((accordion) => {
      $$('.faq-question', accordion).forEach((button) => {
        button.addEventListener('click', () => {
          const item = button.closest('.faq-item');
          const isOpen = item.classList.contains('is-open');
          $$('.faq-item', accordion).forEach((other) => {
            other.classList.remove('is-open');
            $('.faq-question', other)?.setAttribute('aria-expanded', 'false');
          });
          if (!isOpen) {
            item.classList.add('is-open');
            button.setAttribute('aria-expanded', 'true');
          }
        });
      });
    });
  }


  function initFlipCards() {
    $$('[data-flip-card]').forEach((card) => {
      const setFlipped = (flipped) => {
        card.classList.toggle('is-flipped', flipped);
        card.setAttribute('aria-pressed', String(flipped));
      };

      card.addEventListener('click', () => {
        setFlipped(!card.classList.contains('is-flipped'));
      });

      card.addEventListener('keydown', (event) => {
        if (!['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        setFlipped(!card.classList.contains('is-flipped'));
      });

      card.addEventListener('mouseleave', () => {
        if (!coarsePointer) setFlipped(false);
      });
    });
  }

  function initAutoTimelines() {
    $$('[data-auto-timeline]').forEach((timeline) => {
      const markers = $$('[data-auto-marker]', timeline);
      const panels = $$('[data-auto-panel]', timeline);
      const fill = $('[data-auto-fill]', timeline);
      const cycle = $('[data-auto-cycle]', timeline);
      const current = $('[data-auto-current]', timeline);
      const toggle = $('[data-auto-toggle]', timeline);
      const toggleIcon = $('[data-auto-toggle-icon]', timeline);
      const toggleLabel = $('[data-auto-toggle-label]', timeline);
      const navScroll = $('[data-auto-nav-scroll]', timeline);
      const peopleContext = timeline.closest('.people-grid');
      const badgeNumber = peopleContext ? $('[data-auto-badge-number]', peopleContext) : null;
      const badgeText = peopleContext ? $('[data-auto-badge-text]', peopleContext) : null;
      const interval = Math.max(1800, Number(timeline.dataset.interval || 2800));
      if (!markers.length || markers.length !== panels.length) return;

      let activeIndex = Math.max(0, markers.findIndex((marker) => marker.classList.contains('is-active')));
      let timer = 0;
      let isVisible = false;
      let userPaused = false;
      let interactionPaused = false;

      timeline.style.setProperty('--auto-interval', `${interval}ms`);

      const centerMarker = (marker, behavior = 'smooth') => {
        if (!navScroll || !marker) return;
        const target = marker.offsetLeft - (navScroll.clientWidth - marker.offsetWidth) / 2;
        navScroll.scrollTo({ left: Math.max(0, target), behavior: reduceMotion ? 'auto' : behavior });
      };

      const stop = () => {
        window.clearTimeout(timer);
        timer = 0;
        timeline.classList.remove('is-running');
      };

      const canRun = () => isVisible && !reduceMotion && !userPaused && !interactionPaused && !document.hidden;

      const restartCycle = () => {
        timeline.classList.remove('is-running');
        if (cycle) {
          cycle.style.animation = 'none';
          void cycle.offsetWidth;
          cycle.style.animation = '';
        }
        if (canRun()) timeline.classList.add('is-running');
      };

      const schedule = () => {
        stop();
        if (!canRun()) {
          timeline.classList.toggle('is-paused', userPaused || interactionPaused);
          return;
        }
        timeline.classList.remove('is-paused');
        restartCycle();
        timer = window.setTimeout(() => {
          setActive(activeIndex + 1, { center: true, restart: true });
        }, interval);
      };

      const updateToggle = () => {
        if (!toggle) return;
        const paused = userPaused;
        toggle.setAttribute('aria-pressed', String(paused));
        toggle.setAttribute('aria-label', paused ? 'Reanudar línea de tiempo automática' : 'Pausar línea de tiempo automática');
        if (toggleIcon) toggleIcon.textContent = paused ? '▶' : 'Ⅱ';
        if (toggleLabel) toggleLabel.textContent = paused ? 'Reanudar' : 'Pausar';
      };

      const setActive = (nextIndex, options = {}) => {
        const normalized = (nextIndex + markers.length) % markers.length;
        activeIndex = normalized;

        markers.forEach((marker, index) => {
          const selected = index === activeIndex;
          marker.classList.toggle('is-active', selected);
          marker.setAttribute('aria-selected', String(selected));
          marker.tabIndex = selected ? 0 : -1;
        });

        panels.forEach((panel, index) => {
          const selected = index === activeIndex;
          panel.classList.toggle('is-active', selected);
          panel.toggleAttribute('aria-hidden', !selected);
        });

        const ratio = markers.length > 1 ? activeIndex / (markers.length - 1) : 1;
        if (fill) fill.style.width = `${ratio * 100}%`;
        if (current) current.textContent = String(activeIndex + 1).padStart(2, '0');

        const activeMarker = markers[activeIndex];
        if (badgeNumber) badgeNumber.textContent = String(activeIndex + 1).padStart(2, '0');
        if (badgeText && activeMarker?.dataset.badge) badgeText.textContent = activeMarker.dataset.badge;
        if (options.center !== false) centerMarker(activeMarker, options.behavior || 'smooth');
        if (options.focus) activeMarker.focus({ preventScroll: true });
        if (options.restart !== false) schedule();
      };

      markers.forEach((marker, index) => {
        marker.addEventListener('click', () => setActive(index, { center: true, restart: true }));
        marker.addEventListener('keydown', (event) => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          let next = activeIndex;
          if (event.key === 'ArrowRight') next += 1;
          if (event.key === 'ArrowLeft') next -= 1;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = markers.length - 1;
          setActive(next, { center: true, focus: true, restart: true });
        });
      });

      toggle?.addEventListener('click', () => {
        userPaused = !userPaused;
        updateToggle();
        schedule();
      });

      timeline.addEventListener('focusin', () => {
        interactionPaused = true;
        schedule();
      });
      timeline.addEventListener('focusout', () => {
        window.setTimeout(() => {
          if (!timeline.contains(document.activeElement)) {
            interactionPaused = false;
            schedule();
          }
        }, 0);
      });

      const visibilityObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.28;
              schedule();
            });
          }, { threshold: [0, .28, .6] })
        : null;

      if (visibilityObserver) visibilityObserver.observe(timeline);
      else isVisible = true;

      document.addEventListener('visibilitychange', schedule);
      updateToggle();
      setActive(activeIndex, { center: false, restart: false });
      schedule();
    });
  }

  function initCalendly() {
    const frame = $('[data-calendly-frame]');
    if (!frame) return;
    const url = String(config.calendlyUrl || '').trim();
    if (!url) return;
    frame.removeAttribute('srcdoc');
    frame.src = url;
    frame.closest('[data-calendly-embed]')?.classList.add('is-configured');
  }

  function captureTracking() {
    const params = new URLSearchParams(window.location.search);
    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        try { sessionStorage.setItem(`labor_${key}`, value); } catch (_) {}
      }
    });
    try {
      if (!sessionStorage.getItem('labor_initial_referrer')) sessionStorage.setItem('labor_initial_referrer', document.referrer || 'direct');
      if (!sessionStorage.getItem('labor_initial_url')) sessionStorage.setItem('labor_initial_url', window.location.href);
    } catch (_) {}
  }

  function getTrackingValue(key) {
    try { return sessionStorage.getItem(`labor_${key}`) || ''; } catch (_) { return ''; }
  }

  function addHidden(form, name, value) {
    let input = form.querySelector(`input[type="hidden"][name="${name}"]`);
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      form.appendChild(input);
    }
    input.value = value || '';
  }

  function populateTrackingFields(form) {
    utmKeys.forEach((key) => addHidden(form, key, getTrackingValue(key)));
    addHidden(form, 'page_url', window.location.href);
    addHidden(form, 'page_title', document.title);
    addHidden(form, 'referrer', document.referrer || 'direct');
    addHidden(form, 'submitted_at', new Date().toISOString());
    addHidden(form, 'timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    try {
      addHidden(form, 'initial_referrer', sessionStorage.getItem('labor_initial_referrer') || 'direct');
      addHidden(form, 'initial_url', sessionStorage.getItem('labor_initial_url') || window.location.href);
    } catch (_) {}
  }

  function corporateEmailIsValid(input) {
    const value = input.value.trim().toLowerCase();
    if (!value || !input.validity.valid) return false;
    const domain = value.split('@')[1] || '';
    return domain.includes('.') && !personalDomains.has(domain);
  }

  function validateCorporateEmail(input, showMessage = true) {
    if (!input) return true;
    const field = input.closest('.field');
    const error = $('[data-email-error]', field);
    const valid = corporateEmailIsValid(input);
    if (!input.value.trim()) {
      input.setCustomValidity('Ingresa tu correo corporativo.');
      if (error && showMessage) error.textContent = 'Ingresa tu correo corporativo.';
    } else if (!input.validity.typeMismatch && personalDomains.has((input.value.split('@')[1] || '').toLowerCase())) {
      input.setCustomValidity('Ingresa un correo corporativo');
      if (error && showMessage) error.textContent = 'Ingresa un correo corporativo';
    } else if (!valid) {
      input.setCustomValidity('Ingresa un correo corporativo válido.');
      if (error && showMessage) error.textContent = 'Ingresa un correo corporativo válido.';
    } else {
      input.setCustomValidity('');
      if (error) error.textContent = '';
    }
    field?.classList.toggle('is-invalid', !valid && showMessage);
    return valid;
  }

  function validateStep(step) {
    const fields = $$('input, select, textarea', step).filter((field) => field.type !== 'hidden');
    let valid = true;
    fields.forEach((field) => {
      if (field.matches('[data-corporate-email]')) validateCorporateEmail(field, true);
      if (!field.checkValidity()) {
        valid = false;
        field.closest('.field, .consent')?.classList.add('is-invalid');
      } else {
        field.closest('.field, .consent')?.classList.remove('is-invalid');
      }
    });
    if (!valid) {
      const firstInvalid = fields.find((field) => !field.checkValidity());
      firstInvalid?.reportValidity();
      firstInvalid?.focus({ preventScroll: false });
    }
    return valid;
  }

  function formDataToObject(formData) {
    const object = {};
    formData.forEach((value, key) => {
      object[key] = value;
    });
    return object;
  }

  async function postForm(formData) {
    if (!config.webhookUrl) {
      await new Promise((resolve) => window.setTimeout(resolve, 650));
      return { ok: true, demoMode: true };
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), config.requestTimeoutMs);
    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        keepalive: true
      });
      if (!response.ok && response.type !== 'opaque') throw new Error(`Respuesta HTTP ${response.status}`);
      return { ok: true };
    } catch (error) {
      if (error?.name !== 'AbortError' && navigator.sendBeacon && navigator.sendBeacon(config.webhookUrl, formData)) {
        return { ok: true, beacon: true };
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function buildThankYouUrl() {
    const target = new URL(config.thankYouUrl || 'thank-you.html', window.location.href);
    target.searchParams.set('submitted', '1');
    utmKeys.forEach((key) => {
      const value = getTrackingValue(key);
      if (value) target.searchParams.set(key, value);
    });
    return target.href;
  }

  function initFormModal() {
    const modal = $('[data-modal]');
    const dialog = $('.modal-dialog', modal || document);
    const form = $('[data-lead-form]');
    if (!modal || !dialog || !form) return;

    const stepCurrent = $('[data-step-current]');
    const progress = $('[data-form-progress]');
    const status = $('[data-form-status]');
    const submitButton = $('[data-submit-button]');
    const email = $('[data-corporate-email]', form);
    const salarySelect = $('[data-salary-select]', form);
    const salaryAmountField = $('[data-salary-amount-field]', form);
    const salaryAmount = $('[data-salary-amount]', form);
    let currentStep = 1;
    let returnFocus = null;

    captureTracking();
    populateTrackingFields(form);

    function setStep(stepNumber) {
      currentStep = stepNumber;
      $$('.form-step', form).forEach((step) => {
        const active = Number(step.dataset.step) === currentStep;
        step.hidden = !active;
        step.classList.toggle('is-active', active);
      });
      if (stepCurrent) stepCurrent.textContent = String(currentStep);
      if (progress) progress.style.width = currentStep === 1 ? '50%' : '100%';
      const firstField = $(`.form-step[data-step="${currentStep}"] input, .form-step[data-step="${currentStep}"] select, .form-step[data-step="${currentStep}"] textarea`, form);
      firstField?.focus({ preventScroll: true });
    }

    function openModal(trigger) {
      returnFocus = trigger || document.activeElement;
      closeMobileMenu();
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      window.setTimeout(() => {
        dialog.focus({ preventScroll: true });
        const first = $('input, select, textarea, button', dialog);
        first?.focus({ preventScroll: true });
      }, 80);
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      returnFocus?.focus?.({ preventScroll: true });
    }

    $$('[data-open-modal]').forEach((button) => button.addEventListener('click', () => openModal(button)));
    $$('[data-close-modal]', modal).forEach((button) => button.addEventListener('click', closeModal));

    const footer = $('.site-footer');
    const footerTrigger = footer ? $('[data-open-modal]', footer) : null;
    const pageEndSentinel = $('[data-page-end-sentinel]');
    let autoPopupOpened = false;
    const openAtPageEnd = () => {
      if (autoPopupOpened) return;
      autoPopupOpened = true;
      if (!modal.classList.contains('is-open')) {
        window.setTimeout(() => openModal(footerTrigger || document.body), 160);
      }
    };

    const detectPageEnd = () => {
      const distanceToBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      if (distanceToBottom <= Math.max(40, window.innerHeight * 0.06)) {
        openAtPageEnd();
        window.removeEventListener('scroll', detectPageEnd);
        window.removeEventListener('resize', detectPageEnd);
      }
    };

    if (pageEndSentinel && 'IntersectionObserver' in window) {
      const pageEndObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          openAtPageEnd();
          pageEndObserver.disconnect();
        }
      }, { rootMargin: '0px 0px 90px 0px', threshold: 0 });
      pageEndObserver.observe(pageEndSentinel);
    }
    window.addEventListener('scroll', detectPageEnd, { passive: true });
    window.addEventListener('resize', detectPageEnd, { passive: true });

    document.addEventListener('keydown', (event) => {
      if (!modal.classList.contains('is-open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = $$('button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', dialog)
        .filter((element) => !element.closest('[hidden]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    $('[data-next-step]', form)?.addEventListener('click', () => {
      const step = $('.form-step[data-step="1"]', form);
      if (validateStep(step)) setStep(2);
    });
    $('[data-prev-step]', form)?.addEventListener('click', () => setStep(1));

    email?.addEventListener('input', () => {
      email.setCustomValidity('');
      email.closest('.field')?.classList.remove('is-invalid');
      const error = $('[data-email-error]', email.closest('.field'));
      if (error) error.textContent = '';
    });
    email?.addEventListener('blur', () => {
      if (email.value.trim()) validateCorporateEmail(email, true);
    });

    const syncSalaryAmount = () => {
      const shouldShow = salarySelect?.value === 'Monto aproximado en MXN';
      if (salaryAmountField) salaryAmountField.hidden = !shouldShow;
      if (salaryAmount) {
        salaryAmount.required = Boolean(shouldShow);
        if (!shouldShow) {
          salaryAmount.value = '';
          salaryAmount.setCustomValidity('');
          salaryAmount.closest('.field')?.classList.remove('is-invalid');
        }
      }
    };
    salarySelect?.addEventListener('change', syncSalaryAmount);
    syncSalaryAmount();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const activeStep = $(`.form-step[data-step="${currentStep}"]`, form);
      if (!validateStep(activeStep)) return;

      populateTrackingFields(form);
      const formData = new FormData(form);
      addHidden(form, 'lead_payload_json', JSON.stringify(formDataToObject(formData)));
      const finalData = new FormData(form);

      if (status) {
        status.textContent = 'Enviando tu solicitud…';
        status.className = 'form-status';
      }
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent;
        submitButton.innerHTML = 'Enviando… <span aria-hidden="true">↗</span>';
      }

      try {
        await postForm(finalData);
        if (status) {
          status.textContent = 'Solicitud enviada. Te redirigiremos en un momento.';
          status.className = 'form-status is-success';
        }
        window.setTimeout(() => { window.location.href = buildThankYouUrl(); }, 500);
      } catch (error) {
        console.error('No fue posible enviar el formulario:', error);
        if (status) {
          status.textContent = 'No pudimos enviar la solicitud. Revisa tu conexión e inténtalo nuevamente.';
          status.className = 'form-status is-error';
        }
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = 'Enviar solicitud <span aria-hidden="true">↗</span>';
        }
      }
    });

    setStep(1);
  }

  function initWhatsappLinks() {
    $$('[data-whatsapp-link]').forEach((link) => {
      if (!config.whatsappUrl) {
        link.hidden = true;
        return;
      }
      link.href = config.whatsappUrl;
      link.hidden = false;
    });
  }

  function init() {
    initYear();
    initHeader();
    initScrollProgress();
    initSmoothAnchors();
    initMobileMenu();
    initReveals();
    initCursor();
    initParallax();
    initTilt();
    initMagnetic();
    initHeroPointer();
    initAccordion();
    initFlipCards();
    initAutoTimelines();
    initFormModal();
    initCalendly();
    initWhatsappLinks();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
