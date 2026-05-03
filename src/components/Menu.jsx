import React, { useEffect, useRef, useState } from "react";

export default function Menu({ mode, onResetMode, onNavigate }) {
  const [isListening, setIsListening] = useState(false);

  // Refs untuk mengontrol mikrofon dan alur narasi
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); // Ref baru untuk mencegah Stale Closure
  const isSystemSpeaking = useRef(false);
  const isIntentionalStop = useRef(false);

  // Penentuan tipe mode
  const isSimpleMode = mode === "tuna_grahita" || mode === "autis";
  const useVoiceControl = mode === "tuna_netra" || mode === "tuna_daksa"; // PERBAIKAN: Aktifkan untuk kedua mode ini

  // Fungsi sinkronisasi agar UI dan logika background selalu punya nilai yang sama
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

      oscillator.type = "sine";
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

  const speak = (text, onFinish) => {
    if (mode === "tuna_rungu") {
      if (onFinish) onFinish();
      return;
    }

    window.speechSynthesis.cancel();

    isSystemSpeaking.current = true;
    isIntentionalStop.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";

    utterance.onend = () => {
      isSystemSpeaking.current = false;
      if (onFinish) onFinish();
    };

    // Tambahkan sedikit delay 100ms sebelum bicara untuk memberi nafas bagi browser
    // dalam memproses .cancel() di atas
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const menuItems = [
    {
      id: "panduan",
      title: isSimpleMode ? "Cara Pakai" : "Buku Panduan",
      subtitle: isSimpleMode
        ? "Belajar cara pakai aplikasi ini"
        : "Petunjuk penggunaan aplikasi",
      icon: "📖",
      color: "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200",
    },
    {
      id: "cerita",
      title: isSimpleMode ? "Baca Cerita" : "Buku Cerita",
      subtitle: isSimpleMode
        ? "Cerita anak hebat yang bisa jaga diri"
        : "Dongeng pencegahan pelecehan seksual",
      icon: "📚",
      color:
        "bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200",
    },
    {
      id: "film",
      title: isSimpleMode ? "Tonton Video" : "Film Dongeng",
      subtitle: isSimpleMode
        ? "Video seru tentang tubuh yang aman"
        : "Edukasi Seksual (Audio Visual)",
      icon: "🎬",
      color:
        "bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200",
    },
    {
      id: "game",
      title: isSimpleMode ? "Main Game" : "Game Edukasi",
      subtitle: isSimpleMode
        ? "Bermain jadi anak berani dan kuat"
        : "Bermain sambil belajar perlindungan diri",
      icon: "🎮",
      color: "bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200",
    },
    {
      id: "studi_kasus",
      title: isSimpleMode ? "Ayo Berlatih" : "Studi Kasus Edukatif",
      subtitle: isSimpleMode
        ? "Semua anak istimewa, semua bisa jadi juara!"
        : "Menemukan Potensi dan Meraih Prestasi Gemilang",
      icon: "💡",
      color: "bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-200",
    },
  ];

  const startListening = (isAutoRestart = false) => {
    // PERBAIKAN: Gunakan variabel useVoiceControl
    if (!useVoiceControl || isSystemSpeaking.current || isListeningRef.current)
      return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    // Bersihkan listener lama agar tidak terjadi penumpukan event
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "id-ID";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListeningState(true);
      isIntentionalStop.current = false;

      // HANYA putar bunyi beep jika dinyalakan manual (bukan auto standby di latar belakang)
      if (!isAutoRestart) {
        playMicOnSound();
      }
      console.log("Mikrofon aktif, silakan bicara...");
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Input Suara:", transcript);

      let selectedMenu = null;

      if (transcript.includes("panduan") || transcript.includes("cara pakai"))
        selectedMenu = menuItems.find((m) => m.id === "panduan");
      else if (transcript.includes("cerita") || transcript.includes("baca"))
        selectedMenu = menuItems.find((m) => m.id === "cerita");
      else if (
        transcript.includes("film") ||
        transcript.includes("tonton") ||
        transcript.includes("video")
      )
        selectedMenu = menuItems.find((m) => m.id === "film");
      else if (transcript.includes("game") || transcript.includes("main"))
        selectedMenu = menuItems.find((m) => m.id === "game");
      else if (
        transcript.includes("studi kasus") ||
        transcript.includes("studi") ||
        transcript.includes("latih") ||
        transcript.includes("berlatih")
      )
        selectedMenu = menuItems.find((m) => m.id === "studi_kasus");

      if (selectedMenu) {
        isIntentionalStop.current = true; // Kita hentikan sengaja untuk menavigasi
        recognition.stop();
        handleMenuClick(selectedMenu);
      } else if (transcript.includes("ganti mode")) {
        isIntentionalStop.current = true; // Kita hentikan sengaja untuk ubah mode
        recognition.stop();
        speak("Mengubah mode", () => onResetMode());
      }
    };

    recognition.onend = () => {
      setListeningState(false);

      if (
        !isIntentionalStop.current &&
        useVoiceControl &&
        !isSystemSpeaking.current
      ) {
        console.log("Mic hening/terputus, mengembalikan ke standby...");
        startListening(true); // Restart sebagai auto-restart (tanpa bunyi beep)
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        isIntentionalStop.current = true;
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Gagal start mic:", e);
    }
  };

  // Bersihkan mic dan suara sepenuhnya saat komponen mati / berpindah halaman
  useEffect(() => {
    return () => {
      isIntentionalStop.current = true;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setListeningState(false);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    // PERBAIKAN: Jalankan pembuka suara otomatis untuk tuna netra & tuna daksa
    if (useVoiceControl) {
      // Pastikan mic mati total saat memulai narasi baru
      isIntentionalStop.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setListeningState(false);

      const introText =
        "Kamu berada di halaman utama. Berikut menu-menu yang tersedia.";
      const allMenuText = menuItems
        .map((item) => `${item.title}. ${item.subtitle}`)
        .join(". ");
      const promptText =
        "Silakan katakan nama menu yang ingin kamu buka. Kamu dapat memilih Panduan, Cerita, Film, Game, atau Studi Kasus.";

      // Rantai narasi: A -> B -> C -> Nyalakan Mic
      speak(introText, () => {
        speak(allMenuText, () => {
          speak(promptText, () => {
            // HANYA setelah prompt terakhir selesai, mic dinyalakan
            isIntentionalStop.current = false; // Izinkan mic hidup kembali
            startListening();
          });
        });
      });
    }

    return () => {
      window.speechSynthesis.cancel();
      isIntentionalStop.current = true;
    };
    // eslint-disable-next-line
  }, [mode]); // Render ulang narasi saat mode berubah

  const handleMenuClick = (menu) => {
    if (menu.id === "cerita") {
      speak(`Membuka ${menu.title}`, () => {
        onNavigate("cerita");
      });
    } else if (menu.id === "game") {
      speak(`Membuka ${menu.title}`, () => {
        onNavigate("game");
      });
    } else if (menu.id === "film") {
      speak(`Membuka ${menu.title}`, () => {
        onNavigate("film");
      });
    } else if (menu.id === "studi_kasus") {
      speak(`Membuka ${menu.title}`, () => {
        onNavigate("studi_kasus");
      });
    } else {
      speak(`Membuka ${menu.title}`, () => {
        alert(`Fitur ${menu.title} akan segera hadir!`);
        startListening();
      });
    }
  };

  const greetingText = isSimpleMode
    ? "Halo! Kamu mau pilih yang mana? ✨"
    : "Halo! Mau belajar apa hari ini? ✨";

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 sm:p-6 rounded-3xl shadow-sm border-2 border-slate-100 mb-8 mt-4">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1
            className="text-2xl sm:text-3xl font-black text-slate-800"
            tabIndex="0"
            // PERBAIKAN: Jangan baca onFocus/onMouseEnter jika sedang dalam useVoiceControl agar tidak tabrakan
            onFocus={() =>
              mode !== "tuna_rungu" && !useVoiceControl && speak(greetingText)
            }
          >
            {greetingText}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            Mode aktif:{" "}
            <span className="text-blue-600 font-bold capitalize underline decoration-yellow-400 decoration-2">
              {mode.replace("_", " ")}
            </span>
          </p>
        </div>
        <button
          onClick={onResetMode}
          onMouseEnter={() =>
            mode !== "tuna_rungu" && !useVoiceControl && speak("Ganti Mode")
          }
          onFocus={() =>
            mode !== "tuna_rungu" &&
            !useVoiceControl &&
            speak("Tombol Ganti Mode")
          }
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-transform active:scale-95 text-sm border-2 border-slate-200 w-full sm:w-auto focus:ring-4 focus:ring-blue-300"
        >
          ⚙️ Ganti Mode
        </button>
      </header>

      {/* PERBAIKAN: Tampilkan indikator mikrofon untuk mode tuna_daksa juga */}
      {useVoiceControl && isListening && (
        <div className="mb-6 flex justify-center items-center gap-3 text-green-600">
          <div className="flex gap-1">
            <div className="w-1 h-3 sm:h-4 bg-green-500 animate-bounce"></div>
            <div className="w-1 h-5 sm:h-6 bg-green-500 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1 h-3 sm:h-4 bg-green-500 animate-bounce [animation-delay:0.4s]"></div>
          </div>
          <span className="text-sm sm:text-base font-bold tracking-widest uppercase">
            Mikrofon Aktif
          </span>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 flex-grow content-start pb-10">
        {menuItems.map((menu) => (
          <button
            key={menu.id}
            onClick={() => handleMenuClick(menu)}
            onMouseEnter={() =>
              !useVoiceControl &&
              mode !== "tuna_rungu" &&
              speak(`${menu.title}. ${menu.subtitle}`)
            }
            onFocus={() =>
              !useVoiceControl && mode !== "tuna_rungu"
                ? speak(`Menu ${menu.title}. ${menu.subtitle}`)
                : null
            }
            className={`group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] flex flex-col sm:flex-row items-center sm:items-start p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-b-[6px] sm:border-b-8 transition-all duration-300 hover:-translate-y-2 active:translate-y-1 active:border-b-2 shadow-sm hover:shadow-xl outline-none focus:ring-8 focus:ring-opacity-50 ${menu.color}`}
          >
            <div className="text-6xl sm:text-7xl mb-4 sm:mb-0 sm:mr-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              {menu.icon}
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-1 sm:mb-2 leading-tight">
                {menu.title}
              </h2>
              <p className="text-sm sm:text-base font-bold opacity-75">
                {menu.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
