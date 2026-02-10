<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto py-8">
      <!-- 진행률 표시 -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <p class="text-sm text-gray-600">
            질문 {{ quizStore.currentQuestionIndex + 1 }} / {{ quizStore.questions.length }}
          </p>
          <p class="text-sm text-gray-600">
            {{ Math.round(quizStore.progress) }}%
          </p>
        </div>
        <ProgressBar :progress="quizStore.progress" />
      </div>

      <!-- 질문 카드 -->
      <TagsQuestionCard
        v-if="quizStore.currentQuestion?.type === 'tags'"
        :question="quizStore.currentQuestion"
        @tags-selected="handleTagsSelected"
      />
      <QuestionCard
        v-else-if="quizStore.currentQuestion"
        :question="quizStore.currentQuestion"
        @answer="handleAnswer"
      />

      <!-- 이전/다음 버튼 -->
      <div class="flex justify-between mt-6">
        <Button
          variant="outline"
          :disabled="quizStore.currentQuestionIndex === 0"
          @click="quizStore.previousQuestion"
        >
          이전
        </Button>

        <Button
          v-if="!quizStore.isLastQuestion"
          variant="secondary"
          :disabled="!hasAnswered"
          @click="quizStore.nextQuestion"
        >
          다음
        </Button>

        <Button
          v-else
          variant="primary"
          :disabled="!hasAnswered"
          @click="finishQuiz"
        >
          결과 보기
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz';
import type { AnswerEffect } from '../types';
import QuestionCard from '../components/quiz/QuestionCard.vue';
import TagsQuestionCard from '../components/quiz/TagsQuestionCard.vue';
import ProgressBar from '../components/common/ProgressBar.vue';
import Button from '../components/common/Button.vue';

const router = useRouter();
const quizStore = useQuizStore();

const hasAnswered = computed(() => {
  if (!quizStore.currentQuestion) return false;

  // tags 질문은 선택된 태그가 있으면 답변한 것으로 간주
  if (quizStore.currentQuestion.type === 'tags') {
    return quizStore.selectedTags.length > 0;
  }

  // 일반 질문은 answers에 있으면 답변한 것으로 간주
  return quizStore.answers[quizStore.currentQuestion.id] !== undefined;
});

function handleAnswer(answerId: string, effects: AnswerEffect[]) {
  if (!quizStore.currentQuestion) return;
  quizStore.answerQuestion(quizStore.currentQuestion.id, answerId, effects);
}

function handleTagsSelected(tags: string[]) {
  quizStore.selectTags(tags);
}

function finishQuiz() {
  quizStore.calculateResults();
  router.push('/results');
}
</script>
