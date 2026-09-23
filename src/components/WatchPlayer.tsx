"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Clip, Series, Teacher } from "@/lib/types";
import { TeacherSheet } from "./TeacherSheet";
import { autoplay, loadPaused, markUserPaused, tryUnmute } from "@/lib/autoplay";
import { useShortPlayer } from "@/lib/use-short-player";
import {
  attachVideo,
  findSlotBySrc,
  getActiveSlot,
  loadSrc,
  parkVideos,
  pausePool,
  rememberSrc,
  setActiveSlot,
} from "@/lib/video-pool";
import { PauseFlash, SeekBar, SpeedBadge } from "./SeekBar";
import { PromptBar } from "./PromptBar";

export function WatchPlayer({
  series,
  teachers,
  startEnded,
}: {
  series: Series;
  teachers: Teacher[];
  startEnded: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [clipId, setClipId] = useState(series.startClipId);
  const [ended, setEnded] = useState(startEnded);
  const [bindId, setBindId] = useState(0);
  const [teacher, setTeacher] = useState(teachers[0]);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState("");
  const [muted, setMuted] = useState(true);
  const player = useShortPlayer(videoRef, { attachKey: bindId, autoResume: false });

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("ended") === "1") setEnded(true);
  }, []);

  const clip: Clip | undefined = series.clips[clipId] ?? series.clips[series.startClipId];

  useLayoutEffect(() => {
    const host = hostRef.current;
    const url = clip?.video;
    if (!host || !url) return;
    let slot = findSlotBySrc(url);
    if (slot < 0) slot = getActiveSlot();
    pausePool();
    const v = attachVideo(host, slot);
    videoRef.current = v;
    setActiveSlot(slot);
    rememberSrc(url);
    loadPaused(v, url, clip?.poster || series.cover);
    setMuted(v.muted);
    setBindId((n) => n + 1);
    return () => {
      parkVideos();
    };
    // mount only — keep the already-decoded start clip
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => setEnded(true);
    const onPlay = () => setMuted(v.muted);
    v.addEventListener("ended", onEnded);
    v.addEventListener("play", onPlay);
    return () => {
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("play", onPlay);
    };
  }, [bindId]);

  useEffect(() => {
    if (!clip) return;
    clip.choices.forEach((c) => {
      const next = series.clips[c.nextClipId];
      if (next?.video) {
        const el = document.createElement("video");
        el.preload = "auto";
        el.src = next.video;
      }
    });
  }, [clip, series]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function playClip(nextId: string) {
    const next = series.clips[nextId];
    if (!next?.video) return;
    setEnded(false);
    setClipId(nextId);
    const v = videoRef.current;
    if (!v) return;
    markUserPaused(v, false);
    v.currentTime = 0;
    player.resetRate();
    loadSrc(v, next.video, next.poster);
    rememberSrc(next.video);
    autoplay(v, next.video, next.poster);
    tryUnmute(v);
    setMuted(v.muted);
  }

  function jumpNext() {
    const choices = clip?.choices ?? [];
    if (choices[0]) {
      playClip(choices[0].nextClipId);
      return;
    }
    const ids = Object.keys(series.clips);
    const at = ids.indexOf(clipId);
    const fallback = ids[at + 1] || ids[0];
    if (fallback && fallback !== clipId) playClip(fallback);
    else setToast("已经是最后一条");
  }

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
      <div ref={hostRef} className="absolute inset-0 bg-black" />

      <PauseFlash kind={player.flash} />
      <SpeedBadge rate={player.rate} holding={player.holding} locked={player.locked} />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <Link
        data-player-ui
        href="/"
        prefetch
        className="absolute left-3 top-[max(12px,env(safe-area-inset-top))] z-[70] rounded-full bg-black/55 px-3 py-1.5 text-xs backdrop-blur"
      >
        返回首页
      </Link>
      <button
        data-player-ui
        type="button"
        onClick={() => {
          const v = videoRef.current;
          if (!v) return;
          v.muted = !v.muted;
          setMuted(v.muted);
        }}
        className="absolute right-28 top-[max(12px,env(safe-area-inset-top))] z-[70] rounded-full bg-black/55 px-2.5 py-1.5 text-[11px] backdrop-blur"
      >
        {muted ? "声音关" : "声音开"}
      </button>
      <button
        data-player-ui
        type="button"
        onClick={() => setSheet(true)}
        className="absolute right-3 top-[max(12px,env(safe-area-inset-top))] z-[70] flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1.5 text-xs backdrop-blur"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={teacher.image} alt="" className="h-6 w-6 rounded-full object-cover" />
        换老师
      </button>

      {!ended ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[8.6rem] z-20 px-5">
          <div className="mt-1 text-xl font-semibold">{clip?.title}</div>
          <p className="mt-1 line-clamp-3 text-sm text-white/75">{clip?.script}</p>
        </div>
      ) : (
        <div data-player-ui className="absolute inset-x-0 bottom-[7.2rem] z-30 px-4">
          <div className="mb-2 text-center text-xs text-white/70">
            在这一页选。点哪条，立刻播下一条真实教学片。
          </div>
          <div className="space-y-2">
            {(clip?.choices ?? []).map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => playClip(c.nextClipId)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/20 bg-black/55 px-3 py-3 text-left backdrop-blur-md"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-semibold text-black">
                  {"ABC"[i]}
                </span>
                <span>
                  <span className="block text-sm font-medium">{c.label}</span>
                  <span className="block text-xs text-white/55">{c.hint}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <SeekBar
        progress={player.progress}
        duration={player.duration}
        onBegin={player.beginSeek}
        onSeek={player.seekTo}
        onEnd={player.endSeek}
        className={ended ? "bottom-[16.6rem]" : "bottom-[7.35rem]"}
      />

      <PromptBar onSubmit={() => jumpNext()} />

      {toast ? (
        <div className="absolute left-1/2 top-24 z-40 -translate-x-1/2 rounded-full bg-white px-3 py-1.5 text-xs text-black">
          {toast}
        </div>
      ) : null}

      <TeacherSheet
        open={sheet}
        teachers={teachers}
        selectedId={teacher.id}
        onClose={() => setSheet(false)}
        onSelect={(t) => {
          setTeacher(t);
          setSheet(false);
          setToast(`后续镜头将以「${t.name} · ${t.tag}」为参考`);
        }}
      />
    </div>
  );
}
