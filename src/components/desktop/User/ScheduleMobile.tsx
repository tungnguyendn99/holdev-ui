import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import cx from 'classnames';
import { days, events } from './Schedule';

export default function WeeklyScheduleMobile({ theme }: any) {
  const daysData = days.map((day) => ({
    day,
    sessions: events
      .filter((e) => e.day === day)
      .map((e) => ({
        id: e.id,
        title: e.title,
        timeLabel: e.timeLabel,
      })),
  }));
  const [openDay, setOpenDay] = useState(null);

  const toggleDay = (day: any) => {
    setOpenDay(openDay === day ? null : day);
  };

  return (
    <div className="w-full divide-y divide-gray-200 dark:divide-gray-700">
      {daysData.map((d) => (
        <div key={d.day} className="py-3 px-4">
          {/* HEADER ROW */}
          <button
            className="w-full flex justify-between items-center"
            onClick={() => toggleDay(d.day)}
          >
            <div>
              <p className="text-base font-semibold">{d.day}</p>
              {/* <p className={cx('text-sm', theme === 'light' ? 'text-gray-500' : 'text-gray-400')}>
                {d.dateLabel}
              </p> */}
            </div>

            {/* <p className={cx('text-sm', theme === 'light' ? 'text-sky-600' : 'text-indigo-300')}>
              {d.statusLabel ?? ''}
            </p> */}

            <span
              className={cx(
                'ml-2 transform transition',
                openDay === d.day ? 'rotate-180' : 'rotate-0',
                theme === 'light' ? 'text-sky-600' : 'text-indigo-300',
              )}
            >
              ▼
            </span>
          </button>

          {/* COLLAPSIBLE CONTENT */}
          <AnimatePresence initial={false}>
            {openDay === d.day && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-3">
                  {d.sessions.length === 0 && (
                    <p
                      className={cx(
                        'text-center text-sm py-2',
                        theme === 'light' ? 'text-gray-400' : 'text-gray-500',
                      )}
                    >
                      No Sessions
                    </p>
                  )}

                  {d.sessions.map((s) => (
                    <div
                      key={s.id}
                      //   onClick={() => s.onOpen?.(s)}
                      className={cx(
                        'rounded-xl p-3 shadow-sm cursor-pointer',
                        theme === 'light'
                          ? 'bg-sky-50 text-sky-900'
                          : 'bg-indigo-900/30 text-indigo-200',
                      )}
                    >
                      <p className="font-semibold text-sm">{s.title}</p>
                      <p className="text-xs opacity-80">{s.timeLabel}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
