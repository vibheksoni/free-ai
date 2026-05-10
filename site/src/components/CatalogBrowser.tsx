import { createSignal, createEffect, onMount, For, Show } from "solid-js";
import { Button, Checkbox, Combobox, NumberField, RadioGroup, Select, Skeleton } from "./ui";
import type { RadioOption, SelectOption } from "./ui";

interface Model {
  id: string;
  prefix: string;
}

const LIVE_ENDPOINT = "https://api.freetheai.xyz/v1/models/full";
const LIVE_KEY = "freetheai.xyz";
const DISABLED = new Set(["xai"]);
const IMAGE_PREFIXES = new Set(["img", "vhr"]);
const PINNED = [
  "img/gpt-image-2", "vhr/bytedance_seedream_v4", "vhr/flux_dev",
  "vhr/gpt_image_2", "vhr/nano_banana_2", "yng/agent-1",
  "yng/claude-4-5-sonnet", "yng/claude-4-6-sonnet", "yng/gemini-3-1-pro",
  "yng/gemini-3-flash", "yng/gpt-5", "yng/gpt-5.1",
  "yng/gpt-5.2", "yng/gpt-5.4",
];

const PAGE_OPTIONS: SelectOption[] = [
  { value: "40", label: "40" }, { value: "80", label: "80" }, { value: "120", label: "120" },
];
const SORT_OPTIONS: RadioOption[] = [
  { value: "alias-asc", label: "Alias A-Z" },
  { value: "alias-desc", label: "Alias Z-A" },
  { value: "prefix", label: "Prefix then alias" },
];

const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
const modelPrefix = (id: string): string => id.includes("/") ? id.slice(0, id.indexOf("/")) : "other";

