/* ═══════════════════════════════════════════════════════
   script.js — Birthday Invitation
   Handles: splash dismiss, audio unlock, fade-in observer
═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Element refs ──────────────────────────────────────
  const splash    = document.getElementById('splash');
  const enterBtn  = document.getElementById('enter-btn');
  const mainSite  = document.getElementById('main-site');
  const bgAudio   = document.getElementById('bg-audio');

  // ── Intersection Observer — fade-in sections ──────────
  // Observes every .fade-in-block on the page
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target); // fire once
        }
      });
    },
    { threshold: 0.15 }
  );

  function observeFadeBlocks() {
    document.querySelectorAll('.fade-in-block').forEach((el) => {
      fadeObserver.observe(el);
    });
  }

  // ── Audio helpers ─────────────────────────────────────
  // Mobile browsers need a direct user-gesture call to .play()
  function startAudio() {
    if (!bgAudio.src && !bgAudio.querySelector('source')?.src) {
      // No audio file linked yet — silently skip
      return;
    }
    bgAudio.volume = 0;
    const playPromise = bgAudio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Fade volume in smoothly over ~2 seconds
          fadeAudioIn(bgAudio, 0.55, 2000);
        })
        .catch((err) => {
          // Autoplay still blocked — not critical, site continues
          console.warn('Audio autoplay blocked:', err.message);
        });
    }
  }

  function fadeAudioIn(audio, targetVolume, durationMs) {
    const steps    = 40;
    const interval = durationMs / steps;
    const increment = targetVolume / steps;
    let current = 0;

    const timer = setInterval(() => {
      current = Math.min(current + increment, targetVolume);
      audio.volume = current;
      if (current >= targetVolume) clearInterval(timer);
    }, interval);
  }

  // ── Splash dismiss ────────────────────────────────────
  function dismissSplash() {
    // 1. Disable button immediately to prevent double-tap
    enterBtn.disabled = true;

    // 2. Start audio — we are inside a user gesture here
    startAudio();

    // 3. Fade out splash
    splash.classList.add('hidden');

    // 4. Reveal main site after a short overlap delay
    setTimeout(() => {
      mainSite.removeAttribute('aria-hidden');
      mainSite.classList.add('visible');

      // Trigger any fade-in blocks already in viewport
      observeFadeBlocks();
    }, 400); // slight overlap with splash fade
  }

  // ── Event listeners ───────────────────────────────────
  enterBtn.addEventListener('click', dismissSplash);

  // Touch devices: also listen for touchend to feel snappier
  enterBtn.addEventListener('touchend', (e) => {
    e.preventDefault(); // prevent ghost click
    dismissSplash();
  }, { passive: false });

  // ── Re-observe if new sections are added later ────────
  // (useful when we build more sections progressively)
  window.__observeFadeBlocks = observeFadeBlocks;

  // ── Navbar: solid on scroll ───────────────────────────
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ── Hero video parallax ───────────────────────────────
  const heroVideo = document.querySelector('.hero-video');

  if (heroVideo) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      // Move video up at 40% of scroll speed — creates depth
      heroVideo.style.transform = `scale(1.08) translateY(${scrolled * 0.4}px)`;
    }, { passive: true });
  }

  // ── Theme section: image parallax ────────────────────
    const themeBg = document.getElementById('theme-bg');

    if (themeBg) {
      window.addEventListener('scroll', () => {
        const section   = themeBg.closest('.section-theme');
        const rect      = section.getBoundingClientRect();
        const inView    = rect.top < window.innerHeight && rect.bottom > 0;

        if (inView) {
          // Translate relative to how far through the section we've scrolled
          const progress  = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
          const offset    = (progress - 0.5) * 160; // 160px total travel range
          themeBg.style.transform = `translateY(${offset}px)`;
        }
      }, { passive: true });
    }
})();
