import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AnswerEffect, AxisScores, MatchResult, Question } from '../types';
import questionsData from '../data/questions.json';
import { decodeScores, decodeTags } from '../utils/encoding';
import { findMatches } from '../utils/matching';
import { calculateMaxScores, normalizeScores } from '../utils/scoring';

export const useQuizStore = defineStore('quiz', () => {
  const currentQuestionIndex = ref(0);
  const answers = ref<Record<string, string>>({});
  const rawScores = ref<Record<string, number>>({
    stability: 0,
    difficulty: 0,
    ceiling: 0,
    tempo: 0,
    niche: 0,
    interaction: 0,
    power: 0,
  });
  const selectedTags = ref<string[]>([]);
  const userScores = ref<AxisScores | null>(null);
  const matchResults = ref<MatchResult[] | null>(null);

  const questions = questionsData as Question[];

  const currentQuestion = computed(() => questions[currentQuestionIndex.value]);
  const progress = computed(() => ((currentQuestionIndex.value + 1) / questions.length) * 100);
  const isLastQuestion = computed(() => currentQuestionIndex.value === questions.length - 1);

  function answerQuestion(questionId: string, answerId: string, effects: AnswerEffect[]) {
    const prevAnswerId = answers.value[questionId];

    if (prevAnswerId) {
      const prevQuestion = questions.find((q) => q.id === questionId);
      const prevAnswer = prevQuestion?.answers.find((a) => a.id === prevAnswerId);

      if (prevAnswer?.effects) {
        prevAnswer.effects.forEach((effect) => {
          const axis = effect.axis as keyof typeof rawScores.value;
          if (axis in rawScores.value && rawScores.value[axis] !== undefined) {
            rawScores.value[axis] = (rawScores.value[axis] ?? 0) - effect.value;
          }
        });
      }
    }

    effects.forEach((effect) => {
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
    userScores.value = normalizeScores(rawScores.value, maxScores);
    matchResults.value = findMatches(userScores.value, selectedTags.value);
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
      power: 0,
    };
    selectedTags.value = [];
    userScores.value = null;
    matchResults.value = null;
  }

  function loadResultsFromUrl(encodedScores: string, encodedTags?: string | string[]) {
    const scores = decodeScores(encodedScores);
    if (!scores) {
      return;
    }

    const tagParam =
      typeof encodedTags === 'string'
        ? encodedTags
        : Array.isArray(encodedTags) && encodedTags.length > 0
          ? (encodedTags[0] ?? '')
          : '';

    const tags = decodeTags(tagParam);
    selectedTags.value = tags;
    userScores.value = scores;
    matchResults.value = findMatches(scores, tags);
  }

  return {
    currentQuestionIndex,
    answers,
    rawScores,
    selectedTags,
    userScores,
    matchResults,
    questions,
    currentQuestion,
    progress,
    isLastQuestion,
    answerQuestion,
    selectTags,
    nextQuestion,
    previousQuestion,
    calculateResults,
    resetQuiz,
    loadResultsFromUrl,
  };
});
