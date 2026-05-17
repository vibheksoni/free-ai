import { createSignal, For, onMount } from "solid-js";
import { Skeleton } from "./ui";

const API = "https://api.freetheai.xyz/v1";

function compactNum(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return new Intl.NumberFormat(void 0, {
    compactDisplay: "short", maximumFractionDigits: n >= 1e6 ? 1 : 0, notation: "compact",
  }).format(n);
}

function fullNum(n: number): string {
  return Number.isFinite(n) ? new Intl.NumberFormat().format(n) : "0";
}

type Tokens = { total: number; input: number; output: number } | false | null;
type LB = { rank: number; alias_model: string; total_requests: number }[] | false | null;

export default function LiveStats() {
  const [tokens, setTokens] = createSignal<Tokens>(null);
  const [lb, setLb] = createSignal<LB>(null);

  onMount(async () => {
    try {
      const r = await fetch(`${API}/health`, { headers: { Accept: "application/json" } });
      if (r.ok) {
        const d = await r.json();
        const v = d?.total_tokens_served ?? d?.total_tokens_serverd ?? {};
        setTokens({ total: +v.total || 0, input: +v.input || 0, output: +v.output || 0 });
      } else setTokens(false);
    } catch (error) {
      console.warn("Failed to load live token totals", error);
      setTokens(false);
    }

    try {
      const r = await fetch(`${API}/models/leaderboard?limit=6`, {
        headers: { Accept: "application/json", Authorization: "Bearer freetheai.xyz" },
      });
      r.ok ? setLb(((await r.json()).data ?? []) as any) : setLb(false);
    } catch (error) {
      console.warn("Failed to load live model leaderboard", error);
      setLb(false);
    }
  });

  const t = () => tokens();
  const l = () => lb();
  const td = () => (t() && t() !== false ? t() as Exclude<Tokens, false | null> : null);
  const te = () => t() === false;
  const tl = () => t() === null;
  const le = () => l() === false;
  const ll = () => l() === null;
  const lr = () => (l() && l() !== false ? l() as Exclude<LB, false | null> : []);

  return (
    <>
      <section class="proof-grid" aria-label="FreeTheAi usage proof">
        <article class="proof-card"><strong>2k</strong><span>members</span><p>Active builder community on Discord.</p></article>
        <article class="proof-card">
          <strong>{te() ? "live" : tl() ? "live" : compactNum(td()!.total)}</strong>
          <span>tokens served</span>
          <p>Successful input and output tokens processed.</p>
        </article>
        <article class="proof-card"><strong>$0</strong><span>free tier</span><p>No card required. Paid slots are optional.</p></article>
        <article class="proof-card"><strong>16k+</strong><span>models</span><p>Chat, images, tools — one key.</p></article>
      </section>
      <section class="section live-usage-section" aria-label="Live FreeTheAi usage">
        <div class="section-head">
          <div class="eyebrow">LIVE USAGE</div>
          <h2>What people are using now.</h2>
          <p>Live aggregate usage and top model aliases, pulled from the API without exposing prompts or completions.</p>
        </div>
        <div class="live-usage-grid">
          <article class="panel live-token-panel">
            <div class="panel-kicker">Total tokens served</div>
            <strong>{te() ? "Unavailable" : tl() ? <Skeleton width="180" height="22" /> : fullNum(td()!.total)}</strong>
            <p>
              {te() ? <><span>input: unavailable</span><span>output: unavailable</span></>
               : tl() ? <><Skeleton width="120" height="12" /><Skeleton width="120" height="12" /></>
               : <><span>input: {fullNum(td()!.input)}</span><span>output: {fullNum(td()!.output)}</span></>}
            </p>
          </article>
          <article class="panel model-leaderboard-panel">
            <div class="panel-kicker">Top models</div>
            <div class="model-leaderboard-list">
              {le() ? <div class="leaderboard-placeholder">Could not load the live leaderboard.</div>
                : tl() ? <div class="leaderboard-placeholder"><Skeleton width="200" height="14" /></div>
                : lr().length === 0 ? <div class="leaderboard-placeholder">No successful model usage yet.</div>
               : <For each={lr()}>{(e) => (
                   <div class="model-leaderboard-row">
                     <span>#{e.rank}</span><code>{e.alias_model}</code><strong>{fullNum(e.total_requests)}</strong>
                   </div>
                 )}</For>}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
