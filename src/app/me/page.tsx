"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadCreations } from "@/lib/creations";
import { withBase } from "@/lib/base-path";
import type { CreationDraft } from "@/lib/types";

export default function MePage() {
  const [tab, setTab] = useState<"works" | "drafts">("works");
  const [items, setItems] = useState<CreationDraft[]>([]);

  useEffect(() => {
    setItems(loadCreations());
  }, []);

  const works = items.filter((i) => i.status === "saved");
  const drafts = items.filter((i) => i.status === "draft");
  const list = tab === "works" ? works : drafts;

  return (
    <div className="h-dvh overflow-y-auto pb-24">
      <header className="px-4 pt-[max(18px,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={withBase("/media/teachers/teacher-female-default.png")}
            alt=""
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <div className="text-lg font-semibold">学习者</div>
            <div className="text-xs text-white/45">互动视频 · 本地档案</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat n={6} label="学习系列" />
          <Stat n={works.length} label="已保存" />
          <Stat n={drafts.length} label="定制中" />
        </div>
      </header>

      <div className="mt-5 flex gap-5 px-4 text-sm">
        <button
          className={tab === "works" ? "text-white" : "text-white/40"}
          onClick={() => setTab("works")}
        >
          作品
        </button>
        <button
          className={tab === "drafts" ? "text-white" : "text-white/40"}
          onClick={() => setTab("drafts")}
        >
          定制中
        </button>
      </div>

      <div className="mt-3 space-y-2 px-4">
        {tab === "works" ? (
          <Link href="/" className="block overflow-hidden rounded-2xl bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/media/series/logic-machine/poster.jpg")} alt="" className="h-36 w-full object-cover" />
            <div className="px-3 py-2">
              <div className="text-sm font-medium">机器怎么分工</div>
              <div className="text-xs text-white/45">首页只播；播完进互动页再选</div>
            </div>
          </Link>
        ) : null}

        {list.length === 0 && tab === "drafts" ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/40">
            还没有进行中的定制学习。
            <div className="mt-2">
              <Link href="/create" className="text-white">
                去定制学习
              </Link>
            </div>
          </div>
        ) : null}

        {list.map((c) => (
          <div key={c.id} className="rounded-2xl bg-white/5 px-3 py-3">
            <div className="text-sm font-medium">{c.title}</div>
            <p className="mt-1 line-clamp-2 text-xs text-white/55">{c.firstScript}</p>
            <div className="mt-2 text-[11px] text-white/35">
              {c.branches.length} 个分支 · {c.status === "draft" ? "草稿" : "已保存"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/5 py-2">
      <div className="text-base font-semibold">{n}</div>
      <div className="text-[11px] text-white/40">{label}</div>
    </div>
  );
}
