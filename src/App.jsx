import React, { useState } from 'react';
import AccessibilityModal from './components/AccessibilityModal';

function App() {
  const [mode, setMode] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50">
   
      {!mode && <AccessibilityModal onSelectMode={(selected) => setMode(selected)} />}

      {mode && (
        <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 md:p-10 animate-in zoom-in duration-700">
          <div className="w-full max-w-3xl bg-blue-100 p-6 sm:p-10 md:p-12 rounded-3xl sm:rounded-[40px] md:rounded-[50px] text-center border-2 sm:border-4 border-blue-200 shadow-xl mx-auto">
             
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-3 sm:mb-4">
               Selamat Belajar! 🎉
             </h1>
             
             <p className="text-lg sm:text-xl md:text-2xl text-blue-700 font-medium leading-relaxed">
               Anda sekarang dalam mode: <br className="block sm:hidden" />
               <span className="inline-block mt-2 sm:mt-0 sm:ml-2 font-bold underline decoration-yellow-400 decoration-4 capitalize">
                 {mode.replace('_', ' ')}
               </span>
             </p>

            
             <button 
               onClick={() => setMode(null)}
               className="mt-8 sm:mt-10 px-6 py-2 sm:px-8 sm:py-3 bg-white hover:bg-blue-50 text-blue-800 font-bold rounded-full shadow-md transition-all hover:scale-105 active:scale-95 text-sm sm:text-base border border-blue-200"
             >
               Ganti Mode
             </button>

          </div>
        </main>
      )}
    </div>
  );
}

export default App;