import { Sandbox } from "e2b";
import { SandboxAgent } from "sandbox-agent";
import { connectAgent } from "./shared.js";

const AGENT_PORT = 2468;

export interface E2bContext {
  sandbox: Sandbox;
  sandboxId: string;
  agentSdk: SandboxAgent;
  agentBaseUrl: string;
}

let cached: E2bContext | null = null;

export function getE2bContext(): E2bContext | null {
  return cached;
}

export async function setupE2b(existingSandboxId?: string): Promise<E2bContext> {
  if (cached) return cached;

  let sandbox: Sandbox;
  let sandboxId: string;

  if (existingSandboxId) {
    sandbox = await Sandbox.connect(existingSandboxId);
    sandboxId = existingSandboxId;
  } else {
    sandbox = await Sandbox.create({ timeoutMs: 10 * 60 * 1000 });
    const info = await sandbox.getInfo();
    sandboxId = info.sandboxId;

    // Install sandbox-agent
    await sandbox.commands.run(
      "curl -fsSL https://releases.rivet.dev/sandbox-agent/0.4.x/install.sh | sh",
      { timeoutMs: 120_000 }
    );

    // Start sandbox-agent in background
    await sandbox.commands.run(
      `nohup sandbox-agent server --no-token --host 0.0.0.0 --port ${AGENT_PORT} > /dev/null 2>&1 &`,
      { timeoutMs: 5_000 }
    );
  }

  const agentBaseUrl = `https://${AGENT_PORT}-${sandboxId}.e2b.app`;
  const agentSdk = await connectAgent(agentBaseUrl);

  cached = { sandbox, sandboxId, agentSdk, agentBaseUrl };
  return cached;
}

export async function teardownE2b(): Promise<void> {
  if (!cached) return;
  await cached.agentSdk.dispose();
  await cached.sandbox.kill();
  cached = null;
}

export async function e2bNativeExec(): Promise<void> {
  if (!cached) throw new Error("E2B not set up");
  await cached.sandbox.commands.run("echo ok");
}

export async function e2bColdstart(): Promise<void> {
  const sandbox = await Sandbox.create({ timeoutMs: 60_000 });
  await sandbox.kill();
}
