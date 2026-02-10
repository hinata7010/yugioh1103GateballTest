<template>
  <div class="w-full bg-gray-200 rounded-full h-2.5">
    <div
      class="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  progress: number; // 0-100
}

defineProps<Props>();
</script>
