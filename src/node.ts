import { IEdgeList, IGraph, INode, INodeLocation, ISpace, MazeCharacterType } from './types';
import { EdgeList } from './edge';
import Space from './space';

export default class Node implements INode {
  edges: IEdgeList;

  graph: IGraph;

  id: number;

  location: INodeLocation;

  space: ISpace;

  constructor(graph: IGraph, x: number, y: number, character: MazeCharacterType) {
    this.edges = new EdgeList(this);
    this.graph = graph;
    this.id = graph.getId(x, y);
    this.location = {
      x,
      y,
      toString(): string {
        return `${this.x},${this.y}`;
      },
    };
    this.space = new Space(character);
  }

  discoverNeighbors() {
    [
      [this.location.x - 1, this.location.y],
      [this.location.x + 1, this.location.y],
      [this.location.x, this.location.y - 1],
      [this.location.x, this.location.y + 1],
    ]
      .filter(([x, y]) => {
        const invalidX = x < 0 || x >= this.graph.grid.length;
        const invalidY = y < 0 || y >= this.graph.grid.length;
        if (invalidX || invalidY) {
          return false;
        }
        return true;
      })
      .map(([x, y]) => this.graph.getNode(x, y))
      .filter(node => node)
      .forEach(neighbor => this.connectNode(neighbor));
  }

  connectNode(node: INode, weight: number = 1) {
    console.log(
      `Node ${this.location.toString()} "${this.space.toString()}" connecting to ${node.location.toString()}, "${node.space.toString()}"`,
    );
    this.edges.connectTo(node, weight);
  }
}
