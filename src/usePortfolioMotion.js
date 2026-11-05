import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { observeMotionVisibility } from './motionVisibility';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);

const OPEN_CLIP = 'inset(0% 0% 0% 0%)';
const BOTTOM_CLIP = 'inset(100% 0% 0% 0%)';
const SIDE_CLIP = 'inset(0% 100% 0% 0%)';

export function usePortfolioMotion(rootRef, filter, expandedExperience) {
  const played = useRef(new Set());
  const openingPlayed = useRef(false);
  const initialAnchorHandled = useRef(false);
  const rebuildCards = useRef(() => {});

  useLayoutEffect(() => {
    const root = rootRef.current;
    const query = selector => root.querySelector(selector);
    const all = (selector, scope = root) => [...scope.querySelectorAll(selector)];
    const media = gsap.matchMedia();

    media.add({ all: '(min-width: 0px)', desktop: '(min-width: 768px)', reduced: '(prefers-reduced-motion: reduce)', fine: '(hover: hover) and (pointer: fine)' }, context => {
      const { desktop, reduced, fine } = context.conditions;
      root.dataset.motionMode = reduced ? 'reduced' : desktop ? 'desktop' : 'mobile';
      let cardContext, cardDisposers = [], disposed = false;
      const cleanups = [];
      const hero = query('.hero');
      const heroVideo = query('.hero-video');
      const header = query('.site-header');
      const glass = query('.header-glass');
      const headerItems = all('.site-header > :not(.header-glass)');
      let heroVisible = hero.getBoundingClientRect().bottom > 0;
      let lenis = null;

      // One clock for scroll interpolation and ScrollTrigger, no scroll hijacking on touch.
      if (desktop && !reduced) {
        lenis = new Lenis({ duration: 1.35, easing: t => 1 - Math.pow(1 - t, 4), smoothWheel: true, syncTouch: false, anchors: true, autoRaf: false, prevent: node => !!node.closest('dialog, [data-lenis-prevent]') });
        lenis.on('scroll', ScrollTrigger.update);
      }
      const raf = time => lenis?.raf(time * 1000);
      if (lenis) gsap.ticker.add(raf);

      const syncHeroVideo = () => {
        const shouldPlay = heroVisible && !document.hidden && !query('dialog[open]') && !reduced && heroVideo.dataset.userPaused !== 'true';
        if (shouldPlay) heroVideo.play().catch(() => {});
        else heroVideo.pause();
      };
      const heroObserver = new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; syncHeroVideo(); }, { threshold: 0 });
      heroObserver.observe(hero);
      cleanups.push(() => heroObserver.disconnect());

      // Native dialog remains scrollable while page smoothing and wheel input are locked.
      const dialogObserver = new MutationObserver(() => {
        if (query('dialog[open]')) lenis?.stop();
        else if (!document.hidden) lenis?.start();
        syncHeroVideo();
      });
      dialogObserver.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['open', 'data-user-paused'] });
      cleanups.push(() => dialogObserver.disconnect());


      function compactHeader(compact, immediate = false) {
        header.dataset.compact = String(compact);
        const duration = immediate || reduced ? 0 : .72;
        gsap.to(glass, { opacity: compact ? 1 : 0, scaleY: compact ? .7 : 1, duration, ease: 'power3.out', overwrite: true });
        gsap.to(headerItems, { y: compact ? -16 : 0, duration, ease: 'power3.out', overwrite: true });
      }
      compactHeader(scrollY > hero.offsetHeight - 104, true);
      ScrollTrigger.create({ trigger: hero, start: 'bottom top+=104', onEnter: () => compactHeader(true), onLeaveBack: () => compactHeader(false) });
      gsap.fromTo('.reading-progress > span', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : .4 } });

      function spreadGlyphs(line, distance) {
        const glyphs = all('.motion-glyph', line);
        gsap.set(glyphs, { x: index => (index - (glyphs.length - 1) / 2) * distance });
        return glyphs;
      }

      // Everything stays visible if motion is reduced or the document was opened at a deep link.
      const skipOpening = reduced || openingPlayed.current || (location.hash && location.hash !== '#home') || scrollY > hero.offsetHeight / 2;
      if (!skipOpening) {
        const masks = all('.hero-line');
        const lines = all('.hero-line .reveal-line');
        const glyphs = masks.flatMap(mask => spreadGlyphs(mask, desktop ? 3 : 1.5));
        const opening = gsap.timeline({ id: 'portfolio-opening', defaults: { ease: 'expo.out' }, onComplete: () => { root.dataset.opening = 'complete'; } });
        root.dataset.opening = 'playing';
        opening.fromTo(heroVideo, { opacity: 0 }, { opacity: .16, duration: 1, ease: 'power2.out' }, 0)
          .fromTo('.hero-person', { clipPath: 'inset(0% 0% 0% 30%)', opacity: 0 }, { clipPath: OPEN_CLIP, opacity: 1, duration: 1.6 }, .08)
          .fromTo(masks, { clipPath: BOTTOM_CLIP }, { clipPath: OPEN_CLIP, duration: 1.45, stagger: .15 }, .25)
          .fromTo(lines, { y: desktop ? 80 : 45, scale: 1.1 }, { y: 0, scale: 1, duration: 1.45, stagger: .15 }, .25)
          .to(glyphs, { x: 0, duration: 1.45 }, .25)
          .fromTo('.hero-eyebrow', { x: -30, clipPath: SIDE_CLIP }, { x: 0, clipPath: OPEN_CLIP, duration: .95 }, .65)
          .fromTo(['.hero-role', '.hero-copy'], { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: .95, stagger: .1, ease: 'power3.out' }, 1.12)
          .fromTo(['.hero-actions', '.scroll-cue', '.hero-index'], { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, stagger: .08, ease: 'power3.out' }, 1.62)
          .fromTo('.hero-endnote', { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 1.8)
          .fromTo(header, { y: -104, opacity: 0 }, { y: 0, opacity: 1, duration: .75, ease: 'power3.out' }, 2.15);
      } else root.dataset.opening = reduced ? 'reduced' : 'complete';
      openingPlayed.current = true;

      function onceTimeline(key, trigger, build) {
        if (reduced || played.current.has(key)) return;
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.05 }, scrollTrigger: { trigger, start: 'top 74%', once: true, onEnter: () => played.current.add(key) } });
        build(timeline);
      }
      function titleReveal(timeline, heading, at = 0) {
        if (!heading) return;
        const masks = all('.reveal-mask', heading);
        const glyphs = masks.flatMap(mask => spreadGlyphs(mask, desktop ? 2.4 : 1));
        timeline.fromTo(masks, { clipPath: BOTTOM_CLIP }, { clipPath: OPEN_CLIP, stagger: .12, duration: 1.15 }, at)
          .fromTo(all('.reveal-line', heading), { y: desktop ? 125 : 48 }, { y: 0, stagger: .12, duration: 1.15, ease: 'expo.out' }, at)
          .to(glyphs, { x: 0, duration: 1.15, ease: 'expo.out' }, at);
      }
      function labelReveal(timeline, section) {
        const label = section.querySelector('.section-label');
        if (!label) return;
        timeline.fromTo(label.querySelector('.pill'), { clipPath: SIDE_CLIP, x: -25 }, { clipPath: OPEN_CLIP, x: 0, duration: .8 }, 0)
          .fromTo(label.querySelector('.label-line'), { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 1.3 }, .1);
      }

      for (const section of all('main > section:not(#home)')) {
        onceTimeline(`section:${section.id}`, section, timeline => {
          labelReveal(timeline, section);
          titleReveal(timeline, section.querySelector('.motion-heading'), .1);
          if (section.id === 'about') timeline.fromTo(all('.about-copy > .eyebrow, .about-copy > p, .profile-contacts', section), { y: desktop ? 48 : 30, opacity: 0 }, { y: 0, opacity: 1, stagger: .09, duration: 1 }, .9);
          if (section.id === 'work' && section.querySelector('.filters')) timeline.fromTo(section.querySelector('.filters'), { x: 45, clipPath: SIDE_CLIP }, { x: 0, clipPath: OPEN_CLIP, duration: .9 }, .9);
          if (section.id === 'expertise') timeline.fromTo(section.querySelector('.expertise-heading > p'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, 1);
          if (section.id === 'contact') {
            timeline.fromTo(section.querySelector('.contact-title > span'), { y: 35, clipPath: BOTTOM_CLIP }, { y: 0, clipPath: OPEN_CLIP }, .3)
              .fromTo(section.querySelector('.contact-bottom > div:first-child'), { x: -60, opacity: 0 }, { x: 0, opacity: 1 }, 1)
              .fromTo(section.querySelector('.contact-wechat'), { x: desktop ? 60 : 0, y: desktop ? 0 : 35, clipPath: SIDE_CLIP }, { x: 0, y: 0, clipPath: OPEN_CLIP }, 1.15)
              .fromTo(section.querySelector('footer'), { y: 25, opacity: 0 }, { y: 0, opacity: 1 }, 1.35);
          }
        });
      }
      onceTimeline('portrait', query('.portrait-card'), timeline => {
        timeline.fromTo('.portrait-card', { y: desktop ? 60 : 35, rotationX: desktop ? 5 : 0, opacity: 0 }, { y: 0, rotationX: 0, opacity: 1, duration: 1.2 }, .25)
          .fromTo('.portrait-image', { clipPath: SIDE_CLIP }, { clipPath: OPEN_CLIP, duration: 1.45, ease: 'expo.out' }, .4)
          .fromTo('.portrait-image img', { scale: 1.12 }, { scale: 1, duration: 1.8 }, .4);
      });
      onceTimeline('metrics', query('.resume-stats'), timeline => {
        timeline.fromTo('.resume-stats > div', { y: 42, clipPath: BOTTOM_CLIP }, { y: 0, clipPath: OPEN_CLIP, stagger: .14, duration: 1.1 })
          .fromTo('.metric-reel', { y: 0, yPercent: 0 }, { y: 0, yPercent: -200 / 3, stagger: .045, duration: 1.7, ease: 'expo.out' }, .25);
      });
      onceTimeline('experience', query('.experience-block'), timeline => {
        titleReveal(timeline, query('.experience-intro .motion-heading'));
        timeline.fromTo('.experience-intro > p', { y: 35, opacity: 0 }, { y: 0, opacity: 1 }, .75)
          .fromTo('.journey-tags, .experience-intro .resume-link', { y: 25, clipPath: BOTTOM_CLIP }, { y: 0, clipPath: OPEN_CLIP, stagger: .12 }, .9)
          .fromTo('.experience-accordion', { y: desktop ? 60 : 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.05 }, .9);
      });
      all('.strength-card').forEach((card, index) => onceTimeline(`strength:${index}`, card, timeline => {
        timeline.fromTo(card, { y: desktop ? 60 : 35, rotationX: desktop ? 5 : 0, opacity: 0 }, { y: 0, rotationX: 0, opacity: 1, duration: 1.2 })
          .fromTo(card.querySelector('.strength-symbol'), { rotation: -35, scale: .6 }, { rotation: 0, scale: 1, duration: 1.5, ease: 'expo.out', clearProps: 'transform' }, .15)
          .fromTo(card.querySelector('h3'), { y: 35, clipPath: BOTTOM_CLIP }, { y: 0, clipPath: OPEN_CLIP, duration: 1.1 }, .2);
      }));
      all('.skill-card').forEach((card, index) => onceTimeline(`skill:${index}`, card, timeline => timeline.fromTo(card, { y: desktop ? 48 : 30, clipPath: BOTTOM_CLIP }, { y: 0, clipPath: OPEN_CLIP, duration: 1.1 })));
      onceTimeline('note', query('.creative-note'), timeline => timeline.fromTo('.creative-note p', { y: 60, clipPath: BOTTOM_CLIP }, { y: 0, clipPath: OPEN_CLIP, duration: 1.25 }));

      // Image and pointer layers are independent: scroll never overwrites mouse movement.
      function imageParallax(layer, trigger) {
        if (!desktop || reduced) return;
        gsap.fromTo(layer, { yPercent: -5 }, { yPercent: 5, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1.4, invalidateOnRefresh: true } });
      }
      imageParallax(query('.hero-parallax'), hero);
      imageParallax(query('.portrait-parallax'), query('.portrait-image'));
      if (desktop && !reduced) gsap.to('.film-strip > div', { xPercent: -12, ease: 'none', scrollTrigger: { trigger: '.film-strip', start: 'top bottom', end: 'bottom top', scrub: 1.5 } });

      function setupCards() {
        cardDisposers.forEach(dispose => dispose()); cardDisposers = [];
        cardContext?.revert();
        cardContext = gsap.context(() => {
          all('.project-card').forEach((card, index) => {
            const visual = card.querySelector('.project-visual');
            const pointer = card.querySelector('.project-pointer');
            const reveal = card.querySelector('.project-cover-reveal');
            const image = card.querySelector('img');
            const id = card.dataset.projectId;
            onceTimeline(`project:${id}`, card, timeline => {
              timeline.fromTo(card, { y: desktop ? 60 : 35, rotationX: desktop ? 5 : 0, opacity: 0 }, { y: 0, rotationX: 0, opacity: 1, duration: 1.15 }, index % 2 * .15)
                .fromTo(reveal, { clipPath: SIDE_CLIP }, { clipPath: OPEN_CLIP, duration: 1.35, ease: 'expo.out' }, .15 + index % 2 * .15)
                .fromTo(image, { scale: 1.1 }, { scale: 1, duration: 1.7 }, .15)
                .fromTo(card.querySelectorAll('.case-kicker, .project-caption, .case-summary, .case-highlights, .case-account-link'), { y: 32, clipPath: BOTTOM_CLIP }, { y: 0, clipPath: OPEN_CLIP, stagger: .1, duration: 1 }, .35);
            });
            imageParallax(card.querySelector('.project-parallax'), visual);
            if (desktop && fine && !reduced) {
              const x = gsap.quickTo(pointer, 'x', { duration: .8, ease: 'power3.out' });
              const y = gsap.quickTo(pointer, 'y', { duration: .8, ease: 'power3.out' });
              let bounds;
              const enter = () => { bounds = visual.getBoundingClientRect(); gsap.to(pointer, { scale: 1.035, duration: .85, ease: 'power3.out', overwrite: 'auto' }); };
              const move = event => { if (!bounds) return; x(gsap.utils.clamp(-.5, .5, (event.clientX - bounds.left - bounds.width / 2) / bounds.width) * 22); y(gsap.utils.clamp(-.5, .5, (event.clientY - bounds.top - bounds.height / 2) / bounds.height) * 18); };
              const leave = () => { bounds = null; x(0); y(0); gsap.to(pointer, { scale: 1, duration: .95, ease: 'power3.out', overwrite: 'auto' }); };
              visual.addEventListener('pointerenter', enter); visual.addEventListener('pointermove', move); visual.addEventListener('pointerleave', leave);
              cardDisposers.push(() => { visual.removeEventListener('pointerenter', enter); visual.removeEventListener('pointermove', move); visual.removeEventListener('pointerleave', leave); x.tween.kill(); y.tween.kill(); gsap.killTweensOf(pointer); });
            }
          });
        }, root);
        ScrollTrigger.refresh();
      }
      rebuildCards.current = setupCards;
      setupCards();

      // Refresh geometry once assets decode; never poll layout in the animation loop.
      const refresh = () => { if (!disposed) ScrollTrigger.refresh(); };
      const disclosureContext = gsap.context(() => {}, root);
      const onDisclosure = event => {
        if (!event.target.matches('.case-process')) return;
        refresh();
        if (event.target.open && !reduced) disclosureContext.add(() => gsap.fromTo(event.target.querySelectorAll('.case-details > div'), { y: 24, opacity: 0, clipPath: BOTTOM_CLIP }, { y: 0, opacity: 1, clipPath: OPEN_CLIP, duration: .8, stagger: .09, ease: 'power3.out', overwrite: true }));
      };
      root.addEventListener('toggle', onDisclosure, true);
      cleanups.push(() => { root.removeEventListener('toggle', onDisclosure, true); disclosureContext.revert(); });
      all('img').forEach(image => { if (!image.complete) { image.addEventListener('load', refresh, { once: true }); cleanups.push(() => image.removeEventListener('load', refresh)); } });
      document.fonts?.ready.then(refresh);
      // React mounts after the browser's initial fragment lookup. Resolve it once
      // after layout so shared links open at their section, including on touch.
      const initialHash = location.hash;
      let anchorFrame;
      const restoreAnchor = () => {
        if (initialAnchorHandled.current) return;
        initialAnchorHandled.current = true;
        if (location.hash !== initialHash) return;
        const target = all('main > section[id]').find(section => `#${section.id}` === initialHash);
        if (!target || target === hero) return;
        if (lenis) lenis.scrollTo(target, { immediate: true });
        else target.scrollIntoView({ block: 'start', behavior: 'instant' });
        ScrollTrigger.update();
      };
      const scheduleAnchor = () => { anchorFrame = requestAnimationFrame(() => { anchorFrame = requestAnimationFrame(restoreAnchor); }); };
      const cancelAnchor = () => { initialAnchorHandled.current = true; };
      if (document.readyState === 'complete') scheduleAnchor();
      else window.addEventListener('load', scheduleAnchor, { once: true });
      window.addEventListener('wheel', cancelAnchor, { once: true, passive: true });
      root.addEventListener('pointerdown', cancelAnchor, { once: true });
      cleanups.push(() => { cancelAnimationFrame(anchorFrame); window.removeEventListener('load', scheduleAnchor); window.removeEventListener('wheel', cancelAnchor); root.removeEventListener('pointerdown', cancelAnchor); });
      cleanups.push(observeMotionVisibility({ root, gsap, lenis, raf, syncHeroVideo: () => { syncHeroVideo(); ScrollTrigger.update(); } }));
      if (!document.hidden) syncHeroVideo();

      return () => {
        disposed = true;
        rebuildCards.current = () => {};
        cardDisposers.forEach(dispose => dispose()); cardContext?.revert();
        cleanups.forEach(cleanup => cleanup());
        gsap.ticker.remove(raf); lenis?.destroy();
        gsap.killTweensOf([glass, ...headerItems]);
      };
    }, root);
    return () => { media.revert(); delete root.dataset.motionMode; delete root.dataset.motionSuspended; };
  }, [rootRef]);

  useLayoutEffect(() => { rebuildCards.current(); }, [filter]);
  useLayoutEffect(() => {
    ScrollTrigger.refresh();
    if (expandedExperience === null || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.fromTo('.experience-panel:not([hidden]) li', { y: 25, opacity: 0, clipPath: BOTTOM_CLIP }, { y: 0, opacity: 1, clipPath: OPEN_CLIP, duration: .8, stagger: .07, ease: 'power3.out' });
    }, rootRef.current);
    return () => context.revert();
  }, [expandedExperience, rootRef]);
}
