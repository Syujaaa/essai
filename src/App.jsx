import React, { useState } from 'react';
import AccessibilityModal from './components/AccessibilityModal';
import Menu from './components/Menu';

function App() {
  const [mode, setMode] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {!mode && <AccessibilityModal onSelectMode={(selected) => setMode(selected)} />}

      {mode && <Menu mode={mode} onResetMode={() => setMode(null)} />}
      
    </div>
  );
}

export default App;