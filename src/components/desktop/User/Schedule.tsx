import React from 'react';
import cx from 'classnames';

const HOURS = Array.from({ length: 19 }, (_, i) => i + 6); // 6h-24h
console.log('HOURS', HOURS);

const HEIGHT_PER_HOUR = 60; // px

export const events = [
  // ===== Monday =====
  {
    id: 1,
    day: 'Monday',
    title: 'Working at Office',
    timeLabel: '07:00 - 18:00',
    startHour: 7,
    startMinute: 0,
    duration: 11 * 60,
  },
  {
    id: 2,
    day: 'Monday',
    title: 'English (Listening + Speaking)',
    timeLabel: '19:30 - 20:30',
    startHour: 19,
    startMinute: 30,
    duration: 60,
  },
  {
    id: 3,
    day: 'Monday',
    title: 'English (Vocab + Grammar)',
    timeLabel: '20:30 - 21:30',
    startHour: 20,
    startMinute: 30,
    duration: 60,
  },
  {
    id: 4,
    day: 'Monday',
    title: 'Poker Grind (Light Session)',
    timeLabel: '21:30 - 23:00',
    startHour: 21,
    startMinute: 30,
    duration: 90,
  },
  {
    id: 5,
    day: 'Monday',
    title: 'Review Poker Hands & Journal',
    timeLabel: '23:00 - 23:30',
    startHour: 23,
    startMinute: 0,
    duration: 30,
  },

  // ===== Tuesday =====
  {
    id: 6,
    day: 'Tuesday',
    title: 'Working at Office',
    timeLabel: '07:00 - 18:00',
    startHour: 7,
    startMinute: 0,
    duration: 11 * 60,
  },
  {
    id: 7,
    day: 'Tuesday',
    title: 'Poker Grind (Main Session)',
    timeLabel: '19:30 - 20:30',
    startHour: 19,
    startMinute: 30,
    duration: 60,
  },
  {
    id: 8,
    day: 'Tuesday',
    title: 'Poker Grind (Main Session)',
    timeLabel: '20:30 - 21:30',
    startHour: 20,
    startMinute: 30,
    duration: 60,
  },
  {
    id: 9,
    day: 'Tuesday',
    title: 'Review Poker + Theory',
    timeLabel: '21:30 - 23:00',
    startHour: 21,
    startMinute: 30,
    duration: 90,
  },
  {
    id: 10,
    day: 'Tuesday',
    title: 'English (Reading + Vocab)',
    timeLabel: '23:00 - 23:30',
    startHour: 23,
    startMinute: 0,
    duration: 30,
  },

  // ===== Wednesday =====
  {
    id: 11,
    day: 'Wednesday',
    title: 'Working at Office',
    timeLabel: '07:00 - 18:00',
    startHour: 7,
    startMinute: 0,
    duration: 11 * 60,
  },
  {
    id: 12,
    day: 'Wednesday',
    title: 'Trading Theory Research',
    timeLabel: '19:30 - 20:30',
    startHour: 19,
    startMinute: 30,
    duration: 60,
  },
  {
    id: 13,
    day: 'Wednesday',
    title: 'Trading Session (Backtest/Live)',
    timeLabel: '20:30 - 21:30',
    startHour: 20,
    startMinute: 30,
    duration: 60,
  },
  {
    id: 14,
    day: 'Wednesday',
    title: 'Trading Review + Journal',
    timeLabel: '21:30 - 23:00',
    startHour: 21,
    startMinute: 30,
    duration: 90,
  },
  {
    id: 15,
    day: 'Wednesday',
    title: 'English (Listening/Reading)',
    timeLabel: '23:00 - 23:30',
    startHour: 23,
    startMinute: 0,
    duration: 30,
  },

  // ===== Thursday =====
  {
    id: 16,
    day: 'Thursday',
    title: 'Working at Office',
    timeLabel: '07:00 - 18:00',
    startHour: 7,
    startMinute: 0,
    duration: 11 * 60,
  },
  {
    id: 17,
    day: 'Thursday',
    title: 'Poker Grind',
    timeLabel: '19:30 - 20:30',
    startHour: 19,
    startMinute: 30,
    duration: 60,
  },
  {
    id: 18,
    day: 'Thursday',
    title: 'Poker Grind / Trading Session',
    timeLabel: '20:30 - 21:30',
    startHour: 20,
    startMinute: 30,
    duration: 60,
  },
  {
    id: 19,
    day: 'Thursday',
    title: 'Trading Session (Scalp)',
    timeLabel: '21:30 - 23:00',
    startHour: 21,
    startMinute: 30,
    duration: 90,
  },
  {
    id: 20,
    day: 'Thursday',
    title: 'English Speaking Practice',
    timeLabel: '23:00 - 23:30',
    startHour: 23,
    startMinute: 0,
    duration: 30,
  },

  // ===== Friday =====
  {
    id: 21,
    day: 'Friday',
    title: 'Working at Office',
    timeLabel: '07:00 - 18:00',
    startHour: 7,
    startMinute: 0,
    duration: 11 * 60,
  },
  {
    id: 22,
    day: 'Friday',
    title: 'English (Speaking + Listening)',
    timeLabel: '19:30 - 20:30',
    startHour: 19,
    startMinute: 30,
    duration: 60,
  },
  {
    id: 23,
    day: 'Friday',
    title: 'Poker Weekly Review',
    timeLabel: '20:30 - 21:30',
    startHour: 20,
    startMinute: 30,
    duration: 60,
  },
  {
    id: 24,
    day: 'Friday',
    title: 'Trading Weekly Review',
    timeLabel: '21:30 - 23:00',
    startHour: 21,
    startMinute: 30,
    duration: 90,
  },
  {
    id: 25,
    day: 'Friday',
    title: 'Relax + Journal',
    timeLabel: '23:00 - 23:30',
    startHour: 23,
    startMinute: 0,
    duration: 30,
  },
];
export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WeeklySchedule({ theme }: any) {
  return (
    <div className={cx('w-full border rounded-xl', theme === 'dark' ? 'bg-[#353266]' : 'bg-white')}>
      {/* HEADER */}
      <div className="grid grid-cols-7 border-b">
        {days.map((d, idx) => (
          <div
            key={d}
            className={cx(
              'text-center py-3 font-semibold',
              theme === 'dark' ? 'text-indigo-300' : 'text-sky-600',
            )}
          >
            {d}
          </div>
        ))}
      </div>

      {/* BODY */}
      <div className="grid grid-cols-7 relative">
        {days.map((day, colIdx) => {
          const dayEvents = events.filter((e) => e.day === day);

          return (
            <div
              key={day}
              className={cx(
                'relative border-r min-h-[760px] rounded-xl',
                theme === 'dark' ? 'bg-[#202b40]' : 'bg-gray-50',
              )}
            >
              {dayEvents.length === 0 && (
                <p className="text-center text-gray-400 mt-10 text-sm">No Sessions</p>
              )}

              {dayEvents.map((ev) => {
                const topMorning =
                  (ev.startHour - HOURS[0]) * HEIGHT_PER_HOUR +
                  (ev.startMinute / 60) * HEIGHT_PER_HOUR;
                const topAfterMorning =
                  (ev.startHour - HOURS[6]) * HEIGHT_PER_HOUR +
                  (ev.startMinute / 60) * HEIGHT_PER_HOUR;
                const top = ev.startHour < 18 ? topMorning : topAfterMorning;
                const height =
                  ev.startHour < 18 ? (ev.duration / 60) * 30 : ev.duration > 60 ? 80 : 54;
                console.log('top', top);
                // console.log('height', height);

                return (
                  <div
                    key={ev.id}
                    className={cx(
                      'absolute w-[90%] mx-auto left-1/2 -translate-x-1/2 rounded-xl p-2 shadow-md cursor-pointer transition hover:scale-[1.02] overflow-auto',
                      theme === 'dark'
                        ? 'bg-indigo-900/40 text-indigo-100'
                        : 'bg-sky-100 text-sky-900',
                    )}
                    style={{
                      top,
                      height,
                    }}
                    // onClick={() => ev.onOpen(ev)}
                  >
                    <p className="font-semibold text-[12px]">{ev.title}</p>
                    <p className="text-xs opacity-70">{ev.timeLabel}</p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
