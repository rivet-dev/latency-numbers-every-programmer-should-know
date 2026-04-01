import { SandboxAgent } from "sandbox-agent";

export async function connectAgent(
  baseUrl: string,
  headers?: HeadersInit
): Promise<SandboxAgent> {
  return SandboxAgent.connect({
    baseUrl,
    headers,
    skipHealthCheck: false,
  });
}

export async function agentExec(sdk: SandboxAgent): Promise<void> {
  await sdk.runProcess({ command: "echo", args: ["ok"] });
}

export async function agentHealth(sdk: SandboxAgent): Promise<void> {
  await sdk.getHealth();
}
