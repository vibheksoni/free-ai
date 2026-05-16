import {
    For,
    Show,
    createEffect,
    createMemo,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
import { siteConfig } from "../config/site";

type ProviderStatus = "up" | "degraded" | "down" | "unknown";

type ProviderHealth = {
    error_rate_30m: number;
    error_rate_60m: number;
    errors_30m: number;
    errors_60m: number;
    last_error_at?: string | null;
    last_success_at?: string | null;
    model_count: number;
    prefix: string;
    requests_30m: number;
    requests_60m: number;
    status: ProviderStatus;
    successes_30m: number;
    successes_60m: number;
};

type HealthPayload = {
    providers?: ProviderHealth[];
};

type ScrollRailMetrics = {
    scrollable: boolean;
    thumbHeight: number;
    thumbTop: number;
};

const providerOrder = [
    "fth",
    "rev",
    "bbg",
    "glm",
    "opc",
    "cat",
    "yng",
    "bbl",
    "cwy",
    "woo",
    "img",
    "kai",
    "or",
    "vhr",
    "wsf",
];

const CSS = `
/* ── Grid ── */
.status-grid {
  align-items: start;
}

/* ── Card ── */
.status-card {
  position: relative;
  display: grid;
  gap: 18px;
  padding: 18px;
  min-height: 210px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius);
  background: var(--sk-shell-bg);
  box-shadow: var(--sk-raised-shadow);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.status-card:hover {
  box-shadow: var(--sk-raised-shadow), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.status-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: -4px;
  border-radius: 4px;
}

.status-card.is-up {
  border-color: rgba(46, 160, 67, 0.3);
  box-shadow: var(--sk-raised-shadow), inset 2px 0 0 rgba(46, 160, 67, 0.7);
}
.status-card.is-degraded {
  border-color: rgba(217, 119, 6, 0.38);
  box-shadow: var(--sk-raised-shadow), inset 2px 0 0 rgba(217, 119, 6, 0.72);
}
.status-card.is-down {
  border-color: rgba(255, 77, 77, 0.38);
  box-shadow: var(--sk-raised-shadow), inset 2px 0 0 rgba(255, 77, 77, 0.72);
}

.status-card-top {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}
.status-card-top strong {
  font-size: 1rem;
  letter-spacing: -0.02em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.status-card-top span:last-child {
  margin-left: auto;
  color: var(--muted);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

.status-dot {
  width: 9px; height: 9px;
  border-radius: 50%;
  background: var(--dim);
  flex-shrink: 0;
}
.is-up .status-dot    { background: #2ea043; }
.is-degraded .status-dot { background: var(--amber); }
.is-down .status-dot  { background: var(--danger); }

.status-card-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}
.status-card-main span {
  font-family: var(--font-mono);
  font-size: clamp(1.55rem, 3vw, 2.15rem);
  line-height: 0.9;
  letter-spacing: -0.05em;
}
.status-card-main small {
  color: var(--muted);
  font-size: 0.82rem;
  flex-shrink: 0;
}

.status-card-blast-slot {
  min-height: 32px;
  display: flex;
  align-items: center;
}
.status-card-blast {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-inset-bg);
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 500;
  max-width: 100%;
}
.status-card-blast strong {
  color: var(--text);
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.is-degraded .status-card-blast {
  border-color: rgba(217, 119, 6, 0.35);
  color: var(--amber);
}
.is-down .status-card-blast {
  border-color: rgba(255, 77, 77, 0.35);
  color: var(--danger);
}

.status-card-meta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 12px;
  padding: 10px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-inset-bg);
  box-shadow: var(--sk-inset-shadow);
  color: var(--muted);
  font-size: 0.82rem;
}
.status-card-meta strong {
  color: var(--text);
  font-weight: 600;
}

/* Selected card */
.status-card.is-selected {
  z-index: 2;
  box-shadow: var(--sk-raised-shadow), 0 0 0 1px var(--accent), 0 0 18px rgba(238, 93, 32, 0.15);
}
.status-card.is-up.is-selected    { border-color: rgba(46, 160, 67, 0.5); }
.status-card.is-degraded.is-selected { border-color: rgba(217, 119, 6, 0.55); }
.status-card.is-down.is-selected  { border-color: rgba(255, 77, 77, 0.55); }

/* ═══ Popover Backdrop ═══ */
.popover-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
  overscroll-behavior: contain;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  animation: backdrop-in 0.18s ease;
}
@keyframes backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ═══ Popover Shell ═══ */
.popover {
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(520px, calc(100vw - 32px));
  max-height: min(640px, calc(100vh - 64px));
  max-height: min(640px, calc(100dvh - 64px));
  height: min(640px, calc(100vh - 64px));
  height: min(640px, calc(100dvh - 64px));
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius);
  background: var(--sk-shell-bg);
  box-shadow: var(--sk-raised-crisp-shadow), 0 32px 64px rgba(0, 0, 0, 0.7);
  opacity: 0;
  transform: translateY(16px) scale(0.98);
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.popover.is-open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Status strip */
.popover-status-strip {
  flex-shrink: 0;
  height: 3px;
  margin: -1px -1px 0;
  border-radius: var(--radius) var(--radius) 0 0;
}
.is-up .popover-status-strip    { background: rgba(46, 160, 67, 0.6); }
.is-degraded .popover-status-strip { background: rgba(217, 119, 6, 0.65); }
.is-down .popover-status-strip  { background: rgba(255, 77, 77, 0.65); }

/* Drag handle — desktop hidden, mobile visible */
.popover-drag-handle {
  display: none;
  width: 64px;
  height: 28px;
  margin: 0 auto;
  padding: 10px 14px 13px;
  box-sizing: border-box;
  border: 0;
  background: transparent;
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
}
.popover-drag-handle::before {
  content: "";
  display: block;
  width: 36px;
  height: 5px;
  margin: 0 auto;
  border-radius: 3px;
  background: var(--border-strong);
}
.popover-drag-handle:active {
  cursor: grabbing;
}

/* Header — fixed, does not scroll */
.popover-header {
  flex-shrink: 0;
  padding: 0 24px;
  min-width: 0;
  touch-action: none;
}
.popover-header.has-handle {
  padding-top: 0;
}

/* Close button */
.popover-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-inset-bg);
  box-shadow: var(--sk-inset-shadow);
  color: var(--muted);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  flex-shrink: 0;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}
.popover-close:hover {
  border-color: var(--border-strong);
  color: var(--text);
  background: var(--sk-shell-bg);
}
.popover-close:active {
  transform: scale(0.93);
}

.popover-heading {
  margin: 22px 0 4px;
  color: var(--text);
  font-family: var(--font-serif);
  font-size: 1.3rem;
  font-weight: 600;
  padding-right: 38px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.popover-sub {
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 0.84rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Body — scrolls independently */
.popover-body-frame {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
}
.popover-body {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  min-height: 0;
  padding: 8px 24px 24px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  touch-action: pan-y;
}
.popover-body::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.popover-scroll-rail {
  position: absolute;
  top: 8px;
  right: 7px;
  bottom: 14px;
  width: 12px;
  border-radius: 999px;
  background: transparent;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  touch-action: none;
}
.popover-body-frame.is-scrollable .popover-scroll-rail {
  opacity: 1;
  pointer-events: auto;
}
.popover-scroll-rail:hover,
.popover-scroll-rail.is-dragging {
  background: transparent;
}
.popover-scroll-thumb {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  min-height: 32px;
  border-radius: 999px;
  background: transparent;
  cursor: grab;
  touch-action: none;
}
.popover-scroll-thumb::before {
  content: "";
  position: absolute;
  inset: 0 4px;
  border-radius: 999px;
  background: rgba(238, 93, 32, 0.48);
}
.popover-scroll-thumb:hover,
.popover-scroll-thumb.is-dragging {
  background: transparent;
}
.popover-scroll-thumb.is-dragging {
  cursor: grabbing;
}
.popover-scroll-thumb:hover::before,
.popover-scroll-thumb.is-dragging::before {
  background: rgba(238, 93, 32, 0.78);
}

/* Detail sections */
.detail-section {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 16px;
  align-items: baseline;
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-inset-bg);
  box-shadow: var(--sk-inset-shadow);
  min-width: 0;
}
.detail-section:last-child { margin-bottom: 0; }

.detail-section-title {
  grid-column: 1 / -1;
  color: var(--dim);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding-bottom: 6px;
  margin: 0 0 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-section dt {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.detail-section dd {
  color: var(--text);
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
  text-align: right;
  font-variant-numeric: tabular-nums;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-section dd.zero { color: var(--muted); }

/* Catalog link */
.catalog-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius);
  color: var(--accent-text);
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.15s ease, background 0.15s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.catalog-link:hover {
  border-color: var(--accent);
  background: var(--accent-muted);
}
.catalog-link-arrow { font-size: 0.9rem; opacity: 0.7; flex-shrink: 0; }

/*
 * ═══ Mobile: bottom sheet ═══
 */
@media (max-width: 640px) {
  .popover-backdrop {
    padding: 0;
    align-items: flex-end;
  }

  .popover {
    width: 100%;
    max-width: 100%;
    max-height: 88vh;
    max-height: 88dvh;
    height: 88vh;
    height: 88dvh;
    border-radius: 14px 14px 0 0;
    border-bottom: none;
    transform: translateY(100%);
    transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
  }
  .popover.is-open {
    transform: translateY(0);
  }

  .popover-drag-handle {
    display: block;
  }

  .popover-header {
    padding: 0 18px;
  }
  .popover-header.has-handle {
    padding-top: 0;
  }
  .popover-heading {
    margin-top: 0;
    font-size: 1.15rem;
  }
  .popover-sub {
    margin-bottom: 12px;
    font-size: 0.78rem;
  }

  .popover-body {
    padding: 4px 30px calc(20px + env(safe-area-inset-bottom, 0px)) 18px;
    overscroll-behavior: contain;
  }

  .popover-close {
    top: 16px;
    right: 14px;
  }

  .status-card {
    gap: 14px;
    padding: 16px;
    min-height: 190px;
  }

  .detail-section {
    grid-template-columns: 1fr 1fr;
    gap: 2px 12px;
    padding: 12px;
  }
  .detail-section dt { font-size: 0.68rem; }
  .detail-section dd { font-size: 0.8rem; }
}

/* ═══ Lock body scroll when popover is open ═══ */
html.popover-open {
  background: var(--bg);
}
html.popover-open,
body.popover-open {
  overflow: hidden;
  overscroll-behavior: none;
}
body.popover-open {
  position: fixed;
  left: 0;
  right: 0;
  width: 100%;
}
`;

export default function ProviderStatusGrid() {
    const [health, setHealth] = createSignal<HealthPayload | null>(null);
    const [loadedAt, setLoadedAt] = createSignal<Date | null>(null);
    const [failed, setFailed] = createSignal(false);
    const [selectedPrefix, setSelectedPrefix] = createSignal<string | null>(
        null,
    );
    const [scrollRailMetrics, setScrollRailMetrics] =
        createSignal<ScrollRailMetrics>({
            scrollable: false,
            thumbHeight: 0,
            thumbTop: 0,
        });
    const [isScrollThumbDragging, setIsScrollThumbDragging] =
        createSignal(false);
    let interval: number | undefined;
    let lockedScrollY = 0;
    let popoverBodyEl: HTMLDivElement | undefined;
    let scrollRailEl: HTMLDivElement | undefined;
    let scrollRailFrame: number | undefined;
    let scrollDragStartY = 0;
    let scrollDragStartTop = 0;

    /* ── Drag-to-dismiss state ── */
    const [dragOffset, setDragOffset] = createSignal(0);
    const [isDragging, setIsDragging] = createSignal(false);
    let dragStartY = 0;
    let sheetStartOffset = 0;
    let sheetEl: HTMLDivElement | undefined;
    let dragBoundMove: ((e: PointerEvent) => void) | null = null;
    let dragBoundUp: ((e: PointerEvent) => void) | null = null;
    const DISMISS_THRESHOLD = 0.3;

    const fetchHealth = async () => {
        try {
            const response = await fetch(`${siteConfig.socials.api}/v1/health`, { cache: "no-store" });
            if (!response.ok) throw new Error(`health ${response.status}`);
            setHealth(await response.json());
            setLoadedAt(new Date());
            setFailed(false);
        } catch (error) {
            console.error("Failed to load provider health", error);
            setFailed(true);
        }
    };

    onMount(() => {
        fetchHealth();
        interval = window.setInterval(fetchHealth, 30000);
    });

    onCleanup(() => {
        if (interval) window.clearInterval(interval);
    });

    /* ── Persistent modal scroll rail ── */
    const resetScrollRail = () => {
        setScrollRailMetrics({
            scrollable: false,
            thumbHeight: 0,
            thumbTop: 0,
        });
    };

    const updateScrollRail = () => {
        const body = popoverBodyEl;
        const rail = scrollRailEl;
        if (!body || !rail) {
            resetScrollRail();
            return;
        }

        const maxScroll = body.scrollHeight - body.clientHeight;
        const railHeight = rail.clientHeight;
        if (maxScroll <= 1 || railHeight <= 0) {
            resetScrollRail();
            return;
        }

        const thumbHeight = Math.max(
            32,
            Math.round((body.clientHeight / body.scrollHeight) * railHeight),
        );
        const maxThumbTop = Math.max(0, railHeight - thumbHeight);
        const thumbTop = Math.round((body.scrollTop / maxScroll) * maxThumbTop);

        setScrollRailMetrics({
            scrollable: true,
            thumbHeight,
            thumbTop,
        });
    };

    const queueScrollRailUpdate = () => {
        if (typeof window === "undefined") return;
        if (scrollRailFrame !== undefined) {
            window.cancelAnimationFrame(scrollRailFrame);
        }
        scrollRailFrame = window.requestAnimationFrame(() => {
            scrollRailFrame = undefined;
            updateScrollRail();
        });
    };

    const scrollBodyFromThumbTop = (thumbTop: number) => {
        const body = popoverBodyEl;
        const rail = scrollRailEl;
        if (!body || !rail) return;

        const maxScroll = body.scrollHeight - body.clientHeight;
        const maxThumbTop = rail.clientHeight - scrollRailMetrics().thumbHeight;
        body.scrollTop =
            maxThumbTop > 0 ? (thumbTop / maxThumbTop) * maxScroll : 0;
        updateScrollRail();
    };

    const handleScrollRailPointerDown = (e: PointerEvent) => {
        if (!scrollRailMetrics().scrollable) return;
        if (e.target !== e.currentTarget) return;
        const rail = scrollRailEl;
        if (!rail) return;

        e.preventDefault();
        e.stopPropagation();

        const metrics = scrollRailMetrics();
        const rect = rail.getBoundingClientRect();
        const maxThumbTop = Math.max(0, rail.clientHeight - metrics.thumbHeight);
        const thumbTop = Math.max(
            0,
            Math.min(
                e.clientY - rect.top - metrics.thumbHeight / 2,
                maxThumbTop,
            ),
        );
        scrollBodyFromThumbTop(thumbTop);
    };

    const handleScrollThumbPointerDown = (e: PointerEvent) => {
        if (!scrollRailMetrics().scrollable) return;

        e.preventDefault();
        e.stopPropagation();

        scrollDragStartY = e.clientY;
        scrollDragStartTop = scrollRailMetrics().thumbTop;
        setIsScrollThumbDragging(true);
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    };

    const handleScrollThumbPointerMove = (e: PointerEvent) => {
        if (!isScrollThumbDragging()) return;
        const rail = scrollRailEl;
        if (!rail) return;

        e.preventDefault();
        e.stopPropagation();

        const maxThumbTop = Math.max(
            0,
            rail.clientHeight - scrollRailMetrics().thumbHeight,
        );
        const thumbTop = Math.max(
            0,
            Math.min(scrollDragStartTop + e.clientY - scrollDragStartY, maxThumbTop),
        );
        scrollBodyFromThumbTop(thumbTop);
    };

    const handleScrollThumbPointerEnd = (e: PointerEvent) => {
        if (!isScrollThumbDragging()) return;
        e.preventDefault();
        e.stopPropagation();
        setIsScrollThumbDragging(false);
        const thumb = e.currentTarget as HTMLDivElement;
        if (thumb.hasPointerCapture(e.pointerId)) {
            thumb.releasePointerCapture(e.pointerId);
        }
    };

    const handlePopoverBodyWheel = (e: WheelEvent) => {
        const body = popoverBodyEl;
        if (!body) return;

        const maxScroll = body.scrollHeight - body.clientHeight;
        if (maxScroll <= 1) return;

        const deltaY =
            e.deltaMode === WheelEvent.DOM_DELTA_LINE
                ? e.deltaY * 16
                : e.deltaMode === WheelEvent.DOM_DELTA_PAGE
                  ? e.deltaY * body.clientHeight
                  : e.deltaY;
        const nextScrollTop = Math.max(
            0,
            Math.min(body.scrollTop + deltaY, maxScroll),
        );

        e.preventDefault();
        e.stopPropagation();
        body.scrollTop = nextScrollTop;
        updateScrollRail();
    };

    createEffect(() => {
        if (selectedPrefix()) queueScrollRailUpdate();
    });

    onCleanup(() => {
        if (typeof window !== "undefined" && scrollRailFrame !== undefined) {
            window.cancelAnimationFrame(scrollRailFrame);
        }
    });

    /* ── Body scroll lock ── */
    const lockPageScroll = () => {
        if (typeof document === "undefined") return;
        if (document.body.classList.contains("popover-open")) return;

        lockedScrollY = window.scrollY;
        document.documentElement.classList.add("popover-open");
        document.body.classList.add("popover-open");
        document.body.style.top = `-${lockedScrollY}px`;
    };

    const unlockPageScroll = () => {
        if (typeof document === "undefined") return;
        if (!document.body.classList.contains("popover-open")) return;

        const restoreY = lockedScrollY;
        document.documentElement.classList.remove("popover-open");
        document.body.classList.remove("popover-open");
        document.body.style.top = "";
        lockedScrollY = 0;
        window.scrollTo(0, restoreY);
    };

    const openPopover = (prefix: string) => {
        lockPageScroll();
        setSelectedPrefix(prefix);
        setDragOffset(0);
        queueScrollRailUpdate();
    };

    const closePopover = () => {
        setSelectedPrefix(null);
        setDragOffset(0);
        setIsDragging(false);
        setIsScrollThumbDragging(false);
        popoverBodyEl = undefined;
        scrollRailEl = undefined;
        resetScrollRail();
        unlockPageScroll();
    };

    onCleanup(() => {
        unlockPageScroll();
    });

    /* ── Drag-to-dismiss ── */
    const handleDragStart = (e: PointerEvent) => {
        if (!isMobile()) return;

        const target = e.target as HTMLElement;
        if (target.closest("button,a")) return;

        e.preventDefault();
        dragStartY = e.clientY;
        sheetStartOffset = dragOffset();
        setIsDragging(true);

        dragBoundMove = handleDragMove;
        dragBoundUp = handleDragEnd;
        document.addEventListener("pointermove", dragBoundMove, { passive: false });
        document.addEventListener("pointerup", dragBoundUp, { passive: false });
        document.addEventListener("pointercancel", dragBoundUp, { passive: false });
    };

    const handleDragMove = (e: PointerEvent) => {
        if (!isDragging()) return;
        e.preventDefault();
        const delta = e.clientY - dragStartY;
        const newOffset = delta > 0 ? delta : delta * 0.3;
        setDragOffset(Math.max(0, sheetStartOffset + newOffset));
    };

    const handleDragEnd = (e: PointerEvent) => {
        if (!isDragging()) return;
        e.preventDefault();
        setIsDragging(false);
        if (dragBoundMove) document.removeEventListener("pointermove", dragBoundMove);
        if (dragBoundUp) {
            document.removeEventListener("pointerup", dragBoundUp);
            document.removeEventListener("pointercancel", dragBoundUp);
        }
        dragBoundMove = null;
        dragBoundUp = null;

        const sheetHeight = sheetEl?.offsetHeight ?? 400;
        const threshold = sheetHeight * DISMISS_THRESHOLD;

        if (dragOffset() > threshold) {
            closePopover();
        } else {
            setDragOffset(0);
        }
    };

    /* ── Keyboard ── */
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && selectedPrefix()) closePopover();
    };

    onMount(() => {
        if (typeof document !== "undefined") {
            document.addEventListener("keydown", handleKeyDown);
        }
    });
    onCleanup(() => {
        if (typeof document !== "undefined") {
            document.removeEventListener("keydown", handleKeyDown);
        }
    });

    /* ── Derived data ── */
    const providers = createMemo(() => {
        const items = [...(health()?.providers ?? [])];
        return items.sort((left, right) => {
            const leftIndex = providerOrder.indexOf(left.prefix);
            const rightIndex = providerOrder.indexOf(right.prefix);
            if (leftIndex !== -1 || rightIndex !== -1) {
                return (
                    (leftIndex === -1 ? 999 : leftIndex) -
                    (rightIndex === -1 ? 999 : rightIndex)
                );
            }
            return left.prefix.localeCompare(right.prefix);
        });
    });

    const summary = createMemo(() => {
        const items = providers();
        const degraded = items.filter((item) => item.status === "degraded");
        const down = items.filter((item) => item.status === "down");
        const up = items.filter((item) => item.status === "up");
        return {
            degraded: degraded.length,
            down: down.length,
            total: items.length,
            up: up.length,
            modelsAffected:
                degraded.reduce((sum, p) => sum + p.model_count, 0) +
                down.reduce((sum, p) => sum + p.model_count, 0),
        };
    });

    const selectedProvider = createMemo(() => {
        const prefix = selectedPrefix();
        if (!prefix) return null;
        return providers().find((p) => p.prefix === prefix) ?? null;
    });

    const formatTimestamp = (iso: string | null | undefined): string => {
        if (!iso) return "never";
        try {
            const date = new Date(iso);
            return date.toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "unknown";
        }
    };

    /* ── Mobile detection ── */
    const [isMobile, setIsMobile] = createSignal(false);
    onMount(() => {
        if (typeof window !== "undefined") {
            setIsMobile(window.innerWidth <= 640);
            const onResize = () => {
                setIsMobile(window.innerWidth <= 640);
                queueScrollRailUpdate();
            };
            window.addEventListener("resize", onResize);
            onCleanup(() => window.removeEventListener("resize", onResize));
        }
    });

    return (
        <div class="status-board">
            <style>{CSS}</style>

            <div class="status-board-head">
                <div>
                    <h1>Status</h1>
                </div>
                <div
                    class="status-summary"
                    aria-label="Provider health summary"
                >
                    <span>{summary().up} up</span>
                    <span>{summary().degraded} degraded</span>
                    <span>{summary().down} down</span>
                </div>
            </div>

            <Show when={failed()}>
                <div class="status-alert">
                    Health data did not load. Retrying automatically.
                </div>
            </Show>

            <Show
                when={providers().length > 0}
                fallback={
                    <div class="status-grid">
                        <article
                            class="status-card is-unknown"
                            aria-live="polite"
                        >
                            <div class="status-card-top">
                                <span class="status-dot" />
                                <strong>providers/</strong>
                                <span>loading</span>
                            </div>
                            <div class="status-card-main">
                                <span>...</span>
                                <small>models</small>
                            </div>
                            <div class="status-card-blast-slot" />
                            <div class="status-card-meta">
                                <span>30m errors</span>
                                <strong>...</strong>
                                <span>requests</span>
                                <strong>...</strong>
                            </div>
                        </article>
                    </div>
                }
            >
                <div class="status-grid">
                    <For each={providers()}>
                        {(provider) => {
                            const isSelected = () =>
                                selectedPrefix() === provider.prefix;
                            const isAffected =
                                provider.status === "degraded" ||
                                provider.status === "down";
                            const modelCount = provider.model_count;
                            const showBlast = isAffected && modelCount > 0;

                            return (
                                <article
                                    class={`status-card is-${provider.status}${isSelected() ? " is-selected" : ""}`}
                                    tabindex="0"
                                    role="button"
                                    aria-label={`${provider.prefix} provider status ${provider.status}`}
                                    onClick={() =>
                                        isSelected()
                                            ? closePopover()
                                            : openPopover(provider.prefix)
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                        ) {
                                            e.preventDefault();
                                            isSelected()
                                                ? closePopover()
                                                : openPopover(provider.prefix);
                                        }
                                    }}
                                >
                                    <div class="status-card-top">
                                        <span class="status-dot" />
                                        <strong>{provider.prefix}/</strong>
                                        <span>{provider.status}</span>
                                    </div>

                                    <div class="status-card-main">
                                        <span>
                                            {modelCount.toLocaleString()}
                                        </span>
                                        <small>
                                            {modelCount === 1
                                                ? "model"
                                                : "models"}
                                        </small>
                                    </div>

                                    <div class="status-card-blast-slot">
                                        {showBlast && (
                                            <span class="status-card-blast">
                                                {provider.status === "down"
                                                    ? "Affected"
                                                    : "At risk"}{" "}
                                                <strong>
                                                    {modelCount.toLocaleString()}
                                                </strong>{" "}
                                                {modelCount === 1
                                                    ? "model"
                                                    : "models"}
                                            </span>
                                        )}
                                    </div>

                                    <div class="status-card-meta">
                                        <span>30m errors</span>
                                        <strong>
                                            {formatPercent(
                                                provider.error_rate_30m,
                                            )}
                                        </strong>
                                        <span>requests</span>
                                        <strong>
                                            {provider.requests_30m.toLocaleString()}
                                        </strong>
                                    </div>
                                </article>
                            );
                        }}
                    </For>
                </div>
            </Show>

            {/* ═══ Popover ═══ */}
            <Show when={selectedProvider()}>
                {(provider) => {
                    const isAffected =
                        provider().status === "degraded" ||
                        provider().status === "down";

                    const sheetTransform = () => {
                        if (!isMobile()) return undefined;
                        const base = isDragging() ? 0 : undefined;
                        const offset = dragOffset();
                        if (offset > 0) {
                            return `translateY(${offset}px)`;
                        }
                        return base !== undefined
                            ? `translateY(${base}px)`
                            : undefined;
                    };

                    const sheetTransition = () => {
                        if (isDragging()) return "none";
                        return undefined;
                    };

                    return (
                        <div class="popover-backdrop" onClick={closePopover}>
                            <div
                                ref={sheetEl}
                                class={`popover is-${provider().status} is-open`}
                                style={{
                                    transform: sheetTransform(),
                                    transition: sheetTransition(),
                                }}
                                onClick={(e) => e.stopPropagation()}
                                role="dialog"
                                aria-label={`${provider().prefix} provider details`}
                            >
                                {/* Status strip */}
                                <div class="popover-status-strip" />

                                {/* Drag handle — mobile only, with drag events */}
                                <Show when={isMobile()}>
                                    <div
                                        class="popover-drag-handle"
                                        onPointerDown={handleDragStart}
                                    />
                                </Show>

                                {/* Header — fixed, also draggable on mobile */}
                                <div
                                    class={`popover-header${isMobile() ? " has-handle" : ""}`}
                                    onPointerDown={
                                        isMobile() ? handleDragStart : undefined
                                    }
                                >
                                    <button
                                        class="popover-close"
                                        onClick={closePopover}
                                        aria-label="Close"
                                    >
                                        &times;
                                    </button>

                                    <h3 class="popover-heading">
                                        <span
                                            class={`status-dot is-${provider().status}`}
                                            style="display:inline-block;margin-right:8px;vertical-align:middle"
                                        />{" "}
                                        {provider().prefix}/
                                    </h3>
                                    <p class="popover-sub">
                                        Status:{" "}
                                        <strong style="color:var(--text)">
                                            {provider().status}
                                        </strong>{" "}
                                        &middot;{" "}
                                        {provider().model_count.toLocaleString()}{" "}
                                        {provider().model_count === 1
                                            ? "model"
                                            : "models"}
                                        {isAffected &&
                                            (provider().status === "down"
                                                ? " — affected"
                                                : " — at risk")}
                                    </p>
                                </div>

                                {/* Body — scrolls */}
                                <div
                                    class={`popover-body-frame${scrollRailMetrics().scrollable ? " is-scrollable" : ""}`}
                                    onWheel={handlePopoverBodyWheel}
                                >
                                    <div
                                        class="popover-body"
                                        ref={(el) => {
                                            popoverBodyEl = el;
                                            queueScrollRailUpdate();
                                        }}
                                        onScroll={updateScrollRail}
                                    >
                                        {/* Reliability */}
                                        <dl class="detail-section">
                                            <h4 class="detail-section-title">
                                                Reliability
                                            </h4>
                                            <dt>60m error rate</dt>
                                            <dd
                                                class={
                                                    provider()
                                                        .error_rate_60m === 0
                                                        ? "zero"
                                                        : ""
                                                }
                                            >
                                                {formatPercent(
                                                    provider().error_rate_60m,
                                                )}
                                            </dd>
                                            <dt>30m errors</dt>
                                            <dd>
                                                {provider().errors_30m.toLocaleString()}
                                            </dd>
                                            <dt>60m errors</dt>
                                            <dd>
                                                {provider().errors_60m.toLocaleString()}
                                            </dd>
                                        </dl>

                                        {/* Throughput */}
                                        <dl class="detail-section">
                                            <h4 class="detail-section-title">
                                                Throughput
                                            </h4>
                                            <dt>60m requests</dt>
                                            <dd>
                                                {provider().requests_60m.toLocaleString()}
                                            </dd>
                                            <dt>30m successes</dt>
                                            <dd>
                                                {provider().successes_30m.toLocaleString()}
                                            </dd>
                                            <dt>60m successes</dt>
                                            <dd>
                                                {provider().successes_60m.toLocaleString()}
                                            </dd>
                                        </dl>

                                        {/* Activity */}
                                        <dl class="detail-section">
                                            <h4 class="detail-section-title">
                                                Activity
                                            </h4>
                                            <dt>Last success</dt>
                                            <dd>
                                                {formatTimestamp(
                                                    provider().last_success_at,
                                                )}
                                            </dd>
                                            <dt>Last error</dt>
                                            <dd
                                                class={
                                                    !provider().last_error_at
                                                        ? "zero"
                                                        : ""
                                                }
                                            >
                                                {formatTimestamp(
                                                    provider().last_error_at,
                                                )}
                                            </dd>
                                        </dl>

                                        {/* Catalog link */}
                                        <Show when={provider().model_count > 0}>
                                            <a
                                                class="catalog-link"
                                                href={`/models?prefix=${provider().prefix}`}
                                            >
                                                View all in model catalog
                                                <span class="catalog-link-arrow">
                                                    &rarr;
                                                </span>
                                            </a>
                                        </Show>
                                    </div>

                                    <div
                                        class={`popover-scroll-rail${isScrollThumbDragging() ? " is-dragging" : ""}`}
                                        ref={(el) => {
                                            scrollRailEl = el;
                                            queueScrollRailUpdate();
                                        }}
                                        aria-hidden="true"
                                        onPointerDown={handleScrollRailPointerDown}
                                    >
                                        <div
                                            class={`popover-scroll-thumb${isScrollThumbDragging() ? " is-dragging" : ""}`}
                                            style={{
                                                height: `${scrollRailMetrics().thumbHeight}px`,
                                                transform: `translateY(${scrollRailMetrics().thumbTop}px)`,
                                            }}
                                            onPointerDown={
                                                handleScrollThumbPointerDown
                                            }
                                            onPointerMove={
                                                handleScrollThumbPointerMove
                                            }
                                            onPointerUp={handleScrollThumbPointerEnd}
                                            onPointerCancel={
                                                handleScrollThumbPointerEnd
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }}
            </Show>

            <div class="status-footnote">
                Updated{" "}
                {loadedAt()
                    ? loadedAt()!.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                      })
                    : "..."}
                .
            </div>
        </div>
    );
}

function formatPercent(value: number): string {
    if (!Number.isFinite(value)) return "\u2014";
    return `${Math.round(value * 100)}%`;
}
