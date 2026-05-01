'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function PageAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    // Route değişince eski trigger'ları temizle
    ScrollTrigger.getAll().forEach(t => t.kill());

    /* ── Ortak animasyonlu element selectors ──────────────── */
    const ALL = [
      '.page-hero h1',
      '.page-hero p',
      '.page-hero-label',
      '.h-section',
      '.h-card',
      '.h-display',
      '.section-index',
      '.eyebrow',
      '.label-orange',
      '.intro-text',
      '.intro-cta',
      '.card',
      '.svc-row',
      '.prod-prev-card',
      '.testi-item',
      '.branch-item',
      '.team-card-mini',
      '.cta-body',
      '.about-split-body',
      '.about-split-badge',
    ].join(',');

    // Başlangıçta gizle (flash önleme)
    gsap.set(ALL, { opacity: 0 });

    /* ── Page hero — dramatik slide up ────────────────────── */
    const pageH1 = document.querySelector('.page-hero h1');
    if (pageH1) {
      gsap.set('.page-hero h1', { y: 50, skewY: 1 });
      ScrollTrigger.create({
        trigger: '.page-hero h1',
        start: 'top 90%',
        onEnter: () =>
          gsap.to('.page-hero h1', {
            opacity: 1, y: 0, skewY: 0,
            duration: 1.2, ease: 'power4.out',
          }),
      });
    }

    gsap.set('.page-hero-label', { x: -24 });
    ScrollTrigger.batch('.page-hero-label', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, x: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' }),
      start: 'top 92%',
    });

    gsap.set('.page-hero p', { y: 24 });
    ScrollTrigger.batch('.page-hero p', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.12, duration: 1.0, ease: 'power3.out' }),
      start: 'top 90%',
    });

    /* ── Section headings ─────────────────────────────────── */
    gsap.set('.h-section, .h-display', { x: -50 });
    ScrollTrigger.batch('.h-section, .h-display', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, x: 0, stagger: 0.08, duration: 1.1, ease: 'power4.out' }),
      start: 'top 85%',
    });

    /* ── Cards ────────────────────────────────────────────── */
    gsap.set('.h-card', { y: 20 });
    ScrollTrigger.batch('.h-card', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' }),
      start: 'top 85%',
    });

    /* ── Labels & eyebrows ────────────────────────────────── */
    gsap.set('.section-index, .eyebrow', { x: -20 });
    ScrollTrigger.batch('.section-index, .eyebrow', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, x: 0, stagger: 0.08, duration: 0.8, ease: 'power2.out' }),
      start: 'top 90%',
    });

    gsap.set('.label-orange', { y: 12 });
    ScrollTrigger.batch('.label-orange', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.08, duration: 0.7, ease: 'power2.out' }),
      start: 'top 90%',
    });

    /* ── Generic cards ────────────────────────────────────── */
    gsap.set('.card', { y: 30, scale: 0.98 });
    ScrollTrigger.batch('.card', {
      onEnter: batch =>
        gsap.to(batch, {
          opacity: 1, y: 0, scale: 1,
          stagger: 0.1, duration: 1.0, ease: 'power3.out',
        }),
      start: 'top 85%',
    });

    /* ── Service rows ─────────────────────────────────────── */
    gsap.set('.svc-row', { x: -30 });
    ScrollTrigger.batch('.svc-row', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, x: 0, stagger: 0.09, duration: 0.9, ease: 'power3.out' }),
      start: 'top 88%',
    });

    /* ── Intro texts ──────────────────────────────────────── */
    gsap.set('.intro-text, .intro-cta', { y: 30 });
    ScrollTrigger.batch('.intro-text, .intro-cta', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, duration: 1.1, ease: 'power3.out' }),
      start: 'top 82%',
    });

    /* ── Product cards ────────────────────────────────────── */
    gsap.set('.prod-prev-card', { y: 40, scale: 0.97 });
    ScrollTrigger.batch('.prod-prev-card', {
      onEnter: batch =>
        gsap.to(batch, {
          opacity: 1, y: 0, scale: 1,
          stagger: 0.12, duration: 1.0, ease: 'power3.out',
        }),
      start: 'top 85%',
    });

    /* ── Testimonials ─────────────────────────────────────── */
    gsap.set('.testi-item', { y: 30 });
    ScrollTrigger.batch('.testi-item', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, duration: 1.0, ease: 'power3.out' }),
      start: 'top 85%',
    });

    /* ── Branch & team ────────────────────────────────────── */
    gsap.set('.branch-item', { y: 20 });
    ScrollTrigger.batch('.branch-item', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.9, ease: 'power3.out' }),
      start: 'top 85%',
    });

    gsap.set('.team-card-mini', { x: 30 });
    ScrollTrigger.batch('.team-card-mini', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, x: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out' }),
      start: 'top 85%',
    });

    /* ── About ────────────────────────────────────────────── */
    const aboutBody = document.querySelector('.about-split-body');
    if (aboutBody) {
      gsap.set(aboutBody, { x: 40 });
      ScrollTrigger.create({
        trigger: aboutBody, start: 'top 80%',
        onEnter: () =>
          gsap.to(aboutBody, { opacity: 1, x: 0, duration: 1.2, ease: 'power3.out' }),
      });
    }
    const badge = document.querySelector('.about-split-badge');
    if (badge) {
      gsap.set(badge, { x: 30, scale: 0.92 });
      ScrollTrigger.create({
        trigger: badge, start: 'top 85%',
        onEnter: () =>
          gsap.to(badge, { opacity: 1, x: -24, scale: 1, duration: 1.2, ease: 'back.out(1.4)' }),
      });
    }

    /* ── CTA ──────────────────────────────────────────────── */
    gsap.set('.cta-body', { y: 40 });
    ScrollTrigger.batch('.cta-body', {
      onEnter: batch =>
        gsap.to(batch, { opacity: 1, y: 0, duration: 1.4, ease: 'power4.out' }),
      start: 'top 80%',
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [pathname]); // pathname değişince yeniden çalış

  return null;
}
