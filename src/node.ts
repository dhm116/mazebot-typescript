import { IEdgeList, IGraph, INode, INodeId, INodeLocation, ISpace, MazeCharacterType } from './types';
import { EdgeList } from './edge';
import NodeId from './id';
import Space from './space';

export default class Node implements INode {
  edges: IEdgeList;

  id: INodeId;

  location: INodeLocation;

  space: ISpace;

  constructor(graph: IGraph, x: number, y: number, character: MazeCharacterType) {
    this.edges = new EdgeList(this);
    this.id = new NodeId(x, y);
    this.location = {
      x,
      y,
    };
    this.space = new Space(character);
  }

  connectNode(node: INode, weight: number = 1) {
    // console.log(
    //   `Node ${this.id.toString()} "${this.space.toString()}" connecting to ${node.id.toString()}, "${node.space.toString()}"`,
    // );
    this.edges.connectTo(node, weight);
  }
}
