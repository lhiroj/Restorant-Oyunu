import React, { useState } from 'react';
import { 
  X, 
  UtensilsCrossed, 
  ChefHat, 
  Tv, 
  Sparkles, 
  Palmtree, 
  Layers, 
  Palette, 
  Star,
  DollarSign
} from 'lucide-react';
import { FurnitureCatalogItem, ItemCategory, ThemeConfig } from '../types/game';
import { FURNITURE_CATALOG, THEME_PRESETS } from '../game/constants';
import { sound } from '../audio/soundEffects';

interface BuildModeDrawerProps {
  cash: number;
  level: number;
  hasSecondFloor: boolean;
  currentFloorView: 1 | 2;
  onSelectItemToPlace: (item: FurnitureCatalogItem) => void;
  onClose: () => void;
  currentTheme: string;
  onSelectTheme: (themeId: string) => void;
}

export const BuildModeDrawer: React.FC<BuildModeDrawerProps> = ({
  cash,
  level,
  hasSecondFloor,
  currentFloorView,
  onSelectItemToPlace,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  const [activeCategory, setActiveCategory] = useState<ItemCategory | 'themes'>('tables');

  const categories: { key: ItemCategory | 'themes'; label: string; icon: React.ReactNode }[] = [
    { key: 'tables', label: 'Masalar', icon: <UtensilsCrossed className="w-4 h-4" /> },
    { key: 'kitchen', label: 'Mutfak', icon: <ChefHat className="w-4 h-4" /> },
    { key: 'tech', label: 'Teknoloji', icon: <Tv className="w-4 h-4" /> },
    { key: 'decor', label: 'Dekor', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'garden', label: 'Sahil & Bahçe', icon: <Palmtree className="w-4 h-4" /> },
    { key: 'floor2', label: '2. Kat Özel', icon: <Layers className="w-4 h-4" /> },
    { key: 'themes', label: 'Temalar', icon: <Palette className="w-4 h-4" /> },
  ];

  const filteredItems = FURNITURE_CATALOG.filter((item) => {
    if (activeCategory === 'themes') return false;
    return item.category === activeCategory;
  });

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-slate-900/95 border-t-2 border-amber-500 shadow-2xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
      <div className="max-w-6xl mx-auto flex flex-col gap-4">
        {/* Header with Title & Close */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔨</span>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">İnşa Modu & Restoran Marketi</h2>
              <p className="text-xs text-slate-400">
                Eşyalar satın alıp dilediğin gibi yerleştir. Teknoloji ve dekor eşyaları restoran puanını artırır!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Kapat"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === cat.key
                  ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Content Section: Themes vs Furniture */}
        {activeCategory === 'themes' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {THEME_PRESETS.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <div
                  key={theme.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/30 shadow-xl'
                      : 'border-slate-700 bg-slate-800/80 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-white">{theme.name}</span>
                    {isSelected && (
                      <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full">
                        AKTİF
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 my-2">
                    <div className="w-6 h-6 rounded-full border border-white/20 shadow" style={{ backgroundColor: theme.wallColor }} title="Duvar Rengi" />
                    <div className="w-6 h-6 rounded-full border border-white/20 shadow" style={{ backgroundColor: theme.floorColor }} title="Zemin Rengi" />
                    <div className="w-6 h-6 rounded-full border border-white/20 shadow" style={{ backgroundColor: theme.roofColor }} title="Çatı Rengi" />
                    <div className="w-6 h-6 rounded-full border border-white/20 shadow" style={{ backgroundColor: theme.accentColor }} title="Aksan Rengi" />
                  </div>

                  <button
                    onClick={() => {
                      onSelectTheme(theme.id);
                      sound.playPlace();
                    }}
                    disabled={isSelected}
                    className={`mt-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
                    }`}
                  >
                    {isSelected ? 'Uygulandı' : 'Bu Temayı Seç'}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const isLocked = level < item.unlockedAtLevel;
              const canAfford = cash >= item.cost;
              const floorMismatch = item.floorLevel !== 'any' && item.floorLevel !== currentFloorView;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${
                    isLocked
                      ? 'bg-slate-800/40 border-slate-700/40 opacity-60'
                      : 'bg-slate-800/90 border-slate-700 hover:border-amber-500/80 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div>
                    {/* Item Name & Cost */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-white">{item.name}</h3>
                      <div className="flex items-center text-emerald-400 font-extrabold text-xs sm:text-sm tabular-nums">
                        <DollarSign className="w-3.5 h-3.5 stroke-[3]" />
                        <span>{item.cost}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">{item.description}</p>
                  </div>

                  {/* Badges / Stats */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                    <span className="bg-amber-950/80 border border-amber-600/60 text-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      +{item.decorRating} Puan
                    </span>

                    {item.capacityBonus && (
                      <span className="bg-blue-950/80 border border-blue-600/60 text-blue-300 px-2 py-0.5 rounded-lg">
                        +{item.capacityBonus} Kapasite
                      </span>
                    )}

                    {item.speedBonus && (
                      <span className="bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 px-2 py-0.5 rounded-lg">
                        +{item.speedBonus}% Hız
                      </span>
                    )}
                  </div>

                  {/* Action / Buy Button */}
                  {isLocked ? (
                    <div className="py-2 px-3 bg-slate-700/60 text-slate-400 text-center rounded-xl text-xs font-bold">
                      🔒 Lv. {item.unlockedAtLevel}'de Açılır
                    </div>
                  ) : floorMismatch ? (
                    <div className="py-2 px-3 bg-amber-950/50 text-amber-400 border border-amber-600/40 text-center rounded-xl text-xs font-bold">
                      {item.floorLevel}. Kat İçin Özeldir
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (canAfford) {
                          onSelectItemToPlace(item);
                          onClose();
                          sound.playPlace();
                        }
                      }}
                      disabled={!canAfford}
                      className={`py-2 px-4 rounded-xl text-xs font-extrabold transition-all shadow-md active:scale-95 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Satın Al & Yerleştir' : 'Yetersiz Para'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
