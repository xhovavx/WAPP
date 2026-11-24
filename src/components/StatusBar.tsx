import React, { useState, useEffect } from 'react';

export const StatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState('8:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      // Format as 12-hour or 24-hour style
      const formatted = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
      setTimeStr(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full pt-2 pb-1 px-7 flex items-center justify-between text-black select-none z-30">
      {/* Time */}
      <span className="font-semibold text-[15px] tracking-tight">{timeStr}</span>

      {/* Dynamic Island Pill */}
      <div className="w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5 mx-auto -mt-0.5 shadow-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#111122]/80 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#001f3f]" />
        </div>
      </div>

      {/* Status Icons: Cellular, Wifi, Battery */}
      <div className="flex items-center space-x-1.5 text-black">
        {/* Cellular Signal (4 bars) */}
        <div className="flex items-end space-x-[2px] h-3">
          <span className="w-[3px] h-[3px] bg-black rounded-full" />
          <span className="w-[3px] h-[5px] bg-black rounded-full" />
          <span className="w-[3px] h-[8px] bg-black rounded-full" />
          <span className="w-[3px] h-[11px] bg-black rounded-full" />
        </div>

        {/* Wi-Fi Icon */}
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.5c3.67 0 7.02 1.34 9.61 3.56L12 19.33 2.39 11.06C4.98 8.84 8.33 7.5 12 7.5z" />
        </svg>

        {/* Battery with 100% or percentage */}
        <div className="flex items-center space-x-0.5">
          <div className="w-6 h-3 rounded-[4px] border border-black/80 p-[1px] flex items-center">
            <div className="h-full w-full bg-black rounded-[2px]" />
          </div>
          <div className="w-[1.5px] h-1.5 bg-black/80 rounded-r-sm" />
        </div>
      </div>
    </div>
  );
};
