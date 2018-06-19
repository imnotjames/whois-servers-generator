import fetch from 'node-fetch';
import cheerio from 'cheerio';

const REGISTRY_AGREEMENTS_URL = 'https://www.icann.org/resources/pages/registries/registries-agreements-en';

async function fetchGTLDList() {
  let response = await fetch(REGISTRY_AGREEMENTS_URL);

  let html = await response.text();

  const $ = cheerio.load(html);

  let list = $('ul > li')
    .filter((i, el) => $(el).text().trim().match(/^\.(xn--)?[-a-z0-9]+ Registry Agreement/))
    .map((i, el) => $(el).text().trim())
    .get();

  return list
    .filter(entry => !entry.match(/– Terminated$/)) // Omit terminated (.mcdonalds, etc)
    .map(entry => entry.match(/\.((?:xn--)?[-a-z0-9]+)/))
    .filter(entry => entry)
    .map(entry => entry[1]);
}

export async function fetchRecord(tld) {
  let list = await fetchList();

  return new Map([ [ tld, list.get(tld) ] ]);
}

export async function fetchList() {
  let list = await fetchGTLDList();

  let results = new Map();

  for (let tld of list) {
    results.set(tld, [ `whois.nic.${tld}` ]);
  }

  return results;
}
