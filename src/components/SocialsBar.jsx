import React from 'react';
import socialsData from '../data/socials.js';

function SocialsBar() {
  return (
    <div className="fixed bottom-0 left-0 w-full h-[4.5rem] bg-lightBG dark:bg-midnight border-t border-pink z-50 transition-colors duration-500">
      <div className="bg-pattern flex justify-evenly h-[5rem] items-start py-4">
        {socialsData.map((social) => (
          <div
            key={social.id}
            className="cursor-pointer group relative w-10 h-10 hover:scale-110 transition-transform duration-300"
            onClick={() => window.open(social.URL, '_blank')}
          >
            <img
              src={social.imageURL}
              alt={social.title}
              className="absolute inset-0 w-10 h-10 object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-300"
            />
            <img
              src={social.imageURL.replace('IconB.', 'IconP.')}
              alt={social.title}
              className="absolute inset-0 w-10 h-10 object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialsBar;
