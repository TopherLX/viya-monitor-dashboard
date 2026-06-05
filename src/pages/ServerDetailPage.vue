<template>
  <div>
    <h2 class="text-2xl font-bold gradient-text-purple mb-6 capitalize">{{ hostName }}</h2>
    <p class="text-white/50">Detail charts for {{ hostName }} will go here.</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ hostName: string }>()
</script>
