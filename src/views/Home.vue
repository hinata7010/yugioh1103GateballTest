<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full text-center">
      <h1 class="text-5xl font-bold text-gray-800 mb-4">
        유희왕 1103 게이트볼
      </h1>
      <h2 class="text-3xl font-semibold text-blue-600 mb-8">
        덱 성향 테스트
      </h2>

      <!-- 메인 이미지 -->
      <div class="mb-8">
        <img
          src="/images/main.jpg"
          alt="유희왕 1103 게이트볼"
          class="w-full rounded-lg shadow-xl"
        />
      </div>

      <Button
        variant="primary"
        @click="startQuiz"
        class="text-xl px-12 py-4"
      >
        테스트 시작하기
      </Button>

      <p class="text-sm text-gray-600 mt-8">
        소요 시간: 약 2~3분
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz';
import Button from '../components/common/Button.vue';

const router = useRouter();
const quizStore = useQuizStore();

function startQuiz() {
  quizStore.resetQuiz();
  router.push('/quiz');
}
</script>
