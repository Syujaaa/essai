import React, { useEffect, useState, useRef } from 'react';
import Puzzle from './games/puzzle';
import Kartu from './games/kartu';

export default function GamePage({ mode, onBack }) {
  const [activeGame, setActiveGame] = useState(null); 
  const [isListening, setIsListening] = useState(false);
  const [voiceContext, setVoiceContext] = useState('menu'); 
  
  const [gameCommand, setGameCommand] = useState(null);
  
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isSystemSpeakingRef = useRef(false);
  const isIntentionalStopRef = useRef(false);

  // PERBAIKAN: Gabungkan tuna_netra dan tuna_daksa untuk akses mikrofon & suara
  const useVoiceControl = mode === 'tuna_netra' || mode === 'tuna_daksa';

  const setListeningState = (state) => {
    setIsListening(state);
    isListeningRef.current = state;
  };

  const playMicOnSound = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();

    const playTone = (frequency, startTime, duration) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine'; 
      oscillator.frequency.value = frequency;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    
    playTone(600, now, 0.15);      
    playTone(850, now + 0.15, 0.25);  
  };

  const speakUI = (text, onFinish) => {
    // PERBAIKAN: Gunakan variabel useVoiceControl
    if (!useVoiceControl) {
      if (onFinish) {
        // Beri jeda 1.5 detik agar pop-up "Benar/Salah" bisa terbaca oleh user sebelum pindah state
        setTimeout(onFinish, 1500); 
      }
      return;
    }

    window.speechSynthesis.cancel();
    
    isSystemSpeakingRef.current = true;
    isIntentionalStopRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    
    utterance.onend = () => {
      isSystemSpeakingRef.current = false;
      if (onFinish) onFinish();
    };
    
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const startListening = (contextOverride, isAutoRestart = false) => {
    // PERBAIKAN: Gunakan variabel useVoiceControl
    if (!useVoiceControl || isSystemSpeakingRef.current || isListeningRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    window.speechSynthesis.cancel();

    if (recognitionRef.current) {
      recognitionRef.current.onend = null; 
      try { recognitionRef.current.stop(); } catch(e){}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'id-ID';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListeningState(true);
      isIntentionalStopRef.current = false;
      
      if (!isAutoRestart) {
        playMicOnSound(); 
      }
      console.log("Mikrofon aktif, narator diam, silakan bicara...");
    };

    recognition.onresult = (event) => {
      if (isSystemSpeakingRef.current) return;

      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Input Suara:", transcript);

      isIntentionalStopRef.current = true;
      try { recognition.stop(); } catch(e){}
      setListeningState(false);

      handleVoiceCommand(transcript, contextOverride || voiceContext);
    };

    recognition.onend = () => {
      setListeningState(false);
      // PERBAIKAN: Gunakan variabel useVoiceControl
      if (!isIntentionalStopRef.current && useVoiceControl && !isSystemSpeakingRef.current) {
        console.log("Mic hening/terputus, mengembalikan ke standby...");
        setTimeout(() => {
          startListening(contextOverride, true); 
        }, 200);
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        isIntentionalStopRef.current = true;
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Gagal start mic:", e);
    }
  };

  const handleVoiceCommand = (transcript, context) => {
    if (transcript.includes('kembali') || transcript.includes('menu') || transcript.includes('utama')) {
      isIntentionalStopRef.current = true;
      window.speechSynthesis.cancel();
      
      if (context === 'menu') {
        onBack();
      } else {
        setActiveGame(null);
        setVoiceContext('menu');
      }
      return;
    }

    if (activeGame !== null) {
      setGameCommand({ text: transcript, context: context, timestamp: Date.now() });
      return;
    }

    if (context === 'menu') {
      if (transcript.includes('kartu')) {
        isIntentionalStopRef.current = true;
        setActiveGame('kartu');
      } else if (transcript.includes('puzzle') || transcript.includes('pazel')) {
        isIntentionalStopRef.current = true;
        setActiveGame('puzzle');
      } else {
        speakUI("Maaf tidak terdengar. Ucapkan Kartu atau Pazzle atau Kembali.", () => startListening('menu'));
      }
    }
  };

  useEffect(() => {
    if (activeGame === null) {
      setVoiceContext('menu');
      
      // PERBAIKAN: Narasi otomatis untuk tuna netra & tuna daksa
      if (useVoiceControl) {
        speakUI("Pilih permainan. Ucapkan Game Kartu, atau Pazel Tubuh. Jika ingin keluar, ucapkan Kembali.", () => startListening('menu'));
      }
    }
    // eslint-disable-next-line
  }, [activeGame, mode]);

  useEffect(() => {
    return () => {
      isIntentionalStopRef.current = true;
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      setListeningState(false);
    };
  }, []);

  const MicIndicator = () => (
    <div className="h-8 my-4 flex justify-center items-center">
      {/* PERBAIKAN: Gunakan useVoiceControl agar indikator muncul untuk tuna daksa */}
      {isListening && useVoiceControl && (
        <div className="flex gap-2 items-center text-green-600 bg-green-100 px-4 py-2 rounded-full">
          <div className="flex gap-1">
            <div className="w-1.5 h-3 bg-green-500 animate-bounce"></div>
            <div className="w-1.5 h-5 bg-green-500 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-3 bg-green-500 animate-bounce [animation-delay:0.4s]"></div>
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">Mendengarkan...</span>
        </div>
      )}
    </div>
  );

  if (activeGame === null) {
    return (
      <main className="min-h-screen bg-rose-50 p-4 sm:p-10 flex flex-col items-center">
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-rose-900 mb-6">🎮 Pilih Permainan</h1>
          <MicIndicator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* PERBAIKAN: Tambahkan focus:ring untuk visibilitas navigasi keyboard tuna daksa */}
            <button 
              onClick={() => setActiveGame('kartu')} 
              className="bg-white p-10 rounded-3xl border-b-8 border-rose-300 shadow-lg active:scale-95 transition-transform outline-none focus:ring-8 focus:ring-rose-200"
            >
              <div className="text-7xl mb-4">🃏</div>
              <h2 className="text-2xl font-bold text-rose-800">Game Kartu</h2>
            </button>
            <button 
              onClick={() => setActiveGame('puzzle')} 
              className="bg-white p-10 rounded-3xl border-b-8 border-cyan-300 shadow-lg active:scale-95 transition-transform outline-none focus:ring-8 focus:ring-cyan-200"
            >
              <div className="text-7xl mb-4">🧩</div>
              <h2 className="text-2xl font-bold text-cyan-800">Puzzle Tubuh</h2>
            </button>
          </div>
          <button 
            onClick={() => { window.speechSynthesis.cancel(); onBack(); }} 
            className="mt-12 px-8 py-4 bg-slate-400 text-white font-bold text-xl rounded-full shadow-lg active:scale-95 transition-transform outline-none focus:ring-4 focus:ring-slate-300"
          >
            🏠 Kembali ke Menu
          </button>
        </div>
      </main>
    );
  }

  // Lempar prop `mode` ke children
  if (activeGame === 'kartu') {
    return (
      <Kartu 
        mode={mode}
        onBack={() => { window.speechSynthesis.cancel(); setActiveGame(null); setVoiceContext('menu'); }}
        speakUI={speakUI}
        startListening={startListening}
        setVoiceContext={setVoiceContext}
        MicIndicator={MicIndicator}
        voiceCommand={gameCommand}
      />
    );
  }

  if (activeGame === 'puzzle') {
    return (
      <Puzzle 
        mode={mode}
        onBack={() => { window.speechSynthesis.cancel(); setActiveGame(null); setVoiceContext('menu'); }}
        speakUI={speakUI}
        startListening={startListening}
        setVoiceContext={setVoiceContext}
        MicIndicator={MicIndicator}
        voiceCommand={gameCommand} 
      />
    );
  }

  return null;
}