import React, { useState, useEffect, useRef } from "react";

export default function GuidelinePage({ mode, onBack }) {
  const [activeSection, setActiveSection] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isSystemSpeakingRef = useRef(false);
  const isIntentionalStopRef = useRef(false);

  const isSimpleMode = mode === "tuna_grahita" || mode === "autis";
  const useVoiceControl = mode === "tuna_netra" || mode === "tuna_daksa";

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

  const speakUI = (text, onFinish) => {
    if (!useVoiceControl) {
      if (onFinish) onFinish();
      return;
    }

    window.speechSynthesis.cancel();

    isSystemSpeakingRef.current = true;
    isIntentionalStopRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.9;

    utterance.onend = () => {
      isSystemSpeakingRef.current = false;
      if (onFinish) onFinish();
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const startListening = (isAutoRestart = false) => {
    if (
      !useVoiceControl ||
      isSystemSpeakingRef.current ||
      isListeningRef.current
    )
      return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    window.speechSynthesis.cancel();

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "id-ID";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListeningState(true);
      isIntentionalStopRef.current = false;

      if (!isAutoRestart) {
        playMicOnSound();
      }
      console.log("Mikrofon aktif, silakan bicara...");
    };

    recognition.onresult = (event) => {
      if (isSystemSpeakingRef.current) return;

      const transcript =
        event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Input Suara:", transcript);

      isIntentionalStopRef.current = true;
      try {
        recognition.abort();
      } catch (e) {}
      setListeningState(false);

      handleVoiceCommand(transcript);
    };

    recognition.onend = () => {
      setListeningState(false);
      if (
        !isIntentionalStopRef.current &&
        useVoiceControl &&
        !isSystemSpeakingRef.current
      ) {
        startListening(true);
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setListeningState(false);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Gagal start mic:", e);
    }
  };

  const handleVoiceCommand = (transcript) => {
    if (transcript.includes("kembali") || transcript.includes("menu")) {
      isIntentionalStopRef.current = true;
      window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.abort();
      setListeningState(false);
      onBack();
      return;
    }

    if (
      transcript.includes("lanjut") ||
      transcript.includes("selanjutnya") ||
      transcript.includes("next")
    ) {
      if (activeSection < guidelines.length - 1) {
        handleNextSection();
      } else {
        speakUI(
          "Sudah di bagian terakhir. Ucapkan Kembali untuk ke menu.",
          () => startListening(),
        );
      }
      return;
    }

    if (
      transcript.includes("sebelum") ||
      transcript.includes("sebelumnya") ||
      transcript.includes("previous")
    ) {
      if (activeSection > 0) {
        handlePreviousSection();
      } else {
        speakUI(
          "Sudah di bagian pertama. Ucapkan Lanjut untuk ke section berikutnya.",
          () => startListening(),
        );
      }
      return;
    }

    speakUI("Ucapkan Lanjut, Sebelumnya, atau Kembali.", () =>
      startListening(),
    );
  };

  // PANDUAN: Helper untuk menambahkan instruksi suara di akhir bacaan
  const getVoicePrompt = (index) => {
    if (index < guidelines.length - 1) {
      return " Ucapkan lanjut untuk panduan selanjutnya.";
    } else {
      return " Ini adalah panduan terakhir. Ucapkan kembali untuk kembali ke menu.";
    }
  };

  const handleNextSection = () => {
    if (activeSection < guidelines.length - 1) {
      const nextIndex = activeSection + 1;
      setActiveSection(nextIndex);
      const nextSection = guidelines[nextIndex];

      if (useVoiceControl) {
        speakUI(`${nextSection.title}. ${nextSection.content}.${getVoicePrompt(nextIndex)}`, () =>
          startListening(),
        );
      }
    }
  };

  const handlePreviousSection = () => {
    if (activeSection > 0) {
      const prevIndex = activeSection - 1;
      setActiveSection(prevIndex);
      const prevSection = guidelines[prevIndex];

      if (useVoiceControl) {
        speakUI(`${prevSection.title}. ${prevSection.content}.${getVoicePrompt(prevIndex)}`, () =>
          startListening(),
        );
      }
    }
  };

  const handleManualNavigation = (index) => {
    setActiveSection(index);
    const section = guidelines[index];
    if (useVoiceControl) {
      speakUI(`${section.title}. ${section.content}.${getVoicePrompt(index)}`, () => startListening());
    }
  };

  const handleBack = () => {
    isIntentionalStopRef.current = true;
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setListeningState(false);
    onBack();
  };

  const guidelines = [
    {
      title: isSimpleMode ? "Selamat Datang" : "Panduan Penggunaan Aplikasi",
      icon: "👋",
      content: isSimpleMode
        ? "Halo! Aplikasi ini membantu kamu belajar cara menjaga tubuhmu tetap aman. Mari kita mulai! Ucapkan Lanjut untuk lanjut."
        : "Aplikasi ini dirancang untuk membantu kamu memahami batasan pribadi dan cara menjaga diri dari pelecehan seksual. Setiap bagian dapat diakses dengan suara atau tombol.",
    },
    {
      title: isSimpleMode ? "Tentang Aplikasi" : "Fitur-Fitur Utama",
      icon: "ℹ️",
      content: isSimpleMode
        ? "Aplikasi ini punya cerita seru, game yang menyenangkan, video, dan kasus inspiratif. Semua membantu kamu belajar cara aman menjaga tubuh."
        : "Aplikasi memiliki: Buku Cerita (edukasi melalui dongeng), Game Interaktif (kartu dan puzzle), Film Edukasi (materi audiovisual), dan Studi Kasus (kisah inspiratif).",
    },
    {
      title: isSimpleMode ? "Mode Aman" : "Menggunakan Mode Aksesibilitas",
      icon: "🛡️",
      content: isSimpleMode
        ? "Ada lima mode khusus: untuk tuna netra, tuna rungu, tuna grahita, autis, dan tuna daksa. Setiap mode disesuaikan dengan kebutuhan kamu."
        : "Aplikasi menyediakan lima mode aksesibilitas: Tuna Netra (navigasi suara), Tuna Rungu (visual dan teks), Tuna Grahita (bahasa sederhana), Autis (struktur jelas), dan Tuna Daksa (akses motorik).",
    },
    {
      title: isSimpleMode ? "Cerita Dongeng" : "Fitur: Buku Cerita",
      icon: "📚",
      content: isSimpleMode
        ? "Cerita 'Ksatria Kancil dan Perisai Cahaya' mengajarkan cara menjaga tubuh. Dengarkan cerita dengan tenang dan pelajari tentang area tubuh yang privat."
        : "Buku Cerita menceritakan 'Ksatria Kancil dan Perisai Cahaya' - sebuah alegori tentang pentingnya melindungi area pribadi tubuh. Setiap paragraf dibaca oleh sistem.",
    },
    {
      title: isSimpleMode ? "Main Game" : "Fitur: Game Interaktif",
      icon: "🎮",
      content: isSimpleMode
        ? "Ada dua game: Game Kartu (tentang bagian tubuh mana yang boleh disentuh) dan Puzzle Tubuh (susun tubuh dari atas ke bawah). Bermain sambil belajar!"
        : "Game Kartu mengajarkan batasan sentuhan pada berbagai bagian tubuh. Puzzle Tubuh melatih kemampuan motorik sambil mempelajari anatomi tubuh manusia.",
    },
    {
      title: isSimpleMode ? "Tonton Video" : "Fitur: Film Edukasi",
      icon: "🎬",
      content: isSimpleMode
        ? "Video menjelaskan tentang keselamatan dan perlindungan diri dengan cara yang menarik dan mudah dipahami. Tonton dengan seksama!"
        : "Film Edukasi menyajikan materi tentang perlindungan diri, batasan pribadi, dan langkah-langkah keselamatan dalam format audiovisual yang menarik.",
    },
    {
      title: isSimpleMode ? "Kisah Inspiratif" : "Fitur: Studi Kasus Edukatif",
      icon: "💡",
      content: isSimpleMode
        ? "Baca cerita anak-anak dengan disabilitas yang berprestasi tinggi. Mereka membuktikan bahwa semua anak bisa jadi juara walau memiliki keterbatasan!"
        : "Studi kasus menampilkan kisah nyata anak-anak dengan berbagai disabilitas yang berhasil meraih prestasi luar biasa. Mereka menginspirasi dan membuktikan potensi setiap anak.",
    },
    {
      title: isSimpleMode ? "Menggunakan Suara" : "Navigasi Dengan Mikrofon",
      icon: "🎤",
      content: isSimpleMode
        ? "Jika kamu adalah tuna netra atau tuna daksa, kamu bisa berinteraksi dengan suara. Bilang 'Lanjut' untuk ke bagian berikutnya, 'Sebelumnya' untuk kembali, atau 'Kembali' untuk ke menu."
        : "Pengguna Tuna Netra dan Tuna Daksa dapat menggunakan perintah suara: 'Lanjut' (bagian berikutnya), 'Sebelumnya' (bagian sebelumnya), dan 'Kembali' (ke menu utama).",
    },
    {
      title: isSimpleMode ? "Tombol dan Navigasi" : "Navigasi Dengan Tombol",
      icon: "📱",
      content: isSimpleMode
        ? "Di bawah panduan ini ada tombol untuk: 'Lanjut' (section berikutnya), 'Sebelumnya' (section sebelumnya), dan 'Kembali ke Menu' (kembali ke halaman utama)."
        : "Gunakan tombol di bagian bawah untuk: navigasi antar section ('Lanjut' dan 'Sebelumnya'), atau kembali ke menu utama dengan tombol 'Kembali'.",
    },
    {
      title: isSimpleMode ? "Batasan Pribadi" : "Memahami Batasan Pribadi",
      icon: "🧠",
      content: isSimpleMode
        ? "Tubuhmu adalah milikmu. Ada bagian yang boleh disentuh orang (kepala, tangan) dan bagian privat yang tidak boleh (dada, pantat, kemaluan). Hanya orang tua dan dokter yang boleh menyentuh area privat saat diperlukan."
        : "Setiap orang memiliki batasan pribadi. Area tubuh terbagi menjadi dua: area publik (dapat disentuh dalam kondisi normal) dan area privat (hanya dapat disentuh oleh orang tua/wali atau petugas medis dengan alasan kesehatan).",
    },
    {
      title: isSimpleMode ? "Jika Ada yang Tidak Aman" : "Langkah Keselamatan",
      icon: "⚠️",
      content: isSimpleMode
        ? "Jika ada orang yang ingin menyentuh area privat atau membuatmu tidak nyaman: 1) Bilang TIDAK keras-keras, 2) Lari ke tempat aman, 3) Cerita pada ayah, ibu, atau guru terpercaya. Jangan takut! Kamu tidak salah!"
        : "Jika merasa tidak aman atau ada kontak yang tidak sesuai: (1) Ucapkan 'TIDAK' dengan tegas, (2) Jauh dari orang tersebut, (3) Lapor kepada orang tua, wali, atau guru terpercaya, (4) Ingat: ini bukan salahmu.",
    },
    {
      title: isSimpleMode ? "Selesai!" : "Tips Penting",
      icon: "⭐",
      content: isSimpleMode
        ? "Ingat: Tubuhmu berharga. Kamu berhak merasa aman. Jangan malu untuk bilang tidak, jangan malu untuk cerita. Ayah, ibu, dan guru siap membantu. Selamat belajar dan tetap aman!"
        : "Ingat: Setiap anak berhak atas privasi dan keamanan tubuh mereka. Berani berkata tidak adalah hak kamu. Berbagi cerita dengan orang terpercaya adalah langkah berani yang tepat. Tetap aman dan percayalah pada orang tua/wali Anda.",
    },
  ];

  useEffect(() => {
    if (useVoiceControl) {
      const firstSection = guidelines[0];
      // PANDUAN: Terapkan juga pada saat pembacaan pertama kali
      speakUI(`${firstSection.title}. ${firstSection.content}.${getVoicePrompt(0)}`, () =>
        startListening(),
      );
    }

    return () => {
      isIntentionalStopRef.current = true;
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const MicIndicator = () => (
    <div className="h-8 my-4 flex justify-center items-center">
      {isListening && useVoiceControl && (
        <div className="flex gap-2 items-center text-green-600 bg-green-100 px-4 py-2 rounded-full">
          <div className="flex gap-1">
            <div className="w-1.5 h-3 bg-green-500 animate-bounce"></div>
            <div className="w-1.5 h-5 bg-green-500 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-3 bg-green-500 animate-bounce [animation-delay:0.4s]"></div>
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">
            Mendengarkan...
          </span>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-amber-50 p-4 sm:p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full pb-20">
        <div className="flex justify-start mb-6">
          <button
            onClick={handleBack}
            className="text-amber-700 font-bold bg-white px-4 py-2 rounded-full border-2 border-amber-200 active:scale-95 transition-transform outline-none focus:ring-4 focus:ring-amber-300 text-sm sm:text-base"
          >
            ⬅ Kembali
          </button>
        </div>

        <MicIndicator />

        <h1 className="text-3xl sm:text-4xl font-black text-amber-900 mb-2 text-center">
          {isSimpleMode ? "📖 Cara Pakai" : "📖 Panduan Penggunaan"}
        </h1>

        <p className="text-center text-amber-600 font-medium mb-8 animate-pulse text-sm sm:text-base">
          {useVoiceControl ? (
            <>
              Ucapkan <b>"Lanjut"</b>, <b>"Sebelumnya"</b>, atau{" "}
              <b>"Kembali"</b>
            </>
          ) : (
            <>Gunakan tombol navigasi di bawah</>
          )}
        </p>

        {/* Main Content Area */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-4 border-amber-200 shadow-lg mb-8 min-h-[300px]">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl sm:text-6xl">
              {guidelines[activeSection].icon}
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-amber-900">
              {guidelines[activeSection].title}
            </h2>
          </div>

          <p className="text-lg sm:text-2xl text-amber-800 leading-relaxed font-medium">
            {guidelines[activeSection].content}
          </p>

          <div className="mt-8 text-sm sm:text-base text-amber-600 font-semibold">
            Bagian {activeSection + 1} dari {guidelines.length}
          </div>
        </div>

        {/* Section Indicator */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 justify-center flex-wrap">
          {guidelines.map((section, index) => (
            <button
              key={index}
              onClick={() => handleManualNavigation(index)}
              className={`px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap text-sm sm:text-base ${
                activeSection === index
                  ? "bg-amber-500 text-white shadow-lg scale-105"
                  : "bg-white text-amber-700 border-2 border-amber-300 hover:bg-amber-100"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={handlePreviousSection}
            disabled={activeSection === 0}
            className={`px-6 py-3 font-bold rounded-xl transition-all text-sm sm:text-base ${
              activeSection === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-yellow-900 active:scale-95 shadow-md"
            }`}
          >
            ⬅ Sebelumnya
          </button>

          <button
            onClick={handleNextSection}
            disabled={activeSection === guidelines.length - 1}
            className={`px-6 py-3 font-bold rounded-xl transition-all text-sm sm:text-base ${
              activeSection === guidelines.length - 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 hover:bg-yellow-500 text-yellow-900 active:scale-95 shadow-md"
            }`}
          >
            Lanjut ➡
          </button>

          <button
            onClick={handleBack}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all text-sm sm:text-base"
          >
            🏠 Kembali Menu
          </button>
        </div>
      </div>
    </main>
  );
}