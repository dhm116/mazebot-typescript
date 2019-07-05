import chalk from 'chalk';
import { IGraph, INode, MazeCharacterType } from './types';
import { MazeCharacters, DirectionalArrows } from './enums';
import Node from './node';
import NodeId from './id';
import { ShortestPath } from './dijkstra';

const randomColor = require('randomcolor');

export default class Graph implements IGraph {
  end: INode;

  grid: string[][];

  gridPrintWidth: number;

  isDirected: boolean;

  nodes: INode[];

  start: INode;

  constructor(grid: string[][], directed = true) {
    this.grid = grid;
    this.gridPrintWidth = this.grid.length * 4 + 2;

    this.isDirected = directed;
    this.nodes = new Array<INode>();

    // Create all nodes
    this.grid.forEach((row, y) => {
      row.forEach((character: MazeCharacterType, x) => {
        this.nodes.push(new Node(this, x, y, character));

        if (MazeCharacters[character] === MazeCharacters.A) {
          this.start = this.nodes.slice(-1)[0];
        } else if (MazeCharacters[character] === MazeCharacters.B) {
          this.end = this.nodes.slice(-1)[0];
        }
      });
    });

    // Discover node neighbors
    this.nodes.map(node => this.discoverNeighbors(node));
  }

  discoverNeighbors(node: INode) {
    [
      [node.location.x - 1, node.location.y],
      [node.location.x + 1, node.location.y],
      [node.location.x, node.location.y - 1],
      [node.location.x, node.location.y + 1],
    ]
      .filter(([x, y]) => {
        const invalidX = x < 0 || x >= this.grid.length;
        const invalidY = y < 0 || y >= this.grid.length;
        if (invalidX || invalidY) {
          return false;
        }
        return true;
      })
      .map(([x, y]) => this.getNode(x, y))
      .filter(node => node && node.space.isMoveable)
      .forEach(neighbor => node.connectNode(neighbor));
  }

  getCharAt(x: number, y: number): MazeCharacterType {
    return this.grid[x][y] as MazeCharacterType;
  }

  getNode(x: number, y: number): Node {
    const id = NodeId.gridId(x, y, this.grid.length);
    return this.nodes[id];
  }

  protected stringifyRow(grid: string[][]): string[] {
    return grid.map((row, y) => {
      const rowString = row.map((char: MazeCharacterType, x) => {
        if (char === ' ') {
          return chalk.dim.gray('.::.');
        }
        if (char === 'X') {
          return chalk.bold.dim.gray('####');
        }
        if (char.includes('A') || char.includes('B')) {
          return chalk.green(`[${char}]`.padStart(4));
        }
        if (Number.parseInt(char) >= 0) {
          const color = randomColor({ luminosity: 'light' });
          return chalk.hex(color)(char.padStart(4));
        }
        const padding = char.length * 4;
        return `${char}`.padStart(padding, char);
      });
      return `${y.toString().padStart(4)}|${rowString.join('')}|${y}`;
    });
  }

  print(solution?: ShortestPath, showWeights?: boolean): void {
    const source = Array.from(this.grid, row => Array.from(row));

    if (solution) {
      if (!showWeights) {
        solution.path.forEach(move => {
          if (`${move.x},${move.y}` === this.end.id.toString()) {
            source[move.y][move.x] = `${chalk.red(move.direction.toString())}B`; // .padStart(2, ' '));
          } else {
            source[move.y][move.x] = chalk.red(`${move.direction.toString()}`); // .padStart(3, ' '));
          }
        });
      } else {
        solution.distances.forEach((weightedEdge, node) => {
          if (weightedEdge.weight === Infinity) {
            return;
          }
          source[node.location.y][node.location.x] = weightedEdge.weight.toString(); // .padStart(4, ' ');
        });
      }
    }

    const flatRows = this.stringifyRow(source);

    // START/END LOCATIONS
    console.log(
      chalk.yellow(
        `${chalk.green('[A]')} - ${this.start.id.toString()}\t${chalk.green(
          '[B]',
        )} - ${this.end.id.toString()}`.padStart(this.gridPrintWidth + 2, ' '),
      ),
    );
    // START/END LOCATIONS

    // TOP BORDER
    console.log(
      chalk.yellow(
        `${Array(this.gridPrintWidth)
          .fill('_')
          .join('')}`.padStart(this.gridPrintWidth + 4, ' '),
      ),
    );
    // TOP BORDER

    // MAZE CELLS
    flatRows.forEach(row => console.log(chalk.yellow(row)));
    // MAZE CELLS

    // BOTTOM BORDER
    console.log(
      chalk.yellow(
        `${Array(this.gridPrintWidth)
          .fill('-')
          .join('')}`.padStart(this.gridPrintWidth + 4, ' '),
      ),
    );
    // BOTTOM BORDER

    // GRID NUMBERING
    console.log(
      chalk.yellow(
        Array.from(Array(this.grid.length))
          .map((_, index) => `${index} `.padStart(4, ' '))
          .join('')
          .padStart(this.gridPrintWidth + 3, ' '),
      ),
    );
    // GRID NUMBERING
  }
}
