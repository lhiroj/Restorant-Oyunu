import React, { useState } from 'react';
import { 
  DollarSign, 
  Sparkles, 
  Star, 
  Users, 
  Volume2, 
  VolumeX, 
  Hammer, 
  ChefHat, 
  BookOpen, 
  Bike, 
  Trophy, 
  Layers, 
  Flame, 
  ChevronDown, 
  ChevronUp,
  Camera,
  RotateCw,
  X,
  Check
} from 'lucide-react';
import { GameState } from '../types/game';
import { sound } from '../audio/soundEffects';

interface GameHUDProps {
  state: GameState;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenBuildMode: () => void;
  onOpenStaffModal: () => void;
  onOpenMenuModal: () => void;
  onOpenDeliveryModal: () => void;
  onOpenFriendsModal: () => void;
  onUnlockSecondFloor: () => void;
  onTriggerRushHour: () => void;
  onCameraPreset: (preset: 'overview' | 'floor1' | 'floor2' | 'patio' | 'kitchen') => void;
  isBuildModeActive: boolean;
  onConfirmPlacement: () => void;
  onCancelPlacement: () => void;
  onRotatePlacement: () => void;
  selectedBuildItemName?: string;
  floorView: 1 | 2;
  onToggleFloorView: (floor: 1 | 2) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  state,
  isMuted,
  onToggleMute,
  onOpenBuildMode,
  onOpenStaffModal,
  onOpenMenuModal,
  onOpenDeliveryModal,
  onOpenFriendsModal,
  onUnlockSecondFloor,
  onTriggerRushHour,
  onCameraPreset,
  isBuildModeActive,
  onConfirmPlacement,
  onCancelPlacement,
  onRotatePlacement,
  selectedBuildItemName,
  floorView,
  onToggleFloorView,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [cameraMenuOpen, setCameraMenuOpen] = useState(false);

  const xpPercent = Math.min(100, Math.round((state.xp / (state.level * 100)) * 100));

