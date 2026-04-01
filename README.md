# AI Latency Benchmarks

Measures round-trip latencies from AWS Lambda to sandbox providers and LLM inference APIs.

## Setup

- **Runtime:** AWS Lambda, Node.js 20.x, 3072 MB memory
- **Region:** us-east-1
- **Method:** Each test runs sequentially N times. Sandbox exec/health tests reuse a pre-provisioned sandbox. Coldstart tests create and destroy a fresh sandbox each sample.

## Available tests

| Test | Description |
|------|-------------|
| `e2b:coldstart` | Create + destroy a fresh E2B sandbox |
| `e2b:native-exec` | `echo ok` via E2B SDK |
| `e2b:agent-exec` | `echo ok` via Sandbox Agent |
| `e2b:agent-health` | `GET /v1/health` via Sandbox Agent |
| `daytona:coldstart` | Create + destroy a fresh Daytona sandbox |
| `daytona:native-exec` | `echo ok` via Daytona SDK |
| `daytona:agent-exec` | `echo ok` via Sandbox Agent |
| `daytona:agent-health` | `GET /v1/health` via Sandbox Agent |
| `llm:anthropic` | Anthropic Haiku 4.5, `"Hi"`, max_tokens=1 |
| `llm:openai` | OpenAI GPT-5 mini, `"Hi"`, max_completion_tokens=16 |
| `llm:openrouter` | Haiku 4.5 via OpenRouter |
| `llm:openrouter-openai` | GPT-5 mini via OpenRouter |

## Usage

```bash
# JSON output
./invoke.sh /run "tests=*&samples=5"

# CSV output (for Google Sheets)
./invoke.sh /run "tests=*&samples=10&format=csv"

# Specific tests
./invoke.sh /run "tests=e2b:coldstart,daytona:coldstart&samples=3"
./invoke.sh /run "tests=llm:*&samples=10&format=csv"
```

### Deploy

```bash
./deploy.sh
```
