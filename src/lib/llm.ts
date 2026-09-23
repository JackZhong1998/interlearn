import OpenAI from "openai";
import { llmConfig } from "./models";

export async function chatComplete(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  opts?: { json?: boolean; temperature?: number },
) {
  const cfg = llmConfig();
  if (!cfg.ready) return null;

  const client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
  const body: Record<string, unknown> = {};
  if (cfg.provider === "deepseek") body.thinking = cfg.extra;
  else body.reasoning_effort = cfg.extra.reasoning_effort;

  const res = await client.chat.completions.create({
    model: cfg.model,
    messages,
    temperature: opts?.temperature ?? 0.7,
    stream: false,
    ...(opts?.json ? { response_format: { type: "json_object" } } : {}),
    ...body,
  });
  return res.choices[0]?.message?.content ?? "";
}

export async function chatStream(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
) {
  const cfg = llmConfig();
  if (!cfg.ready) return null;

  const client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
  const body: Record<string, unknown> = {};
  if (cfg.provider === "deepseek") body.thinking = cfg.extra;
  else body.reasoning_effort = cfg.extra.reasoning_effort;

  return client.chat.completions.create({
    model: cfg.model,
    messages,
    temperature: 0.7,
    stream: true,
    ...body,
  });
}
