import React, { useEffect } from 'react';
import { Play, Sparkles } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  restaurantName: string;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame, restaurantName }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-between p-6 sm:p-12 pointer-events-none select-none bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>ROBLOX SAHİL RESTORANI TYCOON 3D</span>
        </div>
      </div>

      {/* Center Bespoke SVG Title Lockup & Play CTA */}
      <div className="self-center flex flex-col items-center text-center max-w-xl">
        {/* Bespoke inline SVG Logo Lockup */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 mb-4 filter drop-shadow-[0_8px_20px_rgba(245,158,11,0.5)]">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#f59e0b" strokeWidth="4" />
            <path d="M22 68C32 58 42 62 50 68C58 62 68 58 78 68" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" />
            <path d="M26 76C34 68 44 72 50 76C56 72 66 68 74 76" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" />
            {/* Chef Hat + Palm Crown */}
            <path d="M35 52C32 44 38 34 50 34C62 34 68 44 65 52H35Z" fill="#f8fafc" stroke="#1e293b" strokeWidth="2" />
            <circle cx="42" cy="36" r="8" fill="#f8fafc" />
            <circle cx="58" cy="36" r="8" fill="#f8fafc" />
            <circle cx="50" cy="30" r="9" fill="#f8fafc" />
            <rect x="35" y="48" width="30" height="6" rx="2" fill="#ef4444" />
            {/* Star badge */}
            <polygon points="50,14 53,23 62,23 55,28 58,37 50,32 42,37 45,28 38,23 47,23" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          SAHİL RESTORANI
        </h1>
        <p className="text-lg sm:text-xl font-extrabold text-amber-300 tracking-wide mt-1 drop-shadow">
          Tycoon 3D • Şehir & Deniz Kıyısı
        </p>
        <p className="text-xs sm:text-sm text-slate-200 mt-2 max-w-md drop-shadow">
          Aşçılarını ve garsonlarını yönet, 2. kat terasını inşa et, menülerini özelleştir ve kuryelerle şehre sipariş dağıt!
        </p>

        {/* Start Game CTA */}
        <button
          onClick={onStartGame}
          data-start="true"
          className="mt-6 pointer-events-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl shadow-[0_8px_25px_rgba(245,158,11,0.6)] flex items-center gap-3 transition-transform active:scale-95 animate-pulse"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>OYUNA BAŞLA</span>
        </button>
      </div>

      {/* Bottom Flat Control Hint Line */}
      <div className="self-center text-center text-xs text-slate-300 font-bold bg-slate-900/60 backdrop-blur-none px-4 py-1.5 rounded-full border border-slate-700/60 drop-shadow">
        Sol Tık / Sürükle: Döndür · Sağ Tık: Kaydır · Scroll: Yakınlaştır · Enter / Space: Başla
      </div>
    </div>
  );
};
