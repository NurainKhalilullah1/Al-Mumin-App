import React from 'react';
import { Moon, BookOpen, MapPin } from 'lucide-react';

const IslamicWidget = () => {
  const hijriDate = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(Date.now());

  return (
    <div className="bg-schoolGreen text-white p-4 md:p-6 shadow-xl border-t-4 border-schoolGold relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        
        {/* Date & Location */}
        <div className="flex items-center space-x-4">
          <div className="bg-white/10 p-3 rounded-full">
            <Moon className="w-6 h-6 text-schoolGold" />
          </div>
          <div>
            <p className="text-sm text-green-200 uppercase tracking-widest font-bold">Today's Date</p>
            <p className="text-xl font-serif font-bold">{hijriDate}</p>
          </div>
        </div>

        {/* Prayer Times (Lagos Specific) */}
        <div className="flex-1 border-t md:border-t-0 md:border-l border-green-700 pt-4 md:pt-0 md:pl-8">
           <div className="flex items-center justify-center md:justify-start mb-2">
             <MapPin className="w-4 h-4 text-schoolGold mr-2" />
             <span className="text-xs font-bold text-green-200">LAGOS PRAYER TIMES</span>
           </div>
           <div className="grid grid-cols-5 gap-2 text-center">
             <TimeBox name="Fajr" time="05:45" />
             <TimeBox name="Dhuhr" time="13:10" />
             <TimeBox name="Asr" time="16:20" />
             <TimeBox name="Maghrib" time="19:00" />
             <TimeBox name="Isha" time="20:15" />
           </div>
        </div>

      </div>
    </div>
  );
};

const TimeBox = ({ name, time }) => (
  <div className="bg-green-800/50 rounded p-1">
    <span className="block text-[10px] text-gray-300 uppercase">{name}</span>
    <span className="block font-bold text-sm text-white">{time}</span>
  </div>
);

export default IslamicWidget;