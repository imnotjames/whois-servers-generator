import { URL } from 'url';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

const IANA_REGISTRY_LISTINGS_URL = 'https://www.icann.org/resources/pages/listing-2012-02-25-en';

function parseHTML(html) {
  const $ = cheerio.load(html);
  const $convey = $('.convey');

  const CELL_NAMES = $convey.find('tr:first-child td').map(
    (_, e) => $(e).text().toUpperCase()
  ).get();

  let tlds = $convey.find('tr:not(:first-child)').map(
    (_, tr) => {
      let output = {};

      $(tr).children().each(
        (i, td) => { output[CELL_NAMES[i]] = $(td).text() }
      ).get();

      return output;
  }).get();

  return tlds;
}

function parseList(listData) {
  return new Map(listData.map((record) => {
    let tld = record['STRING'];
    let whois = record['WHOIS DIRECTORY SERVICE'];

    // Strip the '.' prefix
    tld = tld.replace(/^\./, '');
    whois = whois.trim();

    try {
      let whoisURL = new URL(whois);

      whois = whoisURL.hostname;
    } catch (e) {
      // If we can't parse it, assume that `whois` is a valud hostname?
    }

    if (!whois || whois.length === 0) {
      return [ tld, [] ];
    }

    return [ tld, [ whois ] ];
  }));
}

export async function fetchRecord(tld) {
  let list = await fetchList();
  return new Map([ [ tld, list.get(tld) ] ]);
}

export async function fetchList() {
  const response = await fetch(IANA_REGISTRY_LISTINGS_URL);
  const html = await response.text();

  let listData = parseHTML(html);
  return parseList(listData);
}
