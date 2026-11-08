import React, { useState } from 'react';
import { 
  X, 
  Trophy, 
  Users, 
  Cloud, 
  Star, 
  DollarSign, 
  ExternalLink, 
  Copy, 
  Check, 
  UploadCloud, 
  DownloadCloud,
  Sparkles
} from 'lucide-react';
import { LeaderboardPlayer, FriendRestaurant, GameState } from '../types/game';
import { MOCK_LEADERBOARD, FRIEND_RESTAURANTS } from '../game/constants';
import { serializeCloudSave, deserializeCloudSave } from '../game/logic';
import { sound } from '../audio/soundEffects';

interface FriendsLeaderboardModalProps {
  state: GameState;
  onApplyCloudState: (newState: Partial<GameState>) => void;
  onRewardGems: (amount: number) => void;
  onClose: () => void;
}

export const FriendsLeaderboardModal: React.FC<FriendsLeaderboardModalProps> = ({
  state,
  onApplyCloudState,
  onRewardGems,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'friends' | 'cloud'>('leaderboard');
  const [visitedFriends, setVisitedFriends] = useState<string[]>([]);
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [importCodeInput, setImportCodeInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Generate dynamic leaderboard with current player state inserted
  const dynamicLeaderboard: LeaderboardPlayer[] = MOCK_LEADERBOARD.map((p) => {
    if (p.isSelf) {
      return {
        ...p,
        restaurantName: state.restaurantName,
        stars: state.billboard.stars,
        netWorth: state.cash + state.stats.totalEarnings,
        ratingScore: Math.round(state.billboard.stars * 18 + state.level * 2),
        level: state.level,
      };
    }
    return p;
  }).sort((a, b) => b.netWorth - a.netWorth).map((p, idx) => ({ ...p, rank: idx + 1 }));

  const handleCopyCode = () => {
    const encoded = serializeCloudSave(state);
    navigator.clipboard.writeText(encoded).then(() => {
      setCopiedSyncCode(true);
      setTimeout(() => setCopiedSyncCode(false), 2500);
    }).catch(() => {});
  };

  const handleImportSave = () => {
    if (!importCodeInput.trim()) return;
    const restored = deserializeCloudSave(importCodeInput.trim(), state);
    if (restored) {
      onApplyCloudState(restored);
      setImportStatus('✅ Bulut verisi başarıyla yüklendi!');
      sound.playCash();
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('❌ Geçersiz bulut kodu!');
    }
  };

  const handleVisitFriend = (friend: FriendRestaurant) => {
    if (!visitedFriends.includes(friend.id)) {
      setVisitedFriends([...visitedFriends, friend.id]);
      onRewardGems(5);
      sound.playVipFanfare();
      alert(`🏝️ ${friend.ownerName}'in "${friend.restaurantName}" mekanını ziyaret ettin!\nİlham aldığın için +5 Elmas kazandın! 💎`);
    } else {
      alert(`🏝️ ${friend.ownerName}'in mekanını inceliyorsun: ${friend.stars} Yıldız, ${friend.tableCount} Masa, ${friend.hasSecondFloor ? '2. Kat Teraslı' : 'Tek Katlı'}.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 sm:p-7 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-600/30 border border-amber-500 rounded-2xl">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Liderlik, Arkadaşlar & Bulut</h2>
              <p className="text-xs text-slate-400">
                Şehrin en iyi restoranlarıyla yarış, arkadaşlarını ziyaret et ve verilerini buluta senkronize et!
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Liderlik Sıralaması</span>
          </button>

          <button
            onClick={() => setActiveTab('friends')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'friends'
                ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Arkadaş Ziyareti</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'cloud'
                ? 'bg-amber-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Bulut Senkronizasyonu</span>
          </button>
        </div>

        {/* Tab 1: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="flex flex-col gap-2.5">
            {dynamicLeaderboard.map((player) => {
              const isFirst = player.rank === 1;
              const isSecond = player.rank === 2;
              const isThird = player.rank === 3;

              return (
                <div
                  key={player.name}
                  className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    player.isSelf
                      ? 'bg-amber-950/40 border-amber-500 shadow-lg scale-[1.01]'
                      : 'bg-slate-800/80 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                        isFirst
                          ? 'bg-yellow-400 text-slate-950 shadow-md'
                          : isSecond
                          ? 'bg-slate-300 text-slate-950 shadow-md'
                          : isThird
                          ? 'bg-amber-700 text-white shadow-md'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      #{player.rank}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-white">
                          {player.restaurantName}
                        </h4>
                        {player.isSelf && (
                          <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded">
                            SEN
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">Sahibi: {player.name} • Lv. {player.level}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:flex items-center gap-1 text-amber-400 font-black text-sm">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{player.stars.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center text-emerald-400 font-black text-sm sm:text-base tabular-nums">
                      <DollarSign className="w-4 h-4 stroke-[3]" />
                      <span>{player.netWorth.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Friends Visit */}
        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {FRIEND_RESTAURANTS.map((friend) => {
              const alreadyVisited = visitedFriends.includes(friend.id);

              return (
                <div
                  key={friend.id}
                  className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">🏝️</span>
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {friend.stars}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm sm:text-base text-white mt-2">
                      {friend.restaurantName}
                    </h4>
                    <p className="text-xs text-slate-400">Şef: {friend.ownerName} • Lv. {friend.level}</p>

                    <div className="text-xs text-slate-300 mt-2 flex flex-col gap-1 bg-slate-900/60 p-2 rounded-xl">
                      <span>🍽️ {friend.tableCount} Masa Kapasitesi</span>
                      <span>🏢 {friend.hasSecondFloor ? '2. Kat Terası Açık' : 'Tek Katlı'}</span>
                      <span className="text-emerald-400 font-bold">💰 Günlük ${friend.dailyRevenue.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVisitFriend(friend)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                      alreadyVisited
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white'
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{alreadyVisited ? 'Tekrar İncele' : 'Ziyaret Et (+5 💎)'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Cloud Sync */}
        {activeTab === 'cloud' && (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-cyan-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">Bulut Kimliğin (Cloud Sync ID)</h3>
              </div>
              <p className="text-xs text-slate-400">
                İlerlemen tarayıcına otomatik kaydedilir. Başka cihazlarda oynamak için bu kodu kopyalayıp yükleyebilirsin!
              </p>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  readOnly
                  value={state.cloudSyncId}
                  className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono text-amber-300 flex-1 select-all"
                />
                <button
                  onClick={handleCopyCode}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
                >
                  {copiedSyncCode ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSyncCode ? 'Kopyalandı!' : 'Yedek Kodu Al'}</span>
                </button>
              </div>
            </div>

            {/* Import Save Section */}
            <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">Farklı Cihazdan Veri Yükle</h3>
              </div>
              <p className="text-xs text-slate-400">
                Önceden kopyaladığın restoran yedek kodunu buraya yapıştırıp yükle:
              </p>

              <textarea
                rows={3}
                placeholder="Yedek kodunu buraya yapıştır..."
                value={importCodeInput}
                onChange={(e) => setImportCodeInput(e.target.value)}
                className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-mono text-slate-200 resize-none"
              />

              {importStatus && (
                <span className="text-xs font-bold text-amber-300">{importStatus}</span>
              )}

              <button
                onClick={handleImportSave}
                disabled={!importCodeInput.trim()}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  importCodeInput.trim()
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <DownloadCloud className="w-4 h-4" />
                <span>Bulut Kodunu Yükle & Devam Et</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
