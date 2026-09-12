/* ============================================================
   +100 MAPAS MENTAIS DE ASTROLOGIA — LANDING PAGE SCRIPTS
   ============================================================ */

// 1. Variáveis Globais de Checkout
const CHECKOUT_URL = "#checkout"; // Fallback universal
const CHECKOUT_BASICO_URL = "#checkout-basico";
const CHECKOUT_COMPLETO_URL = "#checkout-completo";

// 2. Atualizar data da oferta dinamicamente
(function () {
  'use strict';
  function updateOfferDate() {
    var dateEl = document.querySelector('[data-current-date]');
    if (!dateEl) return;

    var now = new Date();
    var day = String(now.getDate()).padStart(2, '0');
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var year = now.getFullYear();
    dateEl.textContent = day + '/' + month + '/' + year;
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateOfferDate);
  } else {
    updateOfferDate();
  }
})();

// 3. Interações Principais (Marquees, Carrossel de Depoimentos, FAQ Accordion, Scroll Reveal)
(function () {
  'use strict';

  /* ---------- Controles do Marquee de Materiais e Fotos ---------- */
  document.querySelectorAll('[data-marquee-control]').forEach(function (group) {
    var sec = group.closest('.sec') || group.parentElement;
    var tracks = sec ? sec.querySelectorAll('.marquee-track') : [];
    if (!tracks.length) return;
    var timer;
    function speedUp() {
      tracks.forEach(function (track) { track.classList.add('is-fast'); });
      clearTimeout(timer);
      timer = setTimeout(function () {
        tracks.forEach(function (track) { track.classList.remove('is-fast'); });
      }, 1800);
    }
    var prev = group.querySelector('[data-marquee-prev]');
    var next = group.querySelector('[data-marquee-next]');
    if (prev) prev.addEventListener('click', speedUp);
    if (next) next.addEventListener('click', speedUp);
  });

  /* ---------- Carrossel de Depoimentos ---------- */
  var tTrack = document.querySelector('[data-testi-track]');
  if (tTrack) {
    var slides = tTrack.children.length;
    var idx = 0;
    var dotsWrap = document.querySelector('[data-testi-dots]');
    var tPrev = document.querySelector('[data-testi-prev]');
    var tNext = document.querySelector('[data-testi-next]');
    var dots = [];
    
    if (dotsWrap) {
      for (var i = 0; i < slides; i++) {
        var b = document.createElement('button');
        b.setAttribute('aria-label', 'Depoimento ' + (i + 1));
        (function (n) { b.addEventListener('click', function () { go(n); }); })(i);
        dotsWrap.appendChild(b);
        dots.push(b);
      }
    }
    
    function go(n) {
      idx = (n + slides) % slides;
      tTrack.style.transform = 'translateX(' + (-idx * 100) + '%)';
      dots.forEach(function (d, j) { d.classList.toggle('on', j === idx); });
    }
    
    if (tPrev) tPrev.addEventListener('click', function () { go(idx - 1); auto(); });
    if (tNext) tNext.addEventListener('click', function () { go(idx + 1); auto(); });
    
    var timer;
    function auto() {
      clearInterval(timer);
      timer = setInterval(function () { go(idx + 1); }, 6500);
    }
    go(0);
    auto();
  }

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;

    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          var otherA = other.querySelector('.faq-a');
          if (otherA) otherA.style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Reveal on Scroll ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Image Preview Modal (Lightbox) ---------- */
  var modal = document.getElementById('imgModal');
  var modalImg = document.getElementById('imgModalSrc');
  var modalClose = document.getElementById('imgModalClose');

  function openImageModal(src, alt) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modalImg.alt = alt || 'Imagem Ampliada';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeImageModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    var card = e.target.closest('.gal-card, .photo-card');
    if (card) {
      var img = card.querySelector('img');
      if (img && img.src) {
        openImageModal(img.src, img.alt);
        return;
      }
    }

    if (e.target.matches('.hero-img, .receive-img, .plan-img, .bonus-img, .testi-img')) {
      openImageModal(e.target.src, e.target.alt);
    }
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeImageModal);
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.classList.contains('img-modal-backdrop') || e.target.classList.contains('img-modal')) {
        closeImageModal();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeImageModal();
    }
  });
})();

// 4. Rastreamento e Injeção Instantânea de Parâmetros UTM no Clique dos Botões de Checkout (Lowtrack / Analytics)
(function () {
  'use strict';

  var UTM_STORAGE_KEY = '__astrology_utm_params__';

  function saveCurrentUtms() {
    var search = window.location.search;
    if (search && search.length > 1) {
      try {
        sessionStorage.setItem(UTM_STORAGE_KEY, search);
        localStorage.setItem(UTM_STORAGE_KEY, search);
      } catch (e) {}
    }
  }

  function getUtmQueryString() {
    var search = window.location.search;
    if (search && search.length > 1) return search;

    try {
      var stored = sessionStorage.getItem(UTM_STORAGE_KEY) || localStorage.getItem(UTM_STORAGE_KEY);
      if (stored) return stored;
    } catch (e) {}

    return '';
  }

  function injectUtmsToUrl(targetUrl) {
    if (!targetUrl) return targetUrl;
    var utmQuery = getUtmQueryString();
    if (!utmQuery) return targetUrl;

    try {
      var incomingParams = new URLSearchParams(utmQuery);
      var anchor = '';

      var hashIdx = targetUrl.indexOf('#');
      var baseUrl = targetUrl;
      if (hashIdx !== -1) {
        anchor = targetUrl.substring(hashIdx);
        baseUrl = targetUrl.substring(0, hashIdx);
      }

      var urlParts = baseUrl.split('?');
      var path = urlParts[0];
      var existingParams = new URLSearchParams(urlParts[1] || '');

      incomingParams.forEach(function (value, key) {
        if (!existingParams.has(key)) {
          existingParams.set(key, value);
        }
      });

      var newQuery = existingParams.toString();
      return path + (newQuery ? '?' + newQuery : '') + anchor;
    } catch (e) {
      return targetUrl;
    }
  }

  function syncAllCheckoutLinks() {
    saveCurrentUtms();
    document.querySelectorAll('a[data-checkout], a[href*="checkout"], a[href*="pay"], a[href*="hotmart"], a[href*="kiwify"], a[href*="monetizze"], a[href*="eduzz"]').forEach(function (link) {
      var currentHref = link.getAttribute('href');
      if (currentHref && !currentHref.startsWith('#')) {
        link.setAttribute('href', injectUtmsToUrl(currentHref));
      }
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('a[data-checkout], a.btn, .plan a');
    if (!btn) return;

    saveCurrentUtms();
    var href = btn.getAttribute('href');
    if (!href || href.startsWith('#')) return;

    var finalCheckoutUrl = injectUtmsToUrl(href);
    btn.setAttribute('href', finalCheckoutUrl);
  }, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncAllCheckoutLinks);
  } else {
    syncAllCheckoutLinks();
  }
})();
