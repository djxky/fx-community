<script setup>
defineProps({
  name: {
    type: String,
    required: true,
    validator: (value) => ['home', 'discover', 'skills', 'academy', 'mylib'].includes(value),
  },
})
</script>

<template>
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'home'">
      <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M9 15h6" />
    </template>
    <template v-else-if="name === 'discover'">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="17" cy="8" r="2.6" />
      <path d="M15.5 13.6A5 5 0 0 1 21 18.5" />
    </template>
    <template v-else-if="name === 'skills'">
      <rect x="3" y="4" width="18" height="16" rx="4" />
      <path d="m9 9-2 3 2 3M15 9l2 3-2 3M11.5 16l1-8" />
    </template>
    <template v-else-if="name === 'academy'">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v4.5c0 1.1 2.7 2.5 6 2.5s6-1.4 6-2.5V12" />
    </template>
    <path v-else d="M7.5 19h9.7a4.3 4.3 0 0 0 .7-8.5A6.2 6.2 0 0 0 6 8.8 5.1 5.1 0 0 0 7.5 19Z" />
  </svg>
</template>
