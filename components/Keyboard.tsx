
import React from 'react';

interface Props {
  guessedLetters: string[];
  correctLetters: string[];
  wrongLetters: string[];
  onSelectLetter: (letter: string) => void;
  disabled?: boolean;
}

const KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const Keyboard: React.FC<Props> = ({ guessedLetters, correctLetters, wrongLetters, onSelectLetter, disabled }) => {
  return (
    <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-2 w-full max-w-4xl mx-auto mt-8">
      {KEYS.map((key) => {
        const isCorrect = correctLetters.includes(key);
        const isWrong = wrongLetters.includes(key);
        const isGuessed = guessedLetters.includes(key);

        return (
          <button
            key={key}
            onClick={() => onSelectLetter(key)}
            disabled={isGuessed || disabled}
            className={`
              h-12 md:h-14 text-lg font-bold rounded-lg transition-all duration-200 transform
              ${isCorrect ? 'bg-emerald-500 text-white scale-95 opacity-50 cursor-default' : ''}
              ${isWrong ? 'bg-rose-500 text-white scale-95 opacity-50 cursor-default' : ''}
              ${!isGuessed ? 'bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-100 shadow-lg hover:shadow-indigo-500/20' : ''}
              ${disabled && !isGuessed ? 'opacity-30 cursor-not-allowed' : ''}
            `}
          >
            {key}
          </button>
        );
      })}
    </div>
  );
};

export default Keyboard;