export default function CatalogBrowser() {
  const [allModels, setAllModels] = createSignal<Model[]>([]);
  const [query, setQuery] = createSignal("");
  const [prefix, setPrefix] = createSignal("all");
  const [sort, setSort] = createSignal("alias-asc");
  const [pageSize, setPageSize] = createSignal(80);
  const [page, setPage] = createSignal(1);
  const [source, setSource] = createSignal("loading...");
  const [imageOnly, setImageOnly] = createSignal(false);

  const prefixCounts = () => {
    const m = new Map<string, number>();
    for (const { prefix: pfx } of allModels()) {
      m.set(pfx, (m.get(pfx) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return collator.compare(a[0], b[0]);
    });
  };

  const imageModelCount = () =>
    allModels().filter((m) => IMAGE_PREFIXES.has(m.prefix)).length;

  const filteredModels = () => {
    let models = allModels();
    if (prefix() !== "all") models = models.filter((m) => m.prefix === prefix());
    if (imageOnly()) models = models.filter((m) => IMAGE_PREFIXES.has(m.prefix));
    const q = query().trim().toLowerCase();
    if (q) models = models.filter((m) => m.id.toLowerCase().includes(q));
    switch (sort()) {
      case "alias-desc":
        return [...models].sort((a, b) => collator.compare(b.id, a.id));
      case "prefix":
        return [...models].sort((a, b) => {
          const c = collator.compare(a.prefix, b.prefix);
          return c !== 0 ? c : collator.compare(a.id, b.id);
        });
      default:
        return [...models].sort((a, b) => collator.compare(a.id, b.id));
    }
  };

  const pageCount = () => Math.max(1, Math.ceil(filteredModels().length / pageSize()));
  const prefixTotal = () => prefixCounts().length;
  const visibleModels = () => {
    const start = (page() - 1) * pageSize();
    return filteredModels().slice(start, start + pageSize());
  };
  const isImageModel = (model: Model) => IMAGE_PREFIXES.has(model.prefix);

  createEffect(() => {
    if (page() > pageCount()) setPage(pageCount());
  });

  /* Fetch on mount */
  onMount(async () => {
    try {
      let items: any[],
        src = "live";
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
      const seen = new Set(
        items.map((i) => String(i?.id ?? "").trim()).filter(Boolean),
      );
      const merged = [
        ...items,
        ...PINNED.filter((id) => !seen.has(id)).map((id) => ({ id })),
      ];
      const models: Model[] = merged
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
      setSource(src === "live" ? "/v1/models/full" : "/models.json fallback");
    } catch {
      setSource("unavailable");
    }
  });

  return (
    <div class="panel catalog-panel">
      <div class="catalog-panel-head">
        <div>
          <div class="eyebrow">LIVE INDEX</div>
          <h3>Find the alias your client should send.</h3>
        </div>
        <span class="catalog-source-pill">{source()}</span>
      </div>

      <div class="catalog-stat-strip" aria-label="Catalog summary">
        <div class="catalog-stat">
          <span>Total</span>
          <strong>{allModels().length ? allModels().length.toLocaleString() : "..."}</strong>
        </div>
        <div class="catalog-stat">
          <span>Image</span>
          <strong>{allModels().length ? imageModelCount().toLocaleString() : "..."}</strong>
        </div>
        <div class="catalog-stat">
          <span>Prefixes</span>
          <strong>{allModels().length ? prefixTotal().toLocaleString() : "..."}</strong>
        </div>
        <div class="catalog-stat">
          <span>Matching</span>
          <strong>{allModels().length ? filteredModels().length.toLocaleString() : "..."}</strong>
        </div>
      </div>

      <div class="catalog-toolbar">
        <div class="catalog-search">
          <Combobox
            options={allModels().map((m) => m.id)}
            value={query()}
            placeholder="Search alias ids like fth/, yng/, cat/, sonnet, kimi, gemma..."
            onChange={(v: string) => { setQuery(v); setPage(1); }}
            onInputChange={(v: string) => { setQuery(v); setPage(1); }}
          />
        </div>
        <label class="catalog-page-size">
          <span>Per page</span>
          <Select
            value={String(pageSize())}
            onChange={(v: string) => setPageSize(Number(v) || 80)}
            options={PAGE_OPTIONS}
          />
        </label>
        <label class="catalog-sort">
          <RadioGroup
            label="Sort"
            value={sort()}
            onChange={(v: string) => { setSort(v); setPage(1); }}
            options={SORT_OPTIONS}
          />
        </label>
      </div>

      <div class="catalog-filters">
        <Checkbox
          checked={imageOnly()}
          onChange={setImageOnly}
          label={`Image models only (${imageModelCount()})`}
        />
      </div>

      <div class="catalog-prefixes">
        <Button
          variant="ghost"
          size="sm"
          class={`catalog-chip ${prefix() === "all" ? "is-active" : ""}`}
          onClick={() => { setPrefix("all"); setPage(1); }}
        >
          All <span>{allModels().length}</span>
        </Button>
        <For each={prefixCounts()}>
          {([pfx, count]) => (
            <Button
              variant="ghost"
              size="sm"
              class={`catalog-chip ${prefix() === pfx ? "is-active" : ""}`}
              onClick={() => { setPrefix(pfx); setPage(1); }}
            >
              {pfx}/* <span>{count}</span>
            </Button>
          )}
        </For>
      </div>

      <div class="catalog-meta">
        <div class="catalog-status">
          {allModels().length === 0
            ? <Skeleton width="240" height="14"><span class="catalog-status-text">Loading models...</span></Skeleton>
            : `${filteredModels().length.toLocaleString()} matching models`}
        </div>
        <div class="catalog-page-label">
          {prefix() === "all"
            ? "Showing all prefixes"
            : `Filtering ${prefix()}/*`}
        </div>
      </div>

      <div class="catalog-results">
        <Show
          when={visibleModels().length > 0}
          fallback={
            <div class="catalog-empty">
              {allModels().length === 0
                ? source() === "unavailable"
                  ? "Could not load the live catalog or fallback snapshot for this page."
                   : <><Skeleton width="200" height="14" /><span class="catalog-status-text">Loading models...</span></>
                : "No models match your current search."}
            </div>
          }
        >
          <For each={visibleModels()}>
            {(model, idx) => (
              <article class={`model-card ${isImageModel(model) ? "is-image" : ""}`}>
                <div class="model-card-top">
                  <span class="model-prefix">{model.prefix}/*</span>
                  <span class="model-kind">{isImageModel(model) ? "Image" : "Text"}</span>
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
                <span class="model-index">
                  #{(idx() + 1 + (page() - 1) * pageSize()).toLocaleString()}
                </span>
              </article>
            )}
          </For>
        </Show>
      </div>

      <div class="catalog-pagination">
        <Button
          variant="ghost"
          class="pagination-button"
          disabled={page() <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <div class="catalog-pagination-text">
          Page {page()} of {pageCount()}
        </div>
        <Button
          variant="ghost"
          class="pagination-button"
          disabled={page() >= pageCount()}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
        <span class="catalog-jump">
          Go to
          <NumberField
            aria-label="Jump to page"
            value={page()}
            minValue={1}
            maxValue={pageCount()}
            onChange={(v: number | null) => {
              if (v !== null) setPage(Math.max(1, Math.min(Math.floor(v), pageCount())));
            }}
          />
        </span>
      </div>
    </div>
  );
}
