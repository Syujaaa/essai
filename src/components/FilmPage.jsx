import React, { useState, useEffect, useRef } from "react";

export default function FilmPage({ mode, onBack }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef(null);
  const isSystemSpeakingRef = useRef(false);
  const isIntentionalStopRef = useRef(false);

  const isSimpleMode = mode === "tuna_grahita" || mode === "autis";
  // Mengubah nama variabel karena kontrol suara (mikrofon) dimatikan, sisa naratornya saja
  const useNarrator = mode === "tuna_netra" || mode === "tuna_daksa";

  const speakUI = (text, onFinish) => {
    if (!useNarrator) {
      if (onFinish) {
        setTimeout(onFinish, 1500);
      }
      return;
    }

    window.speechSynthesis.cancel();

    isSystemSpeakingRef.current = true;
    isIntentionalStopRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";

    utterance.onend = () => {
      isSystemSpeakingRef.current = false;
      if (onFinish) onFinish();
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const handlePlay = () => {
    if (videoRef.current) {
      setIsPlaying(true);
      speakUI(
        isSimpleMode ? "Video diputar." : "Video sedang diputar.",
        () => {
          videoRef.current.play().catch((e) => console.error("Play error:", e));
        }
      );
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      speakUI(isSimpleMode ? "Video dihentikan." : "Video dijeda.");
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    
    // Jika mode tuna netra/daksa, narator bicara lalu OTOMATIS kembali ke menu
    if (useNarrator) {
      speakUI(
        "Video selesai. Mengembalikan ke menu utama.",
        () => {
          onBack(); // Langsung pindah ke menu setelah narator selesai bicara
        }
      );
    } else {
      // Untuk mode lain (autis/tuna rungu/tuna grahita), diam di tempat atau opsi lain
      speakUI("Video selesai.");
    }
  };

  // Sinkronisasi status play/pause dari native controls kursor ke state aplikasi
  const handleNativePlayPause = () => {
    if (videoRef.current) {
      setIsPlaying(!videoRef.current.paused);
    }
  };

  useEffect(() => {
    // Autoplay diaktifkan untuk SEMUA mode
    if (videoRef.current) {
      const autoplayTimer = setTimeout(() => {
        videoRef.current?.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.log("Autoplay failed (butuh interaksi user):", err);
          // Jika browser menolak autoplay otomatis, bacakan narasi pengenalan.
          if (useNarrator) {
            const narasi = isSimpleMode
              ? "Halaman Video. Gunakan tombol untuk memutar."
              : "Halaman Film Edukasi. Gunakan kontrol untuk memutar.";
            
            speakUI(narasi);
          }
        });
      }, 500);

      return () => clearTimeout(autoplayTimer);
    }

    return () => {
      isIntentionalStopRef.current = true;
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <main className="min-h-screen bg-purple-50 p-2 sm:p-6 lg:p-10 flex flex-col items-center">
      <div className="max-w-5xl w-full text-center">
        {/* Header dengan tombol kembali */}
        <div className="flex justify-start mb-3 sm:mb-4 lg:mb-6">
          <button
            onClick={() => {
              isIntentionalStopRef.current = true;
              window.speechSynthesis.cancel();
              onBack();
            }}
            className="text-purple-700 font-bold bg-white px-3 sm:px-4 py-2 rounded-full border-2 border-purple-200 active:scale-95 transition-transform outline-none focus:ring-4 focus:ring-purple-300 text-sm sm:text-base"
          >
            ⬅ Kembali
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-purple-900 mb-2 sm:mb-3 lg:mb-4 mt-2 sm:mt-3">
          {isSimpleMode ? "Tonton Video" : "Film Edukasi"}
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-purple-700 font-medium mb-4 sm:mb-6 lg:mb-8 animate-pulse px-2">
          {useNarrator ? (
            <>Tonton video ini hingga selesai.</>
          ) : (
            <>Gunakan kontrol di bawah untuk memutar video</>
          )}
        </p>

        {/* Video container yang responsive */}
        <div className="bg-white p-2 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-purple-200 shadow-lg mb-4 sm:mb-6 lg:mb-8 w-full aspect-video">
          <div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              onEnded={handleVideoEnd}
              onPlay={handleNativePlayPause}
              onPause={handleNativePlayPause}
              controls={true} /* Kontrol bawaan selalu muncul di semua mode */
              autoPlay={true} 
              muted={mode === "tuna_rungu"}
              className="w-full h-full object-contain"
            >
              <source src="/video/video.mp4" type="video/mp4" />
              Browser Anda tidak mendukung video HTML5.
            </video>
          </div>
        </div>

        {/* Button controls ekstra untuk aksesibilitas jika dibutuhkan */}
        {useNarrator ? (
          <div className="flex gap-2 sm:gap-4 justify-center mb-4 sm:mb-6 lg:mb-8 flex-wrap">
            <button
              onClick={handlePlay}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-400 hover:bg-green-500 text-green-900 font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-md active:scale-95 transition-transform outline-none focus:ring-4 focus:ring-green-300"
            >
              ▶️ Putar
            </button>
            <button
              onClick={handlePause}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-400 hover:bg-orange-500 text-orange-900 font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-md active:scale-95 transition-transform outline-none focus:ring-4 focus:ring-orange-300"
            >
              ⏸️ {isSimpleMode ? "Henti" : "Pause"}
            </button>
          </div>
        ) : (
          <div className="mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base text-purple-600 font-medium px-2">
            Gunakan kontrol video untuk memutar dan menjeda
          </div>
        )}
      </div>
    </main>
  );
}