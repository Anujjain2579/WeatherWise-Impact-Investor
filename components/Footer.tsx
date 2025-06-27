
import React from 'react';
import { APP_NAME } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/80 text-center py-6 text-sm text-slate-400 border-t border-slate-700">
      <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      <p className="mt-1">Weather data is simulated. Investment insights are AI-generated and for informational purposes only.</p>
    </footer>
  );
};
