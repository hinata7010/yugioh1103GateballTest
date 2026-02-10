import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AxisScores, MatchResult, AnswerEffect, Question } from '../types';
import { findMatches } from '../utils/matching';
import { normalizeScores, calculateMaxScores } from '../utils/scoring';
import { decodeScores } from '../utils/encoding';
import questionsData from '../data/questions.json';

export const useQuizStore = defineStore('quiz', () => {
  // 상태 (ref)
  const currentQuestionIndex = ref(0);
  const answers = ref<Record<string, string>>({});
  const rawScores = ref<Record<string, number>>({
    stability: 0,
    difficulty: 0,
    ceiling: 0,
    tempo: 0,
    niche: 0,
    interaction: 0,
    power: 0
  });
  const selectedTags = ref<string[]>([]); // 선택된 소환 방식
  const userScores = ref<AxisScores | null>(null);
  const matchResults = ref<MatchResult[] | null>(null);

  // 질문 데이터
  const questions = questionsData as Question[];

  // Computed
  const currentQuestion = computed(() => questions[currentQuestionIndex.value]);
  const progress = computed(() =>
    ((currentQuestionIndex.value + 1) / questions.length) * 100
  );
  const isLastQuestion = computed(() =>
    currentQuestionIndex.value === questions.length - 1
  );

  // 액션
  function answerQuestion(questionId: string, answerId: string, effects: AnswerEffect[]) {
    // 이전 답변이 있으면 취소 (점수 복원)
    const prevAnswerId = answers.value[questionId];
    if (prevAnswerId) {
      // 이전 답변의 효과를 찾아서 되돌림
      const prevQuestion = questions.find(q => q.id === questionId);
      const prevAnswer = prevQuestion?.answers.find(a => a.id === prevAnswerId);
      if (prevAnswer && prevAnswer.effects) {
        prevAnswer.effects.forEach(effect => {
          const axis = effect.axis as keyof typeof rawScores.value;
          if (axis in rawScores.value && rawScores.value[axis] !== undefined) {
            rawScores.value[axis] = (rawScores.value[axis] ?? 0) - effect.value;
          }
        });
      }
    }

    // 새 답변 적용
    effects.forEach(effect => {
      const axis = effect.axis as keyof typeof rawScores.value;
      if (axis in rawScores.value && rawScores.value[axis] !== undefined) {
        rawScores.value[axis] = (rawScores.value[axis] ?? 0) + effect.value;
      }
    });

    answers.value[questionId] = answerId;
  }

  function selectTags(tags: string[]) {
    selectedTags.value = tags;
  }

  function nextQuestion() {
    if (currentQuestionIndex.value < questions.length - 1) {
      currentQuestionIndex.value++;
    }
  }

  function previousQuestion() {
    if (currentQuestionIndex.value > 0) {
      currentQuestionIndex.value--;
    }
  }

  function calculateResults() {
    const maxScores = calculateMaxScores(questions);

    // 점수 정규화 (1~10 범위)
    userScores.value = normalizeScores(rawScores.value, maxScores);

    console.log('calculateResults - selectedTags:', selectedTags.value);
    console.log('calculateResults - userScores:', userScores.value);

    // 매칭 덱 찾기 (선택된 태그 필터 적용)
    matchResults.value = findMatches(userScores.value, selectedTags.value);

    console.log('calculateResults - matchResults:', matchResults.value);
    console.log('calculateResults - matchResults length:', matchResults.value?.length);
    console.log('calculateResults - top match:', matchResults.value?.[0]);
  }

  function resetQuiz() {
    currentQuestionIndex.value = 0;
    answers.value = {};
    rawScores.value = {
      stability: 0,
      difficulty: 0,
      ceiling: 0,
      tempo: 0,
      niche: 0,
      interaction: 0,
      power: 0
    };
    selectedTags.value = [];
    userScores.value = null;
    matchResults.value = null;
  }

  function loadResultsFromUrl(encodedScores: string) {
    console.log('loadResultsFromUrl called with:', encodedScores);
    const scores = decodeScores(encodedScores);
    console.log('Decoded scores:', scores);

    if (scores) {
      userScores.value = scores;
      console.log('Set userScores to:', userScores.value);

      matchResults.value = findMatches(scores);
      console.log('Set matchResults to:', matchResults.value);
    } else {
      console.error('Failed to decode scores from:', encodedScores);
    }
  }

  return {
    // State
    currentQuestionIndex,
    answers,
    rawScores,
    selectedTags,
    userScores,
    matchResults,
    questions,
    // Computed
    currentQuestion,
    progress,
    isLastQuestion,
    // Actions
    answerQuestion,
    selectTags,
    nextQuestion,
    previousQuestion,
    calculateResults,
    resetQuiz,
    loadResultsFromUrl
  };
});
