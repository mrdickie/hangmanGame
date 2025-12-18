
export type GameState = 'LOBBY' | 'SETUP' | 'PLAYING' | 'RESULT';

export interface GameData {
  word: string;
  category: string;
  clue: string;
}

export interface Challenge {
  word: string;
  category: string;
  clue: string;
}
