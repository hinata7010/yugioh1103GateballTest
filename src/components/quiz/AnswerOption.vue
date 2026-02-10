<template>
  <button
    :class="[
      'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
      selected
        ? 'border-blue-600 bg-blue-50 text-blue-900'
        : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
    ]"
    @click="handleClick"
  >
    <span class="text-lg">{{ answer.text }}</span>
  </button>
</template>

<script setup lang="ts">
import type { Answer, AnswerEffect } from '../../types';

interface Props {
  answer: Answer;
  selected?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [answerId: string, effects: AnswerEffect[]];
}>();

function handleClick() {
  emit('select', props.answer.id, props.answer.effects);
}
</script>
