"use client";

import type { Teacher } from "@/lib/types";

export function PersonalizedClip({
  teacher,
  title,
  script,
  onEnded,
}: {
  teacher: Teacher;
  title: string;
  script: string;
  onEnded: () => void;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={teacher.image}
        alt={teacher.name}
        className="kenburns h-full w-full object-cover"
        onAnimationEnd={onEnded}
      />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="absolute left-4 top-4 rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/80">
        后续镜头 · 参考 {teacher.name}
      </div>
      <div className="absolute inset-x-0 bottom-28 px-5">
        <div className="text-lg font-semibold">{title}</div>
        <p className="mt-2 text-sm leading-6 text-white/85">{script}</p>
      </div>
    </div>
  );
}
