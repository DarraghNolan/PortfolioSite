import React from 'react';
import { useNavigate } from 'react-router-dom';
import DarkModeToggle from './DarkModeToggle';

function Navbar({ showBack = false, onClose = null }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 w-full z-[9999] flex justify-between items-center px-6 py-3 transition-colors duration-500 pointer-events-none">
      <div className="pointer-events-auto">
        {showBack && (
          <button
            className="w-[10rem] h-[2.75rem] border-[1px] text-blueLIGHT border-solid border-pink bg-lightBG dark:bg-midnight rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-pink hover:border-[3px] hover:italic"
            onClick={() => navigate('/')}
          >
            Back To Home
          </button>
        )}
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        {onClose && (
          <button
            className="w-[6rem] h-[2.75rem] border-[1px] text-blueLIGHT border-solid border-pink bg-lightBG dark:bg-midnight rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-pink hover:border-[3px] hover:italic"
            onClick={onClose}
          >
            Close
          </button>
        )}
        <DarkModeToggle />
      </div>
    </nav>
  );
}

export default Navbar;
