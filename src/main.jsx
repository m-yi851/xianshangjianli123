import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { profile, experiences, strengths, skills, asset } from './content';
import { MotionText, RevealLine, MetricValue } from './MotionText';
import AmbientParticles from './AmbientParticles';
import FilmArchive from './FilmArchive';
import { usePortfolioMotion } from './usePortfolioMotion';
import './styles.css';
import './motion.css';
import './refinement.css';

function Arrow({ diagonal = false, className = '' }) {
  return <svg className={`arrow ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? 'M5 19 19 5M5 5h14v14' : 'M4 12h15m-6-6 6 6-6 6'} stroke="currentColor" strokeWidth="1.6" /></svg>;
}
function PlayIcon() { return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m9 5 11 7-11 7Z" /></svg>; }
function SectionLabel({ children, number }) { return <div className="section-label"><span className="pill">{children}</span><span className="label-line"/><span className="section-number">/{number}</span></div>; }

function App() {
  const [expandedExperience, setExpandedExperience] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState('');
  const siteRef = useRef(null);
  const heroVideo = useRef(null);
  const toastTimer = useRef(null);
  usePortfolioMotion(siteRef, null, expandedExperience);

  useEffect(() => { heroVideo.current.dataset.userPaused = String(paused); }, [paused]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    }), { rootMargin: '-20% 0px -45% 0px' });
    document.querySelectorAll('main > section[id]').forEach(el => observer.observe(el));
    return () => { observer.disconnect(); clearTimeout(toastTimer.current); };
  }, []);

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
    <div className="reading-progress" aria-hidden="true"><span/></div>
    <header className="site-header">
      <div className="header-glass" aria-hidden="true"/>
      <a className="wordmark wordmark--name" href="#home" aria-label="王聪聪，返回首页">王聪聪</a>
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
          <h1 className="hero-title" aria-label="短视频编导"><RevealLine className="hero-line"><MotionText>短视频</MotionText></RevealLine><RevealLine className="hero-line"><em><MotionText>编导</MotionText></em><b>↗</b></RevealLine></h1>
          <div className="hero-role">短视频编导 <span>×</span> 内容运营</div>
          <p className="hero-copy">4 年编导运营经验 · 单月涨粉 5.6w</p>
          <div className="hero-actions"><a href="#work" className="button primary">查看项目案例 <Arrow /></a><a className="play-teaser" href={profile.resume} download="王聪聪-短视频编导.pdf"><span className="round-play"><Arrow diagonal /></span>下载完整简历 <span className="tiny">PDF</span></a></div>
        </div>
        <div className="hero-bottom wrap"><a className="scroll-cue" href="#about"><span>向下，认识我</span><span>↓</span></a><div className="hero-index"><span>01</span> / 05 <i/><i/><i/></div><div className="hero-endnote"><span className="hero-motto">IMAGINE. DIRECT. CREATE.</span><button className="sound-control" onClick={toggleVideo} aria-label={paused ? '播放背景视频' : '暂停背景视频'}>{paused ? '▶' : 'Ⅱ'}<span>BACKGROUND FILM</span></button></div></div>
        <div className="red-horizon"/>
      </section>

      <div className="film-strip" aria-hidden="true"><div>{Array.from({ length: 4 }, (_, index) => <React.Fragment key={index}>短视频编导 <span>✳</span> AI 编导 <span>✳</span> </React.Fragment>)}</div></div>

      <section id="about" className="about section wrap">
        <SectionLabel number="02">ABOUT THE CREATOR</SectionLabel>
        <div className="about-main">
          <div className="portrait-card"><div className="portrait-image"><div className="portrait-parallax"><img src={asset('portrait.jpg')} alt="王聪聪个人形象照" loading="lazy"/></div><div className="frame-corner top"/><div className="frame-corner bottom"/><span className="portrait-tag">BEHIND THE LENS</span></div><div className="portrait-name"><strong>{profile.name}</strong><span>{profile.englishName}<Arrow diagonal /></span></div></div>
          <div className="about-copy">
            <div className="eyebrow">你好，我是王聪聪。</div>
            <h2 className="motion-heading" aria-label="从内容出发，让增长发生。"><RevealLine><MotionText>从内容出发，</MotionText></RevealLine><RevealLine><span className="serif-accent"><MotionText>让增长发生。</MotionText></span></RevealLine></h2>
            <p>{profile.introduction}</p><p className="muted">{profile.background}</p>
            <div className="profile-contacts"><span><i className="live-dot"/>{profile.age} · {profile.education} · {profile.availability}</span><a href={`mailto:${profile.email}`}>{profile.email}<Arrow diagonal /></a></div>
            <div className="stats resume-stats">{profile.stats.map(stat => <div key={stat.label}><MetricValue value={stat.value}/><small>{stat.label}</small></div>)}</div>
          </div>
        </div>
        <div className="experience-block">
          <div className="experience-intro"><span className="eyebrow">MY JOURNEY / 工作经历</span><h3 className="motion-heading" aria-label="4年经历，连接内容与生意。"><RevealLine><MotionText>4年经历，</MotionText></RevealLine><RevealLine><MotionText>连接内容</MotionText></RevealLine><RevealLine><span className="serif-accent"><MotionText>与生意。</MotionText></span></RevealLine></h3><p>从选题到内容，<br/>从账号增长到商业转化。</p><div className="journey-tags" aria-label="内容领域"><span>教育内容</span><span>知识 IP</span><span>AI 学习机</span></div><a className="resume-link" href={profile.resume} download="王聪聪-短视频编导.pdf">下载完整简历 <Arrow diagonal /></a></div>
          <div className="timeline experience-accordion">
            {experiences.map((item, index) => <article className={`experience-item ${expandedExperience === index ? 'is-open' : ''}`} key={item.date}>
              <h4 className="experience-toggle-heading"><button type="button" className="experience-toggle" aria-expanded={expandedExperience === index} aria-controls={`experience-panel-${index}`} id={`experience-toggle-${index}`} onClick={() => setExpandedExperience(expandedExperience === index ? null : index)}><span className="experience-toggle-copy"><time>{item.date}</time><span className="experience-role">{item.title}</span><span className="company">{item.detail}</span></span><span className="experience-toggle-action"><span className="experience-hint">{expandedExperience === index ? '收起详情' : '展开详情'}</span><span className="experience-chevron" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.5"/></svg></span></span></button></h4>
              <div className="experience-panel" id={`experience-panel-${index}`} role="region" aria-labelledby={`experience-toggle-${index}`} hidden={expandedExperience !== index}><ul className="experience-points">{item.points.map(point => <li key={point.title}><strong>{point.title}</strong><p>{point.text}</p></li>)}</ul></div>
            </article>)}
          </div>
        </div>
      </section>

      <FilmArchive />

      <section id="expertise" className="expertise section wrap"><SectionLabel number="04">MY CREATIVE DNA</SectionLabel><div className="expertise-heading"><h2 className="motion-heading" aria-label="让创意落地，让内容生长。"><RevealLine><MotionText>让创意落地，</MotionText></RevealLine><RevealLine><span className="serif-accent"><MotionText>让内容生长。</MotionText></span></RevealLine></h2><p>产品理解、选题嗅觉、IP 打造、AI 提效。<br/>把策划、制作、运营连接成完整链路。</p></div>
        <div className="strength-grid resume-strengths">{strengths.map(item => <article className="strength-card" key={item.no}><div className="strength-top"><span>{item.no} /</span><span>{item.en}</span></div><div className="strength-symbol" aria-hidden="true">{item.mark}</div><h3>{item.title}</h3><p>{item.text}</p><div className="strength-tags">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></article>)}</div>
        <div className="skills-block"><div className="eyebrow">TOOLS OF THE TRADE / 专业技能</div><div className="skills-grid">{skills.map(item => <article className="skill-card" key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div>
        <div className="creative-note"><span>“</span><p>让内容有方法，<br/>让创意<span>有落地的路径。</span></p><small>WANG CONGCONG / CREATIVE NOTES</small></div>
      </section>

      <section id="contact" className="contact"><div className="contact-orbit" aria-hidden="true"/><div className="contact-inner wrap"><SectionLabel number="05">LET'S MAKE SOMETHING</SectionLabel><div className="contact-title"><span>下一个故事，</span><h2 className="motion-heading contact-invitation" aria-label="让我们一起进行。"><RevealLine><MotionText>让我们</MotionText></RevealLine><RevealLine><span className="contact-accent"><MotionText>一起进行。</MotionText></span><Arrow diagonal/></RevealLine></h2></div><div className="contact-bottom"><div><div className="eyebrow">从一个想法开始，期待你的来信。</div><a className="email-link" href={`mailto:${profile.email}`}>{profile.email}<Arrow diagonal/></a><div className="contact-actions"><button className="button primary" onClick={copyEmail}>复制邮箱 <Arrow diagonal/></button><a className="phone-link" href={`tel:${profile.phone}`}>电话 {profile.phone}</a></div></div><div className="contact-wechat"><h3>微信联系</h3><a className="wechat-qr" href={asset('wechat-qr.jpg')} target="_blank" rel="noopener noreferrer" aria-label="打开微信二维码原图"><img src={asset('wechat-qr.jpg')} alt="微信联系二维码，扫码添加王聪聪" width="636" height="740" loading="lazy" /></a><p>扫码添加微信 · 点击查看原图</p></div></div><footer><span>© {new Date().getFullYear()} WANG CONGCONG</span><span>每一帧，都是新的开始。</span><a href="#home">返回顶部 ↑</a></footer></div></section>
    </main>

    <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">{toast}</div>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
