import { createSignal, createEffect, onMount, For, Show } from "solid-js";
import { Button, Skeleton, TextField } from "./ui";

interface Model {
  id: string;
  prefix: string;
}

const LIVE_ENDPOINT = "https://api.freetheai.xyz/v1/models/full";
const LIVE_KEY = "freetheai.xyz";
const DISABLED = new Set(["xai"]);
const PAGE_SIZE = 80;

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
const modelPrefix = (id: string): string => id.includes("/") ? id.slice(0, id.indexOf("/")) : "other";

const readCatalogParams = () => {
  if (typeof window === "undefined") return { prefix: "all", query: "" };
  const params = new URLSearchParams(window.location.search);
  const rawPrefix = params.get("prefix")?.trim() || "all";
  return {
    prefix: rawPrefix === "*" ? "all" : rawPrefix,
    query: params.get("q")?.trim() || "",
  };
};

export default function CatalogBrowser() {
  const initial = readCatalogParams();
  const [allModels, setAllModels] = createSignal<Model[]>([]);
  const [query, setQuery] = createSignal(initial.query);
  const [page, setPage] = createSignal(1);
  const [prefix, setPrefix] = createSignal(initial.prefix);
  const [source, setSource] = createSignal<"live" | "snapshot" | "error">("live");
  const [loadError, setLoadError] = createSignal("");

  const prefixCounts = () => {
    const m = new Map<string, number>();
    for (const { prefix: pfx } of allModels()) m.set(pfx, (m.get(pfx) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };

  const filteredModels = () => {
    let models = allModels();
    if (prefix() !== "all") models = models.filter((m) => m.prefix === prefix());
    const q = query().trim().toLowerCase();
    if (q) models = models.filter((m) => m.id.toLowerCase().includes(q));
    return [...models].sort((a, b) => collator.compare(a.id, b.id));
  };

  const pageCount = () => Math.max(1, Math.ceil(filteredModels().length / PAGE_SIZE));
  const visibleModels = () => {
    const start = (page() - 1) * PAGE_SIZE;
    return filteredModels().slice(start, start + PAGE_SIZE);
  };

  createEffect(() => {
    if (page() > pageCount()) setPage(pageCount());
  });

  createEffect(() => {
    const selected = prefix();
    if (selected === "all") return;
    if (allModels().length === 0) return;
    if (!prefixCounts().some(([pfx]) => pfx === selected)) {
      setPrefix("all");
      setPage(1);
    }
  });

  createEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const selected = prefix();
    const search = query().trim();
    if (selected === "all") params.delete("prefix");
    else params.set("prefix", selected);
    if (search) params.set("q", search);
    else params.delete("q");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", next);
    }
  });

  onMount(async () => {
    try {
      let items: any[];
      let src: "live" | "snapshot" = "live";
      try {
        const res = await fetch(LIVE_ENDPOINT, {
          headers: { Accept: "application/json", Authorization: `Bearer ${LIVE_KEY}` },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const payload = await res.json();
        items = Array.isArray(payload?.data) ? payload.data : [];
      } catch {
        src = "snapshot";
        const res = await fetch("/models.json", {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const payload = await res.json();
        items = Array.isArray(payload?.data) ? payload.data : [];
        console.warn("Falling back to bundled model catalog snapshot.");
      }
      const models: Model[] = items
        .filter((i) => typeof i?.id === "string" && i.id.trim())
        .map((i) => ({
          id: i.id.trim(),
          prefix:
            typeof i?.prefix === "string" && i.prefix.trim()
              ? i.prefix.trim()
              : modelPrefix(i.id.trim()),
        }))
        .filter((m) => !DISABLED.has(m.prefix));
      setAllModels([...models].sort((a, b) => collator.compare(a.id, b.id)));
      setSource(src);
    } catch (err) {
      setSource("error");
      setLoadError(err instanceof Error ? err.message : "Failed to load model catalog.");
    }
  });

  const providerLabel = () => prefix() === "all" ? "all providers" : `${prefix()}/*`;
  const resultLabel = () => {
    if (allModels().length === 0 && source() !== "error") return "Loading model catalog...";
    const count = filteredModels().length;
    const plural = count === 1 ? "model" : "models";
    return `${count.toLocaleString()} ${plural} across ${providerLabel()}`;
  };

  return (
    <div class="panel catalog-panel">
      <div class="catalog-panel-head">
        <div>
          <div class="eyebrow">LIVE INDEX</div>
          <h3>Find the alias your client should send.</h3>
          <p>
            Search exact aliases or filter by provider prefix. Every visible alias can be sent as the
            <code> model</code> value.
          </p>
        </div>
        <div class="catalog-meta" aria-live="polite">
          <span>{source() === "snapshot" ? "Snapshot catalog" : source() === "error" ? "Catalog unavailable" : "Live catalog"}</span>
          <span>{prefixCounts().length.toLocaleString()} providers</span>
          <span>{allModels().length.toLocaleString()} aliases</span>
        </div>
      </div>

      <div class="catalog-toolbar">
        <div class="catalog-search-field">
          <span class="material-symbols-outlined catalog-search-icon">search</span>
          <TextField
            class="catalog-search-input"
            value={query()}
            placeholder="Search model aliases..."
            onChange={(v: string) => { setQuery(v); setPage(1); }}
          />
        </div>
        <div class="catalog-prefixes">
          <button class={`catalog-chip ${prefix() === "all" ? "is-active" : ""}`} onClick={() => { setPrefix("all"); setPage(1); }}>All</button>
          <For each={prefixCounts()}>
            {([pfx, count]) => (
              <button class={`catalog-chip ${prefix() === pfx ? "is-active" : ""}`} onClick={() => { setPrefix(pfx); setPage(1); }}>
                {pfx}/* <span>{count}</span>
              </button>
            )}
          </For>
        </div>
      </div>

      <div class="catalog-summary" aria-live="polite">
        <span>{resultLabel()}</span>
        <Show when={query().trim()}>
          <button type="button" onClick={() => { setQuery(""); setPage(1); }}>
            Clear search
          </button>
        </Show>
      </div>

      <div class={`catalog-results ${visibleModels().length <= 6 ? "is-short" : ""}`}>
        <Show
          when={visibleModels().length > 0}
          fallback={
            <div class="catalog-empty">
              {source() === "error"
                ? loadError()
                : allModels().length === 0
                ? <Skeleton width="200" height="14" />
                : "No models match your search."}
            </div>
          }
        >
          <For each={visibleModels()}>
            {(model, idx) => (
              <article class="model-card">
                <div class="model-card-top">
                  <span class="model-prefix">{model.prefix}/*</span>
                </div>
                <code class="model-id">{model.id}</code>
                <button
                  class="model-copy"
                  title="Copy model alias"
                  aria-label={"Copy " + model.id}
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(model.id).catch(() => {});
                    const btn = e.currentTarget as HTMLElement;
                    const icon = btn.querySelector(".material-symbols-outlined");
                    if (icon) {
                      icon.textContent = "check";
                      setTimeout(() => { icon.textContent = "content_copy"; }, 1500);
                    }
                  }}
                >
                  <span class="material-symbols-outlined">content_copy</span>
                </button>
              </article>
            )}
          </For>
        </Show>
      </div>

      <div class="catalog-pagination">
        <span class="catalog-pagination-count">
          {allModels().length === 0
            ? "Loading..."
            : `${filteredModels().length.toLocaleString()} model${filteredModels().length !== 1 ? "s" : ""}`}
        </span>
        <Button
          variant="ghost"
          class="pagination-button"
          disabled={page() <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span class="catalog-pagination-text">
          {page()} / {pageCount()}
        </span>
        <Button
          variant="ghost"
          class="pagination-button"
          disabled={page() >= pageCount()}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
