import React, { useState } from 'react';
import { 
  X, 
  ChefHat, 
  Utensils, 
  Bike, 
  Zap, 
  Award, 
  UserPlus, 
  ArrowUpCircle,
  DollarSign
} from 'lucide-react';
import { StaffMember, StaffRole } from '../types/game';
import { sound } from '../audio/soundEffects';

interface StaffManagementModalProps {
  staff: StaffMember[];
  cash: number;
  onHireStaff: (role: StaffRole) => void;
  onUpgradeStaff: (staffId: string) => void;
  onClose: () => void;
}

export const StaffManagementModal: React.FC<StaffManagementModalProps> = ({
  staff,
  cash,
  onHireStaff,
  onUpgradeStaff,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<StaffRole | 'all'>('all');

  const filteredStaff = staff.filter((s) => {
    if (selectedRole === 'all') return true;
    return s.role === selectedRole;
  });

  const hireCosts: Record<StaffRole, number> = {
    chef: 350,
    waiter: 250,
    courier: 300,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-blue-500 rounded-3xl p-5 sm:p-7 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-500 rounded-2xl">
              <ChefHat className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Personel & Yapay Zeka Yönetimi</h2>
              <p className="text-xs text-slate-400">
                Aşçılar, garsonlar ve kuryeler yapay zeka ile otomatik çalışır. Seviyelerini artırarak hızlarını yükselt!
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

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'chef', 'waiter', 'courier'] as const).map((r) => {
            const count = r === 'all' ? staff.length : staff.filter(s => s.role === r).length;
            const labels = {
              all: `Tümü (${count})`,
              chef: `🍳 Aşçılar (${count})`,
              waiter: `🍽️ Garsonlar (${count})`,
              courier: `🛵 Kuryeler (${count})`,
            };
            return (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedRole === r
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {labels[r]}
              </button>
            );
          })}
        </div>

        {/* Hire Section */}
        <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5 text-blue-300">
              <UserPlus className="w-4 h-4 text-blue-400" />
              Yeni Personel İşe Al
            </h3>
            <p className="text-xs text-slate-300">
              Kapasiteni artırmak ve restoranı büyütmek için yeni çalışanlar ekle.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                if (cash >= hireCosts.chef) {
                  onHireStaff('chef');
                  sound.playCash();
                }
              }}
              disabled={cash < hireCosts.chef}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                cash >= hireCosts.chef
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-110 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>+ Aşçı (${hireCosts.chef})</span>
            </button>

            <button
              onClick={() => {
                if (cash >= hireCosts.waiter) {
                  onHireStaff('waiter');
                  sound.playCash();
                }
              }}
              disabled={cash < hireCosts.waiter}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                cash >= hireCosts.waiter
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>+ Garson (${hireCosts.waiter})</span>
            </button>

            <button
              onClick={() => {
                if (cash >= hireCosts.courier) {
                  onHireStaff('courier');
                  sound.playCash();
                }
              }}
              disabled={cash < hireCosts.courier}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                cash >= hireCosts.courier
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>+ Kurye (${hireCosts.courier})</span>
            </button>
          </div>
        </div>

        {/* Staff Members List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredStaff.map((member) => {
            const upgradeCost = member.level * 200;
            const canUpgrade = cash >= upgradeCost;

            return (
              <div
                key={member.id}
                className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black text-white shadow-inner"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.role === 'chef' ? '🍳' : member.role === 'courier' ? '🛵' : '🍽️'}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-white">{member.name}</h4>
                      <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                        {member.role === 'chef' ? 'Aşçı / Şef' : member.role === 'courier' ? 'Kurye' : 'Garson'}
                      </span>
                    </div>
                  </div>

                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-lg text-xs font-extrabold">
                    Lv. {member.level}
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hız Çarpanı:</span>
                    <strong className="text-white ml-auto">{member.speed.toFixed(1)}x</strong>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Hüner:</span>
                    <strong className="text-white ml-auto">{member.skill.toFixed(2)}x</strong>
                  </div>
                </div>

                {/* Upgrade Button */}
                <button
                  onClick={() => {
                    if (canUpgrade) {
                      onUpgradeStaff(member.id);
                      sound.playLevelUp();
                    }
                  }}
                  disabled={!canUpgrade}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                    canUpgrade
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4" />
                  <span>Seviye Yükselt (${upgradeCost})</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
