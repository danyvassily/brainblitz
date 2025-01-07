import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./components/theme/theme-provider";
import { Toaster } from "./components/ui/toaster";
import AppRoutes from "./routes";
import { useEffect } from "react";

function App() {
  // Initialiser le thème système au chargement
  useEffect(() => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="brainblitz-theme">
      <Router>
        <div className="relative min-h-screen bg-background text-foreground antialiased">
          <AppRoutes />
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
