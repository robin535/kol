"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Lang } from "../data";
import { BACKGROUND_MUSIC } from "./util";

/* Background music: one looping track, started on the first user gesture,
   paused whenever the tab is hidden. Mirrors the source player. */
function useBackgroundMusic(active: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!active) return;
    const audio = new Audio();
    audio.preload = "metadata";
    audio.loop = true;
    audio.volume = 0.4;
    audio.src = audio.canPlayType('audio/mp4; codecs="mp4a.40.2"')
      ? BACKGROUND_MUSIC.m4a
      : BACKGROUND_MUSIC.mp3;
    audioRef.current = audio;
    const onPlaying = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    const onVisibility = () => {
      if (document.hidden) audio.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    void audio.play().catch(() => setPlaying(false));
    return () => {
      audio.pause();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      document.removeEventListener("visibilitychange", onVisibility);
      audioRef.current = null;
    };
  }, [active]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, []);

  return { playing, toggle };
}

export function MusicToggle({ lang }: { lang: Lang }) {
  const [started, setStarted] = useState(false);
  const { playing, toggle } = useBackgroundMusic(started);
  const label =
    lang === "zh" ? (playing ? "关闭音乐" : "播放歌曲") : playing ? "Turn music off" : "Play music";

  return (
    <button
      type="button"
      className="music-toggle"
      aria-pressed={playing}
      aria-label={label}
      title={label}
      onClick={() => {
        if (!started) setStarted(true);
        else toggle();
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 17V5l11-2v12M9 8l11-2" />
        <ellipse cx="6" cy="18" rx="3" ry="2" />
        <ellipse cx="17" cy="16" rx="3" ry="2" />
        <path className="music-slash" d="M3 3l18 18" style={{ opacity: playing ? 0 : 1 }} />
      </svg>
    </button>
  );
}
