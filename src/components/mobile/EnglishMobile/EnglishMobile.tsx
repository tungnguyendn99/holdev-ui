'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Search, Plus, X, Speaker, Volume2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import API from '../../../utils/api';
import { useAppDispatch } from '../../../store/hooks';
import { hideLoading, showLoading } from '../../../store/slices/user.slice';
import { notification } from 'antd';
import WordCard from './WordCard';
import cx from 'classnames';

type WordResult = {
  definition?: string;
  partOfSpeech?: string;
  synonyms?: string[];
  typeOf?: string[];
  hasTypes?: string[];
  hasParts?: string[];
  inCategory?: string[];
  similarTo?: string[];
  also?: string[];
  examples?: string[];
};

type WordData = {
  word: string;
  results?: WordResult[];
  syllables?: { count?: number; list?: string[] };
  pronunciation?: { all?: string; noun?: string; verb?: string; adj?: string };
  frequency?: number;
  createdAt?: string;
  type?: string;
};

export default function EngLishMobile() {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [words, setWords] = useState<WordData[]>([]);
  const [selected, setSelected] = useState<WordData | any>(null);
  const [loading, setLoading] = useState(false);

  const [api, contextHolder] = notification.useNotification();

  const dispatch = useAppDispatch();

  const getListWords = async () => {
    try {
      dispatch(showLoading());
      // Simulate API call (replace with actual API request)
      const { data } = await API.get('/english/list-words');
      setWords(data);
    } catch (err) {
      console.log('error123', err);
    } finally {
      dispatch(hideLoading()); // tắt loading dù có lỗi hay không
    }
  };

  useEffect(() => {
    getListWords();
  }, []);

  const fetchWord = async (w: string): Promise<any> => {
    try {
      const { data } = await API.post('/english/new-word', {
        word: w,
      });
      getListWords();
      api.success({
        message: 'Success!',
        description: 'Add new word successfully.',
      });
      return data;
    } catch (err) {
      // fallback to mock (for demo)
      console.warn('Fetch word failed, using fallback', err);
      api.error({
        message: 'Success!',
        description: 'Add new word error.',
      });
    }
  };

  const handleAddWord = async () => {
    const w = query.trim().toLowerCase();
    if (!w) return;
    dispatch(showLoading());
    try {
      const data = await fetchWord(w);
      setWords((prev) => [data, ...prev]);
      setSelected(data);
      setQuery('');
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleDeleteWord = (word: string) => {
    // setWords((prev) => prev.filter((w) => w.word !== word));
    api.success({
      message: 'Success!',
      description: 'Add new word successfully.',
    });
  };

  const speak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      const utter = new SpeechSynthesisUtterance(text);
      // optional settings
      utter.lang = 'en-US';
      utter.rate = 0.95;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('TTS failed', e);
    }
  };

  const renderCompactInfo = (wd: WordData) => {
    const pos = wd.results?.[0]?.partOfSpeech || '';
    const pron = wd.pronunciation?.all || '';
    return (
      <div className="text-xs text-muted-foreground mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-3">
        <span className="capitalize">{pos}</span>
        {pron && <span className="opacity-80">/{pron}/</span>}
        {wd.frequency !== undefined && <span className="opacity-80">freq: {wd.frequency}</span>}
      </div>
    );
  };

  // Animation Variants
  const [showAllTypes, setShowAllTypes] = useState(false);
  console.log('showAllTypes', showAllTypes);

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.15,
        type: 'spring' as const,
        stiffness: 150,
        damping: 20,
      },
    }),
  };

  const cardVariant = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b p-4">
      {contextHolder}
      <div className="max-w-xl mx-auto">
        {/* Header / motivational */}
        <div className="mb-4">
          <h1
            className={cx('text-2xl font-bold', {
              'text-indigo-700': theme === 'light',
              'text-indigo-300': theme === 'dark',
            })}
          >
            Word Workout ✨
          </h1>
          <p
            className={cx('text-sm mt-1', {
              'text-gray-600': theme === 'light',
              'text-gray-400': theme === 'dark',
            })}
          >
            Type a word, press <span className="font-semibold">Add</span>, and explore meanings. One
            word at a time — daily progress!
          </p>
        </div>

        {/* Input row */}
        <div className="flex gap-2 items-center mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddWord();
              }}
              placeholder="Enter English word..."
              className={cx('w-full pl-10 pr-3 py-2 rounded-lg border', {
                'bg-white': theme === 'light',
                'bg-gray-800 border-gray-700 text-white': theme === 'dark',
              })}
            />
          </div>

          <button
            onClick={handleAddWord}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            aria-label="Add word"
          >
            <Plus size={14} />
            <span className="text-sm">Add</span>
          </button>
        </div>

        {/* Words list */}
        <section>
          {words.length === 0 ? (
            <div className="p-6 rounded-xl bg-indigo-50 dark:bg-gray-800 text-center">
              <p className="font-medium text-indigo-700 dark:text-indigo-200">No words yet</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Add your first word to begin your journey ✍️
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <AnimatePresence initial={false}>
                {words.map((w) => (
                  <WordCard
                    key={w.word}
                    w={w}
                    speak={speak}
                    handleDeleteWord={handleDeleteWord}
                    setSelected={setSelected}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* bottom hint / progress */}
        {/* <div className="mt-6 p-3 rounded-lg bg-white dark:bg-gray-800 border dark:border-gray-700 text-sm">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Today: <span className="font-semibold">{words.length}</span> word
            {words.length !== 1 ? 's' : ''}. Try to learn 5 every day! 🌱
          </p>
        </div> */}
      </div>
      {/* Word detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="word-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              variants={cardVariant}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col 
            ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}
            max-h-[76vh] md:max-h-[80vh]`}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                // className="sticky top-0 z-10 flex justify-between items-start p-5 border-b "
                className={cx('sticky top-0 z-10 flex justify-between items-start p-5 border-b', {
                  'text-indigo-700': theme === 'light',
                  'text-indigo-300': theme === 'dark',
                })}
              >
                <div>
                  <motion.h2
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cx('text-3xl font-extrabold capitalize', {
                      'text-indigo-700': theme === 'light',
                      'text-indigo-300': theme === 'dark',
                    })}
                  >
                    {selected?.word}
                  </motion.h2>
                  <motion.div className="mt-1">
                    {selected?.translate && <span>{selected?.translate}</span>}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={cx('flex items-center gap-3 mt-1 text-sm', {
                      'text-gray-500': theme === 'light',
                      'text-gray-400': theme === 'dark',
                    })}
                  >
                    {selected?.pronunciation?.all && <span>/{selected?.pronunciation?.all}/</span>}
                    {selected?.syllables?.list && (
                      <span>{selected?.syllables?.list?.join(' • ')}</span>
                    )}
                    {selected?.frequency !== undefined && <span>freq: {selected?.frequency}</span>}
                  </motion.div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => speak(selected?.word)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <Volume2 size={18} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelected(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Scrollable content */}
              <motion.div
                className="flex-1 overflow-y-auto px-5 pb-6 space-y-6"
                initial="hidden"
                animate="visible"
              >
                {selected?.results?.map((r: any, idx: number) => (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    custom={idx}
                    className={`rounded-xl p-4 border shadow-sm transition-all mb-0 mt-3
                  ${theme === 'dark' ? 'bg-gray-800/60 border-gray-700' : 'bg-indigo-50 border-indigo-100'}`}
                  >
                    {/* Part of speech */}
                    <div className="flex items-center justify-between mb-2">
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={cx('text-sm font-semibold capitalize', {
                          'text-indigo-600': theme === 'light',
                          'text-indigo-400': theme === 'dark',
                        })}
                      >
                        {r.partOfSpeech}
                      </motion.span>
                      {r.inCategory && (
                        <span className="text-xs text-gray-400">{r.inCategory.join(', ')}</span>
                      )}
                    </div>

                    {/* Definition */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="text-sm leading-relaxed mb-3"
                    >
                      {r.definition}
                    </motion.p>

                    {/* Synonyms */}
                    {r.synonyms && r.synonyms.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-3"
                      >
                        <p
                          className={cx('text-xs font-semibold mb-1', {
                            'text-gray-500': theme === 'light',
                            'text-gray-400': theme === 'dark',
                          })}
                        >
                          Synonyms
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {r.synonyms.slice(0, 10).map((s: any) => (
                            <motion.button
                              whileHover={{
                                scale: 1.05,
                                backgroundColor: theme === 'dark' ? '#374151' : '#EEF2FF',
                              }}
                              whileTap={{ scale: 0.95 }}
                              key={s}
                              className={`px-2 py-1 text-xs rounded-full border transition-all
                            ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            >
                              {s}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Has types */}
                    {r.hasTypes && r.hasTypes.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <p
                          className={cx('text-xs font-semibold mb-1', {
                            'text-gray-500': theme === 'light',
                            'text-gray-400': theme === 'dark',
                          })}
                        >
                          Types / Examples
                        </p>
                        <div className="overflow-x-auto flex gap-2 pb-1">
                          {r.hasTypes
                            .slice(0, showAllTypes ? r.hasTypes.length : 12)
                            .map((t: any) => (
                              <motion.span
                                whileHover={{ scale: 1.05 }}
                                key={t}
                                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap border
                              ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                              >
                                {t}
                              </motion.span>
                            ))}
                          <div className="rounded-2xl border-b-blue-600">
                            {!showAllTypes && r.hasTypes.length > 12 ? (
                              <button
                                onClick={() => setShowAllTypes(true)}
                                className="w-[70px]! text-xs text-indigo-500 font-medium"
                              >
                                +{r.hasTypes.length - 12} more
                              </button>
                            ) : (
                              r.hasTypes.length > 12 &&
                              showAllTypes && (
                                <button
                                  onClick={() => setShowAllTypes(false)}
                                  className="w-[80px]! text-xs text-indigo-500 font-medium"
                                >
                                  show less
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Examples */}
                    {r.examples && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3"
                      >
                        <p
                          className={cx('text-xs font-semibold mb-1', {
                            'text-gray-500': theme === 'light',
                            'text-gray-400': theme === 'dark',
                          })}
                        >
                          Examples
                        </p>
                        <div
                          className={cx('space-y-1 text-xs italic', {
                            'text-gray-600': theme === 'light',
                            'text-gray-300': theme === 'dark',
                          })}
                        >
                          {r.examples.map((ex: any, i: number) => (
                            <p key={i}>“{ex}”</p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`p-3 text-xs text-center border-t
              ${theme === 'dark' ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'}`}
              >
                Added on {new Date(selected?.createdAt || Date.now()).toLocaleString()}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
