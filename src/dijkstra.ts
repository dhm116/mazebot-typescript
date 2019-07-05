import { IEdge, IGraph, INode, INodeLocation, INodeId } from './types';
import { DirectionalArrows } from './enums';

interface IWeightedNode {
  weight: number;
  edge?: IEdge;
}

export interface INodeDirection extends INodeLocation {
  direction: DirectionalArrows;
}

export class ShortestPath {
  distances: Map<INode, IWeightedNode>;

  path: INodeDirection[];

  constructor(path: INodeDirection[], distances?: Map<INode, IWeightedNode>) {
    this.path = path;
    this.distances = distances || new Map<INode, IWeightedNode>();
  }

  toString(): string {
    return this.path.map(step => DirectionalArrows[step.direction].toString()).join('');
  }
}

export default class Dijkstra {
  public static shortestPath(graph: IGraph): ShortestPath {
    const distances = new Map<INode, IWeightedNode>();
    const allNodes = graph.nodes.slice();

    const visited = new Set<IEdge>();

    // Mark all nodes as unvisited
    allNodes.forEach(node => distances.set(node, { weight: Infinity }));

    distances.set(graph.start, { weight: 0 });

    // For unweighted graphs, this creates an arbitrary metric to determine how far a given
    // node is from another. This helps prevent the solution from wandering too far away
    // from the goal, when possible.
    function manhattanDistance(a: INode, b: INode): number {
      return Math.abs(a.location.x - b.location.x) + Math.abs(a.location.y - b.location.y);
    }

    function inspectNeighbor(edge: IEdge) {
      if (visited.has(edge)) {
        return;
      }

      const weight = distances.get(edge.from).weight;
      const sum = weight + manhattanDistance(edge.to, graph.end);

      if (sum < distances.get(edge.to).weight) {
        distances.set(edge.to, { weight: sum, edge });
      }
    }

    function inspectAllNeighbors(nodes: INode[], parents?: INode[]) {
      if (nodes.includes(graph.end)) {
        return;
      }

      const edges = new Set<IEdge>();
      parents = parents || new Array<INode>();

      nodes.forEach(node => {
        Array.from(node.edges.outgoing.values())
          .filter(edge => !visited.has(edge))
          .forEach(edge => {
            if (!parents.includes(edge.to)) {
              edges.add(edge);
            }
          });
      });

      const neighbors: INode[] = Array.from(edges).map((edge: IEdge) => edge.to);

      edges.forEach(edge => {
        inspectNeighbor(edge);
        visited.add(edge);
      });

      inspectAllNeighbors(neighbors, nodes);
    }

    function followPathBack(to: INode, history: INodeDirection[] = []): INodeDirection[] {
      const weightedEdge = distances.get(to);
      if (!weightedEdge || !weightedEdge.edge) {
        return history;
      }

      const { from } = weightedEdge.edge;
      history.push({
        x: to.location.x,
        y: to.location.y,
        direction: weightedEdge.edge.direction,
      });
      // Recurse back up the graph
      followPathBack(weightedEdge.edge.from, history);
      return history;
    }

    inspectAllNeighbors([graph.start]);

    const directions = followPathBack(graph.end);
    return new ShortestPath(directions.reverse(), distances);
  }
}
