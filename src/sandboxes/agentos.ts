import { AgentOs } from "@rivet-dev/agent-os-core";
import common from "@rivet-dev/agent-os-common";

let cached: AgentOs | null = null;

export async function setupAgentOs(): Promise<void> {
  if (cached) return;

  const vm = await AgentOs.create({ software: [common] });

  // Warm up (not measured)
  await vm.exec("echo warmup");

  cached = vm;
}

export async function teardownAgentOs(): Promise<void> {
  if (!cached) return;
  await cached.dispose();
  cached = null;
}

export async function agentOsNativeExec(): Promise<void> {
  if (!cached) throw new Error("AgentOS not set up");
  await cached.exec("echo ok");
}
