import React, { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

type ThemeState = {
  syncWithSystem: boolean;
  theme: Theme;
};

type ThemeActions = {
  setTheme: (theme: Theme) => void;
  setSyncWithSystem: (syncWithSystem: boolean) => void;
};

const initialState: ThemeState = {
  syncWithSystem: true,
  theme: window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light",
};

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set) => ({
      ...initialState,
      setTheme: (theme) => set({ theme }),
      setSyncWithSystem: (syncWithSystem) => set({ syncWithSystem }),
    }),
    {
      name: "app.theme",
    },
  ),
);

const useThemeDetector = () => {
  const getCurrentTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [isDarkTheme, setIsDarkTheme] = useState(getCurrentTheme());

  const mqListener = (e: MediaQueryListEvent) => {
    setIsDarkTheme(e.matches);
  };

  useEffect(() => {
    const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");

    darkThemeMq.addEventListener("change", mqListener);

    return () => darkThemeMq.removeEventListener("change", mqListener);
  }, []);

  return isDarkTheme;
};

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) => {
  const { theme, setTheme, syncWithSystem } = useThemeStore();

  const systemIsDark = useThemeDetector();

  useEffect(() => {
    const themeToSet = theme;
    const root = window.document.documentElement;
    root.classList.remove(themeToSet === "dark" ? "light" : "dark");
    root.classList.add(themeToSet);
    root.style.colorScheme = themeToSet;
  }, [theme]);

  useEffect(() => {
    if (syncWithSystem) {
      const themeToSet: Theme = systemIsDark ? "dark" : "light";
      setTheme(themeToSet);
    }
  }, [syncWithSystem, systemIsDark, setTheme]);

  return children;
};

export const useTheme = () => {
  return useThemeStore((state) => [state.theme, state.setTheme] as const);
};
