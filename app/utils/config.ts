export const API_BASE = 'http://localhost:8888/api/v1'

export function authHeader(): Record<string, string> {
  if (!import.meta.client) return {}
  const tok = localStorage.getItem('access_token')
  if (!tok) return {}
  return { Authorization: `Bearer ${tok}` }
}
