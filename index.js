const chalk = require('chalk');
const fetch = require('node-fetch');
const { inspect } = require('util');

// Map of a point and the direction travelled to get there
const visited = new Map();
const candidates = new Map();
const directions = [];
const GridSize = 10;
let beginAt;
let endAt;
/** @type {Maze} */
let maze;

function pretty(val, depth = 2) {
  return inspect(val, { color: true, depth });
}

const DirectionArrows = {
  N: '\u2191',
  S: '\u2193',
  E: '\u2192',
  W: '\u2190',
};

const MovementSpaces = {
  A: true,
  B: true,
  ' ': true,
  X: false,
};

class Cell {
  constructor(x, y, char = '') {
    /** @type {number} */
    this.x = x;

    /** @type {number} */
    this.y = y;

    /** @type {char} */
    this.char = char || maze.charAt(this.x, this.y);

    /** @type {Cell[]} */
    this.neighbors = [];
  }

  /** @type {boolean} */
  get isEnd() {
    return this.isEqual(endAt);
  }

  /** @type {boolean} */
  get isBeginning() {
    return this.isEqual(beginAt);
  }

  /** @type {boolean} */
  get isTraversable() {
    return MovementSpaces[this.char];
  }

  /** @return {undefined} */
  discoverNeighbors() {
    this.neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      .map(([offsetX, offsetY]) => {
        return maze.validLocations.get(`${this.x + offsetX},${this.y + offsetY}`);
      })
      .filter(cell => cell);
  }

  /** @return {string} */
  toString() {
    return `${this.x},${this.y}`;
  }

  /**
   * @param {Cell} other
   * @return {boolean}
   */
  isEqual(other) {
    return this.toString() === other.toString();
  }

  /**
   * @param {Cell} cell
   * @return {string}
   */
  directionFrom(cell) {
    let direction = '';
    if (this.y < cell.y) {
      direction = 'S';
    } else if (this.y > cell.y) {
      direction = 'N';
    }
    if (this.x < cell.x) {
      direction += 'E';
    } else if (this.x > cell.x) {
      direction += 'W';
    }
    return direction;
  }
}

class Maze {
  constructor(grid) {
    /** @type {string[][]} */
    this.grid = grid;

    /** @type {Cell[]} */
    this.cells = this.generateCells();

    /** @type {Map<string, Cell>} */
    this.validLocations = new Map();

    this.cells.filter(cell => cell.isTraversable).forEach(cell => this.validLocations.set(cell.toString(), cell));

    this.validLocations.values().forEach(cell => cell.discoverNeighbors());
  }

  /** @return {Cell[]} */
  generateCells() {
    return Array.flatten(this.grid.map((row, y) => row.map((char, x) => new Cell(x, y, char))));
  }

  /**
   *
   * @param {number} column
   * @param {number} row
   * @return {string}
   */
  charAt(column, row) {
    let x = column;
    let y = row;

    if (column instanceof Cell) {
      ({ x, y } = column);
    }

    return this.grid[y][x];
  }

  print(solution = null) {
    const gridWidth = this.grid.length * 3 + 2;
    let source;

    if (solution) {
      source = this.grid.slice();
      solution.result.forEach((point, index) => {
        if (point.toString() === endAt.toString()) return;
        source[point.y][point.x] = DirectionArrows[solution.path[index]];
      });
    } else {
      source = this.grid;
    }

    const flatRows = source.map(
      row =>
        `|${row
          .map(char => {
            if (char === ' ') {
              return chalk.dim.gray('.:.');
            }
            if (MovementSpaces[char]) {
              return chalk.green(`[${char}]`);
            }
            return ` ${char} `;
          })
          .join('')}|`,
    );

    console.log(
      chalk.yellow(
        Array(gridWidth)
          .fill('_')
          .join(''),
      ),
    );

    flatRows.forEach(row => console.log(chalk.yellow(row)));

    console.log(
      chalk.yellow(
        Array(gridWidth)
          .fill('-')
          .join(''),
      ),
    );
  }
}

const Directions = {
  N: position => {
    return new Cell([position.x, position.y - 1]);
  },
  S: position => {
    return new Cell([position.x, position.y + 1]);
  },
  E: position => {
    return new Cell([position.x + 1, position.y]);
  },
  W: position => {
    return new Cell([position.x - 1, position.y]);
  },
};

function relativeDirection(start, end) {
  let direction = '';
  if (start.y < end.y) {
    direction = 'S';
  } else if (start.y > end.y) {
    direction = 'N';
  }
  if (start.x < end.x) {
    direction += 'E';
  } else if (start.x > end.x) {
    direction += 'W';
  }
  return direction;
}

