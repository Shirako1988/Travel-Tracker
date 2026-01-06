import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="w-full relative pt-6 pb-2">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-bold text-parchment-800 font-serif">Start</span>
        <span className="text-sm font-bold text-parchment-800 font-serif">Destination</span>
      </div>
      
      {/* Track Background */}
      <div className="h-6 bg-parchment-300 rounded-full border-2 border-parchment-800 relative shadow-inner overflow-hidden">
        
        {/* Fill */}
        <div 
          className="h-full bg-dragon-red transition-all duration-500 ease-out flex items-center justify-end pr-2"
          style={{ width: `${percentage}%` }}
        >
           {percentage > 5 && <span className="text-xs text-white font-bold opacity-80">{Math.round(percentage)}%</span>}
        </div>
        
        {/* Markers for 25%, 50%, 75% */}
        <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-parchment-800 opacity-20"></div>
        <div className="absolute top-0 bottom-0 left-2/4 w-0.5 bg-parchment-800 opacity-20"></div>
        <div className="absolute top-0 bottom-0 left-3/4 w-0.5 bg-parchment-800 opacity-20"></div>
      </div>

      {/* Avatar / Marker */}
      <div 
        className="absolute top-4 w-10 h-10 -ml-5 transition-all duration-500 ease-out flex items-center justify-center"
        style={{ left: `${percentage}%` }}
      >
        <div className="bg-parchment-100 border-2 border-dragon-gold rounded-full p-1 shadow-lg text-xl">
          ♟️
        </div>
      </div>
      
      <div className="text-center mt-2 font-serif text-lg text-parchment-900">
        <span className="font-bold">{current.toFixed(1)}</span> / <span className="text-parchment-800">{total}</span> miles
      </div>
    </div>
  );
};