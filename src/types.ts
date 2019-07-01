import { MazeCharacters } from './enums';

export type MazeCharacterType = keyof typeof MazeCharacters;

export interface IEdge {
  from: INode;
  to: INode;
  weight: number;
}

export interface IEdgeList {
  incoming: Map<number, IEdge>;
  node: INode;
  outgoing: Map<number, IEdge>;

  readonly all: IEdge[];

  connectTo(target: INode, weight: number): [IEdge, IEdge];
}

export interface IGraph {
  end: INode;

  grid: string[][];

  isDirected: boolean;

  nodes: INode[];

  start: INode;

  getCharAt(x: number, y: number): MazeCharacterType;
  getId(x: number, y: number): number;
  getNode(x: number, y: number): INode;
  print(): void;
}

export interface INode {
  edges: IEdgeList;
  graph: IGraph;
  id: number;
  location: INodeLocation;
  space: ISpace;

  discoverNeighbors(): void;
  connectNode(node: INode, weight: number): void;
}

export interface INodeLocation {
  x: number;
  y: number;
  toString(): string;
}

export interface ISpace {
  character: MazeCharacters;
  isMoveable: boolean;
  toString(): string;
}
