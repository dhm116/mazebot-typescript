import { INodeId } from './types';

export default class NodeId extends INodeId {
  protected serialized: string;

  protected serializedInt: number;

  protected x: number;

  protected y: number;

  constructor(x: number, y: number, gridSize: number = 10) {
    super();

    this.x = x;
    this.y = y;

    this.serialized = NodeId.stringify(this.x, this.y);
    this.serializedInt = NodeId.gridId(this.x, this.y, gridSize);
  }

  toString(): string {
    return this.serialized;
  }

  valueOf(): number {
    return this.serializedInt;
  }
}
