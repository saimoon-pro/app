import { useCallback, useRef } from 'react';
import { useStore } from '@/store/useStore';

export function useSound() {
  const soundEnabled = useStore((s) => s.soundEnabled);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playHoverTick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getContext();
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
  }, [soundEnabled, getContext]);

  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getContext();
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
  }, [soundEnabled, getContext]);

  const playPanelOpen = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getContext();
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
  }, [soundEnabled, getContext]);

  const playConfirm = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getContext();
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
  }, [soundEnabled, getContext]);

  return { playHoverTick, playClick, playPanelOpen, playConfirm };
}
