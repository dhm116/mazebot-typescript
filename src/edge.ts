import { IEdge, IEdgeList, INode, INodeId } from './types';
import { DirectionalArrows } from './enums';

export class Edge implements IEdge {
  protected _direction: DirectionalArrows;

  from: INode;

  to: INode;

  weight: number;

  constructor(from: INode, to: INode, weight: number = 1) {
    this.from = from;
    this.to = to;
    this.weight = weight;

    if (this.from.location.x < to.location.x) {
      this._direction = DirectionalArrows.E;
    } else {
      this._direction = DirectionalArrows.W;
    }

    if (this.from.location.y < to.location.y) {
      this._direction = DirectionalArrows.S;
    } else if (this.from.location.y > to.location.y) {
      this._direction = DirectionalArrows.N;
    }
  }

  get direction(): DirectionalArrows {
    return this._direction;
  }
}

export class EdgeList implements IEdgeList {
  incoming: Map<INodeId, IEdge>;

  node: INode;

  outgoing: Map<INodeId, IEdge>;

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
