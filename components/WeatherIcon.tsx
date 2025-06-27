
import React from 'react';

interface WeatherIconProps {
  condition: string; // e.g., "Flood Watch", "Severe Thunderstorm Warning", "High Wind Advisory"
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = "w-16 h-16 text-sky-300" }) => {
  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes("flood") || lowerCondition.includes("coastal flood")) {
    return ( // Water/Flood Icon
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-blue-400`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.25 4.5h13.5c.75 0 1.375.405 1.625.998L21 9.75H3L3.625 5.498A1.875 1.875 0 0 1 5.25 4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 9.75v7.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-7.5" />
      </svg>
    );
  }
  if (lowerCondition.includes("fire") || lowerCondition.includes("red flag")) {
    return ( // Fire Icon
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-orange-500`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.286 8.286 0 0 0 3-7.387Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75A2.25 2.25 0 0 1 14.25 12v.001A2.25 2.25 0 0 1 12 14.25h-.001A2.25 2.25 0 0 1 9.75 12v-.001A2.25 2.25 0 0 1 12 9.75Z" />
      </svg>
    );
  }
  if (lowerCondition.includes("wind") || lowerCondition.includes("gale")) {
    return ( // Wind Icon
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-teal-400`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
      </svg>
    );
  }
  if (lowerCondition.includes("thunder") || lowerCondition.includes("storm") || lowerCondition.includes("severe") && lowerCondition.includes("warning")) {
    return ( // Severe Alert / Thunderstorm Icon
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-purple-400`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-5.056-1.921A4.5 4.5 0 0 0 2.25 15Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 1.5-3.75-1.5-3.75M9 15l1.5-3.75L9 7.5M16.5 15l1.5-3.75-1.5-3.75" />
      </svg>
    );
  }
  if (lowerCondition.includes("snow") || lowerCondition.includes("blizzard") || lowerCondition.includes("sleet") || lowerCondition.includes("winter storm")) {
     return ( // Snow/Winter Icon
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-sky-200`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L12 6l-1.5-1.5m1.5 0V1.5M12 6v2.25m-6.364-.386L4.045 6.045M3 12h2.25m-.386 6.364l1.591-1.591M12 18.75V21m6.364-.386l-1.591-1.591M21 12h-2.25m.386-6.364l-1.591 1.591M12 9.75a3 3 0 0 1 3 3V15a3 3 0 1 1-6 0v-2.25a3 3 0 0 1 3-3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 13.5 1.5 1.5m12-1.5-1.5 1.5m-10.5-3 1.5 1.5m7.5-1.5-1.5 1.5M9 19.5l1.5-1.5m3 1.5-1.5-1.5" />
        </svg>
     );
  }
  if (lowerCondition.includes("warning") || lowerCondition.includes("advisory") || lowerCondition.includes("watch") || lowerCondition.includes("alert")) {
    return ( // Generic Alert Icon (Exclamation)
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-yellow-400`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
      </svg>
    );
  }
   if (lowerCondition.includes("sun") || lowerCondition.includes("clear")) { // Less likely for alerts, but keep for fallback
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-yellow-400`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591" />
      </svg>
    );
  }
  if (lowerCondition.includes("cloud")) { // Less likely for alerts, but keep for fallback
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-slate-400`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-5.056-1.921A4.5 4.5 0 0 0 2.25 15Z" />
      </svg>
    );
  }


  // Default icon (general info/alert symbol)
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-red-300`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.25 .25m0 0l-1.5 1.5m1.5-1.5l1.5 1.5m-1.5-1.5l1.5-1.5M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
};
