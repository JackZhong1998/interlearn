"use client";

import { useEffect, useRef, useState } from "react";
import { TEACHERS } from "@/data/teachers";
import { GOAL_CHIPS, METHOD_CHIPS, localCustomLearn, type CustomLearnPlan } from "@/lib/custom-learn";
import { withBase } from "@/lib/base-path";
import { newDraftId, saveCreation } from "@/lib/creations";
import type { Teacher } from "@/lib/types";

type Msg = { role: "user" | "assistant"; content: string };
type Step = "goal" | "method" | "teacher" | "done";

export default function CustomLearnPage() {
  const [step, setStep] = useState<Step>("goal");
  const [goal, setGoal] = useState("");
  const [method, setMethod] = useState("");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<CustomLearnPlan | null>(null);
  const [status, setStatus] = useState("本地分镜（未配置钥匙时也能走完）");
  const [saved, setSaved] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "定制学习。先锁三件事：学什么、怎么学、哪位老师。锁完我再写讲解和分镜，有钥匙就出片。\n\n你想搞懂什么？",
    },
  ]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(withBase("/api/status"))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no api"))))
      .then((s) => {
        const llm = s.llm?.ready ? `${s.llm.provider} · ${s.llm.model}` : "讲解走本地";
        const fal = s.fal?.ready ? s.fal.t2v : "无 FAL_KEY，只出分镜";
        setStatus(`${llm} · ${fal}`);
      })
      .catch(() => setStatus("静态站 / 本地分镜（无服务器钥匙）"));
  }, []);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [messages, plan, busy]);

  function push(role: Msg["role"], content: string) {
    setMessages((m) => [...m, { role, content }]);
  }

  function lockGoal(text: string) {
    const g = text.trim();
    if (!g || step !== "goal") return;
    setGoal(g);
    setInput("");
    setStep("method");
    setMessages((m) => [
      ...m,
      { role: "user", content: g },
      { role: "assistant", content: `已锁定目标：${g}。\n\n用哪种方式学？类比、逐步推导，或场景问答。` },
    ]);
  }

  function lockMethod(text: string) {
    const w = text.trim();
    if (!w || step !== "method") return;
    setMethod(w);
    setInput("");
    setStep("teacher");
    setMessages((m) => [
      ...m,
      { role: "user", content: w },
      { role: "assistant", content: `已锁定方式：${w}。\n\n选一位老师。后面的讲解和分镜按这个人写。` },
    ]);
  }

  async function lockTeacher(t: Teacher) {
    if (step !== "teacher" || busy) return;
    setTeacher(t);
    setStep("done");
    push("user", `${t.name} · ${t.tag}`);
    push("assistant", `已锁定老师：${t.name}（${t.tag}）。三件事齐了，正在生成讲解和分镜…`);
    setBusy(true);
    try {
      let next: CustomLearnPlan | null = null;
      try {
        const res = await fetch(withBase("/api/custom-learn"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal,
            method,
            teacher: { id: t.id, name: t.name, tag: t.tag, image: t.image },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          next = data.plan as CustomLearnPlan;
        }
      } catch {
        next = null;
      }
      if (!next) {
        next = localCustomLearn({ goal, method, teacher: t });
        next.videoReason = "静态站 / 无钥匙：已用本地分镜，对话已走完。";
      }
      setPlan(next);
      push(
        "assistant",
        next.videoReason
          ? `讲解和分镜好了。${next.videoReason}`
          : "讲解和分镜好了。",
      );
    } catch (err) {
      push("assistant", `生成中断：${String(err)}。下面仍保留你锁定的三件事，可再试。`);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit() {
    if (step === "goal") lockGoal(input);
    else if (step === "method") lockMethod(input);
  }

  function persist() {
    if (!plan) return;
    saveCreation({
      id: newDraftId(),
      title: plan.goal,
      hook: plan.method,
      firstScript: plan.explanation,
      branches: plan.storyboard.slice(1).map((s) => ({
        label: s.title.slice(0, 12),
        hint: s.visual.slice(0, 24),
        script: s.script,
      })),
      expansion: `${plan.teacher.name} · ${plan.provider}`,
      status: "saved",
      updatedAt: Date.now(),
    });
    setSaved(true);
  }

  return (
    <div className="flex h-dvh flex-col pb-16">
      <header className="px-4 pb-2 pt-[max(14px,env(safe-area-inset-top))]">
        <div className="text-[11px] tracking-[0.2em] text-white/40">定制学习</div>
        <h1 className="text-lg font-semibold">先锁三件事，再出片</h1>
        <p className="text-xs text-white/45">{status}</p>
        <div className="mt-2 flex gap-1.5 text-[10px]">
          <LockChip on={Boolean(goal)} label={goal || "目标"} />
          <LockChip on={Boolean(method)} label={method || "方式"} />
          <LockChip on={Boolean(teacher)} label={teacher ? teacher.name : "老师"} />
        </div>
      </header>

      <div ref={box} className="flex-1 space-y-3 overflow-y-auto px-4 pb-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-6 ${
              m.role === "user" ? "ml-auto bg-white text-black" : "bg-white/8 text-white/90"
            }`}
          >
            {m.content}
          </div>
        ))}

        {step === "goal" ? (
          <ChipRow items={GOAL_CHIPS} onPick={lockGoal} />
        ) : null}
        {step === "method" ? (
          <ChipRow items={METHOD_CHIPS} onPick={lockMethod} />
        ) : null}
        {step === "teacher" ? (
          <div className="grid grid-cols-4 gap-2">
            {TEACHERS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => void lockTeacher(t)}
                className="rounded-2xl bg-white/5 p-1.5 text-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.image} alt="" className="mx-auto h-12 w-12 rounded-full object-cover" />
                <div className="mt-1 text-[10px]">{t.name}</div>
                <div className="text-[9px] text-white/40">{t.tag}</div>
              </button>
            ))}
          </div>
        ) : null}

        {busy ? <div className="text-xs text-white/40">在写讲解和分镜…</div> : null}

        {plan ? (
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/40">
              {plan.provider} · {plan.model}
            </div>
            <div>
              <div className="text-xs text-white/40">知识讲解</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-white/85">{plan.explanation}</p>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-white/40">分镜</div>
              {plan.storyboard.map((s) => (
                <div key={s.id} className="rounded-xl bg-black/30 px-3 py-2">
                  <div className="text-sm font-medium">{s.title}</div>
                  <p className="mt-1 text-xs text-white/70">{s.script}</p>
                  <p className="mt-1 text-[11px] text-white/40">画面：{s.visual}</p>
                  {s.video ? (
                    <video src={s.video} className="mt-2 h-40 w-full rounded-lg object-cover" controls playsInline />
                  ) : null}
                </div>
              ))}
            </div>
            {plan.videoReason ? <p className="text-[11px] text-white/40">{plan.videoReason}</p> : null}
            <button
              type="button"
              onClick={persist}
              className="w-full rounded-xl bg-white py-2 text-sm text-black"
            >
              {saved ? "已存到我的" : "保存到我的"}
            </button>
          </div>
        ) : null}
      </div>

      {step === "goal" || step === "method" ? (
        <form
          className="flex gap-2 px-3 pb-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={step === "goal" ? "输入或点上面的目标…" : "输入或点上面的方式…"}
            className="flex-1 rounded-2xl bg-white/10 px-3 py-2.5 text-sm outline-none placeholder:text-white/30"
          />
          <button className="rounded-2xl bg-white px-3 text-sm text-black" type="submit">
            锁定
          </button>
        </form>
      ) : (
        <p className="px-3 pb-3 text-center text-[10px] text-white/25">
          {step === "teacher" ? "点一位老师即开始生成" : "目标 / 方式 / 老师已锁定"}
        </p>
      )}
    </div>
  );
}

function LockChip({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`max-w-[32%] truncate rounded-full px-2 py-0.5 ${
        on ? "bg-white text-black" : "bg-white/10 text-white/45"
      }`}
    >
      {label}
    </span>
  );
}

function ChipRow({ items, onPick }: { items: string[]; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPick(item)}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
