import {
    For,
    Show,
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

type ModelEntry = {
    id: string;
    object: string;
    created: number;
    owned_by: string;
};

type ModelCatalog = {
    data: ModelEntry[];
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

const MAX_VISIBLE_MODELS = 15;

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
  display: flex;
  flex-direction: column;
  width: min(520px, calc(100vw - 32px));
  max-height: min(640px, calc(100vh - 64px));
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
  width: 36px;
  height: 5px;
  margin: 10px auto 8px;
  border-radius: 3px;
  background: var(--border-strong);
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
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
.popover-body {
  flex: 1 1 auto;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0;
  padding: 8px 24px 24px;
  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
.popover-body::-webkit-scrollbar { width: 4px; }
.popover-body::-webkit-scrollbar-track { background: transparent; }
.popover-body::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: 2px;
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

/* Models */
.models-section {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--sk-border);
  min-width: 0;
}
.models-title {
  color: var(--dim);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.models-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 16px;
  min-width: 0;
}
.model-chip {
  display: inline-block;
  max-width: 100%;
  padding: 3px 8px;
  border: 1px solid var(--sk-border);
  border-radius: var(--radius-sm);
  background: var(--sk-inset-bg);
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.model-chip-more {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  color: var(--dim);
  font-size: 0.68rem;
  font-weight: 500;
  flex-shrink: 0;
}

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
    padding: 4px 18px calc(20px + env(safe-area-inset-bottom, 0px));
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
body.popover-open {
  overflow: hidden;
  touch-action: none;
}
`;

export default function ProviderStatusGrid() {
    const [health, setHealth] = createSignal<HealthPayload | null>(null);
    const [loadedAt, setLoadedAt] = createSignal<Date | null>(null);
    const [failed, setFailed] = createSignal(false);
    const [selectedPrefix, setSelectedPrefix] = createSignal<string | null>(
        null,
    );
    const [modelsByPrefix, setModelsByPrefix] = createSignal<
        Map<string, string[]>
    >(new Map());
    const [modelsFailed, setModelsFailed] = createSignal(false);
    let interval: number | undefined;

    /* ── Drag-to-dismiss state ── */
    const [dragOffset, setDragOffset] = createSignal(0);
    const [isDragging, setIsDragging] = createSignal(false);
    let dragStartY = 0;
    let sheetStartOffset = 0;
    let sheetEl: HTMLDivElement | undefined;
    const DISMISS_THRESHOLD = 0.3; // 30% of sheet height

    const fetchHealth = async () => {
        try {
            const response = await fetch("/api/health", { cache: "no-store" });
            if (!response.ok) throw new Error(`health ${response.status}`);
            setHealth(await response.json());
            setLoadedAt(new Date());
            setFailed(false);
        } catch (error) {
            console.error("Failed to load provider health", error);
            setFailed(true);
        }
    };

    const fetchModels = async () => {
        try {
            const response = await fetch("/models.json", {
                cache: "force-cache",
            });
            if (!response.ok) throw new Error(`models ${response.status}`);
            const catalog: ModelCatalog = await response.json();
            const map = new Map<string, string[]>();
            for (const entry of catalog.data) {
                const slash = entry.id.indexOf("/");
                if (slash === -1) continue;
                const prefix = entry.id.slice(0, slash);
                const existing = map.get(prefix);
                if (existing) {
                    existing.push(entry.id);
                } else {
                    map.set(prefix, [entry.id]);
                }
            }
            setModelsByPrefix(map);
            setModelsFailed(false);
        } catch (error) {
            console.error("Failed to load model catalog", error);
            setModelsFailed(true);
        }
    };

    onMount(() => {
        fetchHealth();
        fetchModels();
        interval = window.setInterval(fetchHealth, 30000);
    });

    onCleanup(() => {
        if (interval) window.clearInterval(interval);
    });

    /* ── Body scroll lock ── */
    const openPopover = (prefix: string) => {
        setSelectedPrefix(prefix);
        setDragOffset(0);
        if (typeof document !== "undefined") {
            document.body.classList.add("popover-open");
        }
    };

    const closePopover = () => {
        setSelectedPrefix(null);
        setDragOffset(0);
        setIsDragging(false);
        if (typeof document !== "undefined") {
            document.body.classList.remove("popover-open");
        }
    };

    onCleanup(() => {
        if (typeof document !== "undefined") {
            document.body.classList.remove("popover-open");
        }
    });

    /* ── Drag-to-dismiss ── */
    const handleDragStart = (e: PointerEvent) => {
        if (!isMobile()) return;
        e.preventDefault();
        dragStartY = e.clientY;
        sheetStartOffset = dragOffset();
        setIsDragging(true);
        if (sheetEl) sheetEl.setPointerCapture(e.pointerId);
    };

    const handleDragMove = (e: PointerEvent) => {
        if (!isDragging()) return;
        const delta = e.clientY - dragStartY;
        // Only allow downward drag, with slight resistance on upward
        const newOffset = delta > 0 ? delta : delta * 0.3;
        setDragOffset(Math.max(0, sheetStartOffset + newOffset));
    };

    const handleDragEnd = (e: PointerEvent) => {
        if (!isDragging()) return;
        setIsDragging(false);
        if (sheetEl) sheetEl.releasePointerCapture(e.pointerId);

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

    const getProviderModels = (prefix: string): string[] =>
        modelsByPrefix().get(prefix) ?? [];

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
            const onResize = () => setIsMobile(window.innerWidth <= 640);
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
                    const providerModels = createMemo(() =>
                        getProviderModels(provider().prefix),
                    );
                    const visibleModels = createMemo(() =>
                        providerModels().slice(0, MAX_VISIBLE_MODELS),
                    );
                    const hiddenCount = createMemo(() =>
                        Math.max(
                            0,
                            providerModels().length - MAX_VISIBLE_MODELS,
                        ),
                    );
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
                                        onPointerMove={handleDragMove}
                                        onPointerUp={handleDragEnd}
                                        onPointerCancel={handleDragEnd}
                                    />
                                </Show>

                                {/* Header — fixed, also draggable on mobile */}
                                <div
                                    class={`popover-header${isMobile() ? " has-handle" : ""}`}
                                    onPointerDown={
                                        isMobile() ? handleDragStart : undefined
                                    }
                                    onPointerMove={
                                        isMobile() ? handleDragMove : undefined
                                    }
                                    onPointerUp={
                                        isMobile() ? handleDragEnd : undefined
                                    }
                                    onPointerCancel={
                                        isMobile() ? handleDragEnd : undefined
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
                                <div class="popover-body">
                                    {/* Reliability */}
                                    <dl class="detail-section">
                                        <h4 class="detail-section-title">
                                            Reliability
                                        </h4>
                                        <dt>60m error rate</dt>
                                        <dd
                                            class={
                                                provider().error_rate_60m === 0
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

                                    {/* Model chips */}
                                    <Show when={providerModels().length > 0}>
                                        <div class="models-section">
                                            <h4 class="models-title">
                                                Models under {provider().prefix}
                                                /
                                                {isAffected
                                                    ? provider().status ===
                                                      "down"
                                                        ? " — likely affected"
                                                        : " — may be affected"
                                                    : ""}
                                            </h4>
                                            <div class="models-chips">
                                                <For each={visibleModels()}>
                                                    {(modelId) => (
                                                        <span
                                                            class="model-chip"
                                                            title={modelId}
                                                        >
                                                            {modelId}
                                                        </span>
                                                    )}
                                                </For>
                                                <Show when={hiddenCount() > 0}>
                                                    <span class="model-chip-more">
                                                        +
                                                        {hiddenCount().toLocaleString()}{" "}
                                                        more
                                                    </span>
                                                </Show>
                                            </div>
                                        </div>
                                    </Show>

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
