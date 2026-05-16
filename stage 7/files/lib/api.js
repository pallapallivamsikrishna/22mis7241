export async function fetchNotifications(params = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.set('limit', String(params.limit));
  if (params.page)  query.set('page',  String(params.page));
  if (params.type)  query.set('type',  params.type);

  const res = await fetch(`/api/notifications?${query.toString()}`);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to fetch notifications');
  }
  return res.json();
}