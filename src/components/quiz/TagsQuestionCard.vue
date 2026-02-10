<template>
  <Card class="max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-gray-800">
      {{ question.text }}
    </h2>

    <div class="space-y-3">
      <button
        v-for="answer in question.answers"
        :key="answer.id"
        @click="toggleTag(answer.id)"
        :class="[
          'w-full p-4 rounded-lg border-2 transition-all',
          'text-left font-medium',
          selectedTags.includes(answer.id)
            ? 'border-blue-600 bg-blue-50 text-blue-900'
            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
        ]"
      >
        <div class="flex items-center justify-between">
          <span>{{ answer.text }}</span>
          <svg
            v-if="selectedTags.includes(answer.id)"
            class="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </button>
    </div>

    <p class="mt-4 text-sm text-gray-500">
      {{ selectedTags.length > 0 ? `${selectedTags.length}개 선택됨` : '하나 이상 선택하세요' }}
    </p>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Question } from '../../types';
import Card from '../common/Card.vue';

interface Props {
  question: Question;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  tagsSelected: [tags: string[]];
}>();

const selectedTags = ref<string[]>([]);

function toggleTag(tagId: string) {
  const index = selectedTags.value.indexOf(tagId);

  // "상관없음" 선택 시 다른 선택 해제
  if (tagId === '상관없음') {
    if (index === -1) {
      selectedTags.value = ['상관없음'];
    } else {
      selectedTags.value = [];
    }
  } else {
    // 다른 태그 선택 시 "상관없음" 해제
    if (index === -1) {
      selectedTags.value = selectedTags.value.filter(t => t !== '상관없음');
      selectedTags.value.push(tagId);
    } else {
      selectedTags.value.splice(index, 1);
    }
  }

  emit('tagsSelected', selectedTags.value);
}

// 선택 변경 감지
watch(selectedTags, (newTags) => {
  emit('tagsSelected', newTags);
}, { deep: true });
</script>
