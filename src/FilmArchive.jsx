import React, { useCallback, useEffect, useRef, useState } from 'react';
import { asset } from './content';
import './film-archive.css';

const figures = [
  ['223.2万', '26.5万', '57.3万'], ['28.7万', '11万', '3.1万'],
  ['24.6万', '15.3万', '4.6万'], ['20.5万', '10.7万', '3.9万'],
  ['19.6万', '11.5万', '3万'], ['17.5万', '10.5万', '2.8万'],
  ['16.9万', '6.7万', '2万'], ['15.5万', '5.9万', '1.1万'],
];
const films = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  title: index === 8 ? '企业宣传片' : `亮亮聊思维 · 作品 ${String(index + 1).padStart(2, '0')}`,
  category: index === 8 ? 'AI 影像作品' : '短视频 / 亮亮聊思维',
  video: asset(`films/work-${index + 1}.mp4`),
  poster: asset(`films/work-${index + 1}.jpg`),
  metrics: figures[index],
}));
const wrap = n => ((n % films.length) + films.length) % films.length;

export default function FilmArchive() {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const [videoError, setVideoError] = useState(false);
  const shelfRef = useRef(null);
  const stageRef = useRef(null);
  const dialogRef = useRef(null);
  const coverRef = useRef(null);
  const motionRef = useRef({ current: 9, target: 9, drag: null, moved: false, tiltX: 0, tiltY: 0, targetTiltX: 0, targetTiltY: 0 });
  const reducedRef = useRef(false);
  const activeRef = useRef(0);
  const previousFocus = useRef(null);

  const step = useCallback(delta => { motionRef.current.target = Math.round(motionRef.current.target) + delta; }, []);
  const goTo = useCallback(index => {
    const state = motionRef.current;
    const now = Math.round(state.target);
    let diff = index - wrap(now);
    if (diff > films.length / 2) diff -= films.length;
    if (diff < -films.length / 2) diff += films.length;
    state.target = now + diff;
  }, []);

  useEffect(() => {
    const shelf = shelfRef.current;
    const faces = [...stageRef.current.children];
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const state = motionRef.current;
    let frame = 0, last = 0, visible = false, H = 0, wheelTimer;
    const render = time => {
      frame = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min((time - (last || time)) / 1000, .05); last = time;
      reducedRef.current = media.matches;
      state.current = media.matches ? state.target : state.current + (state.target - state.current) * (1 - Math.exp(-(state.drag ? 18 : 5.2) * dt));
      const tiltEase = media.matches ? 1 : 1 - Math.exp(-7 * dt);
      state.tiltX += (state.targetTiltX - state.tiltX) * tiltEase;
      state.tiltY += (state.targetTiltY - state.tiltY) * tiltEase;
      if (Math.abs(state.target) > 36) { const shift = Math.trunc(state.target / 9) * 9; state.current -= shift; state.target -= shift; }
      const next = wrap(Math.round(state.current));
      if (activeRef.current !== next) { activeRef.current = next; setActive(next); }
      if (!H) return;
      const ws = H * .169, depth = H * .527, gap = H * .035;
      const U = H * (innerWidth < 768 ? 1.05 : 1.3), P = 1400;
      faces.forEach((tape, v) => {
        let r = ((v - state.current + 13.5) % 27 + 27) % 27 - 13.5;
        const open = Math.max(0, 1 - Math.abs(r));
        const smooth = open * open * (3 - 2 * open);
        const b = Math.abs(r) < 1 ? (r + Math.sin(Math.PI * r) / Math.PI) / 2 : Math.sign(r) * .5;
        const u = r * (ws + gap) + (depth - ws + 1.4 * gap) * b;
        if (Math.abs(u) > U * 1.95) { tape.style.visibility = 'hidden'; return; }
        tape.style.visibility = 'visible';
        const sc = 1 / (1 + Math.pow(Math.abs(u) / U, 1.6));
        // A sampled integral packs the outer spines as they recede.
        const steps = 14, distance = Math.abs(u), du = distance / steps;
        let integral = 0;
        for (let j = 0; j < steps; j++) integral += du / (1 + Math.pow((j + .5) * du / U, 1.6));
        const x = Math.sign(u) * integral / sc, z = P * (1 - 1 / sc) + smooth * H * .1;
        const y = (H * .5 * (1 - sc) * .42 + smooth * H * .012) / sc;
        const rotation = Math.sign(u) * Math.min(1, Math.abs(u) / U) * 26 * (1 - smooth) - 90 * smooth;
        tape.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateX(${state.tiltX * smooth}deg) rotateY(${rotation + state.tiltY * smooth}deg)`;
        tape.style.zIndex = String(Math.round(3000 + z));
        tape.style.setProperty('--spine-shade', String(Math.min(.6, smooth * .55 + (1 - sc) * .32)));
        tape.style.setProperty('--cover-shade', String((1 - smooth) * .82));
      });
      if (Math.abs(state.current - state.target) > .001 || Math.abs(state.tiltX - state.targetTiltX) > .02 || Math.abs(state.tiltY - state.targetTiltY) > .02 || state.drag) frame = requestAnimationFrame(render);
    };
    const wake = () => { if (!frame && visible && !document.hidden) { last = 0; frame = requestAnimationFrame(render); } };
    state.wake = wake;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; } }, { rootMargin: '100px' });
    observer.observe(shelf);
    const resize = new ResizeObserver(() => { H = shelf.querySelector('.archive-probe').getBoundingClientRect().height; wake(); }); resize.observe(shelf);
    const wheel = event => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) && !event.shiftKey) return;
      event.preventDefault();
      state.target += (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) / (H * .204) * .5;
      wake(); clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => { state.target = Math.round(state.target); wake(); }, 160);
    };
    shelf.addEventListener('wheel', wheel, { passive: false });
    document.addEventListener('visibilitychange', wake); media.addEventListener('change', wake);
    return () => { cancelAnimationFrame(frame); clearTimeout(wheelTimer); observer.disconnect(); resize.disconnect(); shelf.removeEventListener('wheel', wheel); document.removeEventListener('visibilitychange', wake); media.removeEventListener('change', wake); delete state.wake; };
  }, []);

  useEffect(() => { motionRef.current.wake?.(); }, [active]);
  useEffect(() => {
    if (!selected) return;
    const dialog = dialogRef.current;
    dialog.showModal();
    const rect = coverRef.current?.getBoundingClientRect();
    if (rect && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dialog.animate([{ clipPath: `inset(${Math.max(0, rect.top)}px ${Math.max(0, innerWidth - rect.right)}px ${Math.max(0, innerHeight - rect.bottom)}px ${Math.max(0, rect.left)}px round 4px)` }, { clipPath: 'inset(0 round 0)' }], { duration: 1050, easing: 'cubic-bezier(.76,0,.18,1)' });
    }
    return () => { if (dialog.open) dialog.close(); previousFocus.current?.focus(); };
  }, [selected]);

  const open = (film, event) => { previousFocus.current = event.currentTarget; setVideoError(false); setSelected(film); };
  const move = amount => { step(amount); motionRef.current.wake?.(); };
  const select = index => { goTo(index); motionRef.current.wake?.(); };
  const onPointerDown = event => { if (event.button !== 0) return; motionRef.current.drag = { x: event.clientX, target: motionRef.current.target }; motionRef.current.moved = false; };
  const onPointerMove = event => { const state = motionRef.current; if (!state.drag) { if (event.pointerType === 'mouse' && innerWidth >= 768) { const bounds = event.currentTarget.getBoundingClientRect(); const h = event.currentTarget.querySelector('.archive-probe').getBoundingClientRect().height; const x = event.clientX - bounds.left - bounds.width / 2, y = event.clientY - bounds.top - bounds.height / 2; const onCover = Math.abs(x) < h * .29 && Math.abs(y) < h * .55; state.targetTiltY = onCover ? x / (h * .29) * 8 : 0; state.targetTiltX = onCover ? -y / (h * .55) * 5 : 0; state.wake?.(); } return; } const dx = event.clientX - state.drag.x; if (Math.abs(dx) > 5) state.moved = true; if (state.moved) { if (!event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId); const H = shelfRef.current.querySelector('.archive-probe').getBoundingClientRect().height; state.target = state.drag.target - dx / (H * .204); state.wake?.(); } };
  const onPointerUp = () => { const state = motionRef.current; if (state.drag) { state.target = Math.round(state.target); state.drag = null; state.wake?.(); } };
  const onKeyDown = event => { if (selected) return; if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } };
  const film = films[active];

  return <section id="work" className="film-archive" aria-labelledby="archive-title" onKeyDown={onKeyDown}>
    <div className="archive-head"><span>SELECTED WORKS / 精选作品</span><span>王聪聪 · 影像档案</span><span>03 / 05</span></div>
    <div className="archive-heading"><div><span>WANG CONGCONG / VIDEO ARCHIVE</span><h2 id="archive-title">作品集<span>。</span></h2></div><p>一帧一帧，<br/>把想法变成看得见的故事。</p></div>
    <div className="archive-stage-wrap" ref={shelfRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onPointerLeave={() => { motionRef.current.targetTiltX = 0; motionRef.current.targetTiltY = 0; motionRef.current.wake?.(); }}>
      <span className="archive-probe" aria-hidden="true"/><span className="archive-giant archive-giant-left" aria-hidden="true">影像</span><span className="archive-giant archive-giant-right" aria-hidden="true">档案</span><div className="archive-shadow"/>
      <div className="archive-stage" ref={stageRef}>{Array.from({ length: 27 }, (_, v) => { const item = films[v % 9]; return <div className="archive-tape" key={v} aria-hidden="true" onClick={() => { if (!motionRef.current.moved) select(v % 9); }}><div className="tape-spine"><span className="spine-index">{String(item.id).padStart(2, '0')}</span><span className="spine-title">{item.title}</span><span className="spine-label">WCC / VIDEO</span></div><div className="tape-cover" style={{ backgroundImage: `url(${item.poster})` }}><span className="cover-label">WCC · SELECTED WORKS / {String(item.id).padStart(2, '0')}</span><span className="cover-bottom">{item.category}<b>▶</b></span></div></div>; })}</div>
      <button className="archive-cover-hit" ref={coverRef} aria-label={`播放${film.title}`} onClick={event => { if (!motionRef.current.moved) open(film, event); }} />
      <span className="archive-drag-hint">拖动浏览 / DRAG TO EXPLORE</span>
    </div>
    <div className="archive-caption"><button className="archive-arrow" aria-label="上一个作品" onClick={() => move(-1)}>←</button><div className="archive-caption-inner" key={active}><span className="archive-kicker">{film.category}</span><h3>{film.title}</h3><div className="archive-caption-rule"/>{film.metrics ? <p>获赞约 {film.metrics[0]} <i/> 收藏约 {film.metrics[1]} <i/> 转发约 {film.metrics[2]}</p> : <p>AI 创作 / 企业宣传片</p>}</div><button className="archive-arrow" aria-label="下一个作品" onClick={() => move(1)}>→</button></div>
    <div className="archive-timeline" aria-label="选择作品"><span className="archive-progress" style={{ transform: `translateX(${active * 100}%)` }} aria-hidden="true"/>{films.map((item, index) => <button key={item.id} className={active === index ? 'is-active' : ''} aria-label={`选择${item.title}`} aria-pressed={active === index} onClick={() => select(index)}><span/>{String(item.id).padStart(2, '0')}</button>)}</div>
    <div className="archive-footer"><span>© WANG CONGCONG / WORKS</span><span>01 — 09</span><span>每一帧，都是新的开始。</span></div>
    {selected && <dialog ref={dialogRef} className="archive-detail" data-lenis-prevent onCancel={event => { event.preventDefault(); setSelected(null); }} aria-labelledby="archive-detail-title"><div className="detail-top"><button onClick={() => setSelected(null)} aria-label="关闭视频">关闭 / CLOSE <span>×</span></button><span>WANG CONGCONG / VIDEO ARCHIVE</span></div><div className="detail-grid"><div className="detail-copy"><span className="detail-kicker">{selected.category} / {String(selected.id).padStart(2, '0')}</span><h3 id="archive-detail-title">{selected.title}</h3><p>影像作品 / VIDEO WORK</p>{selected.metrics && <div className="detail-metrics"><div><strong>{selected.metrics[0]}</strong><span>约获赞</span></div><div><strong>{selected.metrics[1]}</strong><span>约收藏</span></div><div><strong>{selected.metrics[2]}</strong><span>约转发</span></div></div>}<p className="detail-note">{selected.metrics ? '作品数据由本人提供，展示为约数。' : 'AI 影像作品 · 企业宣传片'}</p></div><div className="detail-video"><video key={selected.id} src={selected.video} poster={selected.poster} controls autoPlay playsInline preload="metadata" onError={() => setVideoError(true)}>你的浏览器不支持视频播放。</video>{videoError && <p>视频暂时无法播放，<a href={selected.video}>点击打开视频文件</a>。</p>}</div></div></dialog>}
  </section>;
}
