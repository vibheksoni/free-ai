import { createMemo, createSignal, onCleanup, onMount } from "solid-js";

type ClientUsage = {
  client_name: string;
  rank: number;
  total_requests: number;
  unique_users: number;
};

export default function LiveStats() {
  const [health, setHealth] = createSignal<{
    catalog: { model_count: number };
    clients?: ClientUsage[];
    total_tokens_served: { total: number; successful_requests: number };
  } | null>(null);

  let interval: number;

  const fetchHealth = async () => {
    try {
      const r = await fetch("https://api.freetheai.xyz/v1/health");
      if (r.ok) setHealth(await r.json());
    } catch (error) {
      console.error("Failed to load live stats", error);
    }
  };

  onMount(() => {
    fetchHealth();
    interval = setInterval(fetchHealth, 30000);
  });

  onCleanup(() => clearInterval(interval));

  const fmt = (n: number): string => {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
    return n.toLocaleString();
  };

  const stats = createMemo(() => {
    const h = health();
    if (!h) return null;

    return {
      clients: (h.clients ?? []).slice(0, 4),
      models: h.catalog?.model_count ?? 0,
      requests: h.total_tokens_served?.successful_requests ?? 0,
      tokens: h.total_tokens_served?.total ?? 0,
    };
  });

  return (
    <div class="home-live-stats">
      <div class="home-live-metrics">
        <div class="shell" style={{"text-align": "center", padding: "12px 20px"}}>
          <div style={{ "font-size": "clamp(1.5rem,2.5vw,2rem)", "font-weight": "600", "font-family": "var(--font-serif)", "line-height": "1", color: "var(--text)" }}>
            {stats() ? stats()!.models.toLocaleString() : "..."}
          </div>
          <div style={{ "font-size": "0.78rem", color: "var(--muted)", "margin-top": "4px" }}>models</div>
        </div>
        <div class="shell" style={{"text-align": "center", padding: "12px 20px"}}>
          <div style={{ "font-size": "clamp(1.5rem,2.5vw,2rem)", "font-weight": "600", "font-family": "var(--font-serif)", "line-height": "1", color: "var(--text)" }}>
            {stats() ? fmt(stats()!.tokens) : "..."}
          </div>
          <div style={{ "font-size": "0.78rem", color: "var(--muted)", "margin-top": "4px" }}>tokens served</div>
        </div>
        <div class="shell" style={{"text-align": "center", padding: "12px 20px"}}>
          <div style={{ "font-size": "clamp(1.5rem,2.5vw,2rem)", "font-weight": "600", "font-family": "var(--font-serif)", "line-height": "1", color: "var(--text)" }}>
            {stats() ? stats()!.requests.toLocaleString() : "..."}
          </div>
          <div style={{ "font-size": "0.78rem", color: "var(--muted)", "margin-top": "4px" }}>requests</div>
        </div>
      </div>
      {stats() && (
        <div class="home-client-strip" aria-label="Top API clients">
          {stats()!.clients.length > 0 ? (
            stats()!.clients.map((client) => (
              <div class="home-client-chip">
                <span>{client.client_name}</span>
                <strong>{fmt(client.total_requests)}</strong>
              </div>
            ))
          ) : (
            <div class="home-client-chip">
              <span>client mix</span>
              <strong>live soon</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
