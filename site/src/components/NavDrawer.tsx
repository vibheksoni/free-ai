import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { siteConfig } from "../config/site";

const LINKS: [string, string, boolean][] = [
  ["/home", "Home", false],
  ["/docs", "Docs", false],
  ["/models", "Models", false],
  ["/pricing", "Pricing", false],
  ["/status", "Status", false],
  [siteConfig.socials.github, "Repo", true],
];

type NavDrawerProps = {
  currentPath?: string;
};

export default function NavDrawer(props: NavDrawerProps) {
  const [open, setOpen] = createSignal(false);
  let rootRef: HTMLDivElement | undefined;
  let drawerRef: HTMLElement | undefined;
  let dragStartX = 0;
  let dragCurrentX = 0;
  let isDragging = false;
  let lockedScrollY = 0;

  const lockPageScroll = () => {
    if (typeof document === "undefined") return;
    if (document.body.classList.contains("nav-drawer-open")) return;
    lockedScrollY = window.scrollY;
    document.documentElement.classList.add("nav-drawer-open");
    document.body.classList.add("nav-drawer-open");
    document.body.style.top = `-${lockedScrollY}px`;
  };

  const unlockPageScroll = () => {
    if (typeof document === "undefined") return;
    if (!document.body.classList.contains("nav-drawer-open")) return;
    const restoreY = lockedScrollY;
    document.documentElement.classList.remove("nav-drawer-open");
    document.body.classList.remove("nav-drawer-open");
    document.body.style.top = "";
    lockedScrollY = 0;
    window.scrollTo(0, restoreY);
  };

  const closeDrawer = () => {
    setOpen(false);
    unlockPageScroll();
  };

  const handleDragStart = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) return;
    dragStartX = e.clientX;
    dragCurrentX = dragStartX;
    isDragging = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handleDragMove = (e: PointerEvent) => {
    if (!isDragging) return;
    dragCurrentX = e.clientX;
    const delta = dragCurrentX - dragStartX;
    if (drawerRef) {
      const clamped = Math.max(0, delta);
      drawerRef.style.transform = `translateX(${clamped}px)`;
      drawerRef.style.transition = "none";
    }
    e.preventDefault();
  };

  const handleDragEnd = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    const delta = dragCurrentX - dragStartX;
    const drawerWidth = drawerRef?.offsetWidth ?? 280;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (drawerRef) {
      drawerRef.style.transition = "";
      drawerRef.style.transform = "";
    }
    if (delta > drawerWidth * 0.3) {
      closeDrawer();
    }
  };

  createEffect(() => {
    const nav = rootRef?.closest(".nav");
    if (nav instanceof HTMLElement) {
      nav.classList.toggle("has-open-drawer", open());
    }

    if (open()) {
      lockPageScroll();
    }

    if (!open() || typeof document === "undefined") return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };

    document.addEventListener("keydown", closeOnEscape);
    onCleanup(() => {
      document.removeEventListener("keydown", closeOnEscape);
    });
  });

  onCleanup(() => unlockPageScroll());

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
        <Portal mount={document.body}>
          <div class="nav-drawer-overlay" onClick={closeDrawer} />
          <nav
            id="mobile-navigation-menu"
            class="nav-drawer"
            ref={drawerRef}
            aria-label="Mobile navigation"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
          >
            <div class="nav-drawer__links">
              {LINKS.map(([href, label, external]) => (
                <a
                  href={href}
                  class={`nav-drawer__link${props.currentPath === href ? " is-active" : ""}`}
                  onClick={() => closeDrawer()}
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
                onClick={() => closeDrawer()}
              >
                <span class="material-symbols-outlined">forum</span>
                Join Discord
              </a>
            </div>
          </nav>
        </Portal>
      </Show>
    </div>
  );
}
