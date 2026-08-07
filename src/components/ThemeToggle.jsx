import React, { useEffect, useState } from 'react';
import { Sun, Moon, Palette, Sparkles } from 'lucide-react';

export default function ThemeToggle() {
  const themes = ['light', 'dark', 'theme-custom', 'theme-custom-dark'];
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme && themes.includes(storedTheme)) {
        return storedTheme;
      }
      return 'dark'; 
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'theme-custom', 'theme-custom-dark');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'theme-custom') {
      root.classList.add('theme-custom');
    } else if (theme === 'theme-custom-dark') {
      root.classList.add('theme-custom-dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <button
      onClick={toggleTheme}
      title={`Toggle Theme: ${theme.replace('theme-', '')}`}
      className="flex size-14 rounded-full bg-monday-gray-background items-center justify-center overflow-hidden hover:opacity-80 transition-300 shrink-0 cursor-pointer text-monday-black"
    >
      {theme === 'light' ? <Sun size={20} /> : 
       theme === 'dark' ? <Moon size={20} /> : 
       theme === 'theme-custom' ? <Palette size={20} /> :
       <Sparkles size={20} />}
    </button>
  );
}
