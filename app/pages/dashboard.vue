<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: ['auth'] })

const api = useApi()

interface Stats {
  letters_count: number
  projects_count: number
  stack_categories_count: number
  stack_items_count: number
  recent_letters: { id: string; title: string; created_at: string }[]
  letters_by_month: { month: string; count: number }[]
  projects_by_category: { category: string; count: number }[]
}

const stats = ref<Stats | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    stats.value = await api.get<Stats>('/dashboard/stats')
  } catch {} finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold">Dashboard</h2>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div class="rounded-xl border border-border bg-surface p-5">
        <p class="text-sm text-text-muted">Total Letters</p>
        <p class="mt-1 text-3xl font-bold">{{ stats?.letters_count ?? 0 }}</p>
      </div>
      <div class="rounded-xl border border-border bg-surface p-5">
        <p class="text-sm text-text-muted">Total Projects</p>
        <p class="mt-1 text-3xl font-bold">{{ stats?.projects_count ?? 0 }}</p>
      </div>
      <div class="rounded-xl border border-border bg-surface p-5">
        <p class="text-sm text-text-muted">Stack Categories</p>
        <p class="mt-1 text-3xl font-bold">{{ stats?.stack_categories_count ?? 0 }}</p>
      </div>
      <div class="rounded-xl border border-border bg-surface p-5">
        <p class="text-sm text-text-muted">Stack Items</p>
        <p class="mt-1 text-3xl font-bold">{{ stats?.stack_items_count ?? 0 }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="py-8 text-center text-sm text-text-muted">Loading dashboard...</div>

    <template v-else>
      <!-- Charts Row -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="rounded-xl border border-border bg-surface p-5">
          <h3 class="mb-4 text-sm font-semibold">Letters per Month</h3>
          <ChartWidget
            v-if="stats?.letters_by_month?.length"
            type="bar"
            :labels="stats.letters_by_month.map((m) => m.month)"
            :datasets="[{ label: 'Letters', data: stats.letters_by_month.map((m) => m.count), backgroundColor: '#6366f1' }]"
            :height="200"
          />
          <p v-else class="py-8 text-center text-sm text-text-muted">No data yet</p>
        </div>
        <div class="rounded-xl border border-border bg-surface p-5">
          <h3 class="mb-4 text-sm font-semibold">Projects by Category</h3>
          <ChartWidget
            v-if="stats?.projects_by_category?.length"
            type="doughnut"
            :labels="stats.projects_by_category.map((c) => c.category)"
            :datasets="[{ label: 'Projects', data: stats.projects_by_category.map((c) => c.count), backgroundColor: ['#6366f1', '#22c55e'] }]"
            :height="200"
          />
          <p v-else class="py-8 text-center text-sm text-text-muted">No data yet</p>
        </div>
      </div>

      <!-- Recent Letters -->
      <div class="rounded-xl border border-border bg-surface p-5">
        <h3 class="mb-3 text-sm font-semibold">Recent Letters</h3>
        <div v-if="stats?.recent_letters?.length">
          <div v-for="letter in stats.recent_letters" :key="letter.id" class="flex items-center justify-between border-b border-border py-2 last:border-0">
            <span class="text-sm">{{ letter.title }}</span>
            <span class="text-xs text-text-muted">{{ new Date(letter.created_at).toLocaleDateString() }}</span>
          </div>
        </div>
        <p v-else class="py-4 text-center text-sm text-text-muted">No letters yet</p>
      </div>
    </template>
  </div>
</template>
