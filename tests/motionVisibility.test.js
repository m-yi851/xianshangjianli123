import test from 'node:test';
import assert from 'node:assert/strict';
import { observeMotionVisibility } from '../src/motionVisibility.js';

function fixture({ initiallyHidden = false } = {}) {
  const doc = new EventTarget();
  doc.hidden = initiallyHidden;
  const calls = [];
  const video = ({ paused = false, connected = true, modal = false } = {}) => ({
    paused, isConnected: connected, plays: 0,
    pause() { this.paused = true; },
    play() { this.paused = false; this.plays++; return Promise.resolve(); },
    closest() { return modal ? {} : null; },
  });
  const hero = video();
  const modal = video({ modal: true });
  const manual = video({ paused: true, modal: true });
  const detached = video({ connected: false, modal: true });
  const running = { stopped: false, paused() { return this.stopped; }, totalProgress: () => .3, pause() { this.stopped = true; }, resume() { this.stopped = false; calls.push('resume'); } };
  const userPaused = { ...running, stopped: true };
  const completed = { ...running, totalProgress: () => 1 };
  let dialogOpen = false;
  const root = { ownerDocument: doc, dataset: {}, querySelector: selector => selector === '.hero-video' ? hero : dialogOpen ? {} : null, querySelectorAll: () => [hero, modal, manual, detached] };
  const gsap = { ticker: { add: () => calls.push('add-frame'), remove: () => calls.push('remove-frame'), sleep: () => calls.push('sleep'), wake: () => calls.push('wake') }, globalTimeline: { getChildren: () => [running, userPaused, completed] } };
  const lenis = { stop: () => calls.push('stop-scroll'), start: () => calls.push('start-scroll') };
  const dispose = observeMotionVisibility({ root, gsap, lenis, raf: () => {}, syncHeroVideo: () => calls.push('sync-hero') });
  return { doc, root, calls, hero, modal, manual, detached, running, userPaused, completed, dispose, setDialog: value => { dialogOpen = value; }, hidden(value) { doc.hidden = value; doc.dispatchEvent(new Event('visibilitychange')); } };
}

test('hiding pauses active work, preserves manual pauses and stops the scroll clock', () => {
  const f = fixture();
  f.hidden(true);
  assert.equal(f.root.dataset.motionSuspended, 'true');
  assert.equal(f.running.stopped, true);
  assert.equal(f.userPaused.stopped, true);
  assert.equal(f.completed.stopped, false);
  assert.equal(f.hero.paused, true);
  assert.equal(f.modal.paused, true);
  assert.ok(f.calls.includes('stop-scroll'));
  assert.ok(f.calls.includes('remove-frame'));
  assert.ok(f.calls.includes('sleep'));
  f.dispose();
});

test('returning resumes only captured work; keeps an open modal scroll-locked', () => {
  const f = fixture();
  f.setDialog(true);
  f.hidden(true);
  f.hidden(false);
  assert.equal(f.running.stopped, false);
  assert.equal(f.userPaused.stopped, true);
  assert.equal(f.modal.plays, 1);
  assert.equal(f.manual.plays, 0);
  assert.equal(f.detached.plays, 0);
  assert.equal(f.hero.plays, 0); // Hero playback is delegated to viewport/user-pause policy.
  assert.ok(f.calls.includes('sync-hero'));
  assert.ok(!f.calls.includes('start-scroll'));
  assert.equal(f.root.dataset.motionSuspended, 'false');
  f.dispose();
});

test('initially hidden documents suspend immediately and cleanup removes the listener', () => {
  const f = fixture({ initiallyHidden: true });
  assert.equal(f.running.stopped, true);
  f.hidden(false);
  assert.ok(f.calls.includes('start-scroll'));
  f.dispose();
  const before = f.calls.length;
  f.hidden(true);
  assert.equal(f.calls.length, before);
});
