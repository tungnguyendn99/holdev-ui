'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import API from '../utils/api';

interface QuoteProps {
  quote: {
    quote: string;
    author: string;
    createdAt: string;
    type?: string;
  };
}

export default function DailyQuote() {
  const [quote, setQuote] = useState<any>({});
  const { theme } = useTheme();
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'noon' | 'night'>('morning');

  const getQuoteEveryday = async () => {
    try {
      // Simulate API call (replace with actual API request)
      const { data } = await API.get('/english/quote');
      setQuote(data);
    } catch (err) {
      console.log('error123', err);
    } finally {
      // dispatch(hideLoading());
    }
  };

  // 🕐 Xác định thời điểm trong ngày
  useEffect(() => {
    getQuoteEveryday();
    const hour = new Date().getHours();
    if (hour < 11) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('noon');
    else setTimeOfDay('night');
  }, []);

  // 🌈 Gradient động tùy theo theme & thời gian
  const gradient = useMemo(() => {
    if (theme === 'dark') {
      switch (timeOfDay) {
        case 'morning':
          return 'from-indigo-900 via-gray-900 to-black';
        case 'noon':
          return 'from-slate-800 via-gray-900 to-gray-950';
        case 'night':
          return 'from-[#0f172a] via-[#1e293b] to-black';
      }
    } else {
      switch (timeOfDay) {
        case 'morning':
          return 'from-orange-100 via-amber-50 to-white';
        case 'noon':
          return 'from-indigo-50 via-white to-blue-50';
        case 'night':
          return 'from-gray-100 via-indigo-50 to-white';
      }
    }
  }, [theme, timeOfDay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative w-full max-w-2xl mx-auto mt-6 md:mt-10 p-6 md:p-8 rounded-2xl shadow-md border
        ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}
        bg-gradient-to-br ${gradient} animate-gradient bg-[length:400%_400%]`}
    >
      {/* Icon lấp lánh */}
      <div className="absolute top-3 right-3 text-indigo-400 dark:text-indigo-300">
        <Sparkles className="w-5 h-5 animate-pulse" />
      </div>

      {/* Nội dung quote */}
      <p
        className={`text-center italic font-medium leading-relaxed
          ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}
          text-base md:text-lg`}
      >
        “{quote.quote}”
      </p>

      {/* Author */}
      <p
        className={`mt-4 text-center text-sm md:text-base
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
      >
        — {quote.author}
      </p>

      {/* Ngày */}
      <p
        className={`text-xs text-center mt-3 
          ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}
      >
        {new Date(quote.createdAt).toLocaleDateString('vi-VN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>

      {/* Tag loại quote */}
      {quote.type && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 
      px-4 py-1.5 rounded-full text-xs font-semibold shadow-md border 
      ${
        theme === 'dark'
          ? 'bg-gradient-to-r from-indigo-900/50 via-purple-900/40 to-indigo-900/50 text-indigo-200 border-indigo-800'
          : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-100 text-indigo-700 border-indigo-200'
      }
      backdrop-blur-sm`}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span className="tracking-wide">
            {quote.type.replace(/-/g, ' ').replace(/\b\w/g, (c: any) => c.toUpperCase())}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
