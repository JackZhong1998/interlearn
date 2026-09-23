"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isUserPaused, markUserPaused } from "./autoplay";

const HOLD_MS = 380;
const SERIES_PX = 52;
const RATE_PX = 32;
const HOLD_RATE = 2;
const UP_RATE = 3;
const DOWN_RATE = 1.5;

export function useShortPlayer(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  opts: { onSeriesSwipe?: (dir: 1 | -1) => void } = {},
) {
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [holding, setHolding] = useState(false);
  const [locked, setLocked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [flash, setFlash] = useState<"pause" | "play" | null>(null);

  const lockedRef = useRef(false);
  const lockedRateRef = useRef(1);
  const holdTimer = useRef<number>(0);
  const start = useRef({ x: 0, y: 0, t: 0 });
  const mode = useRef<"idle" | "pending" | "hold">("idle");
  const swipedRate = useRef(false);
  const seeking = useRef(false);
  const seriesCb = useRef(opts.onSeriesSwipe);
  seriesCb.current = opts.onSeriesSwipe;

  const applyRate = useCallback((next: number, lock: boolean) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = next;
    setRate(next);
    if (lock) {
      lockedRef.current = true;
      lockedRateRef.current = next;
      setLocked(true);
    }
  }, [videoRef]);

  const resetRate = useCallback(() => {
    lockedRef.current = false;
    lockedRateRef.current = 1;
    setLocked(false);
    applyRate(1, false);
  }, [applyRate]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      setProgress(v.currentTime);
      setDuration(v.duration || 0);
      setPaused(v.paused);
    };
    const onMeta = () => setDuration(v.duration || 0);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("durationchange", onMeta);
    v.addEventListener("play", onTime);
    v.addEventListener("pause", onTime);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("durationchange", onMeta);
      v.removeEventListener("play", onTime);
      v.removeEventListener("pause", onTime);
    };
  });

  const togglePause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      markUserPaused(v, false);
      void v.play().catch(() => undefined);
      setPaused(false);
      setFlash("play");
    } else {
      markUserPaused(v, true);
      v.pause();
      setPaused(true);
      setFlash("pause");
    }
    window.setTimeout(() => setFlash(null), 520);
  }, [videoRef]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button != null && e.button !== 0) return;
      if ((e.target as HTMLElement).closest("[data-player-ui]")) return;
      const v = videoRef.current;
      if (!v) return;
      start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      mode.current = "pending";
      swipedRate.current = false;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      window.clearTimeout(holdTimer.current);
      holdTimer.current = window.setTimeout(() => {
        mode.current = "hold";
        setHolding(true);
        markUserPaused(v, false);
        const next = lockedRef.current ? lockedRateRef.current : HOLD_RATE;
        applyRate(next, false);
        void v.play().catch(() => undefined);
        setPaused(false);
      }, HOLD_MS);
    },
    [applyRate, videoRef],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (mode.current === "idle") return;
      const dy = e.clientY - start.current.y;
      if (mode.current === "pending" && Math.abs(dy) >= SERIES_PX) {
        window.clearTimeout(holdTimer.current);
        mode.current = "idle";
        setHolding(false);
        const dir = dy > 0 ? -1 : 1;
        seriesCb.current?.(dir);
        return;
      }
      if (mode.current === "hold" && Math.abs(dy) >= RATE_PX) {
        const next = dy < 0 ? UP_RATE : DOWN_RATE;
        swipedRate.current = true;
        applyRate(next, true);
      }
    },
    [applyRate],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      window.clearTimeout(holdTimer.current);
      const was = mode.current;
      mode.current = "idle";
      setHolding(false);
      if (was === "pending") {
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        if (Math.hypot(dx, dy) < 14) togglePause();
        return;
      }
      if (was === "hold") {
        if (swipedRate.current) applyRate(lockedRateRef.current, true);
        else if (lockedRef.current) applyRate(lockedRateRef.current, true);
        else applyRate(1, false);
      }
    },
    [applyRate, togglePause],
  );

  const beginSeek = useCallback(() => {
    seeking.current = true;
    window.clearTimeout(holdTimer.current);
    mode.current = "idle";
  }, []);

  const seekTo = useCallback(
    (t: number) => {
      const v = videoRef.current;
      if (!v || !Number.isFinite(v.duration)) return;
      const next = Math.min(Math.max(t, 0), v.duration);
      v.currentTime = next;
      setProgress(next);
    },
    [videoRef],
  );

  const endSeek = useCallback(() => {
    seeking.current = false;
  }, []);

  const onUnexpectedPause = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const v = e.currentTarget;
      if (v.ended || isUserPaused(v) || seeking.current) return;
      void v.play().catch(() => undefined);
    },
    [],
  );

  const onCanPlay = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.paused && !isUserPaused(v) && !v.ended) void v.play().catch(() => undefined);
  }, []);

  return {
    paused,
    rate,
    holding,
    locked,
    progress,
    duration,
    flash,
    resetRate,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    beginSeek,
    seekTo,
    endSeek,
    onUnexpectedPause,
    onCanPlay,
  };
}

export function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
