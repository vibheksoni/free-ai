# Growth Playbook

This repo already has strong social proof. Current public count at the time of writing: `379` stars and `81` forks.

Use this checklist to improve GitHub discovery, Google SEO, and launch conversion without fake engagement or spam.

## GitHub Repository

- Keep the repo description short and keyword-rich: `Free OpenAI-compatible AI API with 16,000+ models, image generation, tool calling, and Discord key signup.`
- Use focused topics instead of generic tags. Suggested topics: `free-ai-api`, `openai-compatible`, `ai-api`, `llm-api`, `chat-completions`, `image-generation`, `developer-tools`, `astro`, `discord-bot`, `api-gateway`.
- Keep the first README screen conversion-focused: one-line value prop, proof badges, quick start, and copy-paste examples.
- Ship regular release tags so GitHub shows activity and users can subscribe to updates.
- Turn high-signal Discord questions into README/docs updates so the repo becomes the canonical answer.
- Add a screenshot, short GIF, or architecture visual above the fold when a polished asset is ready.

## Releases

GitHub releases are based on tags and provide a public feed users can watch. Create a release for meaningful site/API updates, not every tiny typo.

Recommended cadence:

- `vYYYY.MM.DD` for dated website/API catalog updates.
- One concise release title, for example `v2026.05.08 - Catalog and docs refresh`.
- Notes should include: what changed, user impact, docs links, and exact aliases or endpoints affected.

GitHub CLI example:

```powershell
gh release create v2026.05.08 --title "v2026.05.08 - Catalog and docs refresh" --notes-file RELEASE_NOTES.md
```

If `gh` is unavailable, use GitHub's Releases page and draft a new release from the latest `master` commit.

## Site SEO

- Keep `/docs`, `/models`, `/llms.txt`, `robots.txt`, and the generated sitemap healthy.
- Submit `https://freetheai.xyz/sitemap-index.xml` in Google Search Console.
- Keep page titles and descriptions aligned with real searches: `free OpenAI-compatible API`, `free AI API key`, `free image generation API`, `OpenAI-compatible model catalog`.
- Link internally between the homepage, docs, model catalog, GitHub repo, and Discord.
- Prefer live model catalog links over hardcoded model counts when possible.
- Add long-tail docs when users ask repeated questions, for example `free OpenAI SDK setup`, `free image generation API`, and `Anthropic messages compatible API`.

## Distribution

- Use one strong launch post, then follow-up posts with different angles.
- Good angles for this project: free OpenAI-compatible API, no billing, Discord key signup, image generation, model catalog, and privacy stance.
- Post where developer intent is high: X, Hacker News, Reddit dev communities, GitHub discussions, and AI builder Discords.
- Respond quickly during the first 24 hours after a post or release.
- Convert objections into docs and link back to the exact docs section.

