import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      className="px-4 py-2 rounded-full bg-blueLIGHT text-midnight dark:bg-pink dark:text-white2 shadow-lg font-bold transition-all duration-300 hover:scale-110 hover:italic hover:shadow-blueLIGHT dark:hover:shadow-pink"
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
    >
      <span className="sm:hidden">
        <img
          src={darkMode ? '/images/Dark.webp' : '/images/Light.webp'}
          alt={darkMode ? 'Dark mode' : 'Light mode'}
          className="w-6 h-6 object-contain"
        />
      </span>
      <span className="hidden sm:inline-flex items-center gap-2">
        <img
          src={darkMode ? '/images/Dark.webp' : '/images/Light.webp'}
          alt={darkMode ? 'Dark mode' : 'Light mode'}
          className="w-6 h-6 object-contain"
        />
        {darkMode ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}

export default DarkModeToggle;
