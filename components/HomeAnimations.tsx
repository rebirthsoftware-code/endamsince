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

  // Stat counters — DB'den gelen değerleri (örn. '15K+', '45+', '3') koruyarak
  // 0'dan hedefe say. Sayısal kısmı parse edip suffix'i ayrı tut.
  const statEls = document.querySelectorAll<HTMLElement>('.hero-stat-val');
  statEls.forEach((el) => {
    const original = (el.textContent || '').trim();
    if (!original) return;
    const match = original.match(/^([\d.,]+)\s*([KMkm]?\+?.*)$/);
    if (!match) return;
    const numStr = match[1].replace(/[.,]/g, '');
    const suffix = match[2] || '';
    let target = parseInt(numStr, 10);
    if (isNaN(target)) return;
    // 'K' suffix'i varsa hedef bin katı (örn. 15K+ → 15000)
    const isThousand = /[Kk]/.test(suffix);
    if (isThousand) target = target * 1000;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 1.8, delay: 0.8, ease: 'power3.out',
      onUpdate() {
        const v = Math.round(obj.val);
        if (isThousand) {
          el.textContent = (v >= 1000 ? Math.round(v / 1000) : v) + suffix;
        } else {
          el.textContent = v + suffix;
        }
      },
      onComplete() {
        // Animasyon bitiminde DB'den gelen orijinal yazıyı geri yaz (kesinlik için)
        el.textContent = original;
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
