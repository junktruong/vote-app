"use client";

import { useCallback, useEffect, useRef } from "react";

type UsePageMusicOptions = {
  enabled?: boolean;
  backgroundEnabled?: boolean;
  revealEnabled?: boolean;
  backgroundSrc?: string;
  revealSrc?: string;
  backgroundVolume?: number;
  revealVolume?: number;
};

const DEFAULT_BACKGROUND_SRC = "/music/spin.mp3";
const DEFAULT_REVEAL_SRC = "/music/winner.mp3";

export function usePageMusic(options: UsePageMusicOptions = {}) {
  const {
    enabled = true,
    backgroundEnabled = true,
    revealEnabled = true,
    backgroundSrc = DEFAULT_BACKGROUND_SRC,
    revealSrc = DEFAULT_REVEAL_SRC,
    backgroundVolume = 0.28,
    revealVolume = 0.9,
  } = options;

  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const revealAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled || !backgroundEnabled || !backgroundSrc || typeof window === "undefined") return;

    const backgroundAudio = new Audio(backgroundSrc);
    backgroundAudio.loop = true;
    backgroundAudio.preload = "auto";
    backgroundAudio.volume = backgroundVolume;

    backgroundAudioRef.current = backgroundAudio;

    const playBackground = () => {
      backgroundAudio.play().catch(() => {});
    };

    playBackground();

    const unlockAudio = () => {
      playBackground();
    };

    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      backgroundAudio.pause();
      backgroundAudio.currentTime = 0;
      backgroundAudioRef.current = null;
    };
  }, [enabled, backgroundEnabled, backgroundSrc, backgroundVolume]);

  useEffect(() => {
    if (!enabled || !revealEnabled || !revealSrc || typeof window === "undefined") return;

    const revealAudio = new Audio(revealSrc);
    revealAudio.loop = false;
    revealAudio.preload = "auto";
    revealAudio.volume = revealVolume;
    revealAudioRef.current = revealAudio;

    return () => {
      revealAudio.pause();
      revealAudio.currentTime = 0;
      revealAudioRef.current = null;
    };
  }, [enabled, revealEnabled, revealSrc, revealVolume]);

  const playReveal = useCallback(() => {
    const revealAudio = revealAudioRef.current;
    if (!revealAudio) return;
    revealAudio.currentTime = 0;
    revealAudio.play().catch(() => {});
  }, []);

  return { playReveal };
}
