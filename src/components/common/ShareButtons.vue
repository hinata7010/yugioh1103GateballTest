<template>
  <div class="space-y-4">
    <h3 class="text-xl font-semibold text-center">결과 공유</h3>

    <div class="flex flex-wrap gap-4 justify-center">
      <Button @click="handleCopyUrl" variant="primary">
        <span class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          링크 복사
        </span>
      </Button>

      <Button @click="handleShareOnX" variant="outline">
        <span class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.2L6.7 22H3.6l7.2-8.3L1 2h6.2l4.4 5.7L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" />
          </svg>
          X(트위터) 공유
        </span>
      </Button>

      <Button @click="handleRetakeTest" variant="outline">테스트 다시하기</Button>
    </div>

    <p v-if="copySuccess" class="text-center text-green-600 text-sm font-semibold">링크를 복사했어요.</p>
    <p v-if="copyError" class="text-center text-red-600 text-sm">복사에 실패했어요. 아래 링크를 직접 복사해 주세요.</p>
    <p class="text-center text-xs text-gray-500">현재 링크: {{ shareUrl }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { AxisScores } from '../../types';
import { generateShareUrl } from '../../utils/encoding';
import Button from './Button.vue';

interface Props {
  userScores: AxisScores;
  selectedTags?: string[];
  topDeckName?: string;
  topDeckId?: string;
}

const props = defineProps<Props>();

const router = useRouter();
const copySuccess = ref(false);
const copyError = ref(false);

const shareUrl = computed(() => generateShareUrl(props.userScores, props.selectedTags ?? []));

async function handleCopyUrl() {
  copyError.value = false;

  try {
    await navigator.clipboard.writeText(shareUrl.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 3000);
    return;
  } catch {
    // Clipboard API not available; fallback below.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = shareUrl.value;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (!successful) {
      throw new Error('Copy command failed');
    }

    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 3000);
  } catch {
    copyError.value = true;
    alert('링크 복사에 실패했어요. 아래 링크를 복사해 주세요:\n\n' + shareUrl.value);
  }
}

function handleShareOnX() {
  const intentUrl = new URL('https://twitter.com/intent/tweet');
  const shareText = props.topDeckName
    ? `${props.topDeckName} - 내 유희왕 1103 게이트볼 덱 성향 테스트 결과는?`
    : '내 유희왕 1103 게이트볼 덱 성향 테스트 결과는?';
  intentUrl.searchParams.set('text', shareText);

  const baseShareUrl = new URL(shareUrl.value);
  const twitterTargetUrl = props.topDeckId
    ? new URL(`/share/${props.topDeckId}.html`, window.location.origin)
    : new URL('/results', window.location.origin);
  const score = baseShareUrl.searchParams.get('s');
  const tags = baseShareUrl.searchParams.get('t');
  if (score) twitterTargetUrl.searchParams.set('s', score);
  if (tags) twitterTargetUrl.searchParams.set('t', tags);

  intentUrl.searchParams.set('url', twitterTargetUrl.toString());

  window.open(intentUrl.toString(), '_blank', 'noopener,noreferrer');
}

function handleRetakeTest() {
  router.push('/');
}
</script>
