// sched-prod API: the incidents the status page and the board read. Contract: contract/api.md.

import { route, queryReads } from './routes.js';

const json = (body, status = 200) => Response.json(body, { status });

async function feed(env) {
  const res = await fetch(env.FEED_URL);
  if (!res.ok) throw new Error(`feed answered ${res.status}`);
  const { incidents } = await res.json();
  return incidents;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/incidents') {
      const incidents = await feed(env);
      for (const read of queryReads) {
        const hit = read.match(url);
        if (hit) return json(read.answer(hit, incidents));
      }
      return json({ incidents });
    }
    if (request.method === 'GET') {
      const hit = await route(request, env, await feed(env));
      if (hit) return json(hit);
    }
    return json({ error: 'not found' }, 404);
  },
};
