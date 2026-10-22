// Testable lifecycle for the real Page Visibility listener. No polling or hidden loops.
export function observeMotionVisibility({ root, gsap, lenis, raf, syncHeroVideo }) {
  const doc = root.ownerDocument;
  const pausedAnimations = new Set();
  const pausedVideos = new Set();
  const heroVideo = root.querySelector('.hero-video');

  function syncVisibility() {
    root.dataset.motionSuspended = String(doc.hidden);
    if (doc.hidden) {
      lenis?.stop();
      gsap.ticker.remove(raf);
      for (const animation of gsap.globalTimeline.getChildren(false, true, true)) {
        if (!animation.paused() && animation.totalProgress() < 1) {
          pausedAnimations.add(animation);
          animation.pause();
        }
      }
      for (const video of root.querySelectorAll('video')) {
        if (!video.paused) { pausedVideos.add(video); video.pause(); }
      }
      gsap.ticker.sleep();
    } else {
      gsap.ticker.wake();
      pausedAnimations.forEach(animation => animation.resume());
      pausedAnimations.clear();
      if (lenis) {
        gsap.ticker.add(raf);
        if (!root.querySelector('dialog[open]')) lenis.start();
      }
      pausedVideos.forEach(video => {
        if (video.isConnected && video !== heroVideo && video.closest('dialog[open]')) video.play().catch(() => {});
      });
      pausedVideos.clear();
      syncHeroVideo();
    }
  }
  doc.addEventListener('visibilitychange', syncVisibility);
  if (doc.hidden) syncVisibility();
  return () => {
    doc.removeEventListener('visibilitychange', syncVisibility);
    pausedAnimations.forEach(animation => animation.resume());
    pausedAnimations.clear(); pausedVideos.clear();
  };
}
