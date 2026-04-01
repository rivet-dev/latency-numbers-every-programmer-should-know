# AI Latency Benchmarks

Measures round-trip latencies from AWS Lambda to sandbox providers and LLM inference APIs.

## Setup

- **Runtime:** AWS Lambda, Node.js 20.x, 3072 MB memory
- **Region:** us-east-1
- **Method:** Each test runs sequentially N times. Sandbox provisioning and agent installation are excluded from measurements. Sandboxes are created once and reused across samples.

## Results

10 samples per test. All values in milliseconds.

### Sandbox Providers

| Test | p50 | mean | min | max |
|------|-----|------|-----|-----|
| Daytona — native exec | 15 | 18 | 13 | 28 |
| Daytona — Sandbox Agent health | 22 | 17 | 9 | 29 |
| Daytona — Sandbox Agent exec | 26 | 27 | 23 | 36 |
| E2B — Sandbox Agent health | 71 | 69 | 63 | 74 |
| E2B — Sandbox Agent exec | 75 | 75 | 65 | 89 |
| E2B — native exec | 79 | 79 | 70 | 97 |

- **Native exec:** Run `echo ok` via the provider's own SDK (`sandbox.commands.run` for E2B, `sandbox.process.executeCommand` for Daytona).
- **Sandbox Agent exec:** Run `echo ok` via [Sandbox Agent](https://sandboxagent.dev) `runProcess()` installed inside the sandbox.
- **Sandbox Agent health:** `GET /v1/health` round-trip via Sandbox Agent SDK.

### LLM Inference

| Test | p50 | mean | min | max |
|------|-----|------|-----|-----|
| Anthropic (Haiku 4.5) | 521 | 653 | 372 | 1570 |
| OpenAI (GPT-5 mini) | 1265 | 1116 | 750 | 1417 |
| OpenRouter (Haiku 4.5) | 1166 | 1253 | 964 | 2559 |

- **Prompt:** `"Hi"` with `max_tokens: 1` (Anthropic) or `max_completion_tokens: 16` (OpenAI/OpenRouter). Measures network round-trip + minimal inference, not generation speed.

## Usage

```
GET /run?tests=*&samples=5
GET /run?tests=llm:*&samples=10
GET /run?tests=daytona:*,e2b:*&samples=3
```

### Available tests

`e2b:native-exec`, `e2b:agent-exec`, `e2b:agent-health`, `daytona:native-exec`, `daytona:agent-exec`, `daytona:agent-health`, `llm:anthropic`, `llm:openai`, `llm:openrouter`

### Deploy

```bash
./deploy.sh
```

### Invoke

```bash
./invoke.sh /run "tests=*&samples=5"
```
