<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p class="text-gray-600">결과를 계산하는 중...</p>
    </div>
  </div>

  <div v-else-if="!quizStore.matchResults || !quizStore.userScores" class="min-h-screen flex items-center justify-center bg-gray-50">
    <Card class="text-center">
      <p class="text-gray-600 mb-4">결과를 찾을 수 없습니다.</p>
      <Button @click="router.push('/')">
        처음으로 돌아가기
      </Button>
    </Card>
  </div>

  <div v-else class="min-h-screen bg-gray-50 p-4 py-12">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold text-center mb-2">당신에게 맞는 덱은?</h1>
      <p class="text-center text-gray-600 mb-12">
        당신의 플레이 스타일을 분석한 결과입니다
      </p>

      <!-- 최적 매칭 -->
      <section v-if="topMatch" class="mb-12">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-semibold mb-2">
            🎯 추천 덱
          </h2>
          <p class="text-xl text-blue-600 font-bold">
            매칭도 {{ topMatch.matchPercentage.toFixed(0) }}%
          </p>
        </div>
        <DeckCard :deck="topMatch.deck" :match-percentage="topMatch.matchPercentage" featured />
      </section>

      <!-- 추가 추천 -->
      <section v-if="alternatives.length > 0" class="mb-12">
        <h2 class="text-2xl font-semibold mb-6 text-center">
          💡 다른 추천 덱
        </h2>
        <div class="grid md:grid-cols-2 gap-6">
          <DeckCard
            v-for="match in alternatives"
            :key="match.deck.id"
            :deck="match.deck"
            :match-percentage="match.matchPercentage"
          />
        </div>
      </section>

      <!-- 공유하기 -->
      <section class="mt-12">
        <Card>
          <ShareButtons :user-scores="quizStore.userScores" />
        </Card>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quiz';
import DeckCard from '../components/results/DeckCard.vue';
import ShareButtons from '../components/common/ShareButtons.vue';
import Card from '../components/common/Card.vue';
import Button from '../components/common/Button.vue';

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();
const isLoading = ref(true);

const topMatch = computed(() => quizStore.matchResults?.[0]);
const alternatives = computed(() => quizStore.matchResults?.slice(1, 3) || []);

onMounted(() => {
  console.log('Results page mounted');
  console.log('Route query:', route.query);

  // URL에서 결과 로드
  const encoded = route.query.s as string;
  console.log('Encoded scores:', encoded);

  if (encoded) {
    console.log('Loading results from URL...');
    quizStore.loadResultsFromUrl(encoded);
    console.log('After loadResultsFromUrl - userScores:', quizStore.userScores);
    console.log('After loadResultsFromUrl - matchResults:', quizStore.matchResults);
  } else {
    console.log('No encoded scores in URL');
  }

  // 로딩 완료
  setTimeout(() => {
    console.log('Setting isLoading to false');
    console.log('Final userScores:', quizStore.userScores);
    console.log('Final matchResults:', quizStore.matchResults);
    isLoading.value = false;
  }, 500);
});
</script>
