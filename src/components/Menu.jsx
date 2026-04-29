import React from 'react';

export default function Menu({ mode, onResetMode }) {
  // Daftar Menu Utama
  const menuItems = [
    { 
      id: 'panduan', 
      title: 'Buku Panduan', 
      subtitle: 'Petunjuk penggunaan',
      icon: '📖', 
      color: 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200' 
    },
    { 
      id: 'cerita', 
      title: 'Buku Cerita', 
      subtitle: '(Audio Visual)',
      icon: '📚', 
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200' 
    },
    { 
      id: 'film', 
      title: 'Film Dongeng', 
      subtitle: 'Edukasi Seks (Audio Visual)',
      icon: '🎬', 
      color: 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200' 
    },
    { 
      id: 'game', 
      title: 'Game', 
      subtitle: 'Bermain sambil belajar',
      icon: '🎮', 
      color: 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200' 
    },
  ];

  const handleMenuClick = (menuTitle) => {
    // Logika navigasi ke halaman menu (bisa pakai react-router)
    console.log(`Membuka: ${menuTitle}`);
    alert(`Membuka halaman: ${menuTitle}`);
  };

  return (
    <main className="min-h-screen flex flex-col p-4 sm:p-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      
      <header className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 sm:p-6 rounded-3xl shadow-sm border-2 border-slate-100 mb-8 mt-4">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800">
            Halo! Mau belajar apa hari ini? ✨
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            Mode aktif: <span className="text-blue-600 font-bold capitalize underline decoration-yellow-400 decoration-2">{mode.replace('_', ' ')}</span>
          </p>
        </div>
        <button 
          onClick={onResetMode}
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-transform active:scale-95 text-sm border-2 border-slate-200 w-full sm:w-auto"
        >
          ⚙️ Ganti Mode
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 flex-grow content-start">
        {menuItems.map((menu) => (
          <button
            key={menu.id}
            onClick={() => handleMenuClick(menu.title)}
            className={`group flex flex-col sm:flex-row items-center sm:items-start p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-b-[6px] sm:border-b-8 transition-all duration-300 hover:-translate-y-2 active:translate-y-1 active:border-b-2 shadow-sm hover:shadow-xl outline-none focus:ring-8 focus:ring-opacity-50 ${menu.color}`}
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