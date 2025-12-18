
import React from 'react';

interface Props {
  wrongGuesses: number;
}

const HangmanDrawing: React.FC<Props> = ({ wrongGuesses }) => {
  const HEAD = (
    <circle key="head" cx="175" cy="80" r="20" stroke="white" strokeWidth="4" fill="transparent" />
  );
  const BODY = (
    <line key="body" x1="175" y1="100" x2="175" y2="160" stroke="white" strokeWidth="4" />
  );
  const RIGHT_ARM = (
    <line key="right-arm" x1="175" y1="120" x2="205" y2="100" stroke="white" strokeWidth="4" />
  );
  const LEFT_ARM = (
    <line key="left-arm" x1="175" y1="120" x2="145" y2="100" stroke="white" strokeWidth="4" />
  );
  const RIGHT_LEG = (
    <line key="right-leg" x1="175" y1="160" x2="200" y2="200" stroke="white" strokeWidth="4" />
  );
  const LEFT_LEG = (
    <line key="left-leg" x1="175" y1="160" x2="150" y2="200" stroke="white" strokeWidth="4" />
  );

  const bodyParts = [HEAD, BODY, LEFT_ARM, RIGHT_ARM, LEFT_LEG, RIGHT_LEG];

  return (
    <div className="relative w-64 h-64 bg-slate-800/50 rounded-xl p-4 shadow-xl border border-slate-700">
      <svg viewBox="0 0 250 250" className="w-full h-full">
        {/* Gallows */}
        <line x1="20" y1="230" x2="120" y2="230" stroke="white" strokeWidth="4" />
        <line x1="70" y1="230" x2="70" y2="20" stroke="white" strokeWidth="4" />
        <line x1="70" y1="20" x2="175" y2="20" stroke="white" strokeWidth="4" />
        <line x1="175" y1="20" x2="175" y2="60" stroke="white" strokeWidth="4" />
        
        {/* Animated Body Parts */}
        {bodyParts.slice(0, wrongGuesses)}
      </svg>
    </div>
  );
};

export default HangmanDrawing;
