/**
 * Shiki-based syntax highlighting utility.
 * Uses the codeToHtml convenience API from Shiki v3.
 * Called at build time in Astro frontmatter — no client-side JS overhead.
 */
import { codeToHtml } from "shiki";

type HighlightLang =
	| "bash"
	| "javascript"
	| "typescript"
	| "python"
	| "json"
	| "plaintext"
	| "curl"
	| "shell";

/** Map of our shorthand lang identifiers to Shiki's grammar names. */
const LANG_MAP: Record<HighlightLang, string> = {
	bash: "bash",
	javascript: "javascript",
	typescript: "typescript",
	python: "python",
	json: "json",
	plaintext: "text",
	curl: "bash",
	shell: "bash",
};

/**
 * Highlight a code string and return HTML with inline styles.
 * Uses the dark-plus theme, matching the site's dark aesthetic.
 */
export async function highlight(
	code: string,
	lang: HighlightLang,
): Promise<string> {
	const grammar = LANG_MAP[lang] ?? "text";
	return codeToHtml(code, {
		lang: grammar,
		theme: "dark-plus",
	});
}
