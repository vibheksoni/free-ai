import { createSignal, onMount, onCleanup } from "solid-js";

export default function LiveStats(props: {
  discordOnline: number;
  modelCount: number;
  tokensServed: number;
  requestsServed: number;
}) {
  const [health, setHealth] = createSignal<{
    catalog: { model_count: number };
    total_tokens_served: { total: number; successful_requests: number };
  } | null>(null);
  let interval: number;

  onMount(() => {
    const fetchHealth = async () => {
      try {
        const r = await fetch("https://api.freetheai.xyz/v1/health");
        if (r.ok) setHealth(await r.json());
      } catch {}
    };
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

  const mc = health() ? health()!.catalog.model_count : props.modelCount;
  const ts = health() ? health()!.total_tokens_served.total : props.tokensServed;
  const rs = health() ? health()!.total_tokens_served.successful_requests : props.requestsServed;

  const stats = [
    { value: props.discordOnline > 0 ? props.discordOnline.toLocaleString() : "—", label: "online now" },
    { value: mc > 0 ? mc.toLocaleString() : "—", label: "models" },
    { value: ts > 0 ? fmt(ts) : "—", label: "tokens served" },
    { value: rs > 0 ? rs.toLocaleString() : "—", label: "requests" },
  ];

  return (
    <div style={{ display: "flex", gap: "clamp(16px,4vw,40px)", "flex-wrap": "wrap", "justify-content": "center" }}>
      {stats.map(s => (
        <div style={{"text-align": "center"}}>
          <div style={{ "font-size": "clamp(1.5rem,2.5vw,2rem)", "font-weight": "600", "font-family": "var(--font-serif)", "line-height": "1", color: "var(--text)" }}>
            {s.value}
          </div>
          <div style={{ "font-size": "0.78rem", color: "var(--muted)", "margin-top": "4px" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}
