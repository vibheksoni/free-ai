import { For, Show, createMemo, createSignal, onCleanup, onMount } from "solid-js";
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

const providerOrder = ["fth", "rev", "bbg", "glm", "opc", "cat", "yng", "bbl", "cwy", "woo", "img", "kai", "or", "vhr", "wsf"];

export default function ProviderStatusGrid() {
  const [health, setHealth] = createSignal<HealthPayload | null>(null);
  const [loadedAt, setLoadedAt] = createSignal<Date | null>(null);
  const [failed, setFailed] = createSignal(false);
  let interval: number | undefined;

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

  const providers = createMemo(() => {
    const items = [...(health()?.providers ?? [])];
    return items.sort((left, right) => {
      const leftIndex = providerOrder.indexOf(left.prefix);
      const rightIndex = providerOrder.indexOf(right.prefix);
      if (leftIndex !== -1 || rightIndex !== -1) {
        return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
      }
      return left.prefix.localeCompare(right.prefix);
    });
  });

  const summary = createMemo(() => {
    const items = providers();
    return {
      degraded: items.filter((item) => item.status === "degraded").length,
      down: items.filter((item) => item.status === "down").length,
      total: items.length,
      up: items.filter((item) => item.status === "up").length,
    };
  });

  return (
    <div class="status-board">
      <div class="status-board-head">
        <div>
          <h1>Status</h1>
        </div>
        <div class="status-summary" aria-label="Provider health summary">
          <span>{summary().up} up</span>
          <span>{summary().degraded} degraded</span>
          <span>{summary().down} down</span>
        </div>
      </div>

      <Show when={failed()}>
        <div class="status-alert">Health data did not load. Retrying automatically.</div>
      </Show>

      <Show
        when={providers().length > 0}
        fallback={
          <div class="status-grid">
            <article class="status-card is-unknown" aria-live="polite">
              <div class="status-card-top">
                <span class="status-dot" />
                <strong>providers/</strong>
                <span>loading</span>
              </div>
              <div class="status-card-main">
                <span>...</span>
                <small>models</small>
              </div>
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
            {(provider) => (
              <article class={`status-card is-${provider.status}`}>
                <div class="status-card-top">
                  <span class="status-dot" />
                  <strong>{provider.prefix}/</strong>
                  <span>{provider.status}</span>
                </div>
                <div class="status-card-main">
                  <span>{provider.model_count.toLocaleString()}</span>
                  <small>models</small>
                </div>
                <div class="status-card-meta">
                  <span>30m errors</span>
                  <strong>{formatPercent(provider.error_rate_30m)}</strong>
                  <span>requests</span>
                  <strong>{provider.requests_30m.toLocaleString()}</strong>
                </div>
              </article>
            )}
          </For>
        </div>
      </Show>

      <div class="status-footnote">
        Updated {loadedAt() ? loadedAt()!.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "..."}.
      </div>
    </div>
  );
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0%";
  return `${Math.round(value * 100)}%`;
}
