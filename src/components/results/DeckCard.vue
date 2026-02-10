<template>
  <Card :hover="!featured" :class="featured ? 'border-4 border-blue-500' : ''">
    <div :class="featured ? 'p-8' : 'p-6'">
      <!-- 덱 이미지 -->
      <div :class="[
        'mb-4 rounded-lg overflow-hidden',
        featured ? 'bg-white' : 'bg-gray-100'
      ]">
        <img
          :src="deckImageUrl"
          :alt="deck.name"
          :class="[
            'w-full rounded-lg',
            featured ? 'h-80' : 'h-64',
            'object-contain'
          ]"
          @error="handleImageError"
        />
      </div>

      <!-- 덱 정보 -->
      <div class="mb-4">
        <h3 :class="[
          'font-bold mb-2',
          featured ? 'text-3xl' : 'text-2xl'
        ]">
          {{ deck.name }}
        </h3>
        <p class="text-gray-600 mb-2">{{ deck.description }}</p>

        <!-- 태그 -->
        <div class="flex flex-wrap gap-2 mb-3">
          <span
            v-for="tag in deck.tags"
            :key="tag"
            class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 매칭도 -->
        <div v-if="matchPercentage !== undefined" class="mb-3">
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm text-gray-600">매칭도</span>
            <span class="text-lg font-bold text-blue-600">
              {{ matchPercentage.toFixed(0) }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-500"
              :style="{ width: `${matchPercentage}%` }"
            />
          </div>
        </div>

        <!-- 코멘트 -->
        <p :class="[
          'text-gray-700 mt-4',
          featured ? 'text-lg' : 'text-base'
        ]">
          {{ deck.commentary }}
        </p>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Deck } from '../../types';
import Card from '../common/Card.vue';

interface Props {
  deck: Deck;
  featured?: boolean;
  matchPercentage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  featured: false
});

const imageError = ref(false);

const deckImageUrl = computed(() => {
  if (imageError.value) {
    // 플레이스홀더 이미지
    return `https://placehold.co/400x300/3b82f6/white?text=${encodeURIComponent(props.deck.name)}`;
  }
  return props.deck.image;
});

function handleImageError() {
  imageError.value = true;
}
</script>
