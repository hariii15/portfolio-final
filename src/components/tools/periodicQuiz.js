import { ELEMENTS } from './periodicTableData.js';

export const QUIZ_SIZE = 10;

const shuffle = (list) => {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const buildQuiz = (pool, category, mode) => {
  const questions = shuffle(pool)
    .slice(0, Math.min(QUIZ_SIZE, pool.length))
    .map((el) => {
      const answer = mode === 'symbol' ? el.sym : el.name;
      const source = pool.length >= 4 ? pool : ELEMENTS;
      const distractors = shuffle(source.filter((x) => x.z !== el.z))
        .slice(0, 3)
        .map((x) => (mode === 'symbol' ? x.sym : x.name));
      return { el, answer, options: shuffle([answer, ...distractors]) };
    });

  return { questions, category, mode };
};
