const API_BASE = process.env.NUXT_PUBLIC_API_BASE_URL;

function token() {
  if (import.meta.client) return localStorage.getItem("access_token") || "";
  return "";
}

export function useApi() {
  async function request<T>(
    path: string,
    options: { method?: string; body?: any } = {},
  ): Promise<T> {
    const { method = "GET", body } = options;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token()) headers["Authorization"] = `Bearer ${token()}`;

    const resp = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (resp.status === 401) {
      const auth = useAuthStore();
      const refreshed = await auth.refresh();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${token()}`;
        const retry = await fetch(`${API_BASE}${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!retry.ok) throw new Error(`API error: ${retry.status}`);
        const json = await retry.json();
        return json.data !== undefined ? json.data : json;
      }
      auth.logout();
      throw new Error("Session expired");
    }

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.message || `API error: ${resp.status}`);
    }

    if (resp.status === 204) return undefined as T;
    const json = await resp.json();
    return (json.data !== undefined ? json.data : json) as T;
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: any) =>
      request<T>(path, { method: "POST", body }),
    put: <T>(path: string, body?: any) =>
      request<T>(path, { method: "PUT", body }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  };
}
