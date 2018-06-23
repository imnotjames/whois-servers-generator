import { promisify } from 'util';
import fetch from 'node-fetch';
import whois from 'whois';

const IANA_TLDS = 'http://data.iana.org/TLD/tlds-alpha-by-domain.txt'
const IANA_WHOIS = 'whois.iana.org';

const WHOIS_LOOKUP = promisify(whois.lookup);

function parseTLDList(text) {
  let tlds = text
    .split(/\n/)
    .map(line => line.toLowerCase())
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .filter(line => line.indexOf('#') === -1);

  return [... new Set(tlds) ];
}

export async function fetchRecord(tld) {
  let result = await WHOIS_LOOKUP(tld, { server: IANA_WHOIS });

  let record = new Map(
    result.split(/\n/)
      .map(line => line.replace(/%.+$/, ''))
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.match(/^([^:]+)\s*:\s*(.+)$/))
      .filter(record => record)
      .map(record => [ record[1], record[2] ])
  );

  if (!record.has('whois')) {
    return new Map();
  }

  return new Map([ [ tld, [ record.get('whois') ] ] ]);
}

export async function fetchList() {
  let response = await fetch(IANA_TLDS);

  let text = await response.text();

  let tlds = parseTLDList(text);

  let results = new Map();

  for (let tld of tlds) {
    let record = await fetchRecord(tld);

    if (record.has(tld)) {
      results.set(tld, record.get(tld));
    } else {
      results.set(tld, []);
    }


  }

  return results;
}
