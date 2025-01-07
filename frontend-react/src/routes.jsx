import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import GameMode from "./pages/GameMode";
import Game from "./pages/Game";
import Auth from "./pages/Auth";
import { ThemeToggle } from "./components/theme/theme-toggle";

export default function AppRoutes() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Navbar />
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game-mode" element={<GameMode />} />
          <Route path="/game" element={<Game />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>

      <footer className="border-t bg-background">
        <div className="container flex h-14 items-center justify-center text-sm text-muted-foreground">
          © 2024 BrainBlitz. Tous droits réservés.
        </div>
      </footer>
    </>
  );
} 