<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full text-center">
      <h1 class="text-5xl font-bold text-gray-800 mb-4">
        유희왕 1103 게이트볼
      </h1>
      <h2 class="text-3xl font-semibold text-blue-600 mb-8">
        덱 성향 테스트
      </h2>

      <Card class="mb-8">
        <p class="text-lg text-gray-700 mb-4">
          12개의 질문으로 당신의 플레이 스타일을 분석하고
        </p>
        <p class="text-lg text-gray-700 mb-6">
          23개 덱 중 가장 적합한 덱을 추천해드립니다!
        </p>

        <div class="flex flex-col gap-4 items-center">
          <div class="text-sm text-gray-600 space-y-2">
            <p>✅ 8가지 성향 축 분석</p>
            <p>✅ 23개 덱 데이터베이스</p>
            <p>✅ 가중치 거리 계산 알고리즘</p>
            <p>✅ 결과 공유하기</p>
          </div>
        </div>
      </Card>

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
import Card from '../components/common/Card.vue';

const router = useRouter();
const quizStore = useQuizStore();

function startQuiz() {
  quizStore.resetQuiz();
  router.push('/quiz');
}
</script>
