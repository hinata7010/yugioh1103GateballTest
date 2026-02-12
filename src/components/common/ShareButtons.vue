<template>
  <div class="space-y-4">
    <h3 class="text-xl font-semibold text-center">결과 공유하기</h3>

    <div class="flex flex-wrap gap-4 justify-center">
      <Button
        @click="handleCopyUrl"
        variant="primary"
      >
        <span class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          URL 복사하기
        </span>
      </Button>

      <Button
        @click="handleRetakeTest"
        variant="outline"
      >
        다시 테스트하기
      </Button>
    </div>

    <p v-if="copySuccess" class="text-center text-green-600 text-sm font-semibold">
      ✓ URL이 복사되었습니다!
    </p>
    <p v-if="copyError" class="text-center text-red-600 text-sm">
      ✗ 복사 실패. 브라우저 콘솔을 확인해주세요.
    </p>
    <p class="text-center text-xs text-gray-500">
      현재 URL: {{ shareUrl }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { generateShareUrl } from '../../utils/encoding';
import type { AxisScores } from '../../types';
import Button from './Button.vue';

interface Props {
  userScores: AxisScores;
  selectedTags?: string[];
}

const props = defineProps<Props>();

const router = useRouter();
const copySuccess = ref(false);
const copyError = ref(false);

const shareUrl = computed(() => {
  return generateShareUrl(props.userScores, props.selectedTags ?? []);
});

async function handleCopyUrl() {
  copyError.value = false;

  console.log('Attempting to copy URL:', shareUrl.value);

  try {
    await navigator.clipboard.writeText(shareUrl.value);
    console.log('Clipboard API success');
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 3000);
  } catch (err) {
    console.log('Clipboard API failed, trying fallback:', err);
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl.value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        console.log('Fallback copy success');
        copySuccess.value = true;
        setTimeout(() => {
          copySuccess.value = false;
        }, 3000);
      } else {
        throw new Error('Copy command failed');
      }
    } catch (e) {
      console.error('Copy failed:', e);
      copyError.value = true;
      alert('URL 복사에 실패했습니다. 수동으로 복사해주세요:\n\n' + shareUrl.value);
    }
  }
}

function handleRetakeTest() {
  router.push('/');
}
</script>
