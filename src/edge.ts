import { IEdge, IEdgeList, INode } from './types';

export class Edge implements IEdge {
  from: INode;

  to: INode;

  weight: number;

  constructor(from: INode, to: INode, weight: number = 1) {
    this.from = from;
    this.to = to;
    this.weight = weight;
  }
}

export class EdgeList implements IEdgeList {
  incoming: Map<number, IEdge>;

  node: INode;

  outgoing: Map<number, IEdge>;

  constructor(node: INode) {
    this.node = node;
    this.incoming = new Map();
    this.outgoing = new Map();
  }

  connectTo(target: INode, weight: number = 1): [IEdge, IEdge] {
    const outgoing = new Edge(this.node, target, weight);
    const incoming = new Edge(target, this.node, weight);

    this.outgoing.set(outgoing.to.id, outgoing);
    this.incoming.set(incoming.from.id, incoming);

    return [incoming, outgoing];
  }

  get all(): IEdge[] {
    return Array.from<IEdge>(this.incoming.values()).concat(Array.from<IEdge>(this.outgoing.values()));
  }
}
