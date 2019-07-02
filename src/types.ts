import { stringify } from 'querystring';
import { MazeCharacters, DirectionalArrows } from './enums';

export type MazeCharacterType = keyof typeof MazeCharacters;

export interface IEdge {
  readonly direction: DirectionalArrows;
  from: INode;
  to: INode;
  weight: number;
}

export interface IEdgeList {
  incoming: Map<INodeId, IEdge>;
  node: INode;
  outgoing: Map<INodeId, IEdge>;

  readonly all: IEdge[];

  connectTo(target: INode, weight: number): [IEdge, IEdge];
}

export interface IGraph {
  end: INode;

  grid: string[][];

  isDirected: boolean;

  nodes: INode[];

  start: INode;

  discoverNeighbors(node: INode): void;
  getCharAt(x: number, y: number): MazeCharacterType;
  getNode(x: number, y: number): INode;
  print(): void;
}

export interface INode {
  edges: IEdgeList;
  id: INodeId;
  location: INodeLocation;
  space: ISpace;

  connectNode(node: INode, weight?: number): void;
}

export abstract class INodeId {
  protected x: number;

  protected y: number;

  toString(): string {
    return 'not implemented';
  }

  valueOf(): number {
    return -1;
  }

  static stringify(x: number, y: number): string {
    return `${x},${y}`;
  }

  static gridId(x: number, y: number, gridSize: number): number {
    return y * gridSize + x;
  }
}

export interface INodeLocation {
  x: number;
  y: number;
}

export interface ISpace {
  character: MazeCharacters;
  isMoveable: boolean;
  toString(): string;
}
