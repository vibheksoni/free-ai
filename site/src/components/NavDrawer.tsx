import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { siteConfig } from "../config/site";

const LINKS: [string, string, boolean][] = [
  ["/home", "Home", false],
  ["/docs", "Docs", false],
  ["/models", "Models", false],
  ["/status", "Status", false],
  [siteConfig.socials.github, "Repo", true],
];

export default function NavDrawer() {
  const [open, setOpen] = createSignal(false);
  let rootRef: HTMLDivElement | undefined;

  createEffect(() => {
    if (!open() || typeof document === "undefined") return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !rootRef?.contains(target)) setOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);

    onCleanup(() => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    });
  });

  return (
    <div class="nav-menu" ref={rootRef} data-open={open() ? "" : undefined}>
      <button
        type="button"
        class="nav-hamburger"
        aria-label={open() ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open()}
        aria-controls="mobile-navigation-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span class="hamburger-bar" />
        <span class="hamburger-bar" />
        <span class="hamburger-bar" />
      </button>
      <Show when={open()}>
        <nav id="mobile-navigation-menu" class="nav-drawer" aria-label="Mobile navigation">
          <div class="nav-drawer__links">
            {LINKS.map(([href, label, external]) => (
              <a
                href={href}
                class="nav-drawer__link"
                onClick={() => setOpen(false)}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
              >
                {label}
              </a>
            ))}
          </div>
          <div class="nav-drawer__footer">
            <a
              href={siteConfig.socials.discord}
              class="nav-drawer__discord"
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
            >
              <span class="material-symbols-outlined">forum</span>
              Join Discord
            </a>
          </div>
        </nav>
      </Show>
    </div>
  );
}
