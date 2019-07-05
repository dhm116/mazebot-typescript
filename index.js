/* eslint-disable @typescript-eslint/no-var-requires, import/no-unresolved */
const chalk = require('chalk');
const fetch = require('node-fetch');
const { inspect } = require('util');

const Graph = require('./src/graph').default;
const Dijkstra = require('./src/dijkstra').default;
/* eslint-enable @typescript-eslint/no-var-requires, import/no-unresolved */

function pretty(val, depth = 2) {
  return inspect(val, { color: true, depth });
}

const GridSize = 200;

(async () => {
  console.log(chalk.green('Fetching new Noops maze...'));

  let response = await fetch(`https://api.noopschallenge.com/mazebot/random?minSize=${GridSize}&maxSize=${GridSize}`);
  const mazeConfig = await response.json();

  console.log(pretty(Object.assign({}, mazeConfig, { map: '<too large>' })));

  const graph = new Graph(mazeConfig.map);
  const path = Dijkstra.shortestPath(graph);

  response = await fetch(`https://api.noopschallenge.com${mazeConfig.mazePath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ directions: path.toString() }),
  });

  if (GridSize < 100) {
    graph.print(path);
  }

  console.log(inspect(await response.json()));
})();
