import React, { useState, useEffect, useRef } from "react";

export default function CaseStudyPage({ mode, onBack }) {
  const [isReading, setIsReading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const isSystemSpeakingRef = useRef(false);
  const isIntentionalStopRef = useRef(false);

  const isSimpleMode = mode === "tuna_grahita" || mode === "autis";
  const useVoiceControl = mode === "tuna_netra" || mode === "tuna_daksa";

  // Konten berita inspiratif untuk berbagai mode
  const caseStudies = [
    {
      title: isSimpleMode
        ? "Reno, Anak Tuna Netra yang Berani"
        : "Reno: Pemenang Olimpiade Sains - Tuna Netra",
      icon: "👁️",
      stories: [
        isSimpleMode
          ? "Reno adalah anak yang tidak bisa melihat, tapi dia berani belajar banyak hal."
          : "Reno kehilangan penglihatan saat berusia 5 tahun, tetapi tidak pernah menyerah.",
        isSimpleMode
          ? "Dia rajin belajar sains dan matematika. Dengan bantuan guru dan teman, dia belajar dengan suara dan sentuhan."
          : "Menggunakan teknologi pembaca layar dan braile, Reno berhasil memenangkan Olimpiade Sains Nasional di kelasnya.",
        isSimpleMode
          ? "Sekarang Reno bisa berbicara di depan banyak orang dan memberi inspirasi kepada teman-temannya."
          : "Prestasi Reno menunjukkan bahwa keterbatasan penglihatan bukan penghalang untuk meraih impian. Dia sekarang menjadi duta pendidikan inklusi.",
      ],
      color: "bg-blue-50 border-blue-300",
      icon_color: "text-blue-600",
    },
    {
      title: isSimpleMode
        ? "Sinta, Anak Tuna Daksa yang Kuat"
        : "Sinta: Atlet Paralimpik Tuna Daksa",
      icon: "♿",
      stories: [
        isSimpleMode
          ? "Sinta tidak bisa berjalan dengan normal, tapi dia sangat kuat dan berani."
          : "Sinta mengalami kecelakaan saat berusia 8 tahun yang membuat kedua kakinya lumpuh.",
        isSimpleMode
          ? "Dia menggunakan kursi roda dan belajar berolahraga. Sinta menjadi perenang yang sangat hebat!"
          : "Dengan determinasi tinggi dan dukungan keluarga, Sinta berlatih renang dan berhasil meraih medali emas di Paralimpik Asia.",
        isSimpleMode
          ? "Sinta membuktikan bahwa walau tubuhnya terbatas, semangatnya tidak terbatas. Banyak teman terispirasi olehnya."
          : "Kisah Sinta menginspirasi jutaan anak bahwa kemampuan sejati tidak diukur dari kemampuan fisik, tetapi dari tekad dan kerja keras.",
      ],
      color: "bg-rose-50 border-rose-300",
      icon_color: "text-rose-600",
    },
    {
      title: isSimpleMode
        ? "Bunga, Anak Tuna Rungu Pandai"
        : "Bunga: Juara Debat - Tuna Rungu",
      icon: "👂",
      stories: [
        isSimpleMode
          ? "Bunga lahir tuna rungu, tapi dia sangat pintar dan pandai berbahasa."
          : "Bunga terlahir dengan gangguan pendengaran 90%, membuatnya tidak bisa mendengar suara normal.",
        isSimpleMode
          ? "Dia belajar bahasa isyarat dan berbicara dengan jelas. Guru dan teman membantunya belajar."
          : "Dengan alat bantu dengar canggih dan dukungan penuh dari keluarga, Bunga belajar berbicara dengan jelas.",
        isSimpleMode
          ? "Bunga menjadi juara debat di tingkat nasional! Dia membuktikan bahwa keterbatasan pendengaran bukan masalah."
          : "Bunga memenangkan kompetisi debat nasional dan kini menjadi inspirasi bagi komunitas tuna rungu di seluruh negeri.",
      ],
      color: "bg-teal-50 border-teal-300",
      icon_color: "text-teal-600",
    },
    {
      title: isSimpleMode
        ? "Ardi, Anak Tuna Grahita Ceria"
        : "Ardi: Juara Melukis - Tuna Grahita",
      icon: "🧸",
      stories: [
        isSimpleMode
          ? "Ardi memiliki keterbatasan dalam belajar akademik, tapi dia sangat ceria dan berbakat dalam seni."
          : "Ardi memiliki keterlambatan perkembangan kognitif sejak lahir, tetapi memiliki bakat luar biasa dalam melukis.",
        isSimpleMode
          ? "Dengan penuh kesabaran, guru seni mengajari Ardi melukis menggunakan warna-warna cerah."
          : "Karya-karya Ardi yang penuh warna dan penuh emosi berhasil memenangkan berbagai pameran seni tingkat daerah.",
        isSimpleMode
          ? "Ardi sekarang sudah punya banyak penggemar yang menyukai lukisannya. Dia bahagia!"
          : 'Prestasi Ardi membuktikan bahwa setiap anak memiliki keunikan dan potensi, meskipun dalam aspek berbeda dari yang dianggap "normal".',
      ],
      color: "bg-orange-50 border-orange-300",
      icon_color: "text-orange-600",
    },
    {
      title: isSimpleMode
        ? "Zara, Anak Autis yang Jenius"
        : "Zara: Geek Teknologi - Autis",
      icon: "🧩",
      stories: [
        isSimpleMode
          ? "Zara adalah anak autis yang memiliki fokus tinggi pada hal-hal yang dia sukai, terutama teknologi."
          : "Zara didiagnosis dengan autisme saat berusia 3 tahun dan memiliki sensitivitas sensorik tinggi.",
        isSimpleMode
          ? "Zara sangat senang bermain dengan komputer dan belajar programming. Dia bisa membuat game sederhana!"
          : "Dengan dukungan orang tua dan guru yang memahami kebutuhan sensoriknya, Zara berkembang pesat dalam bidang programming.",
        isSimpleMode
          ? "Zara sudah mendesain aplikasi mobile yang berguna. Dia membuktikan bahwa autis bisa berprestasi tinggi!"
          : "Zara telah merancang aplikasi yang membantu anak-anak autis lainnya. Kemampuan fokusnya menjadi kekuatan yang luar biasa.",
      ],
      color: "bg-purple-50 border-purple-300",
      icon_color: "text-purple-600",
    },
  ];

  const setListeningState = (state) => {
    setIsListening(state);
    isListeningRef.current = state;
  };

  // PERBAIKAN: Nada diubah agar lebih ramah (seperti asisten virtual)
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

      // Membuat suara masuk dan keluar lebih lembut
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(600, now, 0.15);
    playTone(850, now + 0.15, 0.25);
  };

  const speakUI = (text, onFinish) => {
    // Jangan bicara sama sekali untuk tuna_rungu
    if (!useVoiceControl || mode === "tuna_rungu") {
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

      // PERBAIKAN: Dihilangkan kondisi if (!isAutoRestart) agar ringtone SELALU bunyi setiap mic menyala
      playMicOnSound();
      
      console.log("Mikrofon aktif, silahkan bicara...");
    };

    recognition.onresult = (event) => {
      if (isSystemSpeakingRef.current) return;

      const transcript =
        event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Input Suara:", transcript);

      isIntentionalStopRef.current = true;
      try {
        recognitionRef.current.stop();
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
        setTimeout(() => {
          startListening(true);
        }, 1000);
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Gagal start mic:", e);
    }
  };

  const handleVoiceCommand = (transcript) => {
    if (
      transcript.includes("kembali") ||
      transcript.includes("menu") ||
      transcript.includes("utama")
    ) {
      isIntentionalStopRef.current = true;
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (activeIndex !== -1) {
        handleBackToMenu();
      } else {
        onBack();
      }
      return;
    }

    if (activeIndex === -1) {
      if (
        transcript.includes("reno") ||
        transcript.includes("satu")
      ) {
        handleSelectStory(0);
      } else if (
        transcript.includes("sinta") ||
        transcript.includes("dua")
      ) {
        handleSelectStory(1);
      } else if (
        transcript.includes("bunga") ||
        transcript.includes("tiga")
      ) {
        handleSelectStory(2);
      } else if (
        transcript.includes("ardi") ||
        transcript.includes("empat")
      ) {
        handleSelectStory(3);
      } else if (
        transcript.includes("zara") ||
        transcript.includes("lima")
      ) {
        handleSelectStory(4);
      } else {
        if (mode !== "tuna_rungu") {
          speakUI(
            "Sebutkan nama tokoh yang ingin didengar: Reno, Sinta, Bunga, Ardi, atau Zara.",
            () => startListening(true)
          );
        } else {
          startListening(true);
        }
      }
    }
  };

  const handleSelectStory = (index) => {
    setActiveIndex(index);
    setIsReading(true);
    
    const fullStoryText = caseStudies[index].stories.join(" ");
    const fullText = `${caseStudies[index].title}. ${fullStoryText}`;
    
    speakUI(fullText, () => {
      if (useVoiceControl && mode !== "tuna_rungu") {
        handleBackToMenu();
      } else {
        startListening(true);
      }
    });
  };

  const handleBackToMenu = () => {
    setActiveIndex(-1);
    setIsReading(false);
    speakUI("Ucapkan kembali untuk ke menu utama atau pilih cerita lagi. Sebutkan nama tokoh: Reno, Sinta, Bunga, Ardi, atau Zara.", () =>
      startListening(true)
    );
  };

  const handleBack = () => {
    isIntentionalStopRef.current = true;
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setListeningState(false);
    onBack();
  };

  useEffect(() => {
    if (useVoiceControl && mode !== "tuna_rungu") {
      const intro =
        activeIndex === -1
          ? "Selamat datang di studi kasus edukatif. Pilih cerita inspiratif dengan menyebutkan nama tokoh: Reno, Sinta, Bunga, Ardi, atau Zara."
          : `Cerita ${caseStudies[activeIndex].title} sedang ditampilkan. Ucapkan Kembali untuk pilih cerita lain.`;
      speakUI(intro, () => startListening());
    } else if (useVoiceControl && mode === "tuna_rungu") {
      startListening();
    }

    return () => {
      isIntentionalStopRef.current = true;
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
    // eslint-disable-next-line
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

  if (activeIndex === -1) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 p-4 sm:p-10 flex flex-col items-center">
        <div className="max-w-6xl w-full">
          <div className="flex justify-start mb-6">
            <button
              onClick={handleBack}
              className="text-cyan-700 font-bold bg-white px-4 py-2 rounded-full border-2 border-cyan-200 active:scale-95 transition-transform outline-none focus:ring-4 focus:ring-cyan-300 text-sm sm:text-base"
            >
              ⬅ Kembali
            </button>
          </div>

          <MicIndicator />

          <h1 className="text-3xl sm:text-4xl font-black text-cyan-900 text-center mb-2">
            Studi Kasus Edukatif 📚
          </h1>
          <p className="text-center text-cyan-700 font-medium mb-8 animate-pulse">
            {useVoiceControl ? (
              <>
                Sebutkan <b>nama tokoh</b> untuk memilih cerita
              </>
            ) : (
              <>Klik salah satu cerita inspiratif di bawah</>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((study, index) => (
              <button
                key={index}
                onClick={() => handleSelectStory(index)}
                className={`group relative overflow-hidden rounded-3xl border-4 transition-all duration-300 hover:scale-105 active:scale-95 outline-none focus:ring-8 ${study.color} ${study.color.includes("blue") ? "focus:ring-blue-300" : ""} ${study.color.includes("rose") ? "focus:ring-rose-300" : ""} ${study.color.includes("teal") ? "focus:ring-teal-300" : ""} ${study.color.includes("orange") ? "focus:ring-orange-300" : ""} ${study.color.includes("purple") ? "focus:ring-purple-300" : ""}`}
              >
                <div className="p-6 sm:p-8 text-center">
                  <div
                    className={`text-5xl sm:text-6xl mb-4 transform group-hover:scale-125 transition-transform ${study.icon_color}`}
                  >
                    {study.icon}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mb-3">
                    {study.title} 
                  </h2>
                  <p className="text-sm sm:text-base opacity-80 leading-relaxed font-medium">
                    {study.stories[0]}
                  </p>
                </div>
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${study.color.split("border-")[1]} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}
                ></div>
              </button>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white rounded-2xl border-2 border-cyan-200 shadow-lg text-center">
            <p className="text-cyan-900 font-bold text-lg">
              💡{" "}
              <span className="block mt-2">
                Setiap anak memiliki keunikan dan potensi yang luar biasa!
              </span>
            </p>
          </div>
        </div>
      </main>
    );
  }

  const currentStudy = caseStudies[activeIndex];

  return (
    <main className="min-h-screen bg-white p-4 sm:p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full pb-20">
        <div
          className={`${currentStudy.color} p-8 sm:p-12 rounded-[40px] border-4 shadow-inner mt-4`}
        >
          <h1 className="text-3xl sm:text-5xl font-black text-center mb-10 p-4 sm:p-6 rounded-2xl bg-white/50 backdrop-blur-sm">
            <span
              className={`text-5xl sm:text-6xl block mb-3 ${currentStudy.icon_color}`}
            >
              {currentStudy.icon}
            </span>
            {currentStudy.title}
          </h1>

          <div className="space-y-8">
            {currentStudy.stories.map((story, index) => (
              <div
                key={index}
                className="text-lg sm:text-2xl leading-relaxed font-medium p-6 sm:p-8 rounded-2xl bg-white/70 backdrop-blur-sm border-2 border-white/50 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                {!useVoiceControl && (
                  <span className="text-3xl font-black opacity-40 mr-3">
                    {index + 1}.
                  </span>
                )}
                {story}
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-white rounded-2xl border-3 border-dashed border-current/20 text-center">
            <p className="text-xl sm:text-2xl font-bold">
              ✨ Inspirasi: Tidak ada yang tidak mungkin dengan tekad dan
              dukungan! ✨
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center min-h-[64px]">
          {isListening && useVoiceControl && (
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

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center animate-in slide-in-from-bottom-4 duration-500 mt-6">
            <button
              onClick={() => handleBackToMenu()}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold text-base sm:text-lg rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-yellow-600"
            >
              ⬅ Kembali ke Menu Cerita
            </button>
            <button
              onClick={handleBack}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-base sm:text-lg rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 focus:ring-4 focus:ring-cyan-300"
            >
              🏠 Menu Utama Aplikasi
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}