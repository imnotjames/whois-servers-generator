export default function merge(lists) {
  let results = new Map();

  for (let list of lists) {
    for (let [ tld, value ] of list.entries()) {
      if (!tld) {
        continue;
      }

      value = value || [];

      if (!results.has(tld)) {
        results.set(tld, value);
        continue;
      }

      let existingValue = results.get(tld) || [];

      results.set(
        tld,
        Array.from(
          new Set(
            [
              ...existingValue,
              ...value,
            ]
          )
        )
      );
    }
  }

  return results;
}
