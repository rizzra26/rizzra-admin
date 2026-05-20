<script setup lang="ts">
const auth = useAuthStore()
const route = useRoute()

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/letters', label: 'Letters', icon: '📝' },
  { to: '/projects', label: 'Projects', icon: '💼' },
  { to: '/stack', label: 'Stack', icon: '🧰' },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <aside class="flex w-60 shrink-0 flex-col border-r border-border bg-surface">
    <div class="flex h-14 items-center gap-2 border-b border-border px-5">
      <span class="text-lg font-bold">Rizzra Admin</span>
    </div>
    <nav class="flex-1 space-y-0.5 p-3">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition"
        :class="isActive(link.to) ? 'bg-accent text-white' : 'text-text-muted hover:bg-bg hover:text-text'"
      >
        <span>{{ link.icon }}</span>
        {{ link.label }}
      </NuxtLink>
    </nav>
    <div class="border-t border-border p-3">
      <button
        @click="auth.logout()"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted transition hover:bg-bg hover:text-red-400"
      >
        <span>🚪</span> Logout
      </button>
    </div>
  </aside>
</template>
