<div align="center">

# FreeTheAi

**Free OpenAI-compatible API for builders**

Chat · Streaming · Tool Calling · Images · 15k+ Models

<br>

[![API](https://img.shields.io/badge/API-OpenAI%20Compatible-white?style=flat-square)](https://api.freetheai.xyz)
[![Models](https://img.shields.io/badge/Models-15k+-white?style=flat-square)](https://freetheai.xyz/models)
[![RPM](https://img.shields.io/badge/RPM-10--35-white?style=flat-square)](https://discord.gg/secrets)
[![Privacy](https://img.shields.io/badge/Prompts-Not%20Stored-white?style=flat-square)](https://api.freetheai.xyz/v1/health)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/secrets)

<br>

[Website](https://freetheai.xyz) · [API](https://api.freetheai.xyz) · [Models](https://freetheai.xyz/models) · [Discord](https://discord.gg/secrets)

<br>

</div>

---

## Overview

FreeTheAi is a public API gateway for builders who want real model access without a billing page.

- OpenAI-compatible `chat/completions` and `messages` routes
- Image generation and editing via `img/gpt-image-2`
- Streaming, tool calling, structured outputs
- No daily cap, no prompt storage, no paid tiers
- 15k+ models across 10+ provider families

> If your client works with the OpenAI SDK, it works here.

---

## Quick Start

```
Base URL    https://api.freetheai.xyz/v1
Auth        Bearer YOUR_API_KEY
```

<table>
<tr>
<td width="50%">

**1. Join Discord**

Open [discord.gg/secrets](https://discord.gg/secrets)

</td>
<td width="50%">

**2. Get a key**

Run `/signup` in any channel

</td>
</tr>
<tr>
<td>

**3. Set your base URL**

```bash
export FREETHEAI_API_KEY="sk-..."
```

</td>
<td>

**4. Start building**

Point any OpenAI-compatible client at the API

</td>
</tr>
</table>

> [!TIP]
> Lost your key? Run `/resetkey` — same account, fresh key.

---

## API Routes

| Route | Method | Description |
| :--- | :---: | :--- |
| `/v1/models` | `GET` | Live model catalog |
| `/v1/chat/completions` | `POST` | Chat completions (streaming supported) |
| `/v1/messages` | `POST` | Anthropic-style messages |
| `/v1/images/generations` | `POST` | Image generation |
| `/v1/images/edits` | `POST` | Image editing (prompt + base64 input) |
| `/v1/health` | `GET` | Health check |

---

## Code Examples

<details>
<summary><b>Chat completion — curl</b></summary>

<br>

```bash
curl https://api.freetheai.xyz/v1/chat/completions \
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm/glm-5.1",
    "messages": [
      { "role": "user", "content": "Write a Python hello world." }
    ],
    "stream": true
  }'
```

</details>

<details>
<summary><b>Chat completion — JavaScript</b></summary>

<br>

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.FREETHEAI_API_KEY,
  baseURL: "https://api.freetheai.xyz/v1",
});

const completion = await client.chat.completions.create({
  model: "glm/glm-5.1",
  messages: [{ role: "user", content: "Say hello in one sentence." }],
});

console.log(completion.choices[0].message.content);
```

</details>

<details>
<summary><b>Chat completion — Python</b></summary>

<br>

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.freetheai.xyz/v1",
)

completion = client.chat.completions.create(
    model="glm/glm-5.1",
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
)

print(completion.choices[0].message.content)
```

</details>

<details>
<summary><b>Messages API — curl</b></summary>

<br>

```bash
curl https://api.freetheai.xyz/v1/messages \
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "rev/claude-sonnet-4.5",
    "max_tokens": 256,
    "messages": [
      { "role": "user", "content": "Reply with a compact migration plan." }
    ]
  }'
```

</details>

<details>
<summary><b>Tool calling — Python</b></summary>

<br>

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.freetheai.xyz/v1",
)

completion = client.chat.completions.create(
    model="wsf/swe-1.6",
    tool_choice="required",
    messages=[
        {
            "role": "user",
            "content": "Use the get_weather tool for Boston.",
        }
    ],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_weather",
                "description": "Get the weather for a city.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "city": {"type": "string"}
                    },
                    "required": ["city"],
                    "additionalProperties": False,
                },
            },
        }
    ],
)

print(completion.choices[0].message.tool_calls)
```

Expected response shape:

- `choices[0].finish_reason == "tool_calls"`
- `choices[0].message.tool_calls` present

</details>

<details>
<summary><b>Image generation — curl</b></summary>

<br>

```bash
curl https://api.freetheai.xyz/v1/images/generations \
  -H "Authorization: Bearer $FREETHEAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "img/gpt-image-2",
    "prompt": "A neon sports car parked under rainy city lights"
  }'
```

Response contains `data[0].b64_json` with the image.

</details>

<details>
<summary><b>Image editing — Python</b></summary>

<br>

```python
import base64, requests, os

def edit_image(prompt, image_path):
    with open(image_path, "rb") as f:
        data_url = "data:image/png;base64," + \
            base64.b64encode(f.read()).decode()

    return requests.post(
        "https://api.freetheai.xyz/v1/images/edits",
        headers={
            "Authorization": f"Bearer {os.environ['FREETHEAI_API_KEY']}",
            "Content-Type": "application/json",
        },
        json={
            "model": "img/gpt-image-2",
            "prompt": prompt,
            "image": data_url,
        },
    ).json()
```

> See [`examples/image_client.py`](examples/image_client.py) for a full CLI tool.

</details>

---

## Model Families

Models are organized by provider prefix. Use exact alias IDs from `/v1/models` or the [model catalog](https://freetheai.xyz/models).

| Prefix | Provider | Notes |
| :--- | :--- | :--- |
| `bbl/*` | Gateway A | GPT, Claude, Gemini, Grok, DeepSeek |
| `cat/*` | Gateway B | GPT, Claude, Gemini |
| `yng/*` | Gateway C | GPT, Claude, Gemini |
| `wsf/*` | Windsurf | Kimi, SWE |
| `glm/*` | GLM | GLM-4.x, GLM-5.x |
| `opc/*` | OpenCode | Mixed free models |
| `or/*` | OpenRouter | Free-tier open models |
| `kai/*` | Kilo | Free-tier aggregator |
| `fth/*` | Featherless | 15k+ open-weight models |
| `bbg/*` | BBG Premium | Curated premium allowlist |
| `img/*` | Image Gateway | `img/gpt-image-2` |
| `rev/*` | Rev Sidecar | Claude, MiniMax |
| `agr/*` | AgentRouter | Small curated catalog |

<details>
<summary><b>Notable models per family</b></summary>

<br>

**`bbl/*`** — `bbl/gpt-5.4`, `bbl/claude-4.6-sonnet`, `bbl/gemini-3.1-pro`, `bbl/grok-4`, `bbl/deepseek-r1`

**`cat/*`** — `cat/gpt-5.4`, `cat/claude-4-6-sonnet`, `cat/gemini-3-1-pro`, `cat/agent-1`

**`yng/*`** — `yng/gpt-5.4`, `yng/claude-4-6-sonnet`, `yng/gemini-3-1-pro`

**`wsf/*`** — `wsf/kimi-k2.6`, `wsf/swe-1.6`

**`glm/*`** — `glm/glm-5.1`, `glm/glm-5`, `glm/glm-4.7`

**`rev/*`** — `rev/claude-sonnet-4.5`, `rev/claude-haiku-4.5`, `rev/minimax-m2.5`

**`bbg/*`** — `bbg/deepseek-ai/DeepSeek-V4-Pro`, `bbg/moonshotai/Kimi-K2.6`, `bbg/Qwen/Qwen3.6-35B-A3B`

**`img/*`** — `img/gpt-image-2`

**`fth/*`** — 15k+ open-weight models. Use exact alias IDs like `fth/Qwen/Qwen2.5-7B-Instruct`. Full list on the [model catalog](https://freetheai.xyz/models).

</details>

---

## Rate Limits

| Tier | RPM | Concurrency |
| :---: | :---: | :---: |
| 1 | 10 | 1 |
| 2 | 15 | 1 |
| 3 | 20 | 2 |
| 4 | 28 | 2 |
| 5 | 35 | 3 |

Tiers are earned through Discord invite progress. No daily limit.

---

## Privacy

Prompt text and completion text are **not** stored.

| Tracked | Not Tracked |
| :--- | :--- |
| Model alias | Prompt content |
| Token counts | Completion content |
| Request timestamp | Conversation history |
| Request status | User identity beyond key |
| Client IP metadata | |

---

## Discord Commands

| Command | Description |
| :--- | :--- |
| `/signup` | Get your API key |
| `/resetkey` | Rotate to a fresh key |
| `/models` | Browse available models |
| `/stats` | Your usage stats |
| `/tiers` | View rate limit tiers |
| `/tiermodels` | Models per access tier |
| `/leaderboard` | Top users by requests |
| `/modelleaderboard` | Top models by usage |
| `/modelstats` | Stats for a specific model |
| `/generate` | Generate an image from Discord |

---

## Links

<div align="center">

[Website](https://freetheai.xyz) · [API](https://api.freetheai.xyz) · [Models](https://freetheai.xyz/models) · [Discord](https://discord.gg/secrets) · [Backup Invite](https://discord.gg/rG3SYpeqYF)

</div>
