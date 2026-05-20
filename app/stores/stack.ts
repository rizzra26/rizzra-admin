import { defineStore } from "pinia";

export interface StackItem {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  order_index: number;
}

export interface StackCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order_index: number;
  items: StackItem[];
}

interface StackState {
  categories: StackCategory[];
  loading: boolean;
}

function token() {
  return localStorage.getItem("access_token") || "";
}

function baseUrl() {
  return import.meta.client
    ? (window as any).__NUXT__?.public?.apiBaseUrl ||
        "http://localhost:8888/api/v1"
    : "http://localhost:8888/api/v1";
}

async function api(path: string, opts: RequestInit = {}): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };
  if (token()) headers["Authorization"] = `Bearer ${token()}`;
  const resp = await fetch(`${baseUrl()}${path}`, { ...opts, headers });
  if (resp.status === 204) return undefined;
  const json = await resp.json();
  if (!resp.ok) throw new Error(json.message || json.error || "API error");
  return json.data !== undefined ? json.data : json;
}

export const useStackStore = defineStore("stack", {
  state: (): StackState => ({
    categories: [],
    loading: false,
  }),

  actions: {
    async fetchAll() {
      this.loading = true;
      try {
        this.categories = await api("/stack/categories");
      } finally {
        this.loading = false;
      }
    },

    async createCategory(data: {
      name: string;
      slug?: string;
      description?: string | null;
    }) {
      return await api("/stack/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async updateCategory(
      id: string,
      data: { name: string; slug?: string; description?: string | null },
    ) {
      return await api(`/stack/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async removeCategory(id: string) {
      await api(`/stack/categories/${id}`, { method: "DELETE" });
      this.categories = this.categories.filter((c) => c.id !== id);
    },

    async createItem(data: {
      category_id: string;
      name: string;
      description?: string | null;
    }) {
      return await api("/stack/items", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async updateItem(
      id: string,
      data: { name: string; description?: string | null },
    ) {
      return await api(`/stack/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async removeItem(itemId: string, categoryId: string) {
      await api(`/stack/items/${itemId}`, { method: "DELETE" });
      const cat = this.categories.find((c) => c.id === categoryId);
      if (cat) {
        cat.items = cat.items.filter((i) => i.id !== itemId);
      }
    },
  },
});
