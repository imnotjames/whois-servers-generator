import program from 'commander';
import table from 'markdown-table';

import packageJson from '../package.json';
import { fetchList, fetchRecord } from './fetch';

async function formatRecords(records, servers = {}) {
  let output = {
    lookup: {}
  };

  for (let tld of [... records.keys() ].sort()) {
    let servers = records.get(tld);

    if (!servers || servers.length === 0) {
      continue;
    }

    output.lookup[tld] = servers[0];
  }

  return output;
}

async function doFetchRecord(tld) {
  return formatRecords(await fetchRecord(tld));
}

async function doFetchList() {
  return formatRecords(await fetchList());
}

function handleErrors(f) {
  return async (...args) => {
    try {
      await f(...args);
    } catch (e) {
      console.error(e);
      process.exitCode = 1;
    }
  }
}

program
  .version(packageJson.version);

program
  .command('fetch [tld]')
  .description('fetch and display the server lists')
  .option('-f, --format <type>', 'Specify format type, defaults to markdown. [markdown, json]', 'markdown')
  .action(handleErrors(async (tld, cmd) => {
    let output;

    if (tld) {
      output = await doFetchRecord(tld);
    } else {
      output = await doFetchList();
    }

    if (cmd.format === 'json') {
      process.stdout.write(JSON.stringify(output, null, 2));
    } else {
      process.stdout.write(table([ [ 'tld', 'server' ], ...Object.entries(output.lookup) ]))
      process.stdout.write("\n");
    }

    process.stdout.write("\n");
  }));

program.parse(process.argv);
