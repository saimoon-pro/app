import { useCallback } from 'react';
import { useStore } from '@/store/useStore';

// Global shared AudioContext and interaction tracking
let sharedAudioContext: AudioContext | null = null;
let hasUserInteracted = false;

// Listen for first genuine user gesture to unlock Web Audio
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    hasUserInteracted = true;
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {});
    }
  };

  window.addEventListener('pointerdown', unlockAudio, { capture: true, once: true });
  window.addEventListener('keydown', unlockAudio, { capture: true, once: true });
  window.addEventListener('touchstart', unlockAudio, { capture: true, once: true });
  window.addEventListener('click', unlockAudio, { capture: true, once: true });
}

function getSafeAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !hasUserInteracted) return null;
  try {
    if (!sharedAudioContext) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        sharedAudioContext = new AudioCtx();
      }
    }
    if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {});
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

export function useSound() {
  const soundEnabled = useStore((s) => s.soundEnabled);

  const playHoverTick = useCallback(() => {
    if (!soundEnabled || !hasUserInteracted) return;
    try {
      const ctx = getSafeAudioContext();
      if (!ctx || ctx.state !== 'running') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 2000;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } catch { /* silent fail */ }
  }, [soundEnabled]);

  const playClick = useCallback(() => {
    // A click IS a user interaction, so we can ensure unlock
    hasUserInteracted = true;
    if (!soundEnabled) return;
    try {
      const ctx = getSafeAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch { /* silent fail */ }
  }, [soundEnabled]);

  const playPanelOpen = useCallback(() => {
    hasUserInteracted = true;
    if (!soundEnabled) return;
    try {
      const ctx = getSafeAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 400;
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* silent fail */ }
  }, [soundEnabled]);

  const playConfirm = useCallback(() => {
    hasUserInteracted = true;
    if (!soundEnabled) return;
    try {
      const ctx = getSafeAudioContext();
      if (!ctx) return;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.frequency.value = 523;
      osc2.frequency.value = 659;
      osc1.type = 'sine';
      osc2.type = 'sine';
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.2);
    } catch { /* silent fail */ }
  }, [soundEnabled]);

  return { playHoverTick, playClick, playPanelOpen, playConfirm };
}
