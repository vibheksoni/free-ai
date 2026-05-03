<div align="center">

# FreeTheAi

**Free OpenAI-compatible API — 16,000+ models, zero billing**

Chat · Streaming · Tool Calling · Image Generation · Image Editing

<br>

[![Models](https://img.shields.io/badge/models-16%2C248-white?style=flat-square)](https://freetheai.xyz/models)
[![API](https://img.shields.io/badge/OpenAI-compatible-white?style=flat-square)](https://api.freetheai.xyz)
[![Cost](https://img.shields.io/badge/cost-%240-white?style=flat-square)](https://freetheai.xyz)
[![Prompts](https://img.shields.io/badge/prompts-not%20stored-white?style=flat-square)](https://freetheai.xyz)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?style=flat-square&logo=discord&logoColor=white)](https://discord.gg/secrets)

<br>

[Website](https://freetheai.xyz) · [Model Catalog](https://freetheai.xyz/models) · [API Health](https://api.freetheai.xyz/v1/health) · [Discord](https://discord.gg/secrets)

</div>

---

## Overview

Free API gateway with 16,000+ models behind a single key. OpenAI-compatible — if your SDK works with OpenAI, it works here.

- `POST /v1/chat/completions` — chat with streaming
- `POST /v1/messages` — Anthropic-style messages route
- `POST /v1/images/generations` — image generation
- `POST /v1/images/edits` — image editing with prompt + base64 input
- Tool calling, structured outputs, multi-turn conversations
- No billing, no daily cap, no prompt storage

---

## Quick Start

```
Base URL    https://api.freetheai.xyz/v1
Auth        Bearer YOUR_API_KEY
```

<table>
<tr>
<td width="50%">

**1 — Join Discord**

Open [discord.gg/secrets](https://discord.gg/secrets)

</td>
<td width="50%">

**2 — Get a key**

Run `/signup` in any channel

</td>
</tr>
<tr>
<td>

**3 — Set your environment**

```bash
export FREETHEAI_API_KEY="sk-..."
```

</td>
<td>

**4 — Build**

Point any OpenAI SDK at the base URL

</td>
</tr>
</table>

> [!TIP]
> Lost your key? Run `/resetkey` — same account, same stats, fresh key.

---

## Routes

| Route | Method | What it does |
| :--- | :---: | :--- |
| `/v1/chat/completions` | `POST` | Chat completions with streaming |
| `/v1/messages` | `POST` | Anthropic-style messages |
| `/v1/images/generations` | `POST` | Image generation |
| `/v1/images/edits` | `POST` | Image editing |
| `/v1/models` | `GET` | Full model catalog |
| `/v1/health` | `GET` | Health check |

---

## Code Examples

<details>
<summary><b>Chat — curl</b></summary>
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
<summary><b>Chat — JavaScript</b></summary>
<br>

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.FREETHEAI_API_KEY,
  baseURL: "https://api.freetheai.xyz/v1",
});

const res = await client.chat.completions.create({
  model: "glm/glm-5.1",
  messages: [{ role: "user", content: "Say hello." }],
});

console.log(res.choices[0].message.content);
```

</details>

<details>
<summary><b>Chat — Python</b></summary>
<br>

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.freetheai.xyz/v1",
)

res = client.chat.completions.create(
    model="glm/glm-5.1",
    messages=[{"role": "user", "content": "Say hello."}],
)

print(res.choices[0].message.content)
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
      { "role": "user", "content": "Write a migration plan." }
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

res = client.chat.completions.create(
    model="wsf/swe-1.6",
    tool_choice="required",
    messages=[{"role": "user", "content": "Get weather for Boston."}],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"],
                "additionalProperties": False,
            },
        },
    }],
)

print(res.choices[0].message.tool_calls)
```

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
    "prompt": "A neon sports car under rainy city lights"
  }'
```

Response contains `data[0].b64_json`.

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

See [`examples/image_client.py`](examples/image_client.py) for a full CLI tool.

</details>

---

## Models

**16,248** models across **13 families**. Browse the full searchable catalog at [freetheai.xyz/models](https://freetheai.xyz/models).

| Prefix | Models | |
| :--- | ---: | :--- |
| `fth/*` | 16,137 | Open-weight catalog |
| `or/*` | 33 | Free-tier models |
| `cat/*` | 15 | Chat models |
| `yng/*` | 15 | Chat models |
| `kai/*` | 12 | Aggregated models |
| `bbg/*` | 9 | Premium allowlist |
| `bbl/*` | 7 | Chat models |
| `glm/*` | 6 | Chat models |
| `opc/*` | 5 | Free models |
| `rev/*` | 4 | Chat models |
| `wsf/*` | 4 | Chat models |
| `img/*` | 1 | Image generation |

> [!NOTE]
> Use exact alias IDs from `GET /v1/models`. Model availability updates automatically as upstream catalogs change.

---

## Rate Limits

| Tier | RPM | Concurrency |
| :---: | :---: | :---: |
| 1 | 10 | 1 |
| 2 | 15 | 1 |
| 3 | 20 | 2 |
| 4 | 28 | 2 |
| 5 | 35 | 3 |

Tiers unlock through Discord invite progress. No daily limit.

---

## Privacy

Prompt and completion text are **not stored**.

<table>
<tr>
<td width="50%">

**Tracked**
- Model alias used
- Token counts
- Request timestamp
- Status code

</td>
<td width="50%">

**Not tracked**
- Prompt content
- Completion content
- Conversation history

</td>
</tr>
</table>

---

## Discord Commands

<table>
<tr>
<td width="50%">

| Command | Description |
| :--- | :--- |
| `/signup` | Get your API key |
| `/resetkey` | Rotate to a fresh key |
| `/models` | Browse models |
| `/stats` | Your usage stats |
| `/generate` | Generate an image |

</td>
<td width="50%">

| Command | Description |
| :--- | :--- |
| `/tiers` | View rate limit tiers |
| `/tiermodels` | Models per access tier |
| `/leaderboard` | Top users |
| `/modelleaderboard` | Top models |
| `/modelstats` | Stats for a model |

</td>
</tr>
</table>

---

<div align="center">

[Website](https://freetheai.xyz) · [Model Catalog](https://freetheai.xyz/models) · [API](https://api.freetheai.xyz) · [Discord](https://discord.gg/secrets) · [Backup Invite](https://discord.gg/rG3SYpeqYF)

<br>

<sub>No paid tiers. No billing page. Community-run.</sub>

</div>
