import { create } from 'zustand';

interface GlobalStateProps {
  showSidebar: boolean;
  setShowSidebar: (showSidebar: boolean) => void;
  toggleSidebar: () => void;

  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;

  isSettingsOpen: boolean;
  setIsSettingsOpen: (isSettingsOpen: boolean) => void;
}

export const GlobalState = create<GlobalStateProps>((set) => ({
  showSidebar: true,
  setShowSidebar: (showSidebar) => set({ showSidebar }),
  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),

  isLoggedIn: false,
  setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),

  isSettingsOpen: false,
  setIsSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
}));
