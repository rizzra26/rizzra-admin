<script setup lang="ts">
import MarkdownIt from 'markdown-it'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const md = new MarkdownIt({ html: false, linkify: true })
const previewHtml = computed(() => md.render(props.modelValue || ''))
</script>

<template>
  <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
    <textarea
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      class="h-[400px] resize-none rounded-lg border border-border bg-bg p-4 font-mono text-sm outline-none focus:border-accent"
      placeholder="Write your markdown content here..."
    />
    <div
      class="prose prose-sm prose-invert h-[400px] max-w-none overflow-y-auto rounded-lg border border-border bg-bg p-4"
      v-html="previewHtml"
    />
  </div>
</template>
