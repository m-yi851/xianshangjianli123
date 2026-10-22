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
