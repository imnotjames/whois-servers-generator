import {
  fetchRecord as fetchRecordIANA,
  fetchList as fetchListIANA
} from './list/iana.js';

import {
  fetchRecord as fetchRecordICANN,
  fetchList as fetchListICANN
} from './list/icann-registry-listing.js';

import {
  fetchRecord as fetchRecordMarcoDitri,
  fetchList as fetchListMarcoDitri
} from './list/marco-ditri-whois.js';

import {
  fetchRecord as fetchRecordGTLD,
  fetchList as fetchListGTLD
} from './list/gtld-default.js';

import { default as merge } from './merger.js';

export async function fetchRecord(tld) {
  return merge(
    await Promise.all([
      fetchRecordIANA(tld),
      fetchRecordICANN(tld),
      fetchRecordMarcoDitri(tld),
      fetchRecordGTLD(tld)
    ])
  );
}

export async function fetchList() {
  return merge(
    await Promise.all([
      fetchListIANA(),
      fetchListICANN(),
      fetchListMarcoDitri(),
      fetchListGTLD()
    ])
  );
}
