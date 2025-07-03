import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import { getFromStorage, saveToStorage } from "./storage";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: (newTheme: Theme) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    border: string;
    primary: string;
    danger: string;
  };
}

const lightColors = {
  background: "#f8f9fa",
  card: "#ffffff",
  text: "#333333",
  border: "#e0e0e0",
  primary: "#3b82f6",
  danger: "#ff4444",
};

const darkColors = {
  background: "#121212",
  card: "#1e1e1e",
  text: "#f5f5f5",
  border: "#333333",
  primary: "#3b82f6",
  danger: "#ff4444",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("system");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load saved theme preference
    const loadTheme = async () => {
      const savedTheme = await getFromStorage("theme");
      if (savedTheme) {
        setTheme(savedTheme);
        updateDarkMode(savedTheme);
      } else {
        updateDarkMode("system");
      }
    };
    loadTheme();
  }, []);

  const updateDarkMode = (selectedTheme: Theme) => {
    if (selectedTheme === "system") {
      const systemColorScheme = Appearance.getColorScheme();
      setIsDarkMode(systemColorScheme === "dark");
    } else {
      setIsDarkMode(selectedTheme === "dark");
    }
  };

  const toggleTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    updateDarkMode(newTheme);
    await saveToStorage("theme", newTheme);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
