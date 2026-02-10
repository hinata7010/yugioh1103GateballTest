<template>
  <button
    :class="[
      'px-6 py-3 rounded-lg font-semibold transition-colors duration-200',
      variantClasses,
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false
});

defineEmits<{
  click: [event: MouseEvent];
}>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-blue-600 text-white';
    case 'secondary':
      return 'bg-gray-600 text-white';
    case 'outline':
      return 'bg-transparent border-2 border-blue-600 text-blue-600';
    default:
      return 'bg-blue-600 text-white';
  }
});
</script>
