import fetch from 'node-fetch';

const MARCO_TLD_URL = 'https://raw.githubusercontent.com/rfc1036/whois/next/tld_serv_list';

function parseWhoisServerText(text) {
  return new Map(
    text
      .split(/\n/)
      .map(line => line.replace(/#.+$/, ''))
      .map(line => line.trim())
      .map(line => line.replace(/^\./, ''))
      .filter(line => line.length > 0)
      .map(line => line.match(/^([^\s]+)\s+(.+)$/))
      .filter(record => record)
      .map(record => [ record[1], record[2] ])
      .map(record => {
        let [ tld, server ] = record;
        let type = 'whois';

        if (server === 'NONE') {
          return [ record[0], null ];
        }

        if (server === 'AFILIAS') {
          return [ tld, 'whois.afilias-grs.info' ];
        }

        if (server === 'ARPA' || server === 'IP6') {
          // This is supposed to go to correct NIC for checking
          // EG ARIN, APNIC, etc.

          // Knowing WHICH delegation to ask isn't the goal of this.

          return [ tld, null ];
        }

        if (server.indexOf(' ') !== -1) {
          [ type, server ] = server.split(' ', 2);

          if (type === 'WEB') {
            server = null;
          }

          return [ record[0], server ];
        }

        return record;
      })
      .map(record => [ record[0], record[1] ? [ record[1] ] : [] ])
  );
}

export async function fetchRecord(tld) {
  let list = await fetchList();

  return new Map([ [ tld, list.get(tld) ] ]);
}

export async function fetchList() {
  const response = await fetch(MARCO_TLD_URL);

  let text = await response.text();

  return parseWhoisServerText(text);
}
