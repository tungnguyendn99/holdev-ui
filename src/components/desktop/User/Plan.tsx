'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, LineChart, Gamepad2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import cx from 'classnames';

export default function PlansTab({ theme, planData }: any) {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const isDark = theme === 'dark';

  const gradientCard = isDark
    ? 'from-indigo-900/30 via-[#6374bf]/40 to-black/30'
    : 'from-blue-50 via-blue-300 to-white';

  //   const borderCard = isDark ? 'border-indigo-800' : 'border-blue-300';

  const textMain = isDark ? 'text-white' : 'text-blue-700';
  const textSub = isDark ? 'text-gray-200' : 'text-dark-600';

  const ruleBg = isDark ? 'bg-indigo-950/40 border-indigo-800' : 'bg-sky-50/60 border-sky-300';

  const getIcon = (type: string) => {
    switch (type) {
      case 'TRADING':
        return <LineChart className="w-5 h-5" />;
      case 'POKER':
        return <Gamepad2 className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      key="plans"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {planData?.map((plan: any) => {
        const open = openId === plan.id;

        return (
          <motion.div
            key={plan.id}
            className={cx(
              'rounded-xl p-4 shadow border cursor-pointer transition-all duration-300',
              `bg-gradient-to-br ${gradientCard} shadow`,
              open ? 'shadow-lg' : 'shadow-sm',
            )}
          >
            {/* HEADER CARD */}
            <div className="flex justify-between items-center" onClick={() => toggleOpen(plan.id)}>
              <div className="flex items-center gap-3">
                <div
                  className={cx(
                    'p-2 rounded-lg shadow-inner',
                    isDark ? 'bg-indigo-950/50' : 'bg-sky-100',
                  )}
                >
                  {getIcon(plan.type)}
                </div>

                <div>
                  <p className={`font-bold text-lg ${textMain}`}>
                    {plan.type} • {plan.identity}
                  </p>
                  <p className={`text-sm ${textSub}`}>{plan.plan}</p>
                </div>
              </div>

              {open ? (
                <ChevronDown className="opacity-75" />
              ) : (
                <ChevronRight className="opacity-75" />
              )}
            </div>

            {/* DETAILS SECTION */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 pl-1"
                >
                  {/* TARGET */}
                  <div className="mb-4 flex gap-3 justify-between">
                    <p className={`text-base font-semibold ${textMain}`}>
                      🎯 Monthly Target: {plan.monthTarget}
                    </p>
                    <p className={`text-base font-bold ${textMain}`}>
                      Daily Target: {plan.dayTarget.toFixed(2)}
                    </p>
                  </div>

                  {/* RULE */}
                  <div className={cx('p-3 rounded-xl border whitespace-pre-line mb-4', ruleBg)}>
                    <h3 className={`font-semibold mb-2 ${textMain}`}>Rules</h3>
                    <p className={`text-sm leading-relaxed ${textSub}`}>{plan.rule}</p>
                  </div>

                  {/* NOTE */}
                  {plan.note && (
                    <div className={cx('p-3 rounded-xl border whitespace-pre-line', ruleBg)}>
                      <h3 className={`font-semibold mb-2 ${textMain}`}>Note</h3>
                      <p className={`text-sm leading-relaxed ${textSub}`}>{plan.note}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
