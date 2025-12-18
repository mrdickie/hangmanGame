
import React, { useState, useCallback, useEffect } from 'react';
import { GameState, GameData, Challenge } from './types';
import { generateAIChallenge, getSmartHint } from './services/geminiService';
import HangmanDrawing from './components/HangmanDrawing';
import Keyboard from './components/Keyboard';

const MAX_WORD_LENGTH = 18;
const MAX_TOTAL_LENGTH = 48;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [gameData, setGameData] = useState<GameData>({ word: '', category: '', clue: '' });
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  // Derive status
  const wrongLetters = guessedLetters.filter(l => !gameData.word.includes(l));
  const correctLetters = guessedLetters.filter(l => gameData.word.includes(l));
  const isWinner = gameData.word.length > 0 && gameData.word.split('').every(l => l === ' ' || guessedLetters.includes(l));
  const isLoser = wrongLetters.length >= 6;

  useEffect(() => {
    if (isWinner || isLoser) {
      setGameState('RESULT');
    }
  }, [isWinner, isLoser]);

  const startSetup = () => {
    setGameState('SETUP');
    setGameData({ word: '', category: '', clue: '' });
    setSetupError(null);
  };

  const startAIChallenge = async () => {
    setLoading(true);
    try {
      const challenge = await generateAIChallenge();
      setGameData(challenge);
      setGuessedLetters([]);
      setHint(null);
      setGameState('PLAYING');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateWord = (val: string): boolean => {
    const words = val.split(' ');
    if (words.some(w => w.length > MAX_WORD_LENGTH)) {
      setSetupError(`One word exceeds ${MAX_WORD_LENGTH} letters!`);
      return false;
    }
    setSetupError(null);
    return true;
  };

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z ]/g, '');
    if (val.length <= MAX_TOTAL_LENGTH) {
      setGameData({ ...gameData, word: val });
      validateWord(val);
    }
  };

  const finalizeSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameData.word.trim()) return;
    if (!validateWord(gameData.word)) return;
    setGuessedLetters([]);
    setHint(null);
    setGameState('PLAYING');
  };

  const handleSelectLetter = useCallback((letter: string) => {
    if (gameState !== 'PLAYING') return;
    setGuessedLetters(prev => prev.includes(letter) ? prev : [...prev, letter]);
  }, [gameState]);

  const requestHint = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const h = await getSmartHint(gameData.word, guessedLetters);
      setHint(h);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGameState('LOBBY');
    setGuessedLetters([]);
    setHint(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full max-w-5xl py-8 flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2 text-center uppercase">
          Gemini Hangman
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium">Classic game, words limited to {MAX_WORD_LENGTH} letters.</p>
      </header>

      <main className="w-full max-w-4xl flex-grow flex flex-col items-center justify-center">
        
        {/* Lobby State */}
        {gameState === 'LOBBY' && (
          <div className="flex flex-col gap-6 w-full max-w-sm">
            <button 
              onClick={startSetup}
              className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-xl transition-all shadow-xl hover:shadow-indigo-500/20 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10">Local Multiplayer</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </button>
            <button 
              onClick={startAIChallenge}
              disabled={loading}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-bold text-xl transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Consulting Gemini...' : 'AI Challenge Mode'}
            </button>
            <p className="text-center text-slate-500 text-sm px-4">
              Local Multiplayer: Set a word for your friend.<br/>
              AI Challenge: Let Gemini generate a unique puzzle.
            </p>
          </div>
        )}

        {/* Setup State */}
        {gameState === 'SETUP' && (
          <form onSubmit={finalizeSetup} className="w-full max-w-md bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
            <h2 className="text-2xl font-bold text-center text-indigo-300">Create Challenge</h2>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Target Word/Phrase</label>
                <span className="text-[10px] font-bold text-slate-600">
                  {gameData.word.length} / {MAX_TOTAL_LENGTH}
                </span>
              </div>
              <input 
                autoFocus
                type="text" 
                required
                placeholder="E.g., NEUTRON STAR"
                value={gameData.word}
                onChange={handleWordChange}
                className={`w-full bg-slate-800 border-2 rounded-xl px-4 py-3 text-xl font-bold mono outline-none transition-all text-white placeholder:text-slate-600 ${setupError ? 'border-rose-500' : 'border-slate-700 focus:border-indigo-500'}`}
              />
              {setupError && <p className="text-rose-400 text-[10px] mt-1 font-bold uppercase tracking-tight">{setupError}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Category (Optional)</label>
              <input 
                type="text" 
                placeholder="E.g., Physics, Movies"
                value={gameData.category}
                onChange={(e) => setGameData({ ...gameData, category: e.target.value })}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-lg focus:border-indigo-500 outline-none transition-all text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Initial Clue (Optional)</label>
              <textarea 
                rows={2}
                placeholder="A helpful hint to start them off..."
                value={gameData.clue}
                onChange={(e) => setGameData({ ...gameData, clue: e.target.value })}
                className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-lg focus:border-indigo-500 outline-none transition-all text-white resize-none"
              />
            </div>
            <button 
              disabled={!!setupError}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              START GAME
            </button>
            <button type="button" onClick={() => setGameState('LOBBY')} className="w-full text-slate-500 hover:text-slate-300 text-sm font-medium">
              Go Back
            </button>
          </form>
        )}

        {/* Playing & Result State */}
        {(gameState === 'PLAYING' || gameState === 'RESULT') && (
          <div className="w-full flex flex-col items-center">
            
            <div className="flex flex-col lg:flex-row gap-12 items-center justify-center w-full mb-12">
              <HangmanDrawing wrongGuesses={wrongLetters.length} />
              
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4 max-w-full">
                <div className="space-y-1">
                  {gameData.category && (
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest">
                      Category: {gameData.category}
                    </span>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-200">Solve the Puzzle</h2>
                </div>

                {/* Grouping letters by word for better unit wrapping */}
                <div className="flex flex-wrap gap-x-8 gap-y-6 justify-center lg:justify-start max-w-2xl">
                  {gameData.word.split(' ').map((word, wordIdx) => (
                    <div key={wordIdx} className="flex gap-1.5 md:gap-2">
                      {word.split('').map((char, charIdx) => (
                        <div 
                          key={charIdx} 
                          className={`
                            w-6 md:w-8 lg:w-9 h-10 md:h-12 border-b-4 flex items-center justify-center text-xl md:text-2xl lg:text-3xl font-black mono transition-all border-slate-700
                            ${gameState === 'RESULT' && isLoser && !guessedLetters.includes(char) ? 'text-rose-400 border-rose-400' : ''}
                          `}
                        >
                          {guessedLetters.includes(char) || (gameState === 'RESULT' && isLoser) ? char : ''}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-4 max-w-sm bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                  <p className="text-slate-400 italic text-sm">
                    {gameData.clue ? `"${gameData.clue}"` : "No starting clue provided."}
                  </p>
                  {hint && (
                    <div className="mt-2 pt-2 border-t border-slate-800">
                      <p className="text-indigo-300 font-medium text-sm animate-pulse">
                        <span className="font-bold text-xs uppercase opacity-50 block mb-1">AI Hint:</span>
                        {hint}
                      </p>
                    </div>
                  )}
                </div>

                {gameState === 'PLAYING' && !hint && (
                  <button 
                    onClick={requestHint}
                    disabled={loading}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest disabled:opacity-30"
                  >
                    {loading ? 'Asking AI...' : 'Stuck? Ask Gemini for a hint'}
                  </button>
                )}
              </div>
            </div>

            {/* Result Overlays */}
            {gameState === 'RESULT' && (
              <div className="mb-8 p-6 rounded-2xl bg-slate-900 border-2 border-slate-800 shadow-2xl flex flex-col items-center animate-in fade-in zoom-in duration-300">
                {isWinner ? (
                  <>
                    <div className="text-5xl mb-2">🎉</div>
                    <h3 className="text-3xl font-black text-emerald-400 mb-2">VICTORY!</h3>
                    <p className="text-slate-400 mb-6 text-center">You guessed the word and saved the day.</p>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-2">💀</div>
                    <h3 className="text-3xl font-black text-rose-500 mb-2">GAME OVER</h3>
                    <p className="text-slate-400 mb-6 text-center">The secret word was: <span className="font-bold text-white mono">{gameData.word}</span></p>
                  </>
                )}
                <div className="flex gap-4">
                  <button 
                    onClick={resetGame}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all active:scale-95"
                  >
                    New Game
                  </button>
                </div>
              </div>
            )}

            <Keyboard 
              guessedLetters={guessedLetters}
              correctLetters={correctLetters}
              wrongLetters={wrongLetters}
              onSelectLetter={handleSelectLetter}
              disabled={gameState === 'RESULT'}
            />
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-5xl py-8 flex justify-between items-center opacity-40">
        <span className="text-[10px] font-mono uppercase">Word_Wrap_Protection: Active (Max {MAX_TOTAL_LENGTH} chars)</span>
        <span className="text-[10px] font-mono uppercase tracking-widest">Powered by Google Gemini</span>
      </footer>
    </div>
  );
};

export default App;
