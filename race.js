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

const domain = 'https://api.noopschallenge.com';
const results = [];

(async () => {
  console.log(chalk.green('Starting new Noops maze race...'));

  let mazeConfig;
  let result;
  let response = await fetch(`${domain}/mazebot/race/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login: 'dhm116' }),
  });

  result = await response.json();

  /* eslint-disable no-await-in-loop */
  while (result.nextMaze) {
    console.log('Starting maze', results.length + 1);
    response = await fetch(`${domain}${result.nextMaze}`);
    mazeConfig = await response.json();

    const graph = new Graph(mazeConfig.map);
    const path = Dijkstra.shortestPath(graph);

    result = await fetch(`${domain}${mazeConfig.mazePath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directions: path.toString() }),
    });

    result = await result.json();
    result.size = mazeConfig.map.length;
    results.push(result);
  }
  /* eslint-enable no-await-in-loop */

  console.log(`Finished ${results.length} mazes.`, pretty(result));
  console.log(pretty(results, 4));
})();
