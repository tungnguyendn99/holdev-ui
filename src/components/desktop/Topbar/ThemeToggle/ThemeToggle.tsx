'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon, Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`cursor-pointer relative w-20 h-10 flex items-center rounded-full transition-colors duration-200 ${
        isDark ? 'bg-[#0b0e14]' : 'bg-gray-200'
      }`}
    >
      {/* icon mặt trời */}
      <Sun
        className={`absolute left-2 w-6 h-6 transition-colors duration-200 ${
          isDark ? 'text-gray-500' : 'text-yellow-500'
        }`}
      />
      {/* icon mặt trăng */}
      <Moon
        className={`absolute right-2 w-6 h-6 transition-colors duration-200 ${
          isDark ? 'text-white' : 'text-gray-500'
        }`}
      />

      {/* nút trượt */}
      <span
        className={`absolute w-6 h-6 rounded-full shadow-md transform transition-all duration-200 ${
          isDark
            ? 'right-2' // dark mode
            : 'left-2' // light mode
        }`}
      />
    </button>
  );
}
