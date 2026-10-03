import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface DarkThemeContextData {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const DarkThemeContext = createContext<DarkThemeContextData | undefined>(
  undefined,
);

interface DarkThemeProviderProps {
  children: React.ReactNode;
}

export const DarkThemeProvider: React.FC<DarkThemeProviderProps> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDarkMode);

    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((previousTheme) => !previousTheme);
  };

  const value = useMemo(
    () => ({
      isDarkMode,
      toggleTheme,
    }),
    [isDarkMode],
  );

  return (
    <DarkThemeContext.Provider value={value}>
      {children}
    </DarkThemeContext.Provider>
  );
};

export const useDarkTheme = (): DarkThemeContextData => {
  const context = useContext(DarkThemeContext);

  if (!context) {
    throw new Error(
      "useDarkTheme deve ser utilizado dentro de um DarkThemeProvider.",
    );
  }

  return context;
};
