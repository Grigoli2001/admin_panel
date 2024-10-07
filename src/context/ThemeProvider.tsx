import { createContext, useState, ReactNode } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { PaletteMode } from "@mui/material";

// Define a ThemeContext to manage theme toggling
export const ThemeContext = createContext({
  toggleTheme: () => {},
  mode: "light" as PaletteMode, // Default to light mode
});

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<PaletteMode>("light");

  // Function to toggle between light and dark mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Create a theme based on the current mode (light or dark)
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // Customization for light mode (optional)
            background: {
              default: "#f5f5f5",
            },
          }
        : {
            // Customization for dark mode (optional)
            background: {
              default: "#121212",
            },
          }),
    },
  });

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      {/* Apply the theme to the whole app */}
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
