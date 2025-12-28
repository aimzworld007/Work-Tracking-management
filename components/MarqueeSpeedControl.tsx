
import React from 'react';

export const marqueeSpeeds = {
  Slow: 240,
  Normal: 160,
  Fast: 80,
};

export type MarqueeSpeed = keyof typeof marqueeSpeeds;

interface MarqueeSpeedControlProps {
  currentSpeed: MarqueeSpeed;
  onSpeedChange: (speed: MarqueeSpeed) => void;
}

const MarqueeSpeedControl: React.FC<MarqueeSpeedControlProps> = ({ currentSpeed, onSpeedChange }) => {
  const buttonClass = "flex-1 px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:z-10";
  const activeClass = "bg-indigo-600 text-white";
  const inactiveClass = "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700";

  return (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Marquee Speed</label>
        <div className="relative flex rounded-md shadow-sm">
        {(Object.keys(marqueeSpeeds) as MarqueeSpeed[]).map((speed, index, arr) => (
            <button
                key={speed}
                type="button"
                onClick={() => onSpeedChange(speed)}
                className={`${buttonClass} ${currentSpeed === speed ? activeClass : inactiveClass} ${index === 0 ? 'rounded-l-md' : ''} ${index === arr.length - 1 ? 'rounded-r-md' : ''} ${index > 0 ? '-ml-px' : ''}`}
            >
            {speed}
            </button>
        ))}
        </div>
    </div>
  );
};

export default MarqueeSpeedControl;
