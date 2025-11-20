import { motion, AnimatePresence } from 'framer-motion';
import WordCard from './WordCard';
import moment from 'moment';
import cx from 'classnames';
import { useTheme } from 'next-themes';
import DailyQuote from '../../DailyQuote';

const MotivationalQuotes = [
  'Every new word is a new superpower. Keep going!',
  'Your future self will thank you for learning today!',
  'Small progress is still progress — learn one more word!',
  'Consistency beats intensity. Add a word today!',
];

export default function VocabList({ words, speak, handleDeleteWord, setSelected }: any) {
  const groups = groupByDate(words);
  const todayKey = moment().format('DD/MM/YYYY');
  const todayWords = groups[todayKey] || [];
  const { theme } = useTheme();

  return (
    <div className="space-y-10">
      {/* --- Today Section --- */}
      <section className="mb-3">
        <h2 className="text-xl font-bold mb-1 sticky top-0 py-2">Today</h2>

        {todayWords.length === 0 ? (
          // <motion.div
          //   initial={{ opacity: 0, y: 10 }}
          //   animate={{ opacity: 1, y: 0 }}
          //   // className="p-5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 text-center"
          //   className={cx('p-5 rounded-xl text-blue-600 border border-blue-200 text-center', {
          //     'bg-blue-50': theme === 'light',
          //     'text-purple-300': theme === 'dark',
          //   })}
          // >
          //   <p className="text-lg font-medium">
          //     {MotivationalQuotes[Math.floor(Math.random() * MotivationalQuotes.length)]}
          //   </p>
          //   <p className="text-sm mt-1 opacity-80">Learn a new word to keep the streak alive!</p>
          // </motion.div>
          <DailyQuote />
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <AnimatePresence initial={false}>
              {todayWords.map((w: any) => (
                <WordCard
                  key={w.word}
                  w={w}
                  speak={speak}
                  handleDeleteWord={handleDeleteWord}
                  setSelected={setSelected}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* --- Other Dates --- */}
      {Object.keys(groups)
        .filter((d) => d !== todayKey)
        .sort((a, b) => (a < b ? 1 : -1)) // newest first
        .map((date) => (
          <section key={date} className="mb-3">
            <h2 className="text-lg font-semibold mb-1 sticky top-0 py-1">
              {/* {format(new Date(date), 'DD/MM/YYYY', { locale: enUS })} */}
              {date}
            </h2>

            <motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              <AnimatePresence initial={false}>
                {groups[date].map((w: any) => (
                  <WordCard
                    key={w.word}
                    w={w}
                    speak={speak}
                    handleDeleteWord={handleDeleteWord}
                    setSelected={setSelected}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        ))}
    </div>
  );
}

function groupByDate(words: any[]) {
  const groups: any = {};
  words.forEach((w) => {
    // const d = new Date(w.createdAt);
    // const key = d.toISOString().split('T')[0];
    const key = moment(w.createdAt).format('DD/MM/YYYY');
    if (!groups[key]) groups[key] = [];
    groups[key].push(w);
  });
  return groups;
}
