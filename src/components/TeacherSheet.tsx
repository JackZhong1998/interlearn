"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Teacher } from "@/lib/types";
import { withBase } from "@/lib/base-path";

export function TeacherSheet({
  open,
  teachers,
  selectedId,
  onClose,
  onSelect,
}: {
  open: boolean;
  teachers: Teacher[];
  selectedId: string;
  onClose: () => void;
  onSelect: (t: Teacher) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [extra, setExtra] = useState<Teacher[]>([]);
  const [note, setNote] = useState("");

  if (!open || typeof document === "undefined") return null;
  const all = [...teachers, ...extra];
  const female = all.filter((t) => t.gender === "female");
  const male = all.filter((t) => t.gender === "male");

  async function generateMore() {
    setBusy(true);
    setNote("");
    try {
      const res = await fetch(withBase("/api/teachers/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt:
            "Photorealistic adult teacher portraits, mixed handsome men and beautiful women, fashion photography, looking at camera",
        }),
      });
      if (!res.ok) {
        setNote("生图暂不可用，先用预制老师");
        return;
      }
      const data = await res.json();
      if (!data.ok) {
        setNote(data.reason || data.error || "生图暂不可用，先用预制老师");
        return;
      }
      setExtra((prev) => [
        ...prev,
        ...data.images.map((img: { id: string; url: string }, i: number) => ({
          id: img.id,
          name: `新形象 ${i + 1}`,
          gender: i % 2 === 0 ? "female" : "male",
          tag: "新生成",
          image: img.url,
          generated: true,
        })),
      ]);
    } catch {
      setNote("生图暂不可用，先用预制老师");
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="max-h-[78%] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-[#141416] px-4 pb-8 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">换老师形象</h2>
            <p className="text-xs text-white/50">选中的肖像会作为后续视频参考图。第一层预制分支仍秒开。</p>
          </div>
          <button onClick={onClose} className="text-sm text-white/60">
            关闭
          </button>
        </div>
        <Section title="女性" items={female} selectedId={selectedId} onSelect={onSelect} />
        <Section title="男性" items={male} selectedId={selectedId} onSelect={onSelect} />
        <button
          onClick={generateMore}
          disabled={busy}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm text-white/80"
        >
          {busy ? "正在用 fal-ai/flux-2/turbo 生成…" : "再生成几张（flux-2/turbo）"}
        </button>
        {note ? <p className="mt-2 text-xs text-amber-200/80">{note}</p> : null}
      </div>
    </div>,
    document.body,
  );
}

function Section({
  title,
  items,
  selectedId,
  onSelect,
}: {
  title: string;
  items: Teacher[];
  selectedId: string;
  onSelect: (t: Teacher) => void;
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-xs tracking-widest text-white/40">{title}</div>
      <div className="grid grid-cols-3 gap-2.5">
        {items.map((t) => {
          const on = t.id === selectedId;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className={`overflow-hidden rounded-2xl border text-left ${
                on ? "border-white" : "border-white/10"
              }`}
            >
              <div className="relative aspect-[3/4] bg-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
                {on ? (
                  <span className="absolute right-1.5 top-1.5 rounded-full bg-white px-1.5 py-0.5 text-[10px] text-black">
                    当前
                  </span>
                ) : null}
              </div>
              <div className="px-2 py-1.5">
                <div className="text-xs font-medium">{t.name}</div>
                <div className="text-[10px] text-white/45">{t.tag}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
