import { create } from 'zustand';
import type { OrbitNodeId, ChatMessage, ContentItem } from '@/types/content';

interface AppState {
  // Active orbit node (which content panel is open)
  activeNode: OrbitNodeId | null;
  setActiveNode: (node: OrbitNodeId | null) => void;

  // Sound toggle
  soundEnabled: boolean;
  toggleSound: () => void;

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
}

export const useStore = create<AppState>((set) => ({
  activeNode: null,
  setActiveNode: (node) => set({ activeNode: node }),

  soundEnabled: false,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

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
}));
