/**
 * Utility untuk menangani permission mikrofon
 */

export const MicrophonePermissionHandler = {
  /**
   * Cek error dari speech recognition dan return pesan yang sesuai
   * @param {string} errorType - error.error dari recognition.onerror
   * @returns {object|null} - {title, message} atau null jika bukan permission error
   */
  getPermissionError: (errorType) => {
    const errors = {
      "not-allowed": {
        title: "🔒 Akses Mikrofon Ditolak",
        message:
          "Aplikasi ini memerlukan akses ke mikrofon untuk fitur suara. Silakan aktifkan izin mikrofon di pengaturan browser Anda, kemudian coba lagi.",
        actionText: "Coba Lagi",
      },
      network: {
        title: "🌐 Masalah Jaringan",
        message:
          "Terjadi masalah dengan koneksi jaringan. Periksa koneksi internet Anda dan coba lagi.",
        actionText: "Coba Lagi",
      },
      "no-speech": {
        title: "🤐 Tidak Ada Suara",
        message:
          "Tidak terdeteksi suara. Silakan pastikan mikrofon Anda berfungsi dengan baik.",
        actionText: "Coba Lagi",
      },
      "audio-capture": {
        title: "🎙️ Kesalahan Mikrofon",
        message:
          "Kesalahan pada perangkat audio. Periksa apakah mikrofon Anda terhubung dengan baik.",
        actionText: "Coba Lagi",
      },
    };

    return errors[errorType] || null;
  },

  /**
   * Cek apakah error tersebut adalah permission denied
   */
  isPermissionDenied: (errorType) => {
    return errorType === "not-allowed";
  },
};
