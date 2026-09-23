/** Persistent <video> nodes so swipe and /watch reuse the same decoder. */

const pool: HTMLVideoElement[] = [];
let activeSlot = 0;
let lastSrc = "";

function makeVideo(): HTMLVideoElement {
  const v = document.createElement("video");
  v.playsInline = true;
  v.muted = true;
  v.defaultMuted = true;
  v.preload = "auto";
  v.setAttribute("playsinline", "");
  v.setAttribute("webkit-playsinline", "");
  v.setAttribute("muted", "");
  v.className = "h-full w-full object-cover";
  v.style.cssText =
    "width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;background:#000";
  return v;
}

export function poolVideo(slot: number): HTMLVideoElement {
  if (!pool[slot]) pool[slot] = makeVideo();
  return pool[slot];
}

export function setActiveSlot(slot: number) {
  activeSlot = slot;
}

export function getActiveSlot() {
  return activeSlot;
}

export function rememberSrc(src: string) {
  lastSrc = src;
}

export function lastPlayedSrc() {
  return lastSrc;
}

export function findSlotBySrc(src: string): number {
  for (let i = 0; i < pool.length; i++) {
    if (pool[i]?.getAttribute("src") === src) return i;
  }
  return -1;
}

function parkingLot(): HTMLElement {
  let el = document.getElementById("il-video-park");
  if (!el) {
    el = document.createElement("div");
    el.id = "il-video-park";
    el.setAttribute("aria-hidden", "true");
    el.style.cssText =
      "position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-99px;top:-99px";
    document.body.appendChild(el);
  }
  return el;
}

export function attachVideo(host: HTMLElement, slot: number): HTMLVideoElement {
  const v = poolVideo(slot);
  if (v.parentElement !== host) host.appendChild(v);
  return v;
}

export function parkVideos() {
  if (typeof document === "undefined") return;
  const park = parkingLot();
  for (const v of pool) {
    if (v && v.parentElement !== park) park.appendChild(v);
  }
}

export function loadSrc(video: HTMLVideoElement, url: string, poster?: string) {
  if (video.getAttribute("src") === url) return false;
  video.src = url;
  if (poster) video.poster = poster;
  video.load();
  return true;
}

export function pausePool() {
  for (const v of pool) {
    if (!v) continue;
    v.pause();
    v.autoplay = false;
  }
}
