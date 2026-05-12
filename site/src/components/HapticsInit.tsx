import { onMount, onCleanup } from 'solid-js';
import { initHaptics, destroyHaptics } from '../lib/haptics';

/** Mount once in the app shell to enable global haptic delegation. */
export default function HapticsInit() {
  onMount(() => {
    initHaptics();
  });
  onCleanup(() => {
    destroyHaptics();
  });
  return null;
}
