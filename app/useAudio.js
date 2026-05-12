// useAudio.js
"use client";

import { useState, useCallback } from 'react';

export function useAudio() {
  // Browsers require audio to start muted until the user interacts
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Core function that clones audio nodes to allow rapid-fire overlapping
  const playSound = useCallback((src, volume = 0.5) => {
    if (!isAudioEnabled) return;

    try {
      // By creating a NEW Audio object every time, sounds can safely overlap
      // without cutting each other off, creating a smooth "rapid fire" effect.
      const audio = new Audio(src);
      audio.volume = volume;

      audio.play().catch(err => {
        console.warn("Audio play blocked by browser. User must interact first.", err);
      });
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  }, [isAudioEnabled]);

  // Specific sound triggers
  const playFollowSound = useCallback(() => playSound('/sounds/follow.mp3', 0.4), [playSound]);
  const playPopSound = useCallback(() => playSound('/sounds/pop.mp3', 0.6), [playSound]);
  const playExplosionSound = useCallback(() => playSound('/sounds/explosion.mp3', 0.9), [playSound]);

  return {
    isAudioEnabled,
    setIsAudioEnabled,
    playFollowSound,
    playPopSound,
    playExplosionSound
  };
}
