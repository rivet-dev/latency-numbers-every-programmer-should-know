import { Daytona } from "@daytonaio/sdk";
import { SandboxAgent } from "sandbox-agent";
import { connectAgent } from "./shared.js";

const AGENT_PORT = 2468;

export interface DaytonaContext {
  daytona: Daytona;
  sandbox: Awaited<ReturnType<Daytona["create"]>>;
  sandboxId: string;
  agentSdk: SandboxAgent;
  agentBaseUrl: string;
}

let cached: DaytonaContext | null = null;

export function getDaytonaContext(): DaytonaContext | null {
  return cached;
}

export async function setupDaytona(
  existingSandboxId?: string
): Promise<DaytonaContext> {
  if (cached) return cached;

  const daytona = new Daytona();
  let sandbox: Awaited<ReturnType<Daytona["create"]>>;
  let sandboxId: string;

  if (existingSandboxId) {
    sandbox = await daytona.get(existingSandboxId);
    sandboxId = existingSandboxId;
  } else {
    sandbox = await daytona.create({
      image: "ubuntu:22.04",
      resources: { cpu: 1, memory: 2, disk: 5 },
      envVars: {},
    });
    sandboxId = sandbox.id;

    // Install sandbox-agent
    await sandbox.process.executeCommand(
      "curl -fsSL https://releases.rivet.dev/sandbox-agent/0.4.x/install.sh | sh",
      undefined,
      undefined,
      120
    );

    // Start sandbox-agent in background
    await sandbox.process.executeCommand(
      `nohup sandbox-agent server --no-token --host 0.0.0.0 --port ${AGENT_PORT} > /dev/null 2>&1 &`,
      undefined,
      undefined,
      5
    );
  }

  // Get preview URL for the agent port
  const signed = await sandbox.getSignedPreviewUrl(AGENT_PORT, 7200);
  const agentBaseUrl = signed.url;

  const agentSdk = await connectAgent(agentBaseUrl);

  cached = { daytona, sandbox, sandboxId, agentSdk, agentBaseUrl };
  return cached;
}

export async function teardownDaytona(): Promise<void> {
  if (!cached) return;
  await cached.agentSdk.dispose();
  await cached.sandbox.delete();
  cached = null;
}

export async function daytonaNativeExec(): Promise<void> {
  if (!cached) throw new Error("Daytona not set up");
  await cached.sandbox.process.executeCommand("echo ok");
}
