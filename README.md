<div align="center">

# FreeTheAi

### Free AI API access with Discord signup, OpenAI-compatible chat routes, xAI image and video generation, streaming, and tool calling

[![API](https://img.shields.io/badge/API-OpenAI%20Compatible-111827?style=for-the-badge)](https://api.freetheai.xyz)
[![Base URL](https://img.shields.io/badge/Base%20URL-api.freetheai.xyz-0ea5e9?style=for-the-badge)](https://api.freetheai.xyz)
[![Limits](https://img.shields.io/badge/Limit-30%20RPM-f59e0b?style=for-the-badge)](https://discord.gg/secrets)
[![Privacy](https://img.shields.io/badge/Logging-No%20Prompt%20Storage-16a34a?style=for-the-badge)](https://api.freetheai.xyz/v1/health)
[![Discord](https://img.shields.io/badge/Discord-discord.gg%2Fsecrets-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/secrets)

</div>

## What This Is

`FreeTheAi` is a public API for builders who want real model access without paying to get started.

- Discord slash-command signup
- OpenAI-compatible `chat/completions`
- Image generation via `images/generations`
- Deferred video generation via `videos/generations`
- Streaming support
- Tool calling support
- No daily cap
- No prompt storage

If your client works with the OpenAI SDK, it works here.

## Community

- Discord: `https://discord.gg/secrets`
- Backup invite: `https://discord.gg/rG3SYpeqYF`
- API: `https://api.freetheai.xyz`

## Get A Key

1. Open the Discord server.
2. Run `/signup`.
3. Copy the key immediately.

If you lose it:

1. Run `/resetkey`.
2. Get a fresh key.
3. Keep the same account stats and usage totals.

Useful Discord commands:

- `/signup`
- `/resetkey`
- `/models`
- `/stats`
- `/leaderboard`
- `/modelleaderboard`
- `/modelstats`

## Limits

- `30 requests per minute`
- `No daily limit`

The minute cap is there so the pool stays usable for everyone.

## Privacy

Prompt text and completion text are **not** stored.

The service only keeps request metadata:

- alias model id
- token counts
- request timestamp
- request status
- client IP metadata

## Base URL

```text
https://api.freetheai.xyz
```

## Routes

| Route | Method | Description |
| --- | --- | --- |
| `/v1/health` | `GET` | Health check |
| `/v1/models` | `GET` | Lightweight live model catalog for API clients |
| `/v1/chat/completions` | `POST` | OpenAI-compatible chat completions |
| `/v1/images/generations` | `POST` | Image generation |
| `/v1/videos/generations` | `POST` | Start video generation |
| `/v1/videos/:request_id` | `GET` | Poll video generation status |

Auth:

```http
Authorization: Bearer YOUR_API_KEY
```

## Quick Start

### List Models

```bash
curl https://api.freetheai.xyz/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Basic Chat

```bash
curl https://api.freetheai.xyz/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "wsf/kimi-k2.6",
    "messages": [
      {
        "role": "user",
        "content": "Write a Python hello world."
      }
    ]
  }'
```

### Image Generation

```bash
curl https://api.freetheai.xyz/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "xai/grok-imagine-image",
    "prompt": "A neon sports car parked under rainy city lights",
    "n": 1,
    "aspect_ratio": "auto",
    "resolution": "1k"
  }'
```

### Video Generation

Start the job:

```bash
curl https://api.freetheai.xyz/v1/videos/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "xai/grok-imagine-video",
    "prompt": "A neon sports car slowly driving through rainy city lights",
    "duration": 5,
    "resolution": "480p",
    "aspect_ratio": "16:9"
  }'
```

Poll it:

```bash
curl https://api.freetheai.xyz/v1/videos/REQUEST_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Pending jobs may return `202` with a payload like:

```json
{"status":"pending","progress":0}
```

Keep polling the same `request_id` until the response includes the final video payload.

### Text To Speech

The speech route returns binary audio. Use `response_format: "pcm"` for 24 kHz PCM or `response_format: "mp3"` for MP3 output.

```bash
curl https://api.freetheai.xyz/v1/audio/speech \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  --output speech.pcm \
  -d '{
    "model": "xai/grok-tts",
    "input": "Hello, how are you?",
    "voice": "Eve",
    "wrapper": "soft",
    "response_format": "pcm",
    "language": "en"
  }'
```

Supported voices: `Ara`, `Eve`, `Leo`, `Rex`, `Sal`.

Supported voice wrappers can be used either as raw tags inside `input` or through the helper field `wrapper`.

```json
{
  "model": "xai/grok-tts",
  "input": "Do not tell anyone",
  "voice": "Ara",
  "wrapper": "whisper",
  "response_format": "mp3"
}
```

Supported wrappers: `soft`, `whisper`, `loud`, `build-intensity`, `decrease-intensity`, `higher-pitch`, `lower-pitch`, `slow`, `fast`, `sing-song`, `singing`, `laugh-speak`, `emphasis`.

## Current Media Limits

The API currently enforces the same anonymous-compatible media limits used by the public site flow:

- `xai/grok-imagine-image`
- image resolution: `1k` only
- image responses are returned as `b64_json`
- `xai/grok-imagine-video`
- video resolution: `480p` only
- video duration: `1` to `5` seconds
- `xai/grok-tts`
- speech response formats: `pcm` or `mp3`
- speech voices: `Ara`, `Eve`, `Leo`, `Rex`, `Sal`

## Tool Calling

Tool calling is live on the public API.

### Non-streaming tool call example

```bash
curl https://api.freetheai.xyz/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "wsf/swe-1.6",
    "tool_choice": "required",
    "messages": [
      {
        "role": "user",
        "content": "Use the get_weather tool for Boston and do not answer directly."
      }
    ],
    "tools": [
      {
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get the weather for a city.",
          "parameters": {
            "type": "object",
            "properties": {
              "city": { "type": "string" }
            },
            "required": ["city"],
            "additionalProperties": false
          }
        }
      }
    ]
  }'
```

Expected result shape:

- `choices[0].finish_reason == "tool_calls"`
- `choices[0].message.tool_calls` present

### Python SDK example

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
            "content": "Use the get_weather tool for Boston and do not answer directly."
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

## JavaScript SDK Example

```js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://api.freetheai.xyz/v1"
});

const completion = await client.chat.completions.create({
  model: "wsf/kimi-k2.6",
  messages: [
    { role: "user", content: "Say hello in one sentence." }
  ]
});

console.log(completion.choices[0].message.content);
```

## Model Families

Use exact alias ids from `GET /v1/models` or the website model catalog. The API route stays compact for client compatibility, while the website catalog can show the expanded list.

- `bbl/*`
- `cat/*`
- `fth/*`
- `glm/*`
- `kai/*`
- `opc/*`
- `or/*`
- `wsf/*`
- `yng/*`
- `xai/*`

## Current Live Snapshot

The lightweight client source of truth is:

```text
GET /v1/models
```

The website uses its dedicated catalog route for the full searchable list, including expanded `fth/*` entries.

Current notable families from the deployed API:

### `bbl/*`

- `bbl/gpt-4.1`
- `bbl/gpt-4o`
- `bbl/gpt-5-mini`
- `bbl/gpt-5`
- `bbl/gpt-5-chat`
- `bbl/gpt-5.1`
- `bbl/gpt-5.2`
- `bbl/gpt-5.4-mini`
- `bbl/gpt-5.4`
- `bbl/gpt-5-max`
- `bbl/o3-mini`
- `bbl/o3`
- `bbl/claude-3.7-sonnet`
- `bbl/claude-4-sonnet`
- `bbl/claude-4.5-sonnet`
- `bbl/claude-4.6-sonnet`
- `bbl/claude-4.5-haiku`
- `bbl/claude-4.5-opus`
- `bbl/claude-4.6-opus`
- `bbl/claude-4.7-opus`
- `bbl/deepseek-r1`
- `bbl/deepseek-v3`
- `bbl/gemini-2.5-flash`
- `bbl/gemini-2.5-flash-lite`
- `bbl/gemini-2.5-pro`
- `bbl/gemini-3.0-flash`
- `bbl/gemini-3.0-pro`
- `bbl/gemini-3.1-pro`
- `bbl/grok-3`
- `bbl/grok-4`
- `bbl/grok-4.1-fast-non-reasoning`

### `cat/*`

- `cat/agent-1`
- `cat/gpt-4.1`
- `cat/gpt-4.1-mini`
- `cat/gpt-5-mini`
- `cat/gpt-5`
- `cat/gpt-5.1`
- `cat/gpt-5.2`
- `cat/gpt-5.4-mini`
- `cat/gpt-5.4`
- `cat/claude-4-5-haiku`
- `cat/claude-4-5-sonnet`
- `cat/claude-4-6-sonnet`
- `cat/gemini-2-5-flash`
- `cat/gemini-3-flash`
- `cat/gemini-3-1-pro`

### `yng/*`

- `yng/agent-1`
- `yng/gpt-5`
- `yng/gpt-5.1`
- `yng/gpt-5.2`
- `yng/gpt-5.4`
- `yng/claude-4-5-sonnet`
- `yng/claude-4-6-sonnet`
- `yng/gemini-3-flash`
- `yng/gemini-3-1-pro`

### `fth/*`

- expanded open-model catalog
- full listing is browsable on the website model catalog
- use the exact returned alias ids such as `fth/Qwen/Qwen2.5-7B-Instruct`

### `wsf/*`

- `wsf/kimi-k2.5`
- `wsf/kimi-k2.6`
- `wsf/swe-1.5`
- `wsf/swe-1.6`

### `glm/*`

- `glm/glm-4.5`
- `glm/glm-4.5-air`
- `glm/glm-4.6`
- `glm/glm-4.7`
- `glm/glm-5`
- `glm/glm-5.1`

### `opc/*`

- `opc/big-pickle`
- `opc/gpt-5-nano`
- `opc/hy3-preview-free`
- `opc/ling-2.6-flash-free`
- `opc/minimax-m2.5-free`
- `opc/nemotron-3-super-free`
- `opc/trinity-large-preview-free`

### `kai/*`

- `kai/baidu/qianfan-ocr-fast:free`
- `kai/google/lyria-3-clip-preview`
- `kai/google/lyria-3-pro-preview`
- `kai/inclusionai/ling-2.6-1t:free`
- `kai/inclusionai/ling-2.6-flash:free`
- `kai/kilo-auto/free`
- `kai/kilo/auto-free`
- `kai/nvidia/nemotron-3-super-120b-a12b:free`
- `kai/openrouter/free`
- `kai/stepfun/step-3.5-flash:free`
- `kai/tencent/hy3-preview:free`
- `kai/x-ai/grok-code-fast-1:optimized:free`

### `or/*`

- `or/baidu/qianfan-ocr-fast:free`
- `or/cognitivecomputations/dolphin-mistral-24b-venice-edition:free`
- `or/google/gemma-3-12b-it:free`
- `or/google/gemma-3-27b-it:free`
- `or/google/gemma-3-4b-it:free`
- `or/google/gemma-3n-e2b-it:free`
- `or/google/gemma-3n-e4b-it:free`
- `or/google/gemma-4-26b-a4b-it:free`
- `or/google/gemma-4-31b-it:free`
- `or/google/lyria-3-clip-preview`
- `or/google/lyria-3-pro-preview`
- `or/inclusionai/ling-2.6-1t:free`
- `or/inclusionai/ling-2.6-flash:free`
- `or/liquid/lfm-2.5-1.2b-instruct:free`
- `or/liquid/lfm-2.5-1.2b-thinking:free`
- `or/meta-llama/llama-3.2-3b-instruct:free`
- `or/meta-llama/llama-3.3-70b-instruct:free`
- `or/minimax/minimax-m2.5:free`
- `or/nousresearch/hermes-3-llama-3.1-405b:free`
- `or/nvidia/nemotron-3-nano-30b-a3b:free`
- `or/nvidia/nemotron-3-super-120b-a12b:free`
- `or/nvidia/nemotron-nano-12b-v2-vl:free`
- `or/nvidia/nemotron-nano-9b-v2:free`
- `or/openai/gpt-oss-120b:free`
- `or/openai/gpt-oss-20b:free`
- `or/openrouter/free`
- `or/qwen/qwen3-coder:free`
- `or/qwen/qwen3-next-80b-a3b-instruct:free`
- `or/tencent/hy3-preview:free`
- `or/z-ai/glm-4.5-air:free`

## Notes

- The public API is OpenAI-compatible.
- Tool calling now works on the public API.
- Prompt text is not stored.
- The backend implementation is private.
- Model availability can change as the live upstream catalog changes.
- If you lose your key, use `/resetkey`.

## Repo

- Docs / landing page repo: `https://github.com/vibheksoni/free-ai`
- Live site: `https://freetheai.xyz`
- Live API: `https://api.freetheai.xyz`
