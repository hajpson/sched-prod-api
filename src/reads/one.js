// GET /incidents/{id} — one incident, the same fields GET /incidents gives it, wrapped under `incident`.
// An id that is not in the feed answers null, so the API keeps its 404 {"error":"not found"}.

export function match(pathname) {
  const m = pathname.match(/^\/incidents\/([^/]+)$/);
  return m && m[1] !== 'grouped' ? decodeURIComponent(m[1]) : null;
}

export function answer(id, incidents) {
  const found = incidents.find((i) => i.id === id);
  if (!found) return null;
  const { id: incidentId, service, summary, status, openedAt } = found;
  return { incident: { id: incidentId, service, summary, status, openedAt } };
}
