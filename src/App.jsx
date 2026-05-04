import React, { useState } from "react";
import AccessibilityModal from "./components/AccessibilityModal";
import Menu from "./components/Menu";
import StoryPage from "./components/StoryPage";
import GamePage from "./components/Game";
import FilmPage from "./components/FilmPage";
import CaseStudyPage from "./components/CaseStudyPage";
import GuidelinePage from "./components/GuidelinePage";

function App() {
  const [mode, setMode] = useState(null);
  const [activePage, setActivePage] = useState("home"); // 'home' atau 'cerita'

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {!mode && (
        <AccessibilityModal onSelectMode={(selected) => setMode(selected)} />
      )}

      {mode && activePage === "home" && (
        <Menu
          mode={mode}
          onResetMode={() => setMode(null)}
          onNavigate={(page) => setActivePage(page)}
        />
      )}

      {mode && activePage === "cerita" && (
        <StoryPage mode={mode} onBack={() => setActivePage("home")} />
      )}
      {mode && activePage === "game" && (
        <GamePage mode={mode} onBack={() => setActivePage("home")} />
      )}

      {mode && activePage === "film" && (
        <FilmPage mode={mode} onBack={() => setActivePage("home")} />
      )}

      {mode && activePage === "studi_kasus" && (
        <CaseStudyPage mode={mode} onBack={() => setActivePage("home")} />
      )}

      {mode && activePage === "panduan" && (
        <GuidelinePage mode={mode} onBack={() => setActivePage("home")} />
      )}
    </div>
  );
}

export default App;
