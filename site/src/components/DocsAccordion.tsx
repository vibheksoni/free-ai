import Accordion, { type AccordionItem } from "./ui/Accordion";
import { For } from "solid-js";

interface DocsAccordionProps {
  baseSnippet: string;
  chatCurlSnippet: string;
  openAISDKSnippet: string;
  messagesSnippet: string;
  modelListSnippet: string;
  fullModelListSnippet: string;
  vhrImageSnippet: string;
  imageEditSnippet: string;
  pythonImageSnippet: string;
  endpoints: [string, string, string][];
  imageModels: [string, string, string][];
}

function CodeBlock(props: { code: string }) {
  return (
    <div class="docs-code-group">
      <pre><code>{props.code}</code></pre>
      <button class="copy-btn" type="button" title="Copy" aria-label="Copy to clipboard">
        <span class="material-symbols-outlined">content_copy</span>
      </button>
    </div>
  );
}

export default function DocsAccordion(props: DocsAccordionProps) {
  const items: AccordionItem[] = [
    {
      value: "auth",
      label: "Get a key",
      eyebrow: "Auth",
      children: (
        <section class="docs-card">
          <p>
            Join Discord and run <code>/signup</code>. Send the key as a bearer token.
            If you lose it, run <code>/resetkey</code>.
          </p>
          <CodeBlock code={props.baseSnippet} />
        </section>
      ),
    },
    {
      value: "endpoints",
      label: "Supported routes",
      eyebrow: "Endpoints",
      children: (
        <section class="docs-card">
          <div class="docs-table">
            <For each={props.endpoints}>
              {([method, route, desc]) => (
                <div class="docs-row">
                  <code>{method}</code>
                  <code>{route}</code>
                  <span>{desc}</span>
                </div>
              )}
            </For>
          </div>
        </section>
      ),
    },
    {
      value: "chat",
      label: "OpenAI-compatible chat",
      eyebrow: "Chat Completions",
      children: (
        <section class="docs-card">
          <p>
            Point OpenAI-compatible clients at <code>https://api.freetheai.xyz/v1</code>.
            Use exact model aliases from <a href="/models">/models</a>.
          </p>
          <div class="docs-code-grid">
            <div>
              <h3>curl</h3>
              <CodeBlock code={props.chatCurlSnippet} />
            </div>
            <div>
              <h3>JavaScript SDK</h3>
              <CodeBlock code={props.openAISDKSnippet} />
            </div>
          </div>
        </section>
      ),
    },
    {
      value: "messages",
      label: "Anthropic-style clients",
      eyebrow: "Messages API",
      children: (
        <section class="docs-card">
          <p>
            Use <code>/v1/messages</code> for clients that expect Anthropic-style request bodies.
          </p>
          <CodeBlock code={props.messagesSnippet} />
        </section>
      ),
    },
    {
      value: "models",
      label: "List models",
      eyebrow: "Model Catalog",
      children: (
        <section class="docs-card">
          <p>
            Use <code>/v1/models</code> for normal clients. Use <code>/v1/models/full</code>
            when you need tier and catalog metadata for a UI.
          </p>
          <div class="docs-code-grid">
            <div>
              <h3>Client catalog</h3>
              <CodeBlock code={props.modelListSnippet} />
            </div>
            <div>
              <h3>Full catalog</h3>
              <CodeBlock code={props.fullModelListSnippet} />
            </div>
          </div>
        </section>
      ),
    },
    {
      value: "images",
      label: "Generate and edit images",
      eyebrow: "Images",
      children: (
        <section class="docs-card">
          <p>
            Use <code>/v1/images/generations</code> for text-to-image. Use
            <code>/v1/images/edits</code> only with <code>img/gpt-image-2</code>.
            Generation responses may contain either <code>b64_json</code> or <code>url</code>,
            so robust clients should support both.
          </p>
          <div class="docs-table">
            <For each={props.imageModels}>
              {([model, support, desc]) => (
                <div class="docs-row">
                  <code>{model}</code>
                  <span>{support}</span>
                  <span>{desc}</span>
                </div>
              )}
            </For>
          </div>
          <div class="docs-code-grid">
            <div>
              <h3>Image generation</h3>
              <CodeBlock code={props.vhrImageSnippet} />
            </div>
            <div>
              <h3>Image edit</h3>
              <CodeBlock code={props.imageEditSnippet} />
            </div>
          </div>
          <h3>Python save helper</h3>
          <CodeBlock code={props.pythonImageSnippet} />
        </section>
      ),
    },
    {
      value: "errors",
      label: "Common responses",
      eyebrow: "Errors",
      children: (
        <section class="docs-card">
          <div class="docs-table compact">
            <div class="docs-row"><code>400</code><span>Invalid request body, missing prompt, unknown model, or unsupported media operation.</span></div>
            <div class="docs-row"><code>401</code><span>Missing or invalid API key. Run <code>/signup</code> or <code>/resetkey</code>.</span></div>
            <div class="docs-row"><code>403</code><span>The model is unknown, disabled, or unavailable in the current catalog.</span></div>
            <div class="docs-row"><code>429</code><span>Rate limit or concurrency limit reached. Wait and retry.</span></div>
            <div class="docs-row"><code>5xx</code><span>Provider or gateway failure. Retry once before reporting it in Discord.</span></div>
          </div>
        </section>
      ),
    },
  ];

  return <Accordion items={items} />;
}
