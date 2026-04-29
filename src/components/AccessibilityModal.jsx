import React, { useState, useEffect, useRef } from 'react';

export default function AccessibilityModal({ onSelectMode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [subtitle, setSubtitle] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const recognitionRef = useRef(null);

  const options = [
    { id: 'tuna_netra', label: 'Tuna Netra', icon: '👁️', color: 'bg-blue-100 text-blue-900', desc: 'Navigasi Suara' },
    { id: 'tuna_rungu', label: 'Tuna Rungu', icon: '👂', color: 'bg-teal-100 text-teal-900', desc: 'Visual & Teks' },
    { id: 'tuna_grahita', label: 'Tuna Grahita', icon: '🧸', color: 'bg-orange-100 text-orange-900', desc: 'Bahasa Sederhana' },
    { id: 'autis', label: 'Autis', icon: '🧩', color: 'bg-purple-100 text-purple-900', desc: 'Struktur Jelas' },
    { id: 'tuna_daksa', label: 'Tuna Daksa', icon: '♿', color: 'bg-rose-100 text-rose-900', desc: 'Akses Motorik' },
  ];

  const speak = (text, onFinish) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    
    setSubtitle(text);
    
    // Menunggu suara selesai sebelum menjalankan callback
    if (onFinish) {
      utterance.onend = onFinish;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'id-ID';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Input Suara:", transcript);


      if (transcript.includes("netra")) handleSelect('tuna_netra');
      else if (transcript.includes("rungu")) handleSelect('tuna_rungu');
      else if (transcript.includes("grahita")) handleSelect('tuna_grahita');
      else if (transcript.includes("autis")) handleSelect('autis');
      else if (transcript.includes("daksa") || transcript.includes("motorik")) handleSelect('tuna_daksa');
    };

    recognition.onerror = () => {
      setTimeout(() => recognition.start(), 1000);
    };

    recognition.start();
  };

  const handleSelect = (id) => {
    const selected = options.find(opt => opt.id === id);
    speak(`Mode ${selected.label} dipilih. Memuat halaman.`, () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsOpen(false);
      onSelectMode(id);
    });
  };

  const activateSystem = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      const introText = "Halo, selamat datang. Silakan sebutkan atau klik pilihan kebutuhan Anda. Ada Tuna Netra, Tuna Rungu, Tuna Grahita, Autis, dan Tuna Daksa.";
      speak(introText);
      startListening();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-3 sm:p-6"
          onClick={activateSystem}
        >
          <div className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto bg-white shadow-2xl rounded-3xl sm:rounded-[40px] p-5 sm:p-8 md:p-12 border-2 sm:border-4 border-blue-200 hide-scrollbar">
            
            <div className="text-center mb-6 sm:mb-10 mt-2 sm:mt-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 mb-3 sm:mb-4">
                Pilih Mode Belajar 🚀
              </h1>
              {!hasInteracted && (
                <div className="inline-block px-4 sm:px-6 py-2 bg-yellow-400 text-yellow-900 text-sm sm:text-base font-bold rounded-full animate-bounce">
                  Klik di mana saja untuk mulai
                </div>
              )}
            </div>


            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={(e) => {
                    e.stopPropagation(); 
                    handleSelect(opt.id);
                  }}
                 
                  className={`flex-grow sm:flex-grow-0 w-[45%] sm:w-[30%] flex flex-col items-center p-4 sm:p-6 rounded-2xl sm:rounded-[30px] transition-all hover:scale-105 active:scale-95 ${opt.color} border-b-4 sm:border-b-8 border-black/10`}
                >
                  <span className="text-4xl sm:text-5xl mb-2 sm:mb-4">{opt.icon}</span>
                  <span className="font-bold text-base sm:text-lg">{opt.label}</span>
                  <span className="text-[10px] sm:text-xs opacity-80 mt-1 text-center">{opt.desc}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-slate-50 rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-200 relative">
              <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6 px-2 sm:px-4 bg-white text-slate-400 text-xs sm:text-sm font-bold flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                SISTEM:
              </div>
              <p className="text-lg sm:text-xl md:text-2xl text-center font-medium text-slate-700 italic mt-2">
                "{subtitle || "..."}"
              </p>
            </div>

            {isListening && (
              <div className="mt-4 sm:mt-6 flex justify-center items-center gap-2 sm:gap-3 text-green-600">
                <div className="flex gap-1">
                  <div className="w-1 h-3 sm:h-4 bg-green-500 animate-bounce"></div>
                  <div className="w-1 h-5 sm:h-6 bg-green-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-3 sm:h-4 bg-green-500 animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-xs sm:text-sm font-bold tracking-widest uppercase">Mikrofon Aktif</span>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}