function ValidNeighbors(cell, history = new Set()) {
  const neighbors = Object.values(Directions).map(getPosition => {
    const point = getPosition(cell);
    if (
      // Can't be negative location
      point.x < 0 ||
      // Can't exceed the width
      point.x >= maze[0].length ||
      // Can't be negative location
      point.y < 0 ||
      // Can't exceed the height
      point.y >= maze.length
    ) {
      return null;
    }

    return point;
  });

  // No point doing any other move than the final location
  if (neighbors.some(point => point && point.toString() === endAt.toString())) {
    console.log('FOUND THE MAZE END');
    return endAt;
  }

  return (
    neighbors
      // Remove invalid locations
      .filter(point => point)
      // Remove visited locations
      .filter(point => !history.has(point.toString()))
      // Remove any "walls"
      .filter(point => MovementSpaces[maze[point.y][point.x]])
  );
}

async function Explore(fromPoint, history = new Set()) {
  if (!history.length) {
    history.add(fromPoint.toString());
  }
  const toTest = ValidNeighbors(fromPoint, history);

  console.log('Neighbors from', fromPoint.toString(), ':', pretty(toTest));
  // console.log(`At ${fromPoint}, found ${(toTest || []).length} neighbors to try`);

  if (!toTest || (Array.isArray(toTest) && !toTest.length)) {
    console.error('No valid neighbors found from', fromPoint.toString());
    return { toPoint: fromPoint, result: [] };
  }

  if (!Array.isArray(toTest) && toTest) {
    console.log('Found final point?', toTest.toString(), endAt.isEqual(toTest));
    // const direction = relativeDirection(fromPoint, toTest);
    // visited.set(toTest.toString(), direction);
    return { toPoint: fromPoint, result: [toTest] };
  }

  const results = toTest.map(toPoint => {
    if (history.has(toPoint.toString())) {
      console.log('History already had', toPoint.toString());
      return { toPoint, result: [] };
    }
    // console.log(`Exploring ${toPoint} from ${fromPoint}`);
    // visited.set(toPoint.toString(), '');
    history.add(toPoint.toString());
    return { toPoint, result: Explore(toPoint, history) };
  });

  // console.log('PATHS FROM', fromPoint.toString(), ':', pretty(results, 4));
  const paths = results
    .map(async route => {
      route.result = await route.result;
      console.log('ROUTE:', route);
      console.log('ROUTE RESULT:', route.result);
      return route;
    })
    .filter(route => route.result && route.result.length);

  if (!paths.length) {
    return { toPoint: fromPoint, result: [] };
  }

  console.log('VALID PATHS FROM', fromPoint.toString(), ':', paths.map(path => path.result.length));

  const path = paths.reduce(
    (result, route) => (!result.result || route.result.length < result.result.length ? route : result),
    {},
  );
  console.log('SHORTEST PATH FROM', fromPoint.toString(), ':', path.result.length);
  if (!path.result || !path.result.length) {
    return { toPoint: fromPoint, result: [] };
  }
  return { toPoint: fromPoint, result: [path.toPoint].concat(path.result) };
}

module.exports = {
  Cell,
};

(async () => {
  console.log(chalk.green('Fetching new Noops maze...'));

  let response = await fetch(`https://api.noopschallenge.com/mazebot/random?maxSize=${GridSize}`);
  const mazeConfig = await response.json();

  console.log(pretty(Object.assign({}, mazeConfig, { map: '<too large>' })));

  beginAt = new Cell(mazeConfig.startingPosition);
  endAt = new Cell(mazeConfig.endingPosition);
  maze = mazeConfig.map;

  visited.set(beginAt.toString(), '');

  const gridWidth = maze[0].length * 3 + 2;

  function printGrid(mazeCopy) {
    const grid = mazeCopy.map(
      row =>
        `|${row
          .map(cell => {
            if (cell === ' ') {
              return chalk.dim.gray('.:.');
            }
            if (MovementSpaces[cell]) {
              return chalk.green(`[${cell}]`);
            }
            return ` ${cell} `;
          })
          .join('')}|`,
    );

    console.log(
      chalk.yellow(
        Array(gridWidth)
          .fill('_')
          .join(''),
      ),
    );

    grid.forEach(row => console.log(chalk.yellow(row)));

    console.log(
      chalk.yellow(
        Array(gridWidth)
          .fill('-')
          .join(''),
      ),
    );
  }

  printGrid(maze);

  const solution = await Explore(beginAt);

  solution.path = solution.result.map((point, index) =>
    index > 0 ? relativeDirection(solution.result[index - 1], point) : relativeDirection(beginAt, point),
  );

  const mazeCopy = maze.slice();
  solution.result.forEach((point, index) => {
    if (point.toString() === endAt.toString()) return;
    mazeCopy[point.y][point.x] = DirectionArrows[solution.path[index]];
  });

  printGrid(mazeCopy);

  console.log(`FINAL PATH (${solution.path.length} moves): ${solution.path.map(char => DirectionArrows[char])}`);

  console.log('SOLUTION:', pretty(solution, 4));

  response = await fetch(`https://api.noopschallenge.com${mazeConfig.mazePath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directions: solution.path.join('') }),
  });
  console.log(inspect(await response.json()));
})();
