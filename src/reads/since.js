// GET /incidents?since=<ISO time> — the same answer as GET /incidents, only incidents opened after
// that time. No since, or a time that does not parse, answers all, as now. Same fields, same order.

export function match(url) {
  const since = url.searchParams.get('since');
  if (since === null) return null;
  const t = Date.parse(since);
  return Number.isNaN(t) ? null : t;
}

export function answer(sinceMs, incidents) {
  return { incidents: incidents.filter((i) => Date.parse(i.openedAt) > sinceMs) };
}
