import { ISpace, MazeCharacterType } from './types';
import { MazeCharacters } from './enums';

export default class Space implements ISpace {
  character: MazeCharacters;

  isMoveable: boolean;

  constructor(character: MazeCharacterType) {
    this.character = MazeCharacters[character];
    this.isMoveable = this.character !== MazeCharacters.X;
  }

  toString(): string {
    return MazeCharacters[this.character];
  }
}
