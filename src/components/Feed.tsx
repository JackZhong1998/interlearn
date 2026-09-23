"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Series } from "@/lib/types";
import { autoplay, tryUnmute } from "@/lib/autoplay";
import { useShortPlayer } from "@/lib/use-short-player";
import { PauseFlash, SeekBar, SpeedBadge } from "./SeekBar";

export function Feed({ series }: { series: Series[] }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const swipeLock = useRef(0);
  const player = useShortPlayer(videoRef, {
    onSeriesSwipe: (dir) => goSeries(index + dir),
  });

  const current = series[index];
  const start = current?.clips[current.startClipId];
  const src = start?.video || "";

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    v.currentTime = 0;
    player.resetRate();
    autoplay(v, src, start?.poster);
  }, [src, start?.poster, index]);

  function goSeries(nextIndex: number) {
    const now = Date.now();
    if (now - swipeLock.current < 360) return;
    if (nextIndex < 0 || nextIndex >= series.length || nextIndex === index) return;
    swipeLock.current = now;
    setIndex(nextIndex);
    const next = series[nextIndex];
    const clip = next.clips[next.startClipId];
    const v = videoRef.current;
    if (v && clip?.video) {
      v.currentTime = 0;
      player.resetRate();
      autoplay(v, clip.video, clip.poster || next.cover);
      tryUnmute(v);
      setMuted(v.muted);
    }
  }

  useEffect(() => {
    const root = videoRef.current?.parentElement;
    if (!root) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[data-player-ui]")) return;
      if (Math.abs(e.deltaY) < 8) return;
      e.preventDefault();
      goSeries(index + (e.deltaY > 0 ? 1 : -1));
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "j") {
        e.preventDefault();
        goSeries(index + 1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "k") {
        e.preventDefault();
        goSeries(index - 1);
      }
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [index, series]);

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-black"
      style={{ touchAction: "none" }}
      onPointerDown={player.onPointerDown}
      onPointerMove={player.onPointerMove}
      onPointerUp={player.onPointerUp}
      onPointerCancel={player.onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={src || undefined}
        playsInline
        muted
        autoPlay
        preload="auto"
        poster={start?.poster || current?.cover}
        onCanPlay={player.onCanPlay}
        onPause={player.onUnexpectedPause}
        onEnded={() => {
          if (current) router.push(`/watch/${current.id}?ended=1`);
        }}
        onPlay={(e) => setMuted(e.currentTarget.muted)}
      />

      <PauseFlash kind={player.flash} />
      <SpeedBadge rate={player.rate} holding={player.holding} locked={player.locked} />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/55 to-transparent" />

      <div className="pointer-events-none absolute left-4 top-[max(14px,env(safe-area-inset-top))] z-20 text-[11px] tracking-[0.22em] text-white/60">
        INTERLEARN
      </div>
      <button
        data-player-ui
        type="button"
        onClick={() => {
          const v = videoRef.current;
          if (!v) return;
          v.muted = !v.muted;
          setMuted(v.muted);
          void v.play();
        }}
        className="absolute right-3 top-[max(12px,env(safe-area-inset-top))] z-20 rounded-full bg-black/45 px-2.5 py-1 text-[11px] text-white/80"
      >
        {muted ? "声音关" : "声音开"}
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 px-5">
        <div className="text-[11px] text-white/55">
          {current?.tag} · {index + 1}/{series.length} · 上下滑切系列
        </div>
        <div className="mt-1 text-xl font-semibold">{start?.title || current?.title}</div>
        <p className="mt-1 line-clamp-2 text-sm text-white/75">
          {start?.script || current?.subtitle}
        </p>
      </div>

      <SeekBar
        progress={player.progress}
        duration={player.duration}
        onBegin={player.beginSeek}
        onSeek={player.seekTo}
        onEnd={player.endSeek}
      />
    </div>
  );
}
