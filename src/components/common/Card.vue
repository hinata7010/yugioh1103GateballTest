<template>
  <div
    :class="[
      'bg-white rounded-lg shadow-md overflow-hidden',
      padding && 'p-6',
      hover && 'hover:shadow-lg transition-shadow duration-200'
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  padding?: boolean;
  hover?: boolean;
}

withDefaults(defineProps<Props>(), {
  padding: true,
  hover: false
});
</script>
