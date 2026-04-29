import React, { useState, useEffect, useRef } from 'react';

export default function AccessibilityModal({ onSelectMode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [subtitle, setSubtitle] = useState(""); // Tulisan yang dibacakan sistem
  const [isListening, setIsListening] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const recognitionRef = useRef(null);

  const options = [
    { id: 'tuna_netra', label: 'Tuna Netra', icon: '👁️', color: 'bg-blue-100 text-blue-900', desc: 'Navigasi Suara' },
    { id: 'tuna_rungu', label: 'Tuna Rungu', icon: '👂', color: 'bg-teal-100 text-teal-900', desc: 'Visual & Teks' },
    { id: 'tuna_grahita', label: 'Tuna Grahita', icon: '🧸', color: 'bg-orange-100 text-orange-900', desc: 'Bahasa Sederhana' },
    { id: 'autis', label: 'Autis', icon: '🧩', color: 'bg-purple-100 text-purple-900', desc: 'Struktur Jelas' },
  ];

  // Fungsi Narator (Text-to-Speech)
  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    
    // Update subtitle saat suara mulai
    setSubtitle(text);
    window.speechSynthesis.speak(utterance);
  };

  // Fungsi Mikrofon (Speech-to-Text) - Selalu Nyala
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'id-ID';
    recognition.continuous = true; // Mikrofon tetap menyala
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Input Suara:", transcript);

      if (transcript.includes("netra")) handleSelect('tuna_netra');
      else if (transcript.includes("rungu")) handleSelect('tuna_rungu');
      else if (transcript.includes("grahita")) handleSelect('tuna_grahita');
      else if (transcript.includes("autis")) handleSelect('autis');
    };

    recognition.onerror = () => {
      // Jika error (misal: diam terlalu lama), nyalakan lagi
      setTimeout(() => recognition.start(), 1000);
    };

    recognition.start();
  };

  const handleSelect = (id) => {
    const selected = options.find(opt => opt.id === id);
    speak(`Mode ${selected.label} dipilih. Memuat halaman.`);
    
    setTimeout(() => {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsOpen(false);
      onSelectMode(id);
    }, 2000);
  };

  const activateSystem = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      const introText = "Halo, selamat datang. Silakan sebutkan atau klik pilihan kebutuhan Anda. Ada Tuna Netra, Tuna Rungu, Tuna Grahita, dan Autis.";
      speak(introText);
      startListening();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4"
          onClick={activateSystem} // Memicu aktivasi pada klik pertama
        >
          <div className="relative w-full max-w-4xl bg-white shadow-2xl rounded-[40px] overflow-hidden p-8 md:p-12 border-4 border-blue-200">
            
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
                Pilih Mode Belajar 🚀
              </h1>
              {!hasInteracted && (
                <div className="inline-block px-6 py-2 bg-yellow-400 text-yellow-900 font-bold rounded-full animate-bounce">
                  Klik di mana saja untuk mulai suara
                </div>
              )}
            </div>

            {/* Grid Pilihan */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`flex flex-col items-center p-6 rounded-[30px] transition-all hover:scale-105 active:scale-95 ${opt.color} border-b-8 border-black/10`}
                >
                  <span className="text-5xl mb-4">{opt.icon}</span>
                  <span className="font-bold text-lg">{opt.label}</span>
                  <span className="text-xs opacity-70 mt-1">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Kotak Subtitle (Transkrip Narator) */}
            <div className="mt-12 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 relative">
              <div className="absolute -top-4 left-6 px-4 bg-white text-slate-400 text-sm font-bold flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                SISTEM BERBICARA:
              </div>
              <p className="text-xl md:text-2xl text-center font-medium text-slate-700 italic">
                "{subtitle || "..."}"
              </p>
            </div>

            {/* Indikator Mikrofon */}
            {isListening && (
              <div className="mt-6 flex justify-center items-center gap-3 text-green-600">
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-green-500 animate-bounce"></div>
                  <div className="w-1 h-6 bg-green-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-4 bg-green-500 animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-sm font-bold tracking-widest uppercase">Mikrofon Aktif</span>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}