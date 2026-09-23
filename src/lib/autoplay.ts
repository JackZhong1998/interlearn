/** Start playback without a tap. Browsers allow muted autoplay; unmute after a gesture. */

const userPaused = new WeakSet<HTMLVideoElement>();

export function markUserPaused(video: HTMLVideoElement, paused: boolean) {
  if (paused) userPaused.add(video);
  else userPaused.delete(video);
}

export function isUserPaused(video: HTMLVideoElement) {
  return userPaused.has(video);
}

export function armInline(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("muted", "");
}

function kick(video: HTMLVideoElement) {
  if (isUserPaused(video)) return Promise.resolve(undefined);
  armInline(video);
  return video.play().catch(() => {
    if (isUserPaused(video)) return undefined;
    video.muted = true;
    return video.play().catch(() => undefined);
  });
}

export function autoplay(video: HTMLVideoElement, url: string, poster?: string) {
  markUserPaused(video, false);
  if (video.getAttribute("src") !== url) {
    video.src = url;
    if (poster) video.poster = poster;
    video.load();
  }
  armInline(video);
  if (video.readyState >= 2) void kick(video);
  else {
    video.addEventListener(
      "canplay",
      () => {
        if (!isUserPaused(video)) void kick(video);
      },
      { once: true },
    );
    video.addEventListener(
      "loadeddata",
      () => {
        if (!isUserPaused(video)) void kick(video);
      },
      { once: true },
    );
  }
  [160, 480, 1200].forEach((ms) => {
    window.setTimeout(() => {
      if (isUserPaused(video)) return;
      if (video.paused && video.getAttribute("src") === url) void kick(video);
    }, ms);
  });
}

export function loadPaused(video: HTMLVideoElement, url?: string, poster?: string) {
  markUserPaused(video, true);
  video.autoplay = false;
  video.removeAttribute("autoplay");
  if (url && video.getAttribute("src") !== url) {
    video.src = url;
    if (poster) video.poster = poster;
    video.load();
  }
  video.pause();
}

export function tryUnmute(video: HTMLVideoElement) {
  video.muted = false;
  void video.play().catch(() => {
    video.muted = true;
    if (video.paused && !isUserPaused(video)) void kick(video);
  });
}
