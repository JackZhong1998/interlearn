"use client";

import { useRef, useState } from "react";

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeech(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function PromptBar({
  onSubmit,
  placeholder = "输入或说话，跳下一条",
}: {
  onSubmit: (text: string) => void;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState("");
  const recRef = useRef<SpeechRec | null>(null);

  function send(text: string) {
    const t = text.trim();
    setValue("");
    setHint("");
    onSubmit(t);
  }

  function startVoice() {
    const Ctor = getSpeech();
    if (!Ctor) {
      setHint("当前浏览器不支持语音，请打字");
      return;
    }
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    const rec = new Ctor();
    rec.lang = "zh-CN";
    rec.interimResults = false;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript || "";
      setListening(false);
      if (text.trim()) send(text);
    };
    rec.onerror = () => {
      setListening(false);
      setHint("没听清，再试一次或打字");
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    setHint("");
    try {
      rec.start();
    } catch {
      setListening(false);
      setHint("语音启动失败，请打字");
    }
  }

  return (
    <div data-player-ui className="absolute inset-x-3 bottom-[3.85rem] z-50">
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(value);
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (e.nativeEvent.isComposing || e.keyCode === 229) return;
            e.preventDefault();
            send(value);
          }}
          placeholder={placeholder}
          enterKeyHint="send"
          autoComplete="off"
          name="prompt"
          className="h-10 min-w-0 flex-1 rounded-full border border-white/15 bg-black/55 px-4 text-sm text-white outline-none placeholder:text-white/40 backdrop-blur-md"
        />
        <button type="submit" className="sr-only">
          下一条
        </button>
        <button
          type="button"
          aria-label="语音输入"
          onClick={startVoice}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 backdrop-blur-md ${
            listening ? "bg-white text-black" : "bg-black/55 text-white"
          }`}
        >
          <MicIcon pulse={listening} />
        </button>
      </form>
      {hint ? <div className="mt-1 px-3 text-[11px] text-white/55">{hint}</div> : null}
    </div>
  );
}

function MicIcon({ pulse }: { pulse: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className={pulse ? "animate-pulse" : ""}>
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V21h2v-3.1A7 7 0 0 0 19 11h-2z" />
    </svg>
  );
}
