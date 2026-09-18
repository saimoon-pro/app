import { create } from 'zustand';
import type { OrbitNodeId, ChatMessage, ContentItem } from '@/types/content';

interface AppState {
  // Active orbit node (which content panel is open)
  activeNode: OrbitNodeId | null;
  setActiveNode: (node: OrbitNodeId | null) => void;

  // Sound toggle
  soundEnabled: boolean;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;

  // Reduced motion preference
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;

  // AI Assistant state
  aiChatOpen: boolean;
  setAiChatOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // Content from CMS
  content: ContentItem[];
  setContent: (content: ContentItem[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Custom cursor
  cursorPos: { x: number; y: number };
  setCursorPos: (pos: { x: number; y: number }) => void;
  cursorHover: boolean;
  setCursorHover: (hover: boolean) => void;

  // Panel animation state
  panelAnimating: boolean;
  setPanelAnimating: (animating: boolean) => void;

  // Back button override hook
  backOverride: (() => boolean) | null;
  setBackOverride: (callback: (() => boolean) | null) => void;

  // 3D Gear Regulator (1-6)
  currentRegulator: number;
  setCurrentRegulator: (regulator: number) => void;

  // Intro Welcome Video
  introCompleted: boolean;
  setIntroCompleted: (completed: boolean) => void;

  // Resume Modal
  resumeModalOpen: boolean;
  setResumeModalOpen: (open: boolean) => void;

  // 24-Hour Celestial Time System (0.0 to 24.0)
  timeOfDay: number;
  setTimeOfDay: (time: number) => void;
  isAutoClock: boolean;
  setIsAutoClock: (auto: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  activeNode: null,
  setActiveNode: (node) => set({ activeNode: node }),

  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  setSoundEnabled: (enabled: boolean) => set({ soundEnabled: enabled }),

  reducedMotion: false,
  setReducedMotion: (value) => set({ reducedMotion: value }),

  aiChatOpen: false,
  setAiChatOpen: (open) => set({ aiChatOpen: open }),
  chatMessages: [],
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  clearChat: () => set({ chatMessages: [] }),

  content: [],
  setContent: (content) => set({ content }),
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),

  cursorPos: { x: 0, y: 0 },
  setCursorPos: (pos) => set({ cursorPos: pos }),
  cursorHover: false,
  setCursorHover: (hover) => set({ cursorHover: hover }),

  panelAnimating: false,
  setPanelAnimating: (animating) => set({ panelAnimating: animating }),

  backOverride: null,
  setBackOverride: (callback) => set({ backOverride: callback }),

  currentRegulator: 1,
  setCurrentRegulator: (regulator) => set({ currentRegulator: regulator }),

  introCompleted: false,
  setIntroCompleted: (completed) => set({ introCompleted: completed }),

  resumeModalOpen: false,
  setResumeModalOpen: (open) => set({ resumeModalOpen: open }),

  // Default mode is Day Mode always (12:30 PM High Noon)
  timeOfDay: 12.5,
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  isAutoClock: false,
  setIsAutoClock: (auto) => set({ isAutoClock: auto }),
}));

