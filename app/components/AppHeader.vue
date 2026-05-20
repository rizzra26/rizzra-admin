<script setup lang="ts">
const route = useRoute()
const auth = useAuthStore()

const title = computed(() => {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/letters': 'Letters',
    '/projects': 'Projects',
    '/stack': 'Stack',
  }
  if (route.path.startsWith('/letters/')) return 'Letters'
  if (route.path.startsWith('/projects/')) return 'Projects'
  if (route.path.startsWith('/stack/')) return 'Stack'
  return map[route.path] || 'Dashboard'
})
</script>

<template>
  <header class="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
    <h1 class="text-lg font-semibold">{{ title }}</h1>
    <div class="flex items-center gap-3">
      <span class="text-sm text-text-muted">{{ auth.user?.username }}</span>
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
        {{ auth.user?.username?.charAt(0)?.toUpperCase() }}
      </div>
    </div>
  </header>
</template>
