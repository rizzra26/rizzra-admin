<script setup lang="ts">
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const props = defineProps<{
  type: 'bar' | 'doughnut'
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string | string[]
  }[]
  height?: number
}>()

const data = computed(() => ({
  labels: props.labels,
  datasets: props.datasets,
}))

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: props.type === 'bar' ? {
    x: { ticks: { color: '#888' }, grid: { display: false } },
    y: { ticks: { color: '#888', stepSize: 1 }, grid: { color: '#2a2828' } },
  } : undefined,
}))
</script>

<template>
  <div :style="{ height: `${height || 200}px` }">
    <Bar v-if="type === 'bar'" :data="data" :options="options" />
    <Doughnut v-else :data="data" :options="options" />
  </div>
</template>
