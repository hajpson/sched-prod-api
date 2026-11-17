// sched-prod API: the incidents the status page and the board read. Contract: contract/api.md.

const json = (body, status = 200) => Response.json(body, { status });

async function feed(env) {
  const res = await fetch(env.FEED_URL);
  if (!res.ok) throw new Error(`feed answered ${res.status}`);
  const { incidents } = await res.json();
  return incidents;
}

// `GET /incidents/grouped` — additive read (a new call, every existing answer keeps every field).
// One line per cause, for the on-call board: no advice, no accept button. Cause = the service.
// The on-call interview asked for exactly this: "seeing which incidents came from the same cause.
// One line, grouped. Not advice."
function grouped(incidents) {
  const byCause = new Map();
  for (const i of incidents) {
    const cause = i.service;
    const g = byCause.get(cause) || { cause, count: 0, open: 0, firstOpenedAt: i.openedAt, lastOpenedAt: i.openedAt, incidents: [] };
    g.count += 1;
    if (i.status === 'open') g.open += 1;
    if (i.openedAt < g.firstOpenedAt) g.firstOpenedAt = i.openedAt;
    if (i.openedAt > g.lastOpenedAt) g.lastOpenedAt = i.openedAt;
    byCause.set(cause, g);
  }
  const groups = [...byCause.values()].sort((a, b) => a.firstOpenedAt.localeCompare(b.firstOpenedAt));
  return { groups };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/incidents') {
      return json({ incidents: await feed(env) });
    }
    if (request.method === 'GET' && url.pathname === '/incidents/grouped') {
      return json(grouped(await feed(env)));
    }
    return json({ error: 'not found' }, 404);
  },
};
