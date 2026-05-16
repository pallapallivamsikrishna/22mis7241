const BASE_URL = 'http://4.224.186.213/evaluation-service';

// Store your token in .env.local as NEXT_PUBLIC_AUTH_TOKEN
const getToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('auth_token') || process.env.NEXT_PUBLIC_AUTH_TOKEN || ''
    : process.env.NEXT_PUBLIC_AUTH_TOKEN || '';

export async function fetchNotifications(params = {}) {
  const query = new URLSearchParams();
  if (params.limit)  query.set('limit', String(params.limit));
  if (params.page)   query.set('page',  String(params.page));
  if (params.type)   query.set('type',  params.type);

  const res = await fetch(`${BASE_URL}/notifications?${query.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'Failed to fetch notifications');
  }
  return res.json();
}
