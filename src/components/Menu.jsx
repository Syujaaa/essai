import React, { useEffect, useRef, useState } from 'react';

export default function Menu({ mode, onResetMode, onNavigate }) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  
  const speak = (text, onFinish) => {
   
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9; 
   
    if (onFinish) {
      utterance.onend = onFinish;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Daftar Menu Utama yang Diperbarui
  const menuItems = [
    { 
      id: 'panduan', 
      title: 'Buku Panduan', 
      subtitle: 'Petunjuk penggunaan aplikasi',
      icon: '📖', 
      color: 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200' 
    },
    { 
      id: 'cerita', 
      title: 'Buku Cerita', 
      subtitle: 'Dongeng pencegahan pelecehan seksual',
      icon: '📚', 
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200' 
    },
    { 
      id: 'film', 
      title: 'Film Dongeng', 
      subtitle: 'Edukasi Seksual (Audio Visual)',
      icon: '🎬', 
      color: 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200' 
    },
    { 
      id: 'game', 
      title: 'Game Edukasi', 
      subtitle: 'Bermain sambil belajar perlindungan diri',
      icon: '🎮', 
      color: 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200' 
    },
    { 
      id: 'studi_kasus', 
      title: 'Studi Kasus Edukatif', 
      subtitle: 'Belajar merespons situasi nyata & bahaya',
      icon: '💡', 
      color: 'bg-cyan-100 text-cyan-900 border-cyan-300 hover:bg-cyan-200' 
    },
  ];

  // Fungsi untuk memulai mendengarkan perintah suara
  const startListening = () => {
    if (mode !== 'tuna_netra') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'id-ID';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log("Input Suara:", transcript);

      // Logika untuk mengenali perintah suara menu
      let selectedMenu = null;
      
      if (transcript.includes("panduan")) {
        selectedMenu = menuItems.find(m => m.id === 'panduan');
        if (selectedMenu) handleMenuClick(selectedMenu);
      } else if (transcript.includes("cerita")) {
        selectedMenu = menuItems.find(m => m.id === 'cerita');
        if (selectedMenu) handleMenuClick(selectedMenu);
      } else if (transcript.includes("film")) {
        selectedMenu = menuItems.find(m => m.id === 'film');
        if (selectedMenu) handleMenuClick(selectedMenu);
      } else if (transcript.includes("game")) {
        selectedMenu = menuItems.find(m => m.id === 'game');
        if (selectedMenu) handleMenuClick(selectedMenu);
      } else if (transcript.includes("studi kasus") || transcript.includes("studi")) {
        selectedMenu = menuItems.find(m => m.id === 'studi_kasus');
        if (selectedMenu) handleMenuClick(selectedMenu);
      } else if (transcript.includes("ganti mode")) {
        speak("Mengubah mode", () => {
          onResetMode();
        });
      }
    };

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
      if (mode === 'tuna_netra') {
        setTimeout(() => recognition.start(), 1000);
      }
    };

    recognition.start();
  };

  // Cleanup speech recognition saat component unmount atau mode berubah
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    };
  }, [mode]);

  useEffect(() => {
  
    if (mode === 'tuna_netra') {

      const introText = "Anda berada di halaman utama. Berikut menu-menu yang tersedia.";
      
      speak(introText, () => {

        const allMenuText = menuItems
          .map(item => `${item.title}. ${item.subtitle}`)
          .join('. ');
        
        speak(allMenuText, () => {
          // Setelah membaca semua menu, tanyakan untuk memilih
          const promptText = "Silakan katakan nama menu yang ingin Anda buka. Anda dapat memilih Panduan, Cerita, Film, Game, atau Studi Kasus.";
          speak(promptText, () => {
            // Setelah membaca semua menu, mulai mendengarkan
            startListening();
          });
        });
      });
    }
  }, [mode]);

const handleMenuClick = (menu) => {

  if (menu.id === 'cerita') {
    speak(`Membuka ${menu.title}`, () => {
      onNavigate('cerita');
    });
  } else {
    speak(`Membuka ${menu.title}`);
    alert(`Fitur ${menu.title} akan segera hadir!`);
  }
};

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-8 animate-in fade-in duration-700 max-w-6xl mx-auto">
      
      <header className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 sm:p-6 rounded-3xl shadow-sm border-2 border-slate-100 mb-8 mt-4">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 
            className="text-2xl sm:text-3xl font-black text-slate-800"
            tabIndex="0"
            onFocus={() => mode !== 'tuna_rungu' && speak("Halo! Mau belajar apa hari ini?")}
          >
            Halo! Mau belajar apa hari ini? ✨
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            Mode aktif: <span className="text-blue-600 font-bold capitalize underline decoration-yellow-400 decoration-2">{mode.replace('_', ' ')}</span>
          </p>
        </div>
        <button 
          onClick={onResetMode}
          onMouseEnter={() => mode !== 'tuna_rungu' && speak("Ganti Mode")}
          onFocus={() => mode !== 'tuna_rungu' && speak("Tombol Ganti Mode")}
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-transform active:scale-95 text-sm border-2 border-slate-200 w-full sm:w-auto focus:ring-4 focus:ring-blue-300"
        >
          ⚙️ Ganti Mode
        </button>
      </header>

      {mode === 'tuna_netra' && isListening && (
        <div className="mb-6 flex justify-center items-center gap-3 text-green-600">
          <div className="flex gap-1">
            <div className="w-1 h-3 sm:h-4 bg-green-500 animate-bounce"></div>
            <div className="w-1 h-5 sm:h-6 bg-green-500 animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1 h-3 sm:h-4 bg-green-500 animate-bounce [animation-delay:0.4s]"></div>
          </div>
          <span className="text-sm sm:text-base font-bold tracking-widest uppercase">Mikrofon Aktif</span>
        </div>
      )}

      {/* Container Flex-Wrap agar 5 Menu tampil Rapi & Tengah */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 flex-grow content-start pb-10">
        {menuItems.map((menu) => (
          <button
            key={menu.id}
            onClick={() => handleMenuClick(menu)}
            
            // Aksesibilitas Suara: Membaca isi menu saat diarahkan (Mouse/Keyboard Tab)
            // Tapi untuk Tuna Netra dan Tuna Rungu, tidak ada suara hover
            onMouseEnter={() => mode !== 'tuna_netra' && mode !== 'tuna_rungu' && speak(`${menu.title}. ${menu.subtitle}`)}
            onFocus={() => mode !== 'tuna_netra' && mode !== 'tuna_rungu' ? speak(`Menu ${menu.title}. ${menu.subtitle}`) : null}
            
            // Layout fleksibel: mengambil 100% lebar di HP, dan sekitar 48% di Tablet/PC
            className={`group w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] flex flex-col sm:flex-row items-center sm:items-start p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-b-[6px] sm:border-b-8 transition-all duration-300 hover:-translate-y-2 active:translate-y-1 active:border-b-2 shadow-sm hover:shadow-xl outline-none focus:ring-8 focus:ring-opacity-50 ${menu.color}`}
          >
            {/* Ikon Menu */}
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