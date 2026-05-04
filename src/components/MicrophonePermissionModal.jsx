import React from "react";

/**
 * Modal untuk menampilkan warning ketika mikrofon permission ditolak
 * @param {boolean} isOpen - Apakah modal terbuka
 * @param {string} title - Judul warning
 * @param {string} message - Pesan warning
 * @param {string} actionText - Teks tombol action
 * @param {function} onRetry - Callback ketika tombol "Coba Lagi" diklik
 * @param {function} onClose - Callback ketika modal ditutup/continue
 */
export default function MicrophonePermissionModal({
  isOpen,
  title,
  message,
  actionText = "Coba Lagi",
  onRetry,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 border-4 border-red-300 animate-in zoom-in duration-300">
        {/* Icon dan Judul */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">
            {title.split(" ")[0]}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            {title.split(" ").slice(1).join(" ")}
          </h2>
        </div>

        {/* Pesan */}
        <p className="text-center text-slate-700 font-medium text-base sm:text-lg mb-8 leading-relaxed">
          {message}
        </p>

        {/* Panduan */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-8">
          <p className="text-sm sm:text-base font-bold text-blue-900 mb-3">
            📝 Cara mengizinkan akses mikrofon:
          </p>
          <ol className="text-xs sm:text-sm text-blue-800 space-y-2 ml-4">
            <li>1. Cari ikon kunci 🔒 di sebelah kiri URL</li>
            <li>2. Klik ikon tersebut</li>
            <li>3. Cari "Mikrofon" atau "Microphone"</li>
            <li>4. Ubah ke "Izinkan" atau "Allow"</li>
            <li>5. Muat ulang halaman ini</li>
          </ol>
        </div>

        {/* Tombol */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-transform active:scale-95 outline-none focus:ring-4 focus:ring-slate-300"
          >
            Tutup
          </button>
          <button
            onClick={onRetry}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-transform active:scale-95 outline-none focus:ring-4 focus:ring-red-300 animate-pulse"
          >
            🎤 {actionText}
          </button>
        </div>

        {/* Info tambahan */}
        <p className="text-center text-xs text-slate-500 mt-6">
          💡 Jika masalah tetap berlanjut, coba gunakan browser lain atau
          hubungi dukungan teknis.
        </p>
      </div>
    </div>
  );
}
