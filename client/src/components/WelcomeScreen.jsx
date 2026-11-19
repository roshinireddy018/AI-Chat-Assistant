import React from 'react';

export const WelcomeScreen = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
      <h1 className="font-serif text-3xl sm:text-4xl text-[var(--text)] tracking-tight font-normal">
        How can I help you today?
      </h1>
    </div>
  );
};

export default WelcomeScreen;
