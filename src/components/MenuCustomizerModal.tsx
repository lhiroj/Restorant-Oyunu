import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  FlaskConical, 
  PlusCircle, 
  BarChart3, 
  Star, 
  Clock, 
  Lock, 
  Check, 
  CheckCircle2, 
  DollarSign, 
  Flame, 
  Layers, 
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Recipe } from '../types/game';
import { 
  DISH_BASES, 
  DISCOVERY_INGREDIENTS, 
  DishBaseOption, 
  IngredientOption 
} from '../game/constants';
import { createCustomDish } from '../game/logic';
import { sound } from '../audio/soundEffects';

interface MenuCustomizerModalProps {
  recipes: Recipe[];
  level: number;
  cash: number;
  gems: number;
  onUpdatePrice: (recipeId: string, newPrice: number) => void;
  onUnlockRecipe: (recipeId: string) => void;
  onToggleActiveMenu: (recipeId: string) => void;
  onAddNewCustomRecipe: (newRecipe: Recipe, cost: number) => void;
  onClose: () => void;
}

export const MenuCustomizerModal: React.FC<MenuCustomizerModalProps> = ({
  recipes,
  level,
  cash,
  gems,
  onUpdatePrice,
  onUnlockRecipe,
  onToggleActiveMenu,
  onAddNewCustomRecipe,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'lab' | 'creator' | 'analytics'>('menu');

  // Custom Dish Creator State
  const [selectedBase, setSelectedBase] = useState<DishBaseOption>(DISH_BASES[0]);
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientOption[]>([]);
  const [customDishName, setCustomDishName] = useState('');
  const [customPriceInput, setCustomPriceInput] = useState<number>(55);
  const [customEmoji, setCustomEmoji] = useState('🍔');

  // Discover Lab State
  const lockedRecipes = recipes.filter(r => !r.unlocked);
  const unlockedRecipes = recipes.filter(r => r.unlocked);
  const activeMenuRecipes = recipes.filter(r => r.unlocked && (r.isActiveOnMenu !== false));

  // Toggle ingredient selection (max 3)
  const toggleIngredient = (ing: IngredientOption) => {
    if (selectedIngredients.some(i => i.id === ing.id)) {
      setSelectedIngredients(selectedIngredients.filter(i => i.id !== ing.id));
    } else {
      if (selectedIngredients.length >= 3) {
        alert('En fazla 3 özel malzeme seçebilirsin!');
        return;
      }
      setSelectedIngredients([...selectedIngredients, ing]);
    }
  };

  // Calculate live preview stats for creator
  const totalIngredientsCost = selectedIngredients.reduce((sum, i) => sum + i.cost, 0);
  const estimatedBasePrice = selectedBase.basePrice + Math.round(totalIngredientsCost * 0.7);
  const totalStarBoost = selectedIngredients.reduce((sum, i) => sum + i.starBoost, 0);
  const estimatedStars = Math.min(5, Math.max(3, Math.round(3 + totalStarBoost)));
  const creationFee = 150 + totalIngredientsCost;
  const canAffordCreation = cash >= creationFee;

  const handleCreateDish = () => {
    if (!canAffordCreation) {
      alert('Yetersiz para!');
      return;
    }

    const dish = createCustomDish(
      customDishName.trim() || `Şefin Özel ${selectedBase.name}`,
      selectedBase,
      selectedIngredients,
      Math.max(estimatedBasePrice, customPriceInput),
      customEmoji || selectedBase.icon
    );

    onAddNewCustomRecipe(dish, creationFee);
    sound.playLevelUp();
    setCustomDishName('');
    setSelectedIngredients([]);
    setActiveTab('menu');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-5 sm:p-7 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col gap-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600/30 border border-emerald-500 rounded-2xl text-2xl">
              🍳
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Tarif & Menü Yönetim Sistemi</h2>
              <p className="text-xs text-slate-400">
                Tarifler keşfet, menü fiyatlarını optimize et ve mutfakta kendi özel spesiyallerini yarat!
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

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'menu'
                ? 'bg-emerald-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Aktif Menü ({activeMenuRecipes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'lab'
                ? 'bg-emerald-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Tarif Keşif Laboratuvarı ({lockedRecipes.length} Kilitli)</span>
          </button>

          <button
            onClick={() => setActiveTab('creator')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'creator'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>✨ Özel Yemek Yarat</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'analytics'
                ? 'bg-emerald-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Menü Analitiği</span>
          </button>
        </div>

        {/* --- TAB 1: AKTİF MENÜ & FİYATLANDIRMA --- */}
        {activeTab === 'menu' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-300">
                💡 <strong>İpucu:</strong> Aktif menüdeki yemekler restorandaki müşteriler tarafından sipariş edilir. Menüde istemediğin yemekleri gizleyebilirsin.
              </span>
              <span className="bg-emerald-950 text-emerald-400 font-extrabold px-2.5 py-1 rounded-lg border border-emerald-700">
                {activeMenuRecipes.length} / {unlockedRecipes.length} Yemek Serviste
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedRecipes.map((recipe) => {
                const isActive = recipe.isActiveOnMenu !== false;

                return (
                  <div
                    key={recipe.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 shadow-md ${
                      isActive
                        ? 'bg-slate-800/90 border-slate-700'
                        : 'bg-slate-900/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
                            {recipe.icon}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm sm:text-base text-white">{recipe.name}</h4>
                              {recipe.isCustom && (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-black px-1.5 py-0.5 rounded">
                                  ÖZEL
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {Array.from({ length: recipe.stars }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                              <span className="text-xs text-slate-400 ml-1.5 font-bold">
                                {recipe.cookTimeSec}s Pişirme
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Toggle Active Button */}
                        <button
                          onClick={() => onToggleActiveMenu(recipe.id)}
                          className={`p-2 rounded-xl transition-all ${
                            isActive
                              ? 'bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50'
                              : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                          }`}
                          title={isActive ? 'Menüden Çıkar' : 'Menüye Ekle'}
                        >
                          {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>

                      {recipe.description && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{recipe.description}</p>
                      )}

                      {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {recipe.ingredients.map((ing, idx) => (
                            <span key={idx} className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price Slider */}
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5 mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-bold">Özel Satış Fiyatı:</span>
                        <span className="text-emerald-400 font-black text-sm">${recipe.customPrice}</span>
                      </div>

                      <input
                        type="range"
                        min={recipe.basePrice}
                        max={Math.round(recipe.basePrice * 2.5)}
                        value={recipe.customPrice}
                        onChange={(e) => onUpdatePrice(recipe.id, Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                      />

                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>Taban: ${recipe.basePrice}</span>
                        <span>Maksimum: ${Math.round(recipe.basePrice * 2.5)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 2: TARİF KEŞİF LABORATUVARI --- */}
        {activeTab === 'lab' && (
          <div className="flex flex-col gap-4">
            <div className="bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 p-4 rounded-2xl border border-emerald-600/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-white flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-emerald-400" />
                  Şefin Sahil Ar-Ge Laboratuvarı
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Restoran seviyeni yükselterek veya mutfak deneyleriyle gizli gurme lezzetlerin kilidini aç!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-300 font-black bg-slate-900 px-3 py-1.5 rounded-xl border border-amber-600/50">
                  Mevcut Restoran Seviyesi: Lv. {level}
                </span>
              </div>
            </div>

            {lockedRecipes.length === 0 ? (
              <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
                <Sparkles className="w-10 h-10 text-amber-400" />
                <h4 className="font-extrabold text-base text-white">Tüm Standart Tarifler Keşfedildi!</h4>
                <p className="text-xs text-slate-400">
                  "Özel Yemek Yarat" sekmesine geçerek kendi imza spesiyallerini oluşturabilirsin!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedRecipes.map((recipe) => {
                  const canUnlock = level >= recipe.requiredLevel;

                  return (
                    <div
                      key={recipe.id}
                      className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-2.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
                            {recipe.icon}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-sm sm:text-base text-white">{recipe.name}</h4>
                            <div className="flex items-center gap-1 mt-0.5">
                              {Array.from({ length: recipe.stars }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-600/50 px-2.5 py-1 rounded-lg">
                          Lv. {recipe.requiredLevel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400">{recipe.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60">
                        <span className="text-xs text-emerald-400 font-extrabold">
                          Tahmini Kazanç: ${recipe.basePrice} - ${Math.round(recipe.basePrice * 1.5)}
                        </span>

                        <button
                          onClick={() => {
                            if (canUnlock) {
                              onUnlockRecipe(recipe.id);
                              sound.playLevelUp();
                            }
                          }}
                          disabled={!canUnlock}
                          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                            canUnlock
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950'
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{canUnlock ? 'Tarifi Keşfet & Menüye Al' : 'Seviye Yetersiz'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: ÖZEL YEMEK YARAT (KENDİ TARİFİNİ YAP) --- */}
        {activeTab === 'creator' && (
          <div className="flex flex-col gap-5">
            {/* Step 1: Taban Seçimi */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                <span>1. Aşama: Yemek Tabanını Seç</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DISH_BASES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBase(b);
                      setCustomEmoji(b.icon);
                    }}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                      selectedBase.id === b.id
                        ? 'border-amber-400 bg-amber-950/40 shadow-lg scale-105'
                        : 'border-slate-700 bg-slate-800/80 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <span className="text-[11px] font-extrabold text-white text-center leading-tight">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">${b.basePrice}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Malzemeler Seçimi (Max 3) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-amber-400">
                  2. Aşama: Gurme Malzemeler Ekle ({selectedIngredients.length} / 3)
                </label>
                <span className="text-[11px] text-slate-400 font-bold">
                  Malzemeler lezzeti, yıldız puanını ve fiyat değerini artırır!
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {DISCOVERY_INGREDIENTS.map((ing) => {
                  const isPicked = selectedIngredients.some(i => i.id === ing.id);

                  return (
                    <button
                      key={ing.id}
                      onClick={() => toggleIngredient(ing)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                        isPicked
                          ? 'border-emerald-400 bg-emerald-950/40 shadow-md scale-[1.02]'
                          : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-xl">{ing.icon}</span>
                      <div className="flex flex-col flex-1 leading-tight">
                        <span className="font-extrabold text-xs text-white">{ing.name}</span>
                        <div className="flex items-center justify-between mt-1 text-[10px]">
                          <span className="text-emerald-400 font-bold">+${ing.cost}</span>
                          <span className="text-amber-300 font-bold">+{ing.starBoost}★</span>
                        </div>
                      </div>
                      {isPicked && <Check className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: İsim ve Fiyat Ayarı */}
            <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full flex flex-col gap-3">
                <div>
                  <label className="text-xs font-black uppercase text-slate-300 mb-1 block">
                    3. Aşama: Özel Yemek İsmi
                  </label>
                  <input
                    type="text"
                    placeholder={`Örn: Şefin Altın ${selectedBase.name}`}
                    value={customDishName}
                    onChange={(e) => setCustomDishName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1 font-bold">
                    <span className="text-slate-300">Menü Satış Fiyatı:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">${customPriceInput}</span>
                  </div>
                  <input
                    type="range"
                    min={estimatedBasePrice}
                    max={Math.round(estimatedBasePrice * 2.8)}
                    value={customPriceInput}
                    onChange={(e) => setCustomPriceInput(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
                  />
                </div>
              </div>

              {/* Preview Card & Create Action */}
              <div className="w-full md:w-72 bg-slate-950 p-4 rounded-2xl border border-amber-500/60 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-black">YEMEK ÖNİZLEMESİ</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: estimatedStars }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 my-1">
                  <span className="text-4xl p-2 bg-slate-900 rounded-xl border border-slate-800">{customEmoji}</span>
                  <div>
                    <h5 className="font-extrabold text-sm text-white">
                      {customDishName.trim() || `Şefin Özel ${selectedBase.name}`}
                    </h5>
                    <span className="text-xs text-emerald-400 font-black">${customPriceInput} Satış Fiyatı</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex flex-col gap-1 border-t border-slate-800 pt-2">
                  <span>Maliyet: ${estimatedBasePrice}</span>
                  <span>Kar Marjı: %{Math.round(((customPriceInput - estimatedBasePrice) / estimatedBasePrice) * 100)}</span>
                  <span className="text-amber-300 font-bold">Laboratuvar Ücreti: ${creationFee}</span>
                </div>

                <button
                  onClick={handleCreateDish}
                  disabled={!canAffordCreation}
                  className={`mt-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                    canAffordCreation
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{canAffordCreation ? 'Yarat & Menüye Ekle' : 'Yetersiz Para'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: MENÜ ANALİTİĞİ --- */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <span className="text-xs text-slate-400 font-bold">Toplam Menü Kalemleri</span>
                <h4 className="text-2xl font-black text-white mt-1">{recipes.length} Çeşit</h4>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <span className="text-xs text-slate-400 font-bold">Aktif Servis Verilen</span>
                <h4 className="text-2xl font-black text-emerald-400 mt-1">{activeMenuRecipes.length} Yemek</h4>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <span className="text-xs text-slate-400 font-bold">Özel Tasarım Yemekler</span>
                <h4 className="text-2xl font-black text-amber-400 mt-1">
                  {recipes.filter(r => r.isCustom).length} Özel Tarif
                </h4>
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col gap-3">
              <h4 className="font-extrabold text-sm sm:text-base text-white">Yemek Satış Performansı</h4>

              <div className="flex flex-col gap-2">
                {recipes.filter(r => r.unlocked).map((recipe) => (
                  <div key={recipe.id} className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{recipe.icon}</span>
                      <span className="font-extrabold text-white">{recipe.name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-slate-400">Sipariş: <strong>{recipe.ordersCount || 0}</strong></span>
                      <span className="text-emerald-400 font-extrabold">Toplam: ${recipe.totalRevenue || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
