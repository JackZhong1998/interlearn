"use client";

import { useRef, useState } from "react";
import { formatTime } from "@/lib/use-short-player";

export function SeekBar({
  progress,
  duration,
  onBegin,
  onSeek,
  onEnd,
  className = "absolute inset-x-4 bottom-[4.6rem]",
}: {
  progress: number;
  duration: number;
  onBegin: () => void;
  onSeek: (t: number) => void;
  onEnd: () => void;
  className?: string;
}) {
  const bar = useRef<HTMLDivElement>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const ratio = duration > 0 ? Math.min(1, Math.max(0, progress / duration)) : 0;

  function at(clientX: number) {
    const el = bar.current;
    if (!el || duration <= 0) return 0;
    const r = el.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * duration;
  }

  return (
    <div data-player-ui className={`z-30 ${className}`}>
      {scrubbing ? (
        <div className="mb-1 flex justify-between text-[10px] text-white/70">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      ) : null}
      <div
        ref={bar}
        className="h-5 cursor-pointer touch-none"
        onPointerDown={(e) => {
          e.stopPropagation();
          e.currentTarget.setPointerCapture(e.pointerId);
          setScrubbing(true);
          onBegin();
          onSeek(at(e.clientX));
        }}
        onPointerMove={(e) => {
          if (e.buttons !== 1) return;
          e.stopPropagation();
          onSeek(at(e.clientX));
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          setScrubbing(false);
          onEnd();
        }}
        onPointerCancel={() => {
          setScrubbing(false);
          onEnd();
        }}
      >
        <div className="relative top-1.5 h-1 overflow-hidden rounded-full bg-white/25">
          <div className="h-full bg-white" style={{ width: `${ratio * 100}%` }} />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white"
            style={{ left: `calc(${ratio * 100}% - 6px)` }}
          />
        </div>
      </div>
    </div>
  );
}

export function SpeedBadge({ rate, holding, locked }: { rate: number; holding: boolean; locked: boolean }) {
  if (rate <= 1.01 && !holding) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-[28%] z-30 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-sm font-semibold backdrop-blur">
      {rate.toFixed(1)}x{locked ? " 锁定" : holding ? " 按住" : ""}
    </div>
  );
}

export function PauseFlash({ kind }: { kind: "pause" | "play" | null }) {
  if (!kind) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-black/45 text-white">
        {kind === "pause" ? (
          <span className="text-2xl">❚❚</span>
        ) : (
          <span className="ml-1 text-2xl">▶</span>
        )}
      </div>
    </div>
  );
}
