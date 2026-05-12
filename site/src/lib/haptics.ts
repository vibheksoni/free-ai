/**
 * Haptics — Vibration API + CSS pseudo-haptic feedback.
 * Framework-agnostic. Zero dependencies. Progressive.
 *
 * Mobile: navigator.vibrate() pulse patterns.
 * Desktop: brief CSS transform micro-animation on the element.
 *
 * Usage:
 *   import { haptic, initHaptics } from '../lib/haptics';
 *   initHaptics(); // once, enables delegation
 *   // or imperatively:
 *   haptic('tap');
 *   // or declarative (after init):
 *   <button data-haptic="tap">Click me</button>
 *   <a href="/docs" data-haptic="press">Docs</a>
 */

export type HapticPattern =
  | 'tap'
  | 'press'
  | 'longPress'
  | 'select'
  | 'error'
  | 'success'
  | 'heavy';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  press: 15,
  longPress: 30,
  select: [5, 10, 5],
  error: [30, 50, 30],
  success: [10, 30, 10],
  heavy: 40,
};

// ── Capability detection ──

function hasVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

function vibrate(pattern: number | number[]): void {
  try {
    if (hasVibrate()) {
      navigator.vibrate(typeof pattern === 'number' ? pattern : (pattern as number[]));
    }
  } catch {
    // silently degrade
  }
}

// ── CSS pseudo-haptic fallback ──

const HAPTIC_CLASS = 'haptic-active';
let hapticTimer: ReturnType<typeof setTimeout> | null = null;

function cssHaptic(el: Element): void {
  el.classList.add(HAPTIC_CLASS);
  if (hapticTimer) clearTimeout(hapticTimer);
  hapticTimer = setTimeout(() => {
    el.classList.remove(HAPTIC_CLASS);
  }, 120);
}

// ── Public API ──

/** Fire a single haptic pulse. */
export function haptic(pattern: HapticPattern): void {
  vibrate(PATTERNS[pattern]);
}

/** Fire haptic + CSS pseudo-haptic on a target element. */
export function hapticOn(el: Element, pattern: HapticPattern): void {
  vibrate(PATTERNS[pattern]);
  if (!hasVibrate()) {
    cssHaptic(el);
  }
}

// ── Event delegation ──

const DELEGATE_EVENTS: Array<[string, HapticPattern]> = [
  ['click', 'tap'],
  ['pointerdown', 'press'],
];

function handleHapticEvent(e: Event): void {
  const target = (e.target as HTMLElement).closest('[data-haptic]');
  if (!target) return;
  const pattern = (target.getAttribute('data-haptic') || 'tap') as HapticPattern;
  hapticOn(target, pattern);
}

let initialized = false;

/** Enable global delegation. Call once at app root. */
export function initHaptics(): void {
  if (initialized) return;
  initialized = true;

  for (const [eventName, _pattern] of DELEGATE_EVENTS) {
    document.addEventListener(eventName, handleHapticEvent, { passive: true });
  }

  // Also handle pointerenter for press pattern
  document.addEventListener(
    'pointerenter',
    (e) => {
      const target = (e.target as HTMLElement).closest('[data-haptic="press"]');
      if (!target) return;
      // Only vibrate on hover if supported — don't CSS pulse on hover
      if (hasVibrate()) {
        vibrate(PATTERNS.press);
      }
    },
    { passive: true },
  );
}

/** Tear down delegation (for hot-reload / cleanup). */
export function destroyHaptics(): void {
  if (!initialized) return;
  initialized = false;
  document.removeEventListener('click', handleHapticEvent);
  document.removeEventListener('pointerdown', handleHapticEvent);
}
