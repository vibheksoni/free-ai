import { onMount, onCleanup } from "solid-js";
import Lenis from "lenis";

// Shared scroll ratio for canvas sync
export let scrollRatio = 0;

export default function SmoothScroll() {
  onMount(() => {
    if (typeof window === "undefined") return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", () => {
      const maxY = document.documentElement.scrollHeight - window.innerHeight;
      scrollRatio = maxY > 0 ? Math.max(0, Math.min(1, window.scrollY / maxY)) : 0;
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    onCleanup(() => lenis.destroy());
  });

  return null;
}
