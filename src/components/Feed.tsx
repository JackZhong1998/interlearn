"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Series } from "@/lib/types";
import { autoplay, tryUnmute } from "@/lib/autoplay";
import { useShortPlayer } from "@/lib/use-short-player";
import {
  attachVideo,
  loadSrc,
  parkVideos,
  pausePool,
  poolVideo,
  rememberSrc,
  setActiveSlot,
} from "@/lib/video-pool";
import { PauseFlash, SeekBar, SpeedBadge } from "./SeekBar";

const SNAP_MS = 220;

export function Feed({ series }: { series: Series[] }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const host0 = useRef<HTMLDivElement>(null);
  const host1 = useRef<HTMLDivElement>(null);
  const host2 = useRef<HTMLDivElement>(null);
  const hosts = [host0, host1, host2];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);
  const [bindId, setBindId] = useState(0);
  const [muted, setMuted] = useState(true);
  const indexRef = useRef(0);
  const heightRef = useRef(700);
  const assignmentRef = useRef([-1, -1, -1]);
  const snappingRef = useRef(false);
  const swipeLock = useRef(0);

  const player = useShortPlayer(videoRef, {
    attachKey: bindId,
    autoResume: true,
    onSeriesDrag: (dy) => applyDrag(dy, false),
    onSeriesRelease: (dy) => handleRelease(dy),
  });

  function slotFor(i: number) {
    return ((i % 3) + 3) % 3;
  }

  function applyDrag(dy: number, transition: boolean) {
    const H = heightRef.current || 700;
    const idx = indexRef.current;
    for (let slot = 0; slot < 3; slot++) {
      const host = hosts[slot].current;
      if (!host) continue;
      const si = assignmentRef.current[slot];
      const y = si < 0 ? 0 : (si - idx) * H + dy;
      host.style.transition = transition
        ? `transform ${SNAP_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
        : "none";
      host.style.transform = `translate3d(0, ${Math.round(y)}px, 0)`;
      host.style.visibility = si < 0 ? "hidden" : "visible";
    }
  }

  function syncSlots(idx: number) {
    const nextAssign = [-1, -1, -1];
    for (const i of [idx - 1, idx, idx + 1]) {
      if (i < 0 || i >= series.length) continue;
      nextAssign[slotFor(i)] = i;
    }
    for (let slot = 0; slot < 3; slot++) {
      const host = hosts[slot].current;
      if (!host) continue;
      const si = nextAssign[slot];
      const v = attachVideo(host, slot);
      v.autoplay = si === idx;
      if (si < 0) {
        v.pause();
        continue;
      }
      const s = series[si];
      const clip = s.clips[s.startClipId];
      if (!clip?.video) continue;
      const changed = loadSrc(v, clip.video, clip.poster || s.cover);
      if (si !== idx) {
        v.pause();
        if (changed) v.currentTime = 0;
      }
    }
    assignmentRef.current = nextAssign;
    const currSlot = slotFor(idx);
    const curr = poolVideo(currSlot);
    videoRef.current = curr;
    setActiveSlot(currSlot);
    rememberSrc(series[idx]?.clips[series[idx].startClipId]?.video || "");
    setBindId((n) => n + 1);
  }

  function playAt(idx: number, unmute: boolean) {
    const s = series[idx];
    const clip = s?.clips[s.startClipId];
    const v = videoRef.current;
    if (!v || !clip?.video) return;
    v.currentTime = 0;
    player.resetRate();
    autoplay(v, clip.video, clip.poster || s.cover);
    if (unmute) {
      tryUnmute(v);
      setMuted(v.muted);
    }
  }

  function commit(next: number) {
    if (next < 0 || next >= series.length) return false;
    const from = indexRef.current;
    if (next === from) return false;
    const now = Date.now();
    if (now - swipeLock.current < 260) return false;
    swipeLock.current = now;
    snappingRef.current = true;
    const H = heightRef.current || 700;
    applyDrag((from - next) * H, true);
    window.setTimeout(() => {
      indexRef.current = next;
      syncSlots(next);
      applyDrag(0, false);
      setIndex(next);
      playAt(next, true);
      const s = series[next];
      if (s) router.prefetch(`/watch/${s.id}`);
      snappingRef.current = false;
    }, SNAP_MS);
    return true;
  }

  function handleRelease(dy: number) {
    if (snappingRef.current) return true;
    const H = heightRef.current || 700;
    const threshold = Math.min(88, H * 0.16);
    let dir = 0;
    if (dy <= -threshold) dir = 1;
    else if (dy >= threshold) dir = -1;
    const next = indexRef.current + dir;
    if (dir !== 0 && next >= 0 && next < series.length) {
      commit(next);
      return true;
    }
    if (Math.abs(dy) < 14) return false;
    snappingRef.current = true;
    applyDrag(0, true);
    window.setTimeout(() => {
      snappingRef.current = false;
    }, SNAP_MS);
    return true;
  }

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root) heightRef.current = root.clientHeight;
    syncSlots(0);
    applyDrag(0, false);
    playAt(0, false);
    for (const s of series) router.prefetch(`/watch/${s.id}`);
    const ro = new ResizeObserver(() => {
      if (root) heightRef.current = root.clientHeight;
      applyDrag(0, false);
    });
    if (root) ro.observe(root);
    return () => {
      ro.disconnect();
      pausePool();
      parkVideos();
    };
    // first paint only — slots persist
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => {
      if (snappingRef.current) return;
      const s = series[indexRef.current];
      if (!s) return;
      router.prefetch(`/watch/${s.id}`);
      router.push(`/watch/${s.id}?ended=1`);
    };
    const onPlay = () => setMuted(v.muted);
    v.addEventListener("ended", onEnded);
    v.addEventListener("play", onPlay);
    return () => {
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("play", onPlay);
    };
  }, [bindId, router, series]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest("[data-player-ui]")) return;
      if (Math.abs(e.deltaY) < 10) return;
      e.preventDefault();
      commit(indexRef.current + (e.deltaY > 0 ? 1 : -1));
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input,textarea")) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === "j") {
        e.preventDefault();
        commit(indexRef.current + 1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp" || e.key === "k") {
        e.preventDefault();
        commit(indexRef.current - 1);
      }
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [series]);

  const current = series[index];
  const start = current?.clips[current.startClipId];

  return (
    <div
      ref={rootRef}
      className="relative h-dvh w-full overflow-hidden bg-black"
      style={{ touchAction: "none" }}
      onPointerDown={player.onPointerDown}
      onPointerMove={player.onPointerMove}
      onPointerUp={player.onPointerUp}
      onPointerCancel={player.onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {[host0, host1, host2].map((ref, slot) => (
        <div
          key={slot}
          ref={ref}
          className="absolute inset-0 will-change-transform"
          style={{
            backfaceVisibility: "hidden",
            contain: "strict",
            transform: "translate3d(0,0,0)",
          }}
        />
      ))}

      <PauseFlash kind={player.flash} />
      <SpeedBadge rate={player.rate} holding={player.holding} locked={player.locked} />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/55 to-transparent" />

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
          if (!v.paused) void v.play();
        }}
        className="absolute right-3 top-[max(12px,env(safe-area-inset-top))] z-20 rounded-full bg-black/45 px-2.5 py-1 text-[11px] text-white/80"
      >
        {muted ? "声音关" : "声音开"}
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-[5.8rem] z-20 px-5">
        <div className="text-xl font-semibold">{start?.title || current?.title}</div>
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
        className="absolute inset-x-4 bottom-[4.55rem]"
      />
    </div>
  );
}
