import React, { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 72;

export default function AmbientParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas.closest('.hero');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const desktop = matchMedia('(min-width: 768px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, frame = 0, last = 0, inView = true;
    const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random(), y: Math.random(), r: .5 + Math.random() * 1.1,
      speed: 3 + Math.random() * 7, phase: Math.random() * Math.PI * 2,
      color: i % 5 === 0 ? '#ff5b77' : '#d7af74', alpha: .14 + Math.random() * .35,
    }));

    function resize() {
      const bounds = host.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(time) {
      frame = requestAnimationFrame(draw);
      if (time - last < 1000 / 30) return;
      const elapsed = Math.min((time - last) / 1000, .1);
      last = time;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speed * elapsed / height;
        p.x += Math.sin(time * .00013 + p.phase) * elapsed * .003;
        if (p.y < -.01) p.y = 1.01;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      const running = desktop.matches && !reduced.matches && !document.hidden && inView;
      canvas.dataset.running = String(running);
      if (running) { resize(); last = performance.now(); frame = requestAnimationFrame(draw); }
      else ctx.clearRect(0, 0, width, height);
    }
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    const resizeObserver = new ResizeObserver(() => { if (frame) resize(); });
    observer.observe(host);
    resizeObserver.observe(host);
    desktop.addEventListener('change', sync);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect(); resizeObserver.disconnect();
      desktop.removeEventListener('change', sync);
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return <canvas ref={canvasRef} className="ambient-particles" data-particle-count={PARTICLE_COUNT} aria-hidden="true" />;
}
