import { createSignal, onMount, onCleanup } from "solid-js";

export default function LiveStats() {
  const [health, setHealth] = createSignal<{
    catalog: { model_count: number };
    total_tokens_served: { total: number; successful_requests: number };
  } | null>(null);

  let interval: number;

  const fetchHealth = async () => {
    try {
      const r = await fetch("https://api.freetheai.xyz/v1/health");
      if (r.ok) setHealth(await r.json());
    } catch {}
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

  const h = health();

  return (
    <div style={{ display: "flex", gap: "clamp(16px,4vw,40px)", "flex-wrap": "wrap", "justify-content": "center" }}>
      <div style={{"text-align": "center"}}>
        <div style={{ "font-size": "clamp(1.5rem,2.5vw,2rem)", "font-weight": "600", "font-family": "var(--font-serif)", "line-height": "1", color: "var(--text)" }}>
          {h ? h.catalog.model_count.toLocaleString() : "..."}
        </div>
        <div style={{ "font-size": "0.78rem", color: "var(--muted)", "margin-top": "4px" }}>models</div>
      </div>
      <div style={{"text-align": "center"}}>
        <div style={{ "font-size": "clamp(1.5rem,2.5vw,2rem)", "font-weight": "600", "font-family": "var(--font-serif)", "line-height": "1", color: "var(--text)" }}>
          {h ? fmt(h.total_tokens_served.total) : "..."}
        </div>
        <div style={{ "font-size": "0.78rem", color: "var(--muted)", "margin-top": "4px" }}>tokens served</div>
      </div>
      <div style={{"text-align": "center"}}>
        <div style={{ "font-size": "clamp(1.5rem,2.5vw,2rem)", "font-weight": "600", "font-family": "var(--font-serif)", "line-height": "1", color: "var(--text)" }}>
          {h ? h.total_tokens_served.successful_requests.toLocaleString() : "..."}
        </div>
        <div style={{ "font-size": "0.78rem", color: "var(--muted)", "margin-top": "4px" }}>requests</div>
      </div>
    </div>
  );
}
