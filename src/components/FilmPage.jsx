import React, { useState, useEffect, useRef } from "react";

export default function FilmPage({ mode, onBack }) {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef(null);
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
        recognition.stop();
      } catch (e) {}
      setListeningState(false);

      if (
        transcript.includes("putar") ||
        transcript.includes("mainkan") ||
        transcript.includes("play")
      ) {
        handlePlay();
      } else if (
        transcript.includes("pause") ||
        transcript.includes("henti") ||
        transcript.includes("paus") ||
        transcript.includes("berhenti")
      ) {
        handlePause();
      } else if (
        transcript.includes("kembali") ||
        transcript.includes("menu") ||
        transcript.includes("utama")
      ) {
        isIntentionalStopRef.current = true;
        window.speechSynthesis.cancel();
        onBack();
      } else {
        speakUI(
          isSimpleMode
            ? "Ucapkan Putar, Henti, atau Kembali."
            : "Ucapkan Putar, Pause, atau Kembali.",
          () => startListening(),
        );
      }
    };

    recognition.onend = () => {
      setListeningState(false);
      if (
        !isIntentionalStopRef.current &&
        useVoiceControl &&
        !isSystemSpeakingRef.current
      ) {
        console.log("Mic hening/terputus, mengembalikan ke standby...");
        setTimeout(() => {
          startListening(true);
        }, 200);
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        isIntentionalStopRef.current = true;
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Gagal start mic:", e);
    }
  };

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      speakUI(isSimpleMode ? "Video diputar." : "Video sedang diputar.", () =>
        startListening(),
      );
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      speakUI(isSimpleMode ? "Video dihentikan." : "Video dijeda.", () =>
        startListening(),
      );
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    speakUI(
      isSimpleMode
        ? "Video selesai. Ucapkan Putar untuk menonton lagi atau Kembali ke menu."
        : "Video selesai. Ucapkan Putar untuk menonton lagi atau Kembali.",
      () => startListening(),
    );
  };

  useEffect(() => {
    // Autoplay untuk semua mode KECUALI tuna_netra dan tuna_daksa
    const shouldAutoPlay = mode !== "tuna_netra" && mode !== "tuna_daksa";

    if (shouldAutoPlay && videoRef.current) {
      // Autoplay langsung dengan delay minimal agar DOM siap
      const autoplayTimer = setTimeout(() => {
        videoRef.current?.play().catch((err) => {
          console.log("Autoplay failed:", err);
        });
        setIsPlaying(true);
      }, 500);

      return () => clearTimeout(autoplayTimer);
    }

    if (useVoiceControl) {
      const narasi = isSimpleMode
        ? "Halaman Video. Ucapkan Putar untuk menonton, Henti untuk berhenti, atau Kembali."
        : "Halaman Film Dongeng. Ucapkan Putar untuk memutar, Pause untuk menjeda, atau Kembali.";

      speakUI(narasi, () => {
        startListening();
      });
    }

    return () => {
      isIntentionalStopRef.current = true;
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setListeningState(false);
    };
  }, []);

  const MicIndicator = () => (
    <div className="h-6 sm:h-8 my-2 sm:my-4 flex justify-center items-center">
      {isListening && useVoiceControl && (
        <div className="flex gap-1 sm:gap-2 items-center text-green-600 bg-green-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
          <div className="flex gap-0.5 sm:gap-1">
            <div className="w-1 sm:w-1.5 h-2 sm:h-3 bg-green-500 animate-bounce"></div>
            <div className="w-1 sm:w-1.5 h-4 sm:h-5 bg-green-500 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1 sm:w-1.5 h-2 sm:h-3 bg-green-500 animate-bounce [animation-delay:0.4s]"></div>
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-widest uppercase">
            Mendengarkan...
          </span>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-purple-50 p-2 sm:p-6 lg:p-10 flex flex-col items-center">
      <div className="max-w-5xl w-full text-center">
        {/* Header dengan tombol kembali */}
        <div className="flex justify-start mb-3 sm:mb-4 lg:mb-6">
          <button
            onClick={() => {
              isIntentionalStopRef.current = true;
              window.speechSynthesis.cancel();
              if (recognitionRef.current) {
                recognitionRef.current.onend = null;
                try {
                  recognitionRef.current.stop();
                } catch (e) {}
              }
              onBack();
            }}
            className="text-purple-700 font-bold bg-white px-3 sm:px-4 py-2 rounded-full border-2 border-purple-200 active:scale-95 transition-transform outline-none focus:ring-4 focus:ring-purple-300 text-sm sm:text-base"
          >
            ⬅ Kembali
          </button>
        </div>

        <MicIndicator />

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-purple-900 mb-2 sm:mb-3 lg:mb-4 mt-2 sm:mt-3">
          {isSimpleMode ? "Tonton Video" : "Film Dongeng"}
        </h1>

        <p className="text-sm sm:text-base lg:text-lg text-purple-700 font-medium mb-4 sm:mb-6 lg:mb-8 animate-pulse px-2">
          {useVoiceControl ? (
            isSimpleMode ? (
              <>
                Ucapkan <b>"Putar"</b>, <b>"Henti"</b>, atau <b>"Kembali"</b>
              </>
            ) : (
              <>
                Ucapkan <b>"Putar"</b>, <b>"Pause"</b>, atau <b>"Kembali"</b>
              </>
            )
          ) : (
            <>Gunakan tombol di bawah untuk memutar video</>
          )}
        </p>

        {/* Video container yang responsive */}
        <div className="bg-white p-2 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-purple-200 shadow-lg mb-4 sm:mb-6 lg:mb-8 w-full aspect-video">
          <div className="w-full h-full rounded-lg sm:rounded-xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              onEnded={handleVideoEnd}
              controls={!useVoiceControl}
              autoPlay={mode !== "tuna_netra" && mode !== "tuna_daksa"}
              muted={mode === "tuna_rungu"}
              className="w-full h-full object-contain"
            >
              <source src="/video/video.mp4" type="video/mp4" />
              Browser Anda tidak mendukung video HTML5.
            </video>
          </div>
        </div>

        {/* Button controls - responsive sizing */}
        {useVoiceControl ? (
          <div className="flex gap-2 sm:gap-4 justify-center mb-4 sm:mb-6 lg:mb-8 flex-wrap">
            <button
              onClick={() => {
                handlePlay();
              }}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-400 hover:bg-green-500 text-green-900 font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-md active:scale-95 transition-transform outline-none focus:ring-4 focus:ring-green-300"
            >
              ▶️ Putar
            </button>
            <button
              onClick={() => {
                handlePause();
              }}
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
