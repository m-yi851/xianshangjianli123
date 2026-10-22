import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { profile, projects, experiences, strengths, asset } from './content';
import { MotionText, RevealLine } from './MotionText';
import AmbientParticles from './AmbientParticles';
import { usePortfolioMotion } from './usePortfolioMotion';
import './styles.css';
import './motion.css';

function Arrow({ diagonal = false, className = '' }) {
  return <svg className={`arrow ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" /></svg>;
}
function PlayIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m9 5 11 7-11 7Z" /></svg>; }
function SectionLabel({ children, number }) { return <div className="section-label"><span className="pill">{children}</span><span className="label-line"/><span className="section-number">/{number}</span></div>; }

function App() {
  const [filter, setFilter] = useState('全部作品');
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState('');
  const [videoError, setVideoError] = useState(false);
  const siteRef = useRef(null);
  const heroVideo = useRef(null);
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const toastTimer = useRef(null);
  usePortfolioMotion(siteRef, filter);

  useEffect(() => { heroVideo.current.dataset.userPaused = String(paused); }, [paused]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    }), { rootMargin: '-20% 0px -45% 0px' });
    document.querySelectorAll('main > section[id]').forEach(el => observer.observe(el));
    return () => { observer.disconnect(); clearTimeout(toastTimer.current); };
  }, []);

  useEffect(() => {
    if (!selected) return;
    dialogRef.current.showModal();
    heroVideo.current?.pause();
    const saved = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = saved;
      if (!paused && !document.hidden && heroVideo.current?.getBoundingClientRect().bottom > 0 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) heroVideo.current?.play().catch(() => {});
      triggerRef.current?.focus();
    };
  }, [selected]);

  const openProject = (project, event) => { triggerRef.current = event.currentTarget; setVideoError(false); setSelected(project); };
  const closeProject = () => { dialogRef.current?.close(); setSelected(null); };
  const showToast = message => { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 3200); };
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(profile.email); showToast('邮箱已复制，期待你的来信。'); }
    catch { showToast(`请复制邮箱：${profile.email}`); }
  };
  const toggleVideo = () => {
    if (!heroVideo.current) return;
    if (heroVideo.current.paused) heroVideo.current.play().then(() => setPaused(false)).catch(() => showToast('请点击作品卡片查看视频。'));
    else { heroVideo.current.pause(); setPaused(true); }
  };
  const navItems = [['home', '首页'], ['about', '关于我'], ['work', '精选作品'], ['expertise', '创作优势']];

  return <div className="portfolio-site" ref={siteRef}>
    <header className="site-header">
      <div className="header-glass" aria-hidden="true"/>
      <a className="wordmark" href="#home" aria-label="王聪聪，返回首页">WCC<span>®</span></a>
      <nav aria-label="主导航" className={menuOpen ? 'nav open' : 'nav'}>
        {navItems.map(([id, label]) => <a key={id} className={active === id ? 'active' : ''} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}<i/></a>)}
      </nav>
      <a href="#contact" className="header-contact">一起创作 <Arrow diagonal /></a>
      <button className="menu-toggle" aria-label={menuOpen ? '收起导航' : '展开导航'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '×' : '☰'}</button>
    </header>

    <main>
      <section id="home" className="hero">
        <video ref={heroVideo} className="hero-video" autoPlay={!window.matchMedia('(prefers-reduced-motion: reduce)').matches} muted loop playsInline poster={asset('project-02.jpg')} aria-hidden="true" onError={() => setPaused(true)}>
          <source src={asset('hero-loop.mp4')} type="video/mp4" />
        </video>
        <div className="hero-tint"/><div className="hero-grid"/>
        <AmbientParticles/>
        <div className="hero-person"><div className="hero-parallax"><img src={asset('portrait-creative.jpg')} alt="王聪聪创意人物形象，原图含 AI 生成标记"/></div><span className="photo-caption">CREATIVE PORTRAIT / AI GENERATED</span></div>
        <div className="hero-content wrap">
          <div className="hero-eyebrow"><span className="live-dot"/> WANG CONGCONG — VISUAL CREATOR</div>
          <h1 aria-label="MAKE IT REAL."><RevealLine className="hero-line"><MotionText>MAKE</MotionText></RevealLine><RevealLine className="hero-line"><MotionText>{'IT '}</MotionText><em><MotionText>REAL.</MotionText></em><b>↗</b></RevealLine></h1>
          <div className="hero-role">短视频编导 <span>×</span> AIGC 编导</div>
          <p className="hero-copy">让想象有画面，让故事被看见。</p>
          <div className="hero-actions"><a href="#work" className="button primary">进入我的作品 <Arrow /></a><button className="play-teaser" onClick={event => openProject(projects[0], event)}><span className="round-play"><PlayIcon /></span>播放作品 <span className="tiny">02:18</span></button></div>
        </div>
        <div className="hero-bottom wrap"><a className="scroll-cue" href="#about"><span>向下，认识我</span><span>↓</span></a><div className="hero-index"><span>01</span> / 05 <i/><i/><i/></div><div className="hero-endnote"><span className="hero-motto">IMAGINE. DIRECT. CREATE.</span><button className="sound-control" onClick={toggleVideo} aria-label={paused ? '播放背景视频' : '暂停背景视频'}>{paused ? '▶' : 'Ⅱ'}<span>BACKGROUND FILM</span></button></div></div>
        <div className="red-horizon"/>
      </section>

      <div className="film-strip" aria-hidden="true"><div>STORYTELLING <span>✳</span> AIGC DIRECTION <span>✳</span> VISUAL CREATION <span>✳</span> STORYTELLING <span>✳</span> AIGC DIRECTION <span>✳</span> VISUAL CREATION <span>✳</span></div></div>

      <section id="about" className="about section wrap">
        <SectionLabel number="02">ABOUT THE CREATOR</SectionLabel>
        <div className="about-main">
          <div className="portrait-card"><div className="portrait-image"><div className="portrait-parallax"><img src={asset('portrait.jpg')} alt="王聪聪个人形象照" loading="lazy"/></div><div className="frame-corner top"/><div className="frame-corner bottom"/><span className="portrait-tag">BEHIND THE LENS</span></div><div className="portrait-name"><strong>{profile.name}</strong><span>{profile.englishName}<Arrow diagonal /></span></div></div>
          <div className="about-copy"><div className="eyebrow">你好，我是王聪聪。</div><h2 className="motion-heading" aria-label="保持好奇，把创意拍成现实。"><RevealLine><MotionText>保持好奇，</MotionText></RevealLine><RevealLine><MotionText>把创意</MotionText><span className="serif-accent"><MotionText>拍成现实。</MotionText></span></RevealLine></h2><p>{profile.introduction}</p><p className="muted">{profile.background}</p><div className="profile-contacts"><span><i className="live-dot"/>{profile.city} · 中国</span><a href={`mailto:${profile.email}`}>{profile.email}<Arrow diagonal /></a></div><div className="stats"><div><strong>02<span>部</span></strong><small>完整视频作品</small></div><div><strong>03:44</strong><small>视频总时长 · 约</small></div><div><strong>01<span>张</span></strong><small>摄影作品展示</small></div></div></div>
        </div>
        <div className="experience-block"><div className="experience-intro"><span className="eyebrow">MY JOURNEY</span><h3 className="motion-heading" aria-label="经历，构成我的创作视角。"><RevealLine><MotionText>经历，构成</MotionText></RevealLine><RevealLine><MotionText>我的创作视角。</MotionText></RevealLine></h3><p>河北工程技术学院<br/>物联网工程 · 本科 · 2026 届</p></div><div className="timeline">{experiences.map(item => <article key={item.date}><span className="timeline-dot"/><time>{item.date}</time><div><h4>{item.title}</h4><span className="company">{item.detail}</span><p>{item.body}</p></div></article>)}</div></div>
      </section>

      <section id="work" className="work section">
        <div className="wrap"><SectionLabel number="03">SELECTED FILMS & FRAMES</SectionLabel><div className="work-heading"><div><div className="eyebrow">一段叙事，一次探索。</div><h2 className="motion-heading" aria-label="作品，即表达。"><RevealLine><MotionText>作品，</MotionText><span className="serif-accent"><MotionText>即表达。</MotionText></span></RevealLine></h2></div><div className="filters" role="group" aria-label="按作品类型筛选">{['全部作品', '视频作品', '影像摄影'].map(item => <button key={item} aria-pressed={filter === item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item}<span>{item === '全部作品' ? '03' : item === '视频作品' ? '02' : '01'}</span></button>)}</div></div>
          <div className="project-grid">{projects.filter(project => filter === '全部作品' || project.category === filter).map(project => <article className={`project-card project-${project.id}`} key={project.id} data-project-id={project.id}><button className="project-visual" onClick={event => openProject(project, event)} aria-label={project.type === 'video' ? `播放${project.title}` : `查看${project.title}摄影作品`}><span className="project-cover-reveal"><span className="project-parallax"><span className="project-pointer"><img src={project.poster} alt={project.type === 'video' ? `${project.title}视频画面` : '爱人错过摄影作品海报'} loading="lazy"/></span></span></span><span className="project-shade"/><span className="project-top"><span>NO. {project.id} / {project.category}</span><span>{project.duration}</span></span><span className="project-play">{project.type === 'video' ? <PlayIcon/> : <Arrow diagonal/>}</span><span className="project-bottom"><span>{project.format}</span><span>{project.type === 'video' ? 'WATCH FILM' : 'VIEW FRAME'} <Arrow diagonal/></span></span></button><div className="project-caption"><div><h3>{project.title}</h3><p>{project.subtitle}</p></div><button onClick={event => openProject(project, event)} aria-label={`打开${project.title}`}><Arrow diagonal/></button></div></article>)}</div>
          <div className="work-footnote"><span>真实素材，持续更新。</span><span>FILMS / PHOTOGRAPHY / EXPLORATIONS</span></div>
        </div>
      </section>

      <section id="expertise" className="expertise section wrap"><SectionLabel number="04">MY CREATIVE DNA</SectionLabel><div className="expertise-heading"><h2 className="motion-heading" aria-label="不止于镜头，也关乎思考。"><RevealLine><MotionText>不止于镜头。</MotionText></RevealLine><RevealLine><span className="serif-accent"><MotionText>也关乎思考。</MotionText></span></RevealLine></h2><p>从理解需求，到探索表达，再到执行落地。<br/>让不同经历，在创作中相遇。</p></div><div className="strength-grid">{strengths.map(item => <article className="strength-card" key={item.no}><div className="strength-top"><span>{item.no} /</span><span>{item.en}</span></div><div className="strength-symbol">{item.mark}</div><h3>{item.title}</h3><p>{item.text}</p><div className="strength-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></article>)}</div><div className="creative-note"><span>“</span><p>工具不断变化，<br/>我始终在寻找<span>打动人的那一帧。</span></p><small>WANG CONGCONG / CREATIVE NOTES</small></div></section>

      <section id="contact" className="contact"><div className="contact-orbit" aria-hidden="true"/><div className="contact-inner wrap"><SectionLabel number="05">LET'S MAKE SOMETHING</SectionLabel><div className="contact-title"><span>下一个故事，</span><h2 className="motion-heading" aria-label="一起开拍。"><RevealLine><MotionText>一起</MotionText><span className="contact-accent"><MotionText>开拍。</MotionText></span><Arrow diagonal/></RevealLine></h2></div><div className="contact-bottom"><div><div className="eyebrow">从一个想法开始，期待你的来信。</div><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}<Arrow diagonal/></a><div className="contact-actions"><button className="button primary" onClick={copyEmail}>复制邮箱 <Arrow diagonal/></button><a className="phone-link" href={`tel:${profile.phone}`}>电话 {profile.phone}</a></div></div><div className="contact-wechat"><h3>微信联系</h3><a className="wechat-qr" href={asset('wechat-qr.jpg')} target="_blank" rel="noopener noreferrer" aria-label="打开微信二维码原图"><img src={asset('wechat-qr.jpg')} alt="微信联系二维码，扫码添加王聪聪" width="636" height="740" loading="lazy" /></a><p>扫码添加微信 · 点击查看原图</p></div></div><footer><span>© {new Date().getFullYear()} WANG CONGCONG</span><span>每一帧，都是新的开始。</span><a href="#home">返回顶部 ↑</a></footer></div></section>
    </main>

    {selected && <dialog ref={dialogRef} className="media-dialog" data-lenis-prevent onCancel={closeProject} onClick={event => { if (event.target === dialogRef.current) closeProject(); }} aria-labelledby="dialog-title"><div className="dialog-header"><div><span className="eyebrow">SELECTED WORK / {selected.id}</span><h2 id="dialog-title">{selected.title}</h2></div><button className="close-modal" autoFocus onClick={closeProject} aria-label="关闭作品">×</button></div><div className={`dialog-media ${selected.type === 'image' ? 'image-media' : ''}`}>{selected.type === 'video' ? <video key={selected.id} src={selected.media} poster={selected.poster} controls autoPlay playsInline preload="metadata" onError={() => setVideoError(true)}>你的浏览器不支持视频播放。</video> : <img src={selected.media} alt="爱人错过摄影作品完整海报"/>}</div><div className="dialog-description"><p>{selected.description}</p><small>{videoError ? '视频暂时无法加载，请稍后重试。' : selected.note}</small>{videoError && <a href={selected.media}>打开视频文件 ↗</a>}</div></dialog>}
    <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
