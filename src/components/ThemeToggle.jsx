import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Check local storage or system preference on initial load
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        return storedTheme === 'dark';
      }
      // Since default was dark before this addition, let's default to dark
      return true; 
    }
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      title="Toggle Theme"
      className="flex size-14 rounded-full bg-monday-gray-background items-center justify-center overflow-hidden hover:opacity-80 transition-300 shrink-0 cursor-pointer text-monday-black"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
