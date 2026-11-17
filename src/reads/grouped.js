// GET /incidents/grouped — one line per cause, for the on-call board: count, open count, first and
// last opened. Read-only, no advice, no accept button. Pure function of the feed.

export function match(pathname) {
  return pathname === '/incidents/grouped' ? true : null;
}

export function answer(_match, incidents) {
  const byCause = new Map();
  for (const i of incidents) {
    const g = byCause.get(i.service) || { cause: i.service, count: 0, open: 0, firstOpenedAt: i.openedAt, lastOpenedAt: i.openedAt };
    g.count += 1;
    if (i.status === 'open') g.open += 1;
    if (i.openedAt < g.firstOpenedAt) g.firstOpenedAt = i.openedAt;
    if (i.openedAt > g.lastOpenedAt) g.lastOpenedAt = i.openedAt;
    byCause.set(i.service, g);
  }
  const groups = [...byCause.values()].sort((a, b) => a.firstOpenedAt.localeCompare(b.firstOpenedAt));
  return { groups };
}