  return (
    <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-10 flex flex-col justify-between p-3 sm:p-5">
      {/* --- TOP STATUS BAR CLUSTER --- */}
      <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Restaurant Info & Currencies */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-slate-900/90 text-white p-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl border border-slate-700/80">
          {/* Logo & Name */}
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🌴</span>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-amber-300 drop-shadow">
                {state.restaurantName}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                  Lv. {state.level}
                </span>
                <div className="w-16 sm:w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Cash */}
          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-600/70 px-2.5 py-1 rounded-xl text-emerald-300 font-extrabold text-sm sm:text-base tabular-nums">
            <DollarSign className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>{state.cash.toLocaleString()}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 bg-purple-950/80 border border-purple-600/70 px-2.5 py-1 rounded-xl text-purple-300 font-extrabold text-sm sm:text-base tabular-nums">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{state.gems}</span>
          </div>

          {/* Live Star Rating */}
          <div className="flex items-center gap-1 bg-amber-950/80 border border-amber-600/70 px-2.5 py-1 rounded-xl text-amber-300 font-extrabold text-sm sm:text-base tabular-nums">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{state.billboard.stars.toFixed(1)}</span>
            <span className="text-xs text-amber-400/80 font-normal hidden md:inline">({state.billboard.decorScore} Dekor)</span>
          </div>

          {/* Pending Delivery Badge */}
          {state.courierMissions.some(m => m.status === 'pending') && (
            <button
              onClick={onOpenDeliveryModal}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95 animate-bounce"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Sipariş Geldi!</span>
            </button>
          )}
        </div>

        {/* Right: Camera & Quick Utilities */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Floor 1 / Floor 2 Switcher (If 2nd floor is unlocked) */}
          {state.hasSecondFloor && (
            <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700 shadow-lg text-xs font-bold text-white">
              <button
                onClick={() => onToggleFloorView(1)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  floorView === 1 ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                1. Kat
              </button>
              <button
                onClick={() => onToggleFloorView(2)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  floorView === 2 ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                2. Kat Teras
              </button>
            </div>
          )}

          {/* Camera Presets Menu */}
          <div className="relative">
            <button
              onClick={() => setCameraMenuOpen(!cameraMenuOpen)}
              className="bg-slate-900/90 hover:bg-slate-800 text-white p-2 rounded-xl border border-slate-700 shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              title="Kamera Açıları"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Kamera</span>
            </button>

            {cameraMenuOpen && (
              <div className="absolute right-0 top-12 bg-slate-900/95 border border-slate-700 p-2 rounded-xl shadow-2xl flex flex-col gap-1 w-36 text-xs text-white z-50">
                <button
                  onClick={() => { onCameraPreset('overview'); setCameraMenuOpen(false); }}
                  className="p-1.5 text-left hover:bg-slate-800 rounded-lg"
                >
                  🌐 Genel Bakış
                </button>
                <button
                  onClick={() => { onCameraPreset('floor1'); setCameraMenuOpen(false); }}
                  className="p-1.5 text-left hover:bg-slate-800 rounded-lg"
                >
                  🍽️ 1. Kat İç Mekan
                </button>
                <button
                  onClick={() => { onCameraPreset('floor2'); setCameraMenuOpen(false); }}
                  className="p-1.5 text-left hover:bg-slate-800 rounded-lg"
                >
                  🌅 2. Kat Teras
                </button>
                <button
                  onClick={() => { onCameraPreset('patio'); setCameraMenuOpen(false); }}
                  className="p-1.5 text-left hover:bg-slate-800 rounded-lg"
                >
                  🌴 Sahil Bahçe
                </button>
                <button
                  onClick={() => { onCameraPreset('kitchen'); setCameraMenuOpen(false); }}
                  className="p-1.5 text-left hover:bg-slate-800 rounded-lg"
                >
                  🍳 Mutfak
                </button>
              </div>
            )}
          </div>

          {/* Sound Mute */}
          <button
            onClick={onToggleMute}
            className="bg-slate-900/90 hover:bg-slate-800 text-white p-2 rounded-xl border border-slate-700 shadow-lg transition-transform active:scale-95"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* --- BUILD MODE ACTIVE PLACEMENT BAR (When in placement) --- */}
      {isBuildModeActive && selectedBuildItemName && (
        <div className="self-center pointer-events-auto bg-slate-900/95 border-2 border-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex flex-col">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Yerleştiriliyor</span>
            <span className="font-extrabold text-sm sm:text-base text-white">{selectedBuildItemName}</span>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          {/* Rotate Button */}
          <button
            onClick={onRotatePlacement}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-2 rounded-xl text-xs font-bold border border-slate-600 transition-all active:scale-95"
          >
            <RotateCw className="w-4 h-4" />
            <span>Döndür (R)</span>
          </button>

          {/* Confirm Button */}
          <button
            onClick={onConfirmPlacement}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Koy</span>
          </button>

          {/* Cancel Button */}
          <button
            onClick={onCancelPlacement}
            className="p-2 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl transition-all active:scale-95"
            title="İptal Et"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- UNIFIED BOTTOM CONTROL DOCK (Collapsible & Zero-Occlusion) --- */}
      <div className="self-center pointer-events-auto max-w-4xl w-full flex flex-col items-center">
        {/* Collapse / Expand Tab */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-t-xl border-t border-x border-slate-700 shadow-md flex items-center gap-1 transition-transform"
        >
          {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isDockCollapsed ? 'Menüyü Göster' : 'Menüyü Gizle'}</span>
        </button>

        {/* Main Buttons Bar */}
        {!isDockCollapsed && (
          <div className="w-full bg-slate-900/95 border border-slate-700/80 p-2 sm:p-2.5 rounded-2xl shadow-2xl flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* 1. İnşa Modu & Market */}
            <button
              onClick={onOpenBuildMode}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all active:scale-95 shadow-lg ${
                isBuildModeActive
                  ? 'bg-amber-500 text-slate-950 border-2 border-amber-300'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:brightness-110'
              }`}
            >
              <Hammer className="w-4 h-4" />
              <span>İnşa Modu & Market</span>
            </button>

            {/* 2. Personel Yönetimi */}
            <button
              onClick={onOpenStaffModal}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-95"
            >
              <ChefHat className="w-4 h-4" />
              <span>Personel ({state.staff.length})</span>
            </button>

            {/* 3. Menü Özelleştirme */}
            <button
              onClick={onOpenMenuModal}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-95"
            >
              <BookOpen className="w-4 h-4" />
              <span>Menü & Tarifler</span>
            </button>

            {/* 4. Kurye & Ev Siparişi */}
            <button
              onClick={onOpenDeliveryModal}
              className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-110 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-95"
            >
              <Bike className="w-4 h-4" />
              <span>Kurye & Paket</span>
            </button>

            {/* 5. 2. Kat Çık (Upgrade button) */}
            {!state.hasSecondFloor && (
              <button
                onClick={onUnlockSecondFloor}
                className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-violet-600 hover:brightness-110 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-95"
                title="2. Kat Teras Genişletmesi"
              >
                <Layers className="w-4 h-4 text-amber-300" />
                <span>2. Kat Çık ($1,000)</span>
              </button>
            )}

            {/* 6. Liderlik & Sosyal / Bulut */}
            <button
              onClick={onOpenFriendsModal}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:brightness-110 text-slate-950 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition-all active:scale-95"
            >
              <Trophy className="w-4 h-4" />
              <span>Liderlik & Arkadaşlar</span>
            </button>

            {/* 7. Rush Hour Hızlandırma */}
            <button
              onClick={onTriggerRushHour}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-2 sm:py-2.5 rounded-xl text-xs font-bold border border-amber-500/40 transition-all active:scale-95"
              title="Sahil Müşteri Akını Başlat"
            >
              <Flame className="w-4 h-4" />
              <span>Rush Hour</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
