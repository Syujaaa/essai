import React, { useEffect, useState, useRef } from 'react';

export default function StoryPage({ mode, onBack }) {
  const [isReading, setIsReading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); 
  const [isListening, setIsListening] = useState(false);

  const lineRefs = useRef([]);

  const isReadingRef = useRef(false); 
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isIntentionalStop = useRef(false); // Penanda saat kita sengaja mematikan mic (misal: kembali ke menu)

  // Fungsi untuk menjaga state dan ref tetap sinkron agar terhindar dari Stale Closure
  const setListeningState = (state) => {
    setIsListening(state);
    isListeningRef.current = state;
  };

  const setReadingState = (state) => {
    setIsReading(state);
    isReadingRef.current = state;
  };

  // Fungsi pembersih khusus saat tombol kembali ditekan
  const handleBack = () => {
    isIntentionalStop.current = true; // Cegah mic merestart dirinya sendiri
    window.speechSynthesis.cancel();
    
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; 
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setListeningState(false);
    onBack();
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

  const storyTitle = "Ksatria Kancil dan Perisai Cahaya";
  const storyContent = [
    "Di Hutan Awan Berkilau, Kancil terpilih menjadi Ksatria Penjaga! Ia diberi misi rahasia yang sangat penting.",
    "Sang Burung Hantu Bijak berkata, 'Tubuhmu dilindungi oleh Perisai Cahaya tak terlihat. Ini adalah harta karun milikmu sendiri dan tidak boleh disentuh sembarang orang!'",
    "Perisai Cahaya ini melindungi area rahasia, yaitu dada dan bagian di antara kakimu. Bentuknya persis seperti baju pelindung renang yang berkilau!",
    "Hanya Tabib Hutan (dokter) yang boleh menyentuhnya saat kamu sakit, atau Ayah dan Ibu Peri saat membantumu mandi agar perisaimu kembali bersinar.",
    "Jika ada Monster Jahat yang mencoba menyentuh area perisaimu atau memintamu melepasnya, keluarkan jurus andalanmu. Teriak 'TIDAK!' sekencang suara petir!",
    "Lalu, gunakan sepatu roket terbangmu untuk lari secepat kilat! Laporkan Monster itu pada Ayah, Ibu, atau Guru. Ingat, kamu adalah Ksatria hebat yang berani!"
  ];

  const speakUI = (text, onFinish) => {
    if (mode === 'tuna_rungu') {
      if (onFinish) onFinish();
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.85;
    
    if (onFinish) {
      utterance.onend = onFinish;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (mode === 'tuna_rungu') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

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
      isIntentionalStop.current = false; // Reset penanda saat mic mulai
      playMicOnSound();
      console.log("Mikrofon aktif, silakan bicara...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Kata tertangkap:", transcript);

      if (transcript.includes('lagi') || transcript.includes('baca')) {
        console.log("Perintah cocok: Baca Lagi");
        isIntentionalStop.current = true;
        recognition.stop(); 
        playSequentialStory(0);
      } 
      else if (transcript.includes('kembali') || transcript.includes('menu') || transcript.includes('utama')) {
        console.log("Perintah cocok: Kembali");
        handleBack(); // Gunakan handleBack agar mic mati sempurna
      }
      else {
        console.log("Kata tidak dikenali, sistem diam dan tetap mendengarkan...");
      }
    };

    recognition.onend = () => {
      // Pastikan bukan karena sengaja dimatikan (unmount/pindah menu) dan tidak sedang membaca
      if (!isIntentionalStop.current && !isReadingRef.current && mode !== 'tuna_rungu') {
        console.log("Restarting microphone untuk standby...");
        try {
          recognition.start();
        } catch (e) {
          console.error("Gagal restart mic:", e);
        }
      } else {
        setListeningState(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Error mikrofon:", event.error);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Gagal memulai mikrofon:", e);
    }
  };

  const playSequentialStory = (index = 0) => {
    if (mode === 'tuna_rungu') return;

    if (index >= storyContent.length) {
      setReadingState(false);
      setActiveIndex(-1);

      setTimeout(() => {
        const closingText =
          "Ceritanya sudah selesai. Jika ingin mendengarnya sekali lagi, cukup ucapkan 'Baca lagi'. Atau, jika ingin ke menu utama, silakan katakan 'Kembali'.";
        speakUI(closingText, () => {
          startListening();
        });
      }, 500);

      return;
    }

    setReadingState(true);
    setActiveIndex(index);

    const textToSpeak =
      index === 0
        ? `${storyTitle}. ${storyContent[index]}`
        : storyContent[index];

    setTimeout(() => {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;

      utterance.onend = () => {
        playSequentialStory(index + 1);
      };

      utterance.onerror = (event) => {
        if (event.error === 'canceled' || event.error === 'interrupted') {
          return; 
        }
        setReadingState(false);
        setActiveIndex(-1);
      };

      window.speechSynthesis.speak(utterance);
    }, 200);
  };

  // PEMUTUS SIKLUS: Matikan mikrofon secara paksa saat komponen ini tidak lagi ditampilkan
  useEffect(() => {
    return () => {
      console.log("Unmounting StoryPage, memastikan mic mati...");
      isIntentionalStop.current = true;
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    if (activeIndex >= 0 && lineRefs.current[activeIndex]) {
      lineRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (mode !== 'tuna_rungu') {
      setTimeout(() => {
        playSequentialStory(0);
      }, 300); 
    }

    return () => window.speechSynthesis.cancel();
  }, [mode]);

  return (
    <main className="min-h-screen bg-white p-4 sm:p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full pb-20">
        
        <div className="bg-emerald-50 p-8 sm:p-12 rounded-[40px] border-4 border-emerald-200 shadow-inner mt-4">
          <h1 
            className={`text-3xl sm:text-5xl font-black text-emerald-900 mb-10 text-center transition-all duration-500 p-4 sm:p-6 rounded-2xl outline-none
              ${activeIndex === 0 
                ? 'bg-emerald-200 shadow-lg scale-105 border-2 border-emerald-400' 
                : ''
              }
            `}
          >
            {storyTitle}
          </h1>

          <div className="space-y-6">
            {storyContent.map((para, index) => (
              <p 
                key={index} 
                ref={(el) => (lineRefs.current[index] = el)} 
                className={`text-xl sm:text-3xl text-emerald-800 leading-relaxed font-medium p-4 sm:p-6 rounded-2xl transition-all duration-700 outline-none
                  ${activeIndex === index 
                    ? 'bg-emerald-200 shadow-lg scale-105 border-2 border-emerald-400' 
                    : ''
                  }
                `}
              >
                {para}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center min-h-[64px]">
          
          {isListening && mode !== 'tuna_rungu' && (
            <div className="mb-6 flex justify-center items-center gap-3 text-green-600">
              <div className="flex gap-1">
                <div className="w-1 h-3 sm:h-4 bg-green-500 animate-bounce"></div>
                <div className="w-1 h-5 sm:h-6 bg-green-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-3 sm:h-4 bg-green-500 animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-sm sm:text-base font-bold tracking-widest uppercase">Mikrofon Aktif</span>
            </div>
          )}
          
          {!isReading && mode !== 'tuna_rungu' ? (
            <div className="flex gap-4 w-full justify-center animate-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={() => {
                  isIntentionalStop.current = true;
                  if (recognitionRef.current) {
                    try { recognitionRef.current.stop(); } catch(e){}
                  }
                  playSequentialStory(0);
                }}
                className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-lg sm:text-xl rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-yellow-600"
              >
                🔄 Bacakan Lagi
              </button>
              <button 
                onClick={handleBack}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg sm:text-xl rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-emerald-300"
              >
                🏠 Kembali Menu
              </button>
            </div>
          ) : null}

          {!isReading && mode === 'tuna_rungu' ? (
            <div className="flex gap-4 w-full justify-center animate-in slide-in-from-bottom-4 duration-500">
              <button 
                onClick={handleBack}
                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg sm:text-xl rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-emerald-300"
              >
                🏠 Kembali Menu
              </button>
            </div>
          ) : null}
        </div>

      </div>
    </main>
  );
}