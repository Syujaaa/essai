import React, { useState } from 'react';
import AccessibilityModal from './components/AccessibilityModal';

function App() {
  const [mode, setMode] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Modal ini akan menghalangi layar sepenuhnya sampai mode dipilih */}
      <AccessibilityModal onSelectMode={(selected) => setMode(selected)} />

      {/* Konten Web Utama */}
      {mode && (
        <main className="flex flex-col items-center justify-center min-h-screen p-10 animate-in zoom-in duration-700">
          <div className="bg-blue-100 p-10 rounded-[50px] text-center border-4 border-blue-200 shadow-xl">
             <h1 className="text-5xl font-black text-blue-900 mb-4">Selamat Belajar!</h1>
             <p className="text-2xl text-blue-700 font-medium">
               Anda sekarang dalam mode: <span className="underline decoration-yellow-400 decoration-4">{mode.replace('_', ' ')}</span>
             </p>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;