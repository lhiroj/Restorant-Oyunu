import React from 'react';
import { X, Bike, MapPin, Package, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { CourierMission, StaffMember } from '../types/game';
import { sound } from '../audio/soundEffects';

interface DeliveryModalProps {
  missions: CourierMission[];
  couriers: StaffMember[];
  onDispatchCourier: (missionId: string) => void;
  onClose: () => void;
}

export const DeliveryModal: React.FC<DeliveryModalProps> = ({
  missions,
  couriers,
  onDispatchCourier,
  onClose,
}) => {
  const availableCouriers = couriers.filter(c => c.state === 'idle');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-5 sm:p-7 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600/30 border border-rose-500 rounded-2xl">
              <Bike className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">Kurye & Paket Servis İstasyonu</h2>
              <p className="text-xs text-slate-400">
                Şehirdeki ve sahil villalarındaki müşterilere sıcak paket siparişler ulaştır!
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

        {/* Courier fleet status banner */}
        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛵</span>
            <span className="font-bold text-slate-300">
              Kurye Filosu: <strong className="text-white">{couriers.length} Kurye</strong> ({availableCouriers.length} Müsait)
            </span>
          </div>

          {couriers.length === 0 && (
            <span className="text-rose-400 font-extrabold text-xs">
              ⚠️ Sipariş göndermek için Personel Menüsünden Kurye işe al!
            </span>
          )}
        </div>

        {/* Missions list */}
        <div className="flex flex-col gap-3">
          {missions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 text-slate-600 animate-spin" />
              <p className="text-sm font-bold">Yeni paket siparişleri bekleniyor...</p>
            </div>
          ) : (
            missions.map((mission) => {
              const isDelivering = mission.status === 'delivering';
              const progressPercent = Math.round(
                ((mission.totalTimeSec - mission.timeRemainingSec) / mission.totalTimeSec) * 100
              );

              return (
                <div
                  key={mission.id}
                  className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white">{mission.customerName}</span>
                      <span className="bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 px-2 py-0.5 rounded-lg text-xs font-black flex items-center gap-1">
                        <DollarSign className="w-3 h-3 stroke-[3]" />
                        +{mission.reward} Kazanç
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{mission.address}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-amber-300">
                      <Package className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{mission.items.join(', ')}</span>
                    </div>

                    {isDelivering && (
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700 mt-1">
                        <div
                          className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    {isDelivering ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-700/60 px-3 py-2 rounded-xl">
                        <Bike className="w-4 h-4 animate-bounce" />
                        <span>Yolda ({Math.round(mission.timeRemainingSec)}s)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (availableCouriers.length > 0) {
                            onDispatchCourier(mission.id);
                            sound.playScooter();
                          }
                        }}
                        disabled={availableCouriers.length === 0}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
                          availableCouriers.length > 0
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-110 text-white'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Bike className="w-4 h-4" />
                        <span>Kuryeyi Gönder</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
