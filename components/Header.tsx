
import React from 'react';

interface HeaderProps {
  appName: string;
}

export const Header: React.FC<HeaderProps> = ({ appName }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-md shadow-lg p-4 sticky top-0 z-50">
      <div className="container mx-auto flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mr-3 text-sky-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-5.056-1.921A4.5 4.5 0 0 0 2.25 15Z" />
        </svg>
        <h1 className="text-2xl font-bold text-sky-100">{appName}</h1>
      </div>
    </header>
  );
};
