import chalk from 'chalk';
import { IGraph, INode, MazeCharacterType } from './types';
import { MazeCharacters } from './enums';
import Node from './node';

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
    this.nodes.map(node => node.discoverNeighbors());
  }

  getCharAt(x: number, y: number): MazeCharacterType {
    return this.grid[x][y] as MazeCharacterType;
  }

  getId(x: number, y: number): number {
    const gridSize = this.grid.length;
    return y * gridSize + x;
  }

  getNode(x: number, y: number): Node {
    const id = this.getId(x, y);
    return this.nodes[id];
  }

  print(): void {
    const gridWidth = this.grid.length * 3 + 2;
    const source = this.grid;

    // if (solution) {
    //   source = this.grid.slice();
    //   solution.path = solution.result.map((point, index) =>
    //     index > 0 ? relativeDirection(solution.result[index - 1], point) : relativeDirection(beginAt, point),
    //   );
    //   solution.result.forEach((point, index) => {
    //     if (point.toString() === endAt.toString()) return;
    //     source[point.y][point.x] = DirectionArrows[solution.path[index]];
    //   });
    // }

    const flatRows = source.map((row, index) => {
      const rowString = row.map((char: MazeCharacterType) => {
        if (char === ' ') {
          return chalk.dim.gray('.:.');
        }
        if ([MazeCharacters.A, MazeCharacters.B].includes(MazeCharacters[char])) {
          return chalk.green(`[${char}]`);
        }
        return ` ${char} `;
      });
      return `${index}|${rowString.join('')}|${index}`;
    });

    // START/END LOCATIONS
    console.log(
      chalk.yellow(
        `  ${chalk.green('[A]')} - ${this.start.location.toString()}\t${chalk.green(
          '[B]',
        )} - ${this.end.location.toString()}`,
      ),
    );
    // START/END LOCATIONS

    // TOP BORDER
    console.log(
      chalk.yellow(
        ` ${Array(gridWidth)
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
        ` ${Array(gridWidth)
          .fill('-')
          .join('')}`,
      ),
    );
    // BOTTOM BORDER

    // GRID NUMBERING
    console.log(
      chalk.yellow(
        ' ',
        Array.from(Array(this.grid.length))
          .map((_, index) => ` ${index} `)
          .join(''),
      ),
    );
    // GRID NUMBERING
  }
}
