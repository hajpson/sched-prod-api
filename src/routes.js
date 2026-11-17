// Every read the API answers after GET /incidents, in one table. Each read is a pure function of the
// feed: additive, no writes, and no change to GET /incidents. A read matches a path and answers it,
// or answers null so the API keeps its 404 {"error":"not found"}.

import * as one from './reads/one.js';
import * as grouped from './reads/grouped.js';
import * as filter from './reads/filter.js';
import * as since from './reads/since.js';

const reads = [one, grouped];

// Reads that keep the /incidents path and answer by query.
export const queryReads = [filter, since];

export async function route(request, env, incidents) {
  if (request.method !== 'GET') return null;
  const url = new URL(request.url);
  for (const read of reads) {
    const hit = read.match(url.pathname);
    if (hit) {
      const answer = read.answer(hit, incidents);
      if (answer) return answer;
    }
  }
  return null;
}
