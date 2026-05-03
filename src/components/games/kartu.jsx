import React, { useState, useEffect, useRef } from 'react';

const baseCards = [
  { 
    id: 1, 
    part: "Rambut dan Kepala", simplePart: "Rambut", 
    safe: true, img: "🧒", 
    reason: "Rambut dan kepala boleh disentuh, misalnya saat ayah atau ibu mengusap kepalamu.",
    simpleReason: "Kepala dan rambut boleh diusap oleh ayah atau ibu."
  },
  { 
    id: 2, 
    part: "Bibir atau Mulut", simplePart: "Mulut", 
    safe: false, img: "👄", 
    reason: "Bibir atau mulut tidak boleh disentuh sembarang orang, karena ini adalah area pribadimu.",
    simpleReason: "Mulut tidak boleh dipegang orang lain."
  },
  { 
    id: 3, 
    part: "Dada", simplePart: "Dada", 
    safe: false, img: "👕", 
    reason: "Dada tidak boleh disentuh sembarang orang. Ini adalah bagian tubuh rahasia yang tertutup bajumu.",
    simpleReason: "Dada ditutup baju. Tidak boleh dipegang orang lain."
  },
  { 
    id: 4, 
    part: "Tangan dan Bahu", simplePart: "Tangan", 
    safe: true, img: "✋", 
    reason: "Tangan dan bahu boleh disentuh, misalnya saat kamu bersalaman dengan teman.",
    simpleReason: "Tangan boleh dipegang saat salaman dengan teman."
  },
  { 
    id: 5, 
    part: "Pantat atau Kemaluan", simplePart: "Pantat dan Kelamin", 
    safe: false, img: "🩲", 
    reason: "Pantat atau kemaluan sangat tidak boleh disentuh sembarang orang. Ini area rahasia yang tertutup pakaian dalammu.",
    simpleReason: "Pantat atau kemaluan ditutup celana dalam. Sama sekali tidak boleh dipegang orang lain."
  }
];

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function Kartu({ mode, onBack, speakUI, startListening, setVoiceContext, MicIndicator, voiceCommand }) {
  const [shuffledCards, setShuffledCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const stateRef = useRef({ index: 0, cards: [], score: 0 });
  const isIntentionalStopRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Deteksi mode yang butuh bahasa sederhana
  const isSimpleMode = mode === 'tuna_grahita' || mode === 'autis';
  
  // Deteksi mode yang menggunakan suara (Tuna Netra & Tuna Daksa)
  const useVoiceControl = mode === 'tuna_netra' || mode === 'tuna_daksa';

  // Helper untuk mengambil teks sesuai mode
  const getPartName = (card) => isSimpleMode ? card.simplePart : card.part;
  const getReasonText = (card) => isSimpleMode ? card.simpleReason : card.reason;
  
  useEffect(() => {
    stateRef.current = { index: currentCardIndex, cards: shuffledCards, score };
  }, [currentCardIndex, shuffledCards, score]);

  const startGame = () => {
    const newShuffledCards = shuffleArray(baseCards);
    setShuffledCards(newShuffledCards);
    setCurrentCardIndex(0);
    setScore(0);
    setFeedback(null);
    setVoiceContext('kartu');
    
    // PERBAIKAN: Menambahkan konteks "orang lain/sembarang orang" pada awal permainan
    const startMsg = isSimpleMode 
      ? `Ayo main! ${getPartName(newShuffledCards[0])}. Boleh dipegang orang lain, atau tidak boleh?`
      : `Game Kartu dimulai. ${newShuffledCards[0].part}. Boleh, atau tidak boleh disentuh sembarang orang?`;

    speakUI(startMsg, () => startListening('kartu'));
  };

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      startGame();
    }
    
    return () => {
      isIntentionalStopRef.current = true;
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!voiceCommand || !useVoiceControl) return;
    const { text, context } = voiceCommand;

    if (context === 'kartu') {
      if (text.includes('tidak') || text.includes('ndak') || text.includes('nggak')) {
        handleAnswer(false);
      } else if (text.includes('boleh') || text.includes('ya') || text.includes('iya')) {
        handleAnswer(true);
      } else {
        const errorMsg = isSimpleMode ? "Bilang Boleh, atau Tidak Boleh." : "Ucapkan Boleh, atau Tidak Boleh.";
        speakUI(errorMsg, () => startListening('kartu'));
      }
    } else if (context === 'game_over') {
      if (text.includes('paham') || text.includes('mengerti') || text.includes('kembali') || text.includes('menu')) {
        onBack(); 
      } 
      else {
        const errorMsg = isSimpleMode ? "Bilang Paham kalau kamu mengerti." : "Ucapkan Paham jika kamu sudah mengerti.";
        speakUI(errorMsg, () => startListening('game_over'));
      }
    }
    // eslint-disable-next-line
  }, [voiceCommand, useVoiceControl, mode]);

  const handleAnswer = (answerIsSafe) => {
    const { index, cards, score: currentScore } = stateRef.current;
    if (cards.length === 0) return;

    const isCorrect = cards[index].safe === answerIsSafe;
    let responseText = "";
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback('benar');
      responseText = isSimpleMode ? "Hebat! Jawabanmu betul." : "Pintar sekali! Jawabanmu benar.";
    } else {
      setFeedback('salah');
      // PERBAIKAN: Konteks kepemilikan tubuh agar dipahami
      responseText = isSimpleMode ? "Oh, salah. Ingat ya, tubuhmu tidak boleh dipegang orang lain." : "O-ow, kurang tepat. Ingat bagian rahasiamu tidak boleh disentuh sembarang orang!";
    }

    speakUI(responseText, () => {
      setFeedback(null);
      
      if (index < cards.length - 1) {
        const nextIndex = index + 1;
        setCurrentCardIndex(nextIndex);
        
        // PERBAIKAN: Menambahkan konteks "orang lain/sembarang orang" pada soal berikutnya
        const nextMsg = isSimpleMode 
          ? `Sekarang, ${getPartName(cards[nextIndex])}. Boleh dipegang orang lain, atau tidak boleh?`
          : `Selanjutnya, ${cards[nextIndex].part}. Boleh, atau tidak boleh disentuh sembarang orang?`;

        speakUI(nextMsg, () => startListening('kartu'));
      } else {
        setFeedback('selesai');
        setVoiceContext('game_over');
        
        const finalScore = currentScore + (isCorrect ? 1 : 0);
        const totalCards = cards.length;
        const totalSalah = totalCards - finalScore;
        
        const explanationText = cards.map(c => getReasonText(c)).join(" ");
        
        // PERBAIKAN: Narator cukup menyuruh bilang paham untuk mode mikrofon, sisanya suruh klik
        const promptAkhir = useVoiceControl 
          ? (isSimpleMode ? "Kalau sudah mengerti, bilang Paham." : "Jika sudah paham, ucapkan Paham.")
          : (isSimpleMode ? "Silakan klik tombol Kembali jika sudah mengerti." : "Silakan klik tombol Kembali jika sudah paham.");

        const endSpeech = isSimpleMode
          ? `Hore, selesai! Kamu betul ${finalScore}, dan salah ${totalSalah}. Dengarkan ya. ${explanationText} ${promptAkhir}`
          : `Permainan selesai! Kamu menjawab benar ${finalScore}, dan salah ${totalSalah}. Dengarkan penjelasannya ya. ${explanationText} ${promptAkhir}`;
        
        if (mode !== 'tuna_rungu') {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(endSpeech);
          utterance.lang = 'id-ID';
          utterance.onend = () => {
            if (useVoiceControl) startListening('game_over');
          };
          setTimeout(() => {
            window.speechSynthesis.speak(utterance);
          }, 100);
        } else {
          if (useVoiceControl) startListening('game_over');
        }
      }
    });
  };

  if (shuffledCards.length === 0) return null;

  return (
    <main className="min-h-screen bg-rose-50 p-4 sm:p-10 flex flex-col items-center">
      <div className="max-w-3xl w-full text-center">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={onBack} 
            className="text-rose-600 font-bold bg-white px-4 py-2 rounded-full border-2 border-rose-200 shadow-sm active:scale-95 transition-transform outline-none focus:ring-4 focus:ring-rose-300"
          >
            ⬅ Kembali
          </button>
          <div className="text-xl font-bold text-rose-800 bg-white px-6 py-2 rounded-full border-2 border-rose-200 shadow-sm">
            {isSimpleMode ? 'Bintang' : 'Skor'}: ⭐️ {score}
          </div>
        </div>
        
        <MicIndicator />

        {feedback === 'selesai' ? (
          <div className="bg-white p-6 sm:p-10 rounded-[40px] shadow-xl border-4 border-rose-300 animate-in zoom-in duration-500 mt-4">
            <h1 className="text-3xl font-black text-rose-900 mb-2">
              {isSimpleMode ? "Hore, Selesai!" : "Permainan Selesai!"}
            </h1>
            <p className="text-xl text-rose-700 font-bold mb-6">
              ✅ {isSimpleMode ? 'Betul' : 'Benar'}: {score} &nbsp; | &nbsp; ❌ Salah: {shuffledCards.length - score}
            </p>
            
            <div className="text-left space-y-4 mb-8 bg-rose-50 p-6 rounded-3xl max-h-[40vh] overflow-y-auto border-2 border-rose-100 focus:outline-none focus:ring-4 focus:ring-rose-200" tabIndex="0">
              {shuffledCards.map(c => (
                <div key={c.id} className="flex gap-4 items-start">
                  <div className="text-3xl">{c.img}</div>
                  <div>
                    {/* PERBAIKAN: Penyesuaian label UI untuk konteks orang lain */}
                    <span className={`font-bold text-sm px-2 py-1 rounded-md mb-1 inline-block ${c.safe ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {c.safe 
                        ? (isSimpleMode ? 'Boleh Dipegang Orang Lain' : 'Boleh Disentuh') 
                        : (isSimpleMode ? 'Tidak Boleh Dipegang Orang Lain' : 'Tidak Boleh Disentuh Sembarang Orang')}
                    </span>
                    <p className="text-rose-900 text-sm sm:text-base font-medium leading-relaxed">
                      {getReasonText(c)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              {/* PERBAIKAN: Menghapus instruksi "klik tombol di bawah" dari teks panduan suara */}
              {useVoiceControl && (
                <p className="text-lg text-rose-700 font-medium animate-pulse mb-2">
                  Ucapkan <b>"Paham"</b>
                </p>
              )}
              <button 
                onClick={onBack} 
                className="text-white font-bold bg-rose-500 hover:bg-rose-600 px-8 py-4 rounded-full border-b-4 border-rose-700 shadow-lg active:scale-95 active:border-b-0 active:translate-y-1 transition-all outline-none focus:ring-4 focus:ring-rose-300 text-lg w-full sm:w-auto"
              >
                ⬅ Kembali ke Menu
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 sm:p-12 rounded-[40px] shadow-xl border-4 border-rose-300 relative mt-4">
            {feedback && feedback !== 'selesai' && (
              <div className={`absolute inset-0 flex items-center justify-center rounded-[36px] z-10 ${feedback === 'benar' ? 'bg-green-100/95 text-green-600' : 'bg-red-100/95 text-red-600'} animate-in fade-in zoom-in duration-300`}>
                <div className="text-9xl drop-shadow-lg">{feedback === 'benar' ? '✅' : '❌'}</div>
              </div>
            )}
            
            {/* PERBAIKAN: Memperjelas konteks pada pertanyaan utama di UI */}
            <h2 className="text-2xl sm:text-3xl font-bold text-rose-900 mb-8">
              {isSimpleMode ? "Boleh dipegang orang lain atau tidak?" : "Boleh disentuh sembarang orang atau tidak?"}
            </h2>
            
            <div className="text-9xl mb-6 animate-in slide-in-from-right-10 drop-shadow-md">{shuffledCards[currentCardIndex].img}</div>
            <p className="text-3xl font-black text-rose-800 mb-10">
              {getPartName(shuffledCards[currentCardIndex])}
            </p>
            
            <p className="text-rose-600 font-medium animate-pulse mb-4">
              {useVoiceControl 
                ? <>Ucapkan <b>"Boleh"</b> atau <b>"Tidak Boleh"</b></> 
                : <>Pilih <b>"BOLEH"</b> atau <b>"TIDAK"</b></>
              }
            </p>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => handleAnswer(true)} 
                disabled={feedback !== null} 
                className="px-8 py-4 bg-green-400 hover:bg-green-500 text-green-900 font-black text-xl rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50 outline-none focus:ring-8 focus:ring-green-200"
              >
                🟢 BOLEH
              </button>
              <button 
                onClick={() => handleAnswer(false)} 
                disabled={feedback !== null} 
                className="px-8 py-4 bg-red-400 hover:bg-red-500 text-red-900 font-black text-xl rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50 outline-none focus:ring-8 focus:ring-red-200"
              >
                🛑 TIDAK
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}