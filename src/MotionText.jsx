import React from 'react';

// Tracking is drawn with transforms, never animated letter-spacing/layout.
export function MotionText({ children }) {
  return <span className="motion-text">{Array.from(children).map((letter, index) =>
    <span className="motion-glyph" key={index}>{letter === ' ' ? '\u00a0' : letter}</span>
  )}</span>;
}

export function RevealLine({ children, className = '' }) {
  return <span className={`reveal-mask ${className}`} aria-hidden="true"><span className="reveal-line">{children}</span></span>;
}

// The accessible value stays stable while the decorative digits roll into place.
export function MetricValue({ value }) {
  return <strong className="metric-value" aria-label={value}><span aria-hidden="true">{Array.from(value).map((character, index) => /\d/.test(character)
    ? <span className="metric-window" key={index}><span className="metric-reel"><span>0</span><span>{(Number(character) + 4) % 10}</span><span>{character}</span></span></span>
    : <span className={character === '→' ? 'metric-separator' : 'metric-unit'} key={index}>{character}</span>)}</span></strong>;
}
