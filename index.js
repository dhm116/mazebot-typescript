const chalk = require('chalk');
const fetch = require('node-fetch');
const { inspect } = require('util');

function pretty(val, depth = 2) {
  return inspect(val, { color: true, depth });
}

class Point {
  constructor(point) {
    if (Array.isArray(point)) {
      const [x, y] = point;
      this.x = x;
      this.y = y;
    } else {
      this.x = point.x;
      this.y = point.y;
    }
  }

  toString() {
    return `${this.x},${this.y}`;
  }

  valueOf() {
    return this.x * 1000 + this.y;
  }
}

const Directions = {
  N: position => {
    return new Point([position.x, position.y - 1]);
  },
  S: position => {
    return new Point([position.x, position.y + 1]);
  },
  E: position => {
    return new Point([position.x + 1, position.y]);
  },
  W: position => {
    return new Point([position.x - 1, position.y]);
  },
};

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

// Map of a point and the direction travelled to get there
const visited = new Map();
const candidates = new Map();
const directions = [];
const GridSize = 40;
let beginAt;
let endAt;
let maze;

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

function ValidNeighbors(cell) {
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
      .filter(point => !visited.has(point.toString()))
      // Remove any "walls"
      .filter(point => MovementSpaces[maze[point.y][point.x]])
  );
}

function Explore(fromPoint) {
  const toTest = ValidNeighbors(fromPoint);

  // console.log(`At ${fromPoint}, found ${(toTest || []).length} neighbors to try`);

  if (!toTest && Array.isArray(toTest) && !toTest.length) {
    // console.error('No valid neighbors found from', fromPoint.toString());
    return [];
  }

  if (!Array.isArray(toTest) && toTest) {
    const direction = relativeDirection(fromPoint, toTest);
    visited.set(toTest.toString(), direction);
    return [direction];
  }

  const results = toTest.map(toPoint => {
    if (visited.has(toPoint.toString())) {
      return [];
    }
    // console.log(`Exploring ${toPoint} from ${fromPoint}`);
    visited.set(toPoint.toString(), relativeDirection(fromPoint, toPoint));
    return Explore(toPoint);
  });

  const paths = results
    .map((route, index) => ({ toPoint: toTest[index], result: route }))
    .filter(route => route.result && route.result.length);

  if (!paths.length) {
    return [];
  }

  console.log('VALID PATHS FROM', fromPoint.toString(), ':', paths.map(path => path.result.length));

  const path = paths.reduce(
    (result, route) => (!result.result || route.result.length < result.result.length ? route : result),
    {},
  );
  console.log('SHORTEST PATH FROM', fromPoint.toString(), ':', path.result.length);
  if (!path.result || !path.result.length) {
    return [];
  }
  return [relativeDirection(fromPoint, path.toPoint)].concat(path.result);
}

(async () => {
  console.log(chalk.green('Fetching new Noops maze...'));

  let response = await fetch(`https://api.noopschallenge.com/mazebot/random?maxSize=${GridSize}`);
  const mazeConfig = await response.json();

  console.log(pretty(Object.assign({}, mazeConfig, { map: '<too large>' })));

  beginAt = new Point(mazeConfig.startingPosition);
  endAt = new Point(mazeConfig.endingPosition);
  maze = mazeConfig.map;

  visited.set(beginAt.toString(), '');

  const grid = maze.map(
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

  const gridWidth = maze[0].length * 3 + 2;

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

  const path = await Explore(beginAt);

  console.log(`FINAL PATH (${path.length} moves): ${path.map(char => DirectionArrows[char])}`);

  response = await fetch(`https://api.noopschallenge.com${mazeConfig.mazePath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directions: path.join('') }),
  });
  console.log(inspect(await response.json()));
})();
