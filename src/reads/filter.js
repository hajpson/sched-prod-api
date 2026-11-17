// GET /incidents?status=open|resolved — the same answer as GET /incidents, only incidents with that
// status. No status, or any other value, answers all, as now. Same fields, same newest-first order.

export function match(url) {
  const status = url.searchParams.get('status');
  return status === 'open' || status === 'resolved' ? status : null;
}

export function answer(status, incidents) {
  return { incidents: incidents.filter((i) => i.status === status) };
}
