# Free AI

Free OpenAI-compatible AI API for anyone to use for anything.

Get a key through Discord in under a minute, plug it into your client, and start building.

[![API](https://img.shields.io/badge/API-OpenAI%20Compatible-0f172a?style=for-the-badge)](https://api.freetheai.xyz)
[![Discord](https://img.shields.io/badge/Discord-discord.gg%2Fsecrets-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/secrets)
[![Limits](https://img.shields.io/badge/Rate%20Limit-30%20RPM-f59e0b?style=for-the-badge)](https://discord.gg/secrets)
[![Privacy](https://img.shields.io/badge/Logging-No%20Request%20Content-16a34a?style=for-the-badge)](https://api.freetheai.xyz/v1/health)

## Join The Community

- Discord: `https://discord.gg/rG3SYpeqYF`
- Vanity invite: `https://discord.gg/secrets`

## Base URL

```text
https://api.freetheai.xyz
```

## Get An API Key

1. Join the Discord server.
2. Run `/signup`.
3. Copy your key immediately.

If you lose it, run `/resetkey` and you will get a new key.

Your usage totals and stats stay attached to your account when you reset your key.

## Limits

- `30 requests per minute`
- `No daily limit`

The per-minute limit exists so everyone gets a fair shot.

## Privacy

No request content is stored.

Only request metadata is kept:

- request timestamp
- model id
- input token count
- output token count
- request status
- source IP

Prompt text and completion text are not saved.

## API Routes

### `GET /v1/health`

Health check.

### `GET /v1/models`

Returns the current model list.

Requires:

```http
Authorization: Bearer YOUR_API_KEY
```

### `POST /v1/chat/completions`

OpenAI-compatible chat completions endpoint.

Requires:

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## Quick Start

### cURL

```bash
curl https://api.freetheai.xyz/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

```bash
curl https://api.freetheai.xyz/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "or/openai/gpt-oss-20b:free",
    "messages": [
      {
        "role": "user",
        "content": "Write a one-line hello world in Python."
      }
    ]
  }'
```

### Python

```python
import requests

response = requests.post(
    "https://api.freetheai.xyz/v1/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "or/openai/gpt-oss-20b:free",
        "messages": [
            {"role": "user", "content": "Say hello in one sentence."}
        ],
    },
    timeout=60,
)

print(response.status_code)
print(response.json())
```

### JavaScript

```js
const response = await fetch("https://api.freetheai.xyz/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "or/openai/gpt-oss-20b:free",
    messages: [
      { role: "user", content: "Explain recursion in one paragraph." }
    ]
  })
});

const data = await response.json();
console.log(data);
```

## Free Models

Model availability changes over time. The live source of truth is always:

```text
GET /v1/models
```

Current snapshot:

### `kai/*`

- `kai/bytedance-seed/dola-seed-2.0-pro:free`
- `kai/google/lyria-3-clip-preview`
- `kai/google/lyria-3-pro-preview`
- `kai/inclusionai/ling-2.6-flash:free`
- `kai/kilo-auto/free`
- `kai/kilo/auto-free`
- `kai/nvidia/nemotron-3-super-120b-a12b:free`
- `kai/openrouter/free`
- `kai/stepfun/step-3.5-flash:free`
- `kai/x-ai/grok-code-fast-1:optimized:free`

### `opc/*`

- `opc/big-pickle`
- `opc/gpt-5-nano`
- `opc/ling-2.6-flash-free`
- `opc/minimax-m2.5-free`
- `opc/nemotron-3-super-free`
- `opc/trinity-large-preview-free`

### `or/*`

- `or/arcee-ai/trinity-large-preview:free`
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
- `or/z-ai/glm-4.5-air:free`

## Why This Exists

Most people never get to build with AI because the first barrier is cost, access, or rate limits.

This removes that barrier.

Join the server, run one command, get a key, and build.

## Notes

- Use the exact model ids returned by `/v1/models`
- This API follows the route shape people already know from the OpenAI ecosystem
- More models may be added over time
