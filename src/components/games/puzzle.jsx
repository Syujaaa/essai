import React, { useState, useEffect, useRef } from 'react';

const initialPieces = [
  { id: 'kaki', name: "Kaki", img: "👖", order: 3 },
  { id: 'kepala', name: "Kepala", img: "🧒", order: 1 },
  { id: 'badan', name: "Badan", img: "👕", order: 2 },
];

export default function Puzzle({ mode, onBack, speakUI, startListening, setVoiceContext, MicIndicator, voiceCommand }) {
  const [availablePieces, setAvailablePieces] = useState(initialPieces);
  const [placedPieces, setPlacedPieces] = useState([]);
  const [puzzleWon, setPuzzleWon] = useState(false);
  const [showError, setShowError] = useState(false);

  const availablePiecesRef = useRef(availablePieces);
  const isIntentionalStopRef = useRef(false);

  // [TAMBAHAN] Variabel untuk mengecek apakah mode saat ini mendukung suara
  const isVoiceMode = mode === 'tuna_netra' || mode === 'tuna_daksa';
  
  useEffect(() => {
    availablePiecesRef.current = availablePieces;
  }, [availablePieces]);

  useEffect(() => {
    setVoiceContext('puzzle');
    setAvailablePieces(initialPieces);
    setPlacedPieces([]);
    setPuzzleWon(false);
    setShowError(false);
    
    // Sesuaikan instruksi awal berdasarkan mode jika perlu
    if (isVoiceMode) {
        speakUI("Game Pazel dimulai. Susun tubuh dari atas ke bawah. Sebutkan, Kepala, Badan, atau Kaki?", () => startListening('puzzle'));
    } else {
        speakUI("Game Pazel dimulai. Susun tubuh dari atas ke bawah.");
    }
    
    return () => {
      isIntentionalStopRef.current = true;
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // [UBAH DI SINI] Mikrofon sekarang merespons untuk tuna_netra DAN tuna_daksa
    if (!voiceCommand || !isVoiceMode) return; 
    
    const { text, context } = voiceCommand;
    const currentAvailablePieces = availablePiecesRef.current;

    if (context === 'puzzle') {
      const foundPiece = currentAvailablePieces.find(p => text.includes(p.id));
      if (foundPiece) {
        handlePlacePiece(foundPiece);
      } else if (text.includes('kepala') || text.includes('badan') || text.includes('kaki')) {
        speakUI("Bagian itu sudah dipasang. Sebutkan yang lain.", () => startListening('puzzle'));
      } else {
        speakUI("Sebutkan Kepala, Badan, atau Kaki.", () => startListening('puzzle'));
      }
    } else if (context === 'game_over') {
      if (!text.includes('kembali') && !text.includes('menu')) {
        speakUI("Ucapkan Kembali.", () => startListening('game_over'));
      }
    }
    // eslint-disable-next-line
  }, [voiceCommand, mode, isVoiceMode]);

  const handlePlacePiece = (piece) => {
    setPlacedPieces(prevPlaced => {
      const newPlaced = [...prevPlaced, piece];
      setAvailablePieces(prevAvail => prevAvail.filter(p => p.id !== piece.id));
      
      if (newPlaced.length === 3) {
        const isCorrectOrder = newPlaced[0].order === 1 && newPlaced[1].order === 2 && newPlaced[2].order === 3;
        
        if (isCorrectOrder) {
          setPuzzleWon(true);
          setVoiceContext('game_over');
          
          if (isVoiceMode) {
              speakUI(`${piece.name} dipasang. Hebat! Susunan tubuhnya sempurna. Ucapkan Kembali.`, () => startListening('game_over'));
          } else {
              speakUI(`${piece.name} dipasang. Hebat! Susunan tubuhnya sempurna.`);
          }
        } else {
          setShowError(true);
          speakUI(`${piece.name} dipasang. Yah, susunannya salah. Susun ulang dari atas ke bawah ya!`, () => {
              setShowError(false);
              resetPuzzle();
          });
        }
      } else {
        if (isVoiceMode) {
            speakUI(`${piece.name} terpasang. Selanjutnya pasang apa?`, () => startListening('puzzle'));
        } else {
            speakUI(`${piece.name} terpasang.`);
        }
      }
      return newPlaced;
    });
  };

  const resetPuzzle = () => {
    setAvailablePieces(initialPieces);
    setPlacedPieces([]);
    setPuzzleWon(false);
    setShowError(false);
    setVoiceContext('puzzle');
    
    if (isVoiceMode) {
        speakUI("Sebutkan, Kepala, Badan, atau Kaki?", () => startListening('puzzle'));
    }
  };

  return (
    <main className="min-h-screen bg-cyan-50 p-4 sm:p-10 flex flex-col items-center">
      <div className="max-w-3xl w-full text-center">
        
        {!puzzleWon && (
          <div className="flex justify-between items-center mb-2 w-full">
            <button onClick={onBack} className="text-cyan-700 font-bold bg-white px-4 py-2 rounded-full border-2 border-cyan-200 active:scale-95 transition-transform">
              ⬅ Kembali
            </button>
          </div>
        )}
        
        <MicIndicator />

        <h1 className="text-3xl sm:text-4xl font-black text-cyan-900 mb-2">Susun Tubuh Manusia</h1>
        
        {!puzzleWon && (
          <p className="text-cyan-700 font-medium mb-6 animate-pulse">
            {/* [UBAH DI SINI] Teks UI menyesuaikan isVoiceMode */}
            {isVoiceMode ? (
              <>Ucapkan <b>"Kepala"</b>, <b>"Badan"</b>, atau <b>"Kaki"</b></>
            ) : (
              <>Pilih dan susun bagian tubuh dari atas ke bawah</>
            )}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-10 items-center justify-center mt-4">
          
          <div className={`bg-white p-6 rounded-3xl border-4 ${showError ? 'border-red-400' : 'border-cyan-200'} flex flex-col gap-2 min-h-[350px] w-[200px] shadow-lg relative`}>
            
            {showError && (
              <div className="absolute inset-0 bg-red-50/95 rounded-[20px] flex flex-col items-center justify-center z-10 animate-in zoom-in duration-200">
                <div className="text-7xl drop-shadow-md mb-2">❌</div>
                <p className="text-red-700 font-bold text-lg leading-tight">Susunan<br/>Salah!</p>
              </div>
            )}

            {placedPieces.map((p, index) => (
              <div key={index} className="text-7xl bg-cyan-50 rounded-2xl p-4 animate-in slide-in-from-top-4">{p.img}</div>
            ))}
            {Array.from({ length: 3 - placedPieces.length }).map((_, i) => (
              <div key={`empty-${i}`} className="text-5xl bg-slate-100 text-slate-300 border-4 border-dashed border-slate-200 rounded-2xl p-4 h-[100px] flex items-center justify-center">?</div>
            ))}
          </div>

          <div className="flex sm:flex-col gap-4">
            {puzzleWon ? (
              <div className="bg-green-100 p-8 rounded-[30px] border-4 border-green-400 text-center animate-in zoom-in shadow-lg">
                <div className="text-7xl mb-4">🎉</div>
                <h3 className="font-black text-green-800 text-2xl mb-4">Sempurna!</h3>
                <p className="font-medium text-green-700 mb-6">
                  {/* [UBAH DI SINI] Pesan menang disesuaikan untuk mode suara */}
                  {isVoiceMode ? <>Ucapkan <b>"Kembali"</b></> : <>Permainan selesai.</>}
                </p>
                
                <button 
                  onClick={onBack} 
                  className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black text-xl rounded-2xl shadow-md active:scale-95 transition-all"
                >
                  ⬅ Kembali ke Menu
                </button>
              </div>
            ) : (
              !showError && availablePieces.map((piece) => (
                <button 
                  key={piece.id} 
                  onClick={() => handlePlacePiece(piece)} 
                  className="text-6xl bg-white p-4 rounded-2xl shadow-md border-b-8 border-slate-200 active:scale-95 transition-transform"
                >
                  {piece.img}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}