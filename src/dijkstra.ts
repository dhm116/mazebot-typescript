import { IEdge, IGraph, INode, INodeLocation } from './types';
import { DirectionalArrows } from './enums';

interface IWeightedNode {
  weight: number;
  edge?: IEdge;
}

export interface INodeDirection extends INodeLocation {
  direction: DirectionalArrows;
}

export class ShortestPath {
  path: INodeDirection[];

  constructor(path: INodeDirection[]) {
    this.path = path;
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

    function inspectNeighbor(edge: IEdge) {
      if (!visited.has(edge)) {
        visited.add(edge);
      } else {
        return;
      }
      const sum = distances.get(edge.from).weight + edge.weight;
      if (sum < distances.get(edge.to).weight) {
        distances.set(edge.to, { weight: sum, edge });
      }
    }

    function inspectAllNeighbors(from: INode, previous: INode) {
      const edges = Array.from(from.edges.outgoing.values()).filter(edge => !visited.has(edge));
      edges.forEach((edge: IEdge) => inspectNeighbor(edge));
      edges.forEach((edge: IEdge) => inspectAllNeighbors(edge.to, from));
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

    inspectAllNeighbors(graph.start, graph.start);

    const directions = followPathBack(graph.end);
    return new ShortestPath(directions.reverse());
  }
}
