import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Speaker, Trash2 } from 'lucide-react';
import { useState } from 'react';
import cx from 'classnames';
import { useTheme } from 'next-themes';

const SWIPE_THRESHOLD = -60;

export default function WordCard({ w, speak, handleDeleteWord, setSelected }: any) {
  const { theme } = useTheme();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-80, 0], [0, 1]);

  const [swiped, setSwiped] = useState(false);

  const [showDelete, setShowDelete] = useState(false);

  const handleDragEnd = (_: any, info: any) => {
    // Nếu vuốt sang trái quá 60px → mở nút xóa
    if (info.offset.x < -50) {
      animate(x, -50, { duration: 0.2 });
      setShowDelete(true);
    } else {
      animate(x, 0, { duration: 0.2 });
      setShowDelete(false);
    }
  };

  const resetPosition = () => {
    animate(x, 0, { duration: 0.2 });
    setShowDelete(false);
  };

  return (
    <div className="relative">
      {/* Background delete button */}
      {showDelete && (
        <div
          className="absolute inset-0 flex items-center justify-end pr-5
          bg-red-500 text-white rounded-xl"
        >
          <button
            onClick={() => handleDeleteWord(w.word)}
            className="flex items-center text-sm font-semibold"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Foreground card */}
      <motion.article
        drag="x"
        dragElastic={0.05}
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x }}
        // onDragEnd={() => {
        //   if (x.get() < SWIPE_THRESHOLD) {
        //     setSwiped(true);
        //     x.set(-80);
        //   } else {
        //     setSwiped(false);
        //     x.set(0);
        //   }
        // }}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (!swiped) setSelected(w);
        }}
        className={cx('rounded-xl p-3 shadow-sm border cursor-pointer relative', {
          'bg-white': theme === 'light',
          'bg-gray-800 border-gray-700': theme === 'dark',
        })}
      >
        <div className="flex flex-col items-start">
          <div className="w-full flex justify-between">
            <p
              className={cx('font-semibold capitalize text-lg', {
                'text-indigo-600': theme === 'light',
                'text-indigo-300': theme === 'dark',
              })}
            >
              {w.word}
            </p>

            {/* compact info */}
            {/* speak button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(w.word);
              }}
              // className="p-2 rounded-lg hover:bg-gray-100 hover:bg-gray-700"
              className={cx('p-2 rounded-lg cursor-pointer', {
                'hover:bg-gray-200': theme === 'light',
                'hover:bg-gray-700': theme === 'dark',
              })}
            >
              <Speaker size={18} />
            </button>
          </div>
          <div
            className={cx('w-full flex justify-between mt-1 text-xs space-y-0.5', {
              'text-gray-500': theme === 'light',
              'text-gray-400': theme === 'dark',
            })}
          >
            {w.translate && <p className="italic">/{w.translate}/</p>}
            {w.frequency !== undefined && (
              <p className="text-[11px] text-gray-400">freq: {w.frequency}</p>
            )}
          </div>
          <div
            className={cx('w-full flex justify-between mt-1 text-xs space-y-0.5', {
              'text-gray-500': theme === 'light',
              'text-gray-400': theme === 'dark',
            })}
          >
            {w.pronunciation?.all && <p className="italic">/{w.pronunciation.all}/</p>}
            {w.syllables?.list && <p>{w.syllables.list.join(' • ')}</p>}
          </div>
        </div>
      </motion.article>
    </div>
  );
}
