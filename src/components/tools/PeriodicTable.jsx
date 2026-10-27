import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiX } from 'react-icons/fi';
import useAdminAuth from './useAdminAuth';
import logActivity from './activity';
import Dropdown from '../dropdown';
import {
  ELEMENTS,
  CATEGORIES,
  CATEGORY_OPTIONS,
  layoutOf,
  blockOf,
  neutronsOf,
} from './periodicTableData';
import { QUIZ_SIZE, buildQuiz } from './periodicQuiz';
import './periodic-table.css';

const MODE_OPTIONS = [
  { value: 'symbol', label: 'Name → symbol' },
  { value: 'name', label: 'Symbol → name' },
];

const MODE_LABELS = {
  symbol: 'Name → symbol',
  name: 'Symbol → name',
};

const categoryLabel = (value) =>
  CATEGORY_OPTIONS.find((option) => option.value === value)?.label || 'All elements';

const Loader = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-[#0A0A0A]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E9E9E6] border-t-[#111111] dark:border-[#232323] dark:border-t-[#EDEDED]" />
    <p className="mono mt-3 text-[11px] uppercase tracking-[0.2em] text-[#9B9A93] dark:text-[#6E6E6E]">
      Verifying session
    </p>
  </div>
);

const PeriodicTableApp = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('table');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(ELEMENTS[0]);

  const [quizCategory, setQuizCategory] = useState('all');
  const [quizMode, setQuizMode] = useState('symbol');
  const [quiz, setQuiz] = useState(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [result, setResult] = useState(null);
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!result || loggedRef.current) return;
    loggedRef.current = true;
    logActivity('periodic', {
      total: result.total,
      correct: result.correct,
      accuracy: result.accuracy,
      mode: result.mode === 'symbol' ? 'symbols' : 'names',
      category: result.category,
    });
  }, [result]);

  const startQuiz = () => {
    const pool =
      quizCategory === 'all'
        ? ELEMENTS
        : ELEMENTS.filter((el) => el.cat === quizCategory);
    setQuiz(buildQuiz(pool, quizCategory, quizMode));
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setResult(null);
    loggedRef.current = false;
  };

  const resetQuiz = () => {
    setQuiz(null);
    setResult(null);
    setPicked(null);
    setIndex(0);
    setCorrect(0);
  };

  const answerQuestion = (option) => {
    if (!quiz || picked !== null) return;
    setPicked(option);
    if (option === quiz.questions[index].answer) {
      setCorrect((value) => value + 1);
    }
  };

  const nextQuestion = () => {
    if (!quiz) return;
    if (index + 1 >= quiz.questions.length) {
      const total = quiz.questions.length;
      const accuracy = total ? Math.round((correct / total) * 100) : 0;
      setResult({
        total,
        correct,
        accuracy,
        mode: quiz.mode,
        category: quiz.category,
      });
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
  };

  const term = search.trim().toLowerCase();
  const isVisible = (el) =>
    (categoryFilter === 'all' || el.cat === categoryFilter) &&
    (!term ||
      el.name.toLowerCase().includes(term) ||
      el.sym.toLowerCase().includes(term) ||
      String(el.z) === term);

  const visibleCount = ELEMENTS.filter(isVisible).length;
  const question = quiz?.questions[index];
  const cat = CATEGORIES[selected.cat];

  return (
    <div className="pt-root">
      <header className="pt-header">
        <button
          className="pt-back"
          onClick={() => navigate('/admin/dashboard')}
          title="Back to dashboard"
          aria-label="Back to dashboard"
        >
          <FiArrowLeft size={16} />
        </button>

        <div className="pt-heading">
          <h1 className="pt-title">Periodic Table</h1>
          <p className="pt-sub">118 elements · facts and quizzes</p>
        </div>

        <div className="pt-tabs" role="tablist" aria-label="Periodic table mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'table'}
            className={mode === 'table' ? 'is-active' : ''}
            onClick={() => setMode('table')}
          >
            Table
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'quiz'}
            className={mode === 'quiz' ? 'is-active' : ''}
            onClick={() => setMode('quiz')}
          >
            Quiz
          </button>
        </div>
      </header>

      <main className="pt-main">
        {mode === 'table' && (
          <>
            <div className="pt-toolbar">
              <div className="pt-search">
                <FiSearch size={15} aria-hidden="true" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, symbol, or number"
                  aria-label="Search elements"
                />
                {search && (
                  <button
                    type="button"
                    className="pt-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    <FiX size={13} />
                  </button>
                )}
              </div>

              <Dropdown
                tone="dark"
                size="sm"
                className="w-[200px]"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={CATEGORY_OPTIONS}
                ariaLabel="Filter the table by category"
              />

              <span className="pt-count">{visibleCount} / 118</span>
            </div>

            <div className="pt-legend" aria-label="Element categories">
              <button
                type="button"
                className={categoryFilter === 'all' ? 'is-active' : ''}
                onClick={() => setCategoryFilter('all')}
              >
                <span className="pt-dot pt-dot-all" />
                All
              </button>
              {Object.entries(CATEGORIES).map(([key, value]) => (
                <button
                  type="button"
                  key={key}
                  className={categoryFilter === key ? 'is-active' : ''}
                  onClick={() =>
                    setCategoryFilter((current) => (current === key ? 'all' : key))
                  }
                >
                  <span className="pt-dot" style={{ background: value.color }} />
                  {value.label}
                </button>
              ))}
            </div>

            <div className="pt-table-scroll">
              <div className="pt-grid" aria-label="Periodic table of the elements">
                {Array.from({ length: 18 }, (_, i) => i + 1).map((group) => (
                  <span
                    key={`g-${group}`}
                    className="pt-axis pt-axis-group"
                    style={{ gridRow: 1, gridColumn: group + 1 }}
                  >
                    {group}
                  </span>
                ))}

                {Array.from({ length: 7 }, (_, i) => i + 1).map((period) => (
                  <span
                    key={`p-${period}`}
                    className="pt-axis pt-axis-period"
                    style={{ gridRow: period + 1, gridColumn: 1 }}
                  >
                    {period}
                  </span>
                ))}

                <span className="pt-axis pt-axis-period" style={{ gridRow: 10, gridColumn: 1 }}>
                  La
                </span>
                <span className="pt-axis pt-axis-period" style={{ gridRow: 11, gridColumn: 1 }}>
                  Ac
                </span>

                <button
                  type="button"
                  className="pt-series"
                  style={{ gridRow: 7, gridColumn: 4 }}
                  onClick={() => setCategoryFilter('lanthanide')}
                  title="Show the lanthanide series"
                >
                  57–71
                </button>
                <button
                  type="button"
                  className="pt-series"
                  style={{ gridRow: 8, gridColumn: 4 }}
                  onClick={() => setCategoryFilter('actinide')}
                  title="Show the actinide series"
                >
                  89–103
                </button>

                {ELEMENTS.map((el) => {
                  const position = layoutOf(el);
                  const visible = isVisible(el);
                  const active = selected.z === el.z;
                  return (
                    <button
                      type="button"
                      key={el.z}
                      className={`pt-cell${visible ? '' : ' is-dim'}${active ? ' is-active' : ''}`}
                      style={{
                        gridRow: position.row,
                        gridColumn: position.col,
                        '--cat': CATEGORIES[el.cat].color,
                      }}
                      onClick={() => setSelected(el)}
                      aria-pressed={active}
                      title={`${el.name} · ${el.sym} · ${el.z}`}
                    >
                      <span className="pt-cell-z">{el.z}</span>
                      <span className="pt-cell-sym">{el.sym}</span>
                      <span className="pt-cell-name">{el.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="pt-scroll-hint">Tip: scroll sideways on a small screen to see the full table.</p>

            <section className="pt-detail" style={{ '--cat': cat.color }}>
              <div className="pt-detail-id">
                <div className="pt-detail-symbol">{selected.sym}</div>
                <div className="pt-detail-text">
                  <span className="pt-eyebrow">
                    Element {String(selected.z).padStart(3, '0')}
                  </span>
                  <h2>{selected.name}</h2>
                  <span className="pt-chip">{cat.label}</span>
                </div>
              </div>

              <dl className="pt-facts">
                <div>
                  <dt>Atomic mass</dt>
                  <dd>{selected.mass.startsWith('[') ? selected.mass : `${selected.mass} u`}</dd>
                </div>
                <div>
                  <dt>Group</dt>
                  <dd>{selected.series ? '—' : selected.group}</dd>
                </div>
                <div>
                  <dt>Period</dt>
                  <dd>{selected.period}</dd>
                </div>
                <div>
                  <dt>Block</dt>
                  <dd>{blockOf(selected)}</dd>
                </div>
                <div>
                  <dt>Protons</dt>
                  <dd>{selected.z}</dd>
                </div>
                <div>
                  <dt>Neutrons</dt>
                  <dd>{neutronsOf(selected) ?? '—'}</dd>
                </div>
                <div>
                  <dt>Electrons</dt>
                  <dd>{selected.z}</dd>
                </div>
              </dl>
            </section>

            {selected.mass.startsWith('[') && (
              <p className="pt-note">
                {selected.mass} is the mass number of {selected.name}&apos;s most stable known
                isotope.
              </p>
            )}
          </>
        )}

        {mode === 'quiz' && (
          <div className="pt-quiz">
            {!quiz && (
              <div className="pt-card">
                <span className="pt-eyebrow">Element quiz</span>
                <h2>How well do you know the table?</h2>
                <p className="pt-lead">
                  Ten questions, four choices. Pick a question style and a category to drill.
                </p>

                <div className="pt-fields">
                  <div className="pt-field">
                    <span>Question style</span>
                    <Dropdown
                      tone="dark"
                      value={quizMode}
                      onChange={setQuizMode}
                      options={MODE_OPTIONS}
                      ariaLabel="Question style"
                    />
                  </div>
                  <div className="pt-field">
                    <span>Category</span>
                    <Dropdown
                      tone="dark"
                      value={quizCategory}
                      onChange={setQuizCategory}
                      options={CATEGORY_OPTIONS}
                      ariaLabel="Quiz category"
                    />
                  </div>
                </div>

                <button type="button" className="pt-primary" onClick={startQuiz}>
                  Start {QUIZ_SIZE} questions
                </button>
              </div>
            )}

            {quiz && !result && question && (
              <div className="pt-card">
                <div className="pt-quiz-top">
                  <span className="mono">
                    Question {index + 1} / {quiz.questions.length}
                  </span>
                  <span className="mono">{correct} correct</span>
                </div>
                <div className="pt-progress">
                  <span style={{ width: `${((index + 1) / quiz.questions.length) * 100}%` }} />
                </div>

                <h2 className="pt-question">
                  {quiz.mode === 'symbol' ? (
                    <>
                      Which symbol belongs to <em>{question.el.name}</em>?
                    </>
                  ) : (
                    <>
                      Which element has the symbol <em>{question.el.sym}</em>?
                    </>
                  )}
                </h2>

                <div className="pt-options">
                  {question.options.map((option) => {
                    let stateClass = '';
                    if (picked !== null) {
                      if (option === question.answer) stateClass = ' is-correct';
                      else if (option === picked) stateClass = ' is-wrong';
                      else stateClass = ' is-muted';
                    }
                    return (
                      <button
                        type="button"
                        key={option}
                        className={`pt-option${stateClass}`}
                        onClick={() => answerQuestion(option)}
                        disabled={picked !== null}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <p className="pt-feedback" aria-live="polite">
                  {picked !== null &&
                    (picked === question.answer ? 'Correct — ' : 'Not quite — ') +
                      `${question.el.name} is ${question.el.sym}.`}
                </p>

                <div className="pt-actions">
                  <button type="button" className="pt-ghost" onClick={resetQuiz}>
                    Exit quiz
                  </button>
                  <button
                    type="button"
                    className="pt-primary"
                    onClick={nextQuestion}
                    disabled={picked === null}
                  >
                    {index + 1 === quiz.questions.length ? 'See results' : 'Next question'}
                  </button>
                </div>
              </div>
            )}

            {result && (
              <div className="pt-card pt-result">
                <span className="pt-eyebrow">Quiz complete</span>
                <div className="pt-score">{result.accuracy}%</div>
                <p className="pt-lead">
                  {result.correct} / {result.total} correct · {MODE_LABELS[result.mode]} ·{' '}
                  {categoryLabel(result.category)}
                </p>
                <p className="pt-result-note">
                  {result.accuracy === 100
                    ? 'Perfect run. Try a harder category next.'
                    : result.accuracy >= 70
                    ? 'Strong score. One more pass will lock it in.'
                    : 'Good start. Review the table, then run it again.'}
                </p>

                <div className="pt-actions">
                  <button type="button" className="pt-ghost" onClick={resetQuiz}>
                    Change setup
                  </button>
                  <button type="button" className="pt-primary" onClick={startQuiz}>
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const PeriodicTable = () => {
  const ready = useAdminAuth();
  if (!ready) return <Loader />;
  return <PeriodicTableApp />;
};

export default PeriodicTable;
