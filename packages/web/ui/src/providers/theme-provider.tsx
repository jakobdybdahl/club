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

const themingIsDisabled = false;

const initialState: ThemeState = {
  syncWithSystem: true,
  theme:
    !themingIsDisabled &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light",
};

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set) => ({
      ...initialState,
      setTheme: (theme) => set({ theme: themingIsDisabled ? "light" : theme }),
      setSyncWithSystem: (syncWithSystem) => set({ syncWithSystem }),
    }),
    {
      name: "px.theme",
    }
  )
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

export const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore((state) => ({
    ...state,
  }));

  const otherTheme: Theme = theme === "light" ? "dark" : "light";

  const toggleTheme = () => {
    setTheme(otherTheme);
  };

  return <div onClick={toggleTheme}>{otherTheme}</div>;
};

export const useTheme = (): Theme => {
  return useThemeStore((state) => state.theme);
};
