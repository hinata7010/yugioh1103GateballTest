<template>
  <Card class="max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">
      {{ question.text }}
    </h2>

    <div class="space-y-3">
      <AnswerOption
        v-for="answer in question.answers"
        :key="answer.id"
        :answer="answer"
        :selected="selectedAnswerId === answer.id"
        @select="handleSelect"
      />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Question, AnswerEffect } from '../../types';
import Card from '../common/Card.vue';
import AnswerOption from './AnswerOption.vue';

interface Props {
  question: Question;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  answer: [answerId: string, effects: AnswerEffect[]];
}>();

const selectedAnswerId = ref<string | null>(null);

function handleSelect(answerId: string, effects: AnswerEffect[]) {
  selectedAnswerId.value = answerId;
  emit('answer', answerId, effects);
}
</script>
