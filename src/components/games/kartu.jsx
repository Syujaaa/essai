import React, { useState, useEffect, useRef } from 'react';

const baseCards = [
  { id: 1, part: "Rambut dan Kepala", safe: true, img: "🧒", reason: "Rambut dan kepala boleh disentuh, misalnya saat ayah atau ibu mengusap kepalamu." },
  { id: 2, part: "Bibir atau Mulut", safe: false, img: "👄", reason: "Bibir atau mulut tidak boleh disentuh siapa pun, karena ini adalah area pribadimu." },
  { id: 3, part: "Dada", safe: false, img: "👕", reason: "Dada tidak boleh disentuh. Ini adalah bagian tubuh rahasia yang tertutup bajumu." },
  { id: 4, part: "Tangan dan Bahu", safe: true, img: "✋", reason: "Tangan dan bahu boleh disentuh, misalnya saat kamu bersalaman dengan teman." },
  { id: 5, part: "Pantat atau Kemaluan", safe: false, img: "🩲", reason: "Pantat atau kemaluan sangat tidak boleh disentuh. Ini area rahasia yang tertutup pakaian dalammu." }
];

const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// PERBAIKAN: Tangkap prop `mode`
export default function Kartu({ mode, onBack, speakUI, startListening, setVoiceContext, MicIndicator, voiceCommand }) {
  const [shuffledCards, setShuffledCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const stateRef = useRef({ index: 0, cards: [], score: 0 });
  const isIntentionalStopRef = useRef(false);
  
  const isInitializedRef = useRef(false);
  
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
    
    speakUI(`Game Kartu dimulai. ${newShuffledCards[0].part}. Boleh, atau tidak boleh disentuh?`, () => startListening('kartu'));
  };

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      startGame();
    }
    
    return () => {
      isIntentionalStopRef.current = true;
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Abaikan voice command sepenuhnya jika bukan mode tuna netra
    if (!voiceCommand || mode !== 'tuna_netra') return;
    const { text, context } = voiceCommand;

    if (context === 'kartu') {
      if (text.includes('tidak') || text.includes('ndak') || text.includes('nggak')) {
        handleAnswer(false);
      } else if (text.includes('boleh') || text.includes('ya') || text.includes('iya')) {
        handleAnswer(true);
      } else {
        speakUI("Ucapkan Boleh, atau Tidak Boleh.", () => startListening('kartu'));
      }
    } else if (context === 'game_over') {
      if (text.includes('paham') || text.includes('mengerti')) {
        onBack(); 
      } 
      else if (!text.includes('kembali') && !text.includes('menu')) {
        speakUI("Ucapkan Paham jika kamu sudah mengerti.", () => startListening('game_over'));
      }
    }
    // eslint-disable-next-line
  }, [voiceCommand, mode]);

  const handleAnswer = (answerIsSafe) => {
    const { index, cards, score: currentScore } = stateRef.current;
    if (cards.length === 0) return;

    const isCorrect = cards[index].safe === answerIsSafe;
    let responseText = "";
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback('benar');
      responseText = "Pintar sekali! Jawabanmu benar.";
    } else {
      setFeedback('salah');
      responseText = "O-ow, kurang tepat. Ingat bagian rahasiamu ya!";
    }

    speakUI(responseText, () => {
      setFeedback(null);
      
      if (index < cards.length - 1) {
        const nextIndex = index + 1;
        setCurrentCardIndex(nextIndex);
        speakUI(`Selanjutnya, ${cards[nextIndex].part}. Boleh, atau tidak boleh?`, () => startListening('kartu'));
      } else {
        setFeedback('selesai');
        setVoiceContext('game_over');
        
        const finalScore = currentScore + (isCorrect ? 1 : 0);
        const totalCards = cards.length;
        const totalSalah = totalCards - finalScore;
        
        const explanationText = cards.map(c => c.reason).join(" ");
        const endSpeech = `Permainan selesai! Kamu menjawab benar ${finalScore}, dan salah ${totalSalah}. Dengarkan penjelasannya ya. ${explanationText} Jika sudah paham, ucapkan Paham.`;
        
        speakUI(endSpeech, () => startListening('game_over'));
      }
    });
  };

  if (shuffledCards.length === 0) return null;

  return (
    <main className="min-h-screen bg-rose-50 p-4 sm:p-10 flex flex-col items-center">
      <div className="max-w-3xl w-full text-center">
        <div className="flex justify-between items-center mb-4">
          <button onClick={onBack} className="text-rose-600 font-bold bg-white px-4 py-2 rounded-full border-2 border-rose-200 shadow-sm active:scale-95 transition-transform">
            ⬅ Kembali
          </button>
          <div className="text-xl font-bold text-rose-800 bg-white px-6 py-2 rounded-full border-2 border-rose-200 shadow-sm">
            Skor: ⭐️ {score}
          </div>
        </div>
        
        <MicIndicator />

        {feedback === 'selesai' ? (
          <div className="bg-white p-6 sm:p-10 rounded-[40px] shadow-xl border-4 border-rose-300 animate-in zoom-in duration-500 mt-4">
            <h1 className="text-3xl font-black text-rose-900 mb-2">Permainan Selesai!</h1>
            <p className="text-xl text-rose-700 font-bold mb-6">
              ✅ Benar: {score} &nbsp; | &nbsp; ❌ Salah: {shuffledCards.length - score}
            </p>
            
            <div className="text-left space-y-4 mb-8 bg-rose-50 p-6 rounded-3xl max-h-[40vh] overflow-y-auto border-2 border-rose-100">
              {shuffledCards.map(c => (
                <div key={c.id} className="flex gap-4 items-start">
                  <div className="text-3xl">{c.img}</div>
                  <div>
                    <span className={`font-bold text-sm px-2 py-1 rounded-md mb-1 inline-block ${c.safe ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {c.safe ? 'Boleh Disentuh' : 'Tidak Boleh'}
                    </span>
                    <p className="text-rose-900 text-sm sm:text-base font-medium leading-relaxed">
                      {c.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* PERBAIKAN Teks Akhir Game */}
            <p className="text-xl text-rose-700 font-medium animate-pulse">
              {mode === 'tuna_netra' ? <>Ucapkan <b>"Paham"</b></> : <button onClick={onBack} className="text-rose-600 font-bold bg-white px-4 py-2 rounded-full border-2 border-rose-200 shadow-sm active:scale-95 transition-transform">
            ⬅ Kembali
          </button>}
            </p>
          </div>
        ) : (
          <div className="bg-white p-8 sm:p-12 rounded-[40px] shadow-xl border-4 border-rose-300 relative mt-4">
            {feedback && feedback !== 'selesai' && (
              <div className={`absolute inset-0 flex items-center justify-center rounded-[36px] z-10 ${feedback === 'benar' ? 'bg-green-100/95 text-green-600' : 'bg-red-100/95 text-red-600'} animate-in fade-in zoom-in duration-300`}>
                <div className="text-9xl drop-shadow-lg">{feedback === 'benar' ? '✅' : '❌'}</div>
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-rose-900 mb-8">Boleh disentuh atau tidak?</h2>
            
            <div className="text-9xl mb-6 animate-in slide-in-from-right-10 drop-shadow-md">{shuffledCards[currentCardIndex].img}</div>
            <p className="text-3xl font-black text-rose-800 mb-10">{shuffledCards[currentCardIndex].part}</p>
            
            {/* PERBAIKAN Teks Instruksi Boleh/Tidak */}
            <p className="text-rose-600 font-medium animate-pulse mb-4">
              {mode === 'tuna_netra' ? <>Ucapkan <b>"Boleh"</b> atau <b>"Tidak Boleh"</b></> : <>Pilih <b>"BOLEH"</b> atau <b>"TIDAK"</b></>}
            </p>

            <div className="flex gap-4 justify-center">
              <button onClick={() => handleAnswer(true)} disabled={feedback !== null} className="px-8 py-4 bg-green-400 hover:bg-green-500 text-green-900 font-black text-xl rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50">🟢 BOLEH</button>
              <button onClick={() => handleAnswer(false)} disabled={feedback !== null} className="px-8 py-4 bg-red-400 hover:bg-red-500 text-red-900 font-black text-xl rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50">🛑 TIDAK</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}