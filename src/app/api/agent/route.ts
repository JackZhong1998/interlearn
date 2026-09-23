import { NextResponse } from "next/server";
import { chatStream } from "@/lib/llm";
import { getPlaybook, localAgentReply } from "@/lib/playbook";
import { llmConfig } from "@/lib/models";

export const dynamic = "force-dynamic";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const body = (await req.json()) as { messages?: Msg[]; mode?: string };
  const messages = body.messages ?? [];
  const last = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  const cfg = llmConfig();
  if (!cfg.ready) {
    const local = localAgentReply(last);
    return NextResponse.json({
      reply: local.reply,
      draft: local.draft,
      provider: "local-playbook",
      model: "playbook",
    });
  }

  const openaiMsgs = [
    { role: "system" as const, content: getPlaybook() },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const stream = await chatStream(openaiMsgs);
  if (!stream) {
    const local = localAgentReply(last);
    return NextResponse.json({ reply: local.reply, draft: local.draft });
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || "";
          if (delta) controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(`\n\n（模型中断：${String(err)}，下面用本地玩法补一版。）\n\n`),
        );
        controller.enqueue(encoder.encode(localAgentReply(last).reply));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-LLM-Provider": cfg.provider,
      "X-LLM-Model": cfg.model,
    },
  });
}
