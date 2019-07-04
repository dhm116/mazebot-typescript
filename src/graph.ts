import chalk from 'chalk';
import { IGraph, INode, MazeCharacterType } from './types';
import { MazeCharacters, DirectionalArrows } from './enums';
import Node from './node';
import NodeId from './id';
import { ShortestPath } from './dijkstra';

export default class Graph implements IGraph {
  end: INode;

  grid: string[][];

  isDirected: boolean;

  nodes: INode[];

  start: INode;

  constructor(grid: string[][], directed = true) {
    this.grid = grid;
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
    return grid.map((row, index) => {
      const rowString = row.map((char: MazeCharacterType) => {
        if (char === ' ') {
          return chalk.dim.gray(' . ');
        }
        if (char === 'X') {
          return chalk.bold.dim.gray('###');
        }
        if ([MazeCharacters.A, MazeCharacters.B].includes(MazeCharacters[char])) {
          return chalk.green(`[${char}]`);
        }
        return ` ${char} `;
      });
      return `${index.toString().padStart(3, ' ')}|${rowString.join('')}|${index}`;
    });
  }

  print(solution?: ShortestPath): void {
    const gridWidth = this.grid.length * 3 + 2;
    let source = this.grid;

    if (solution) {
      source = this.grid.slice();
      solution.path.forEach(move => {
        // let color = chalk.red;
        // if (source[move.y][move.x] === this.end.space.toString()) {
        //   color = chalk.green;
        // }
        source[move.y][move.x] = chalk.red(move.direction.toString());
      });
    }

    const flatRows = this.stringifyRow(source);

    // START/END LOCATIONS
    console.log(
      chalk.yellow(
        `  ${chalk.green('[A]')} - ${this.start.id.toString()}\t${chalk.green('[B]')} - ${this.end.id.toString()}`,
      ),
    );
    // START/END LOCATIONS

    // TOP BORDER
    console.log(
      chalk.yellow(
        `    ${Array(gridWidth)
          .fill('_')
          .join('')}`,
      ),
    );
    // TOP BORDER

    // MAZE CELLS
    flatRows.forEach(row => console.log(chalk.yellow(row)));
    // MAZE CELLS

    // BOTTOM BORDER
    console.log(
      chalk.yellow(
        `    ${Array(gridWidth)
          .fill('-')
          .join('')}`,
      ),
    );
    // BOTTOM BORDER

    // GRID NUMBERING
    console.log(
      chalk.yellow(
        '   ',
        Array.from(Array(this.grid.length))
          .map((_, index) => ` ${index} `)
          .join(''),
      ),
    );
    // GRID NUMBERING
  }
}
