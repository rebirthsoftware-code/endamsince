'use client';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** SADECE hero sekansını çalar — scroll animasyonları PageAnimations'da */
function playHeroSequence() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl.fromTo('.hero-bg',    { scale: 1.12, opacity: 0 }, { scale: 1.06, opacity: 1, duration: 1.6 }, 0);
  tl.fromTo('.hero-overlay', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.1);
  tl.fromTo('.hero-top-bar', { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.9 }, 0.3);
  tl.fromTo('.hero-left .label-orange', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.5);
  tl.fromTo('.h-hero',   { opacity: 0, y: 60, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: 1.2 }, 0.65);
  tl.fromTo('.hero-right', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 1.1 }, 0.7);
  tl.fromTo('.hero-right-line', { scaleX: 0, transformOrigin: 'left' }, { scaleX: 1, width: '56px', duration: 0.9, ease: 'power3.inOut' }, 0.9);
  tl.fromTo('.hero-bottom', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.0 }, 1.0);
  tl.fromTo('.hero-scroll-cue', { opacity: 0 }, { opacity: 1, duration: 1.0 }, 1.4);

  // Stat counters
  const statEls  = document.querySelectorAll('.hero-stat-val');
  const targets  = [15000, 45, 3];
  const suffixes = ['K+', '+', ''];
  statEls.forEach((el, i) => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: targets[i], duration: 2.2, delay: 1.2 + i * 0.12, ease: 'power3.out',
      onUpdate() {
        const v = Math.round(obj.val);
        el.textContent = i === 0
          ? (v >= 1000 ? Math.round(v / 1000) + suffixes[i] : v + '')
          : v + suffixes[i];
      },
    });
  });
}

export default function HomeAnimations() {
  useEffect(() => {
    // Hero elementleri başlangıçta gizle
    gsap.set([
      '.hero-bg', '.hero-overlay', '.hero-top-bar',
      '.hero-left .label-orange', '.h-hero',
      '.hero-right', '.hero-bottom', '.hero-scroll-cue',
    ], { opacity: 0 });
    gsap.set('.hero-right-line', { scaleX: 0, transformOrigin: 'left' });

    const onLsDone = () => playHeroSequence();
    window.addEventListener('ls:done', onLsDone, { once: true });

    // Dev: loading screen yoksa hemen başlat
    if (!document.querySelector('.ls-root')) {
      setTimeout(playHeroSequence, 80);
    }

    return () => window.removeEventListener('ls:done', onLsDone);
  }, []);

  return null;
}
