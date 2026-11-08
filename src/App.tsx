/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameState, StaffRole, FurnitureCatalogItem, PlacedItem, Recipe } from './types/game';
import { 
  createInitialGameState, 
  calculateDecorScore, 
  calculateBillboardRating, 
  createNewStaffMember, 
  upgradeStaffMember, 
  generateCourierMission,
  calculateCapacity
} from './game/logic';
import { RestaurantSceneManager } from './game/three/RestaurantScene';
import { GameHUD } from './components/GameHUD';
import { TitleScreen } from './components/TitleScreen';
import { BuildModeDrawer } from './components/BuildModeDrawer';
import { StaffManagementModal } from './components/StaffManagementModal';
import { MenuCustomizerModal } from './components/MenuCustomizerModal';
import { DeliveryModal } from './components/DeliveryModal';
import { FriendsLeaderboardModal } from './components/FriendsLeaderboardModal';
import { sound } from './audio/soundEffects';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('oceanfront_restaurant_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.cash !== undefined) return parsed;
      }
    } catch (e) {}
    return createInitialGameState();
  });

  const [gamePhase, setGamePhase] = useState<'title' | 'playing'>(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('autostart=1')) {
      return 'playing';
    }
    return 'title';
  });

  const [isMuted, setIsMuted] = useState(false);
  const [activeModal, setActiveModal] = useState<
    'none' | 'build' | 'staff' | 'menu' | 'delivery' | 'friends'
  >('none');

  // Selected item in build mode
  const [itemToPlace, setItemToPlace] = useState<FurnitureCatalogItem | undefined>(undefined);

  // References
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<RestaurantSceneManager | null>(null);
  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;

  // Initialize 3D Scene once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const manager = new RestaurantSceneManager(canvasMountRef.current);
    sceneManagerRef.current = manager;

    // Initial sync
    manager.syncPlacedItems(stateRef.current.placedItems);
    manager.syncStaff(stateRef.current.staff);
    manager.updateSecondFloor(stateRef.current.hasSecondFloor);
    manager.updateBillboard(
      stateRef.current.billboard.stars,
      stateRef.current.billboard.decorScore,
      stateRef.current.restaurantName
    );

    // Callbacks from 3D world
    manager.registerCallbacks(
      (bill, tip, isVip) => {
        // Customer paid!
        setGameState((prev) => {
          const totalEarned = bill + tip;
          const newCash = prev.cash + totalEarned;
          const newTotalEarnings = prev.stats.totalEarnings + totalEarned;
          const newCustomersCount = prev.stats.totalCustomersServed + 1;
          const newVipCount = isVip ? prev.stats.vipServed + 1 : prev.stats.vipServed;
          const newXp = prev.xp + (isVip ? 40 : 15);
          let newLevel = prev.level;
          if (newXp >= prev.level * 100) {
            newLevel += 1;
            sound.playLevelUp();
          }

          const decorScore = calculateDecorScore(prev.placedItems);
          const newBillboard = calculateBillboardRating(decorScore, 85, true, newVipCount);

          if (sceneManagerRef.current) {
            sceneManagerRef.current.updateBillboard(newBillboard.stars, newBillboard.decorScore, prev.restaurantName);
          }

          return {
            ...prev,
            cash: newCash,
            xp: newXp,
            level: newLevel,
            billboard: newBillboard,
            stats: {
              ...prev.stats,
              totalCustomersServed: newCustomersCount,
              totalEarnings: newTotalEarnings,
              vipServed: newVipCount,
            },
          };
        });
      },
      (isVip) => {
        // Customer served
      }
    );

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Sync dataset.state with gamePhase
  useEffect(() => {
    document.body.dataset.state = gamePhase;
  }, [gamePhase]);

  // Periodic Auto-Save
  useEffect(() => {
    try {
      localStorage.setItem('oceanfront_restaurant_save', JSON.stringify(gameState));
    } catch (e) {}
  }, [gameState]);

  // Customer Spawner Loop
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    let customerTimer: number;
    let vipTimer: number;

    const spawnLoop = () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.spawnCustomer(false);
      }
      const delay = stateRef.current.rushHourActive ? 3500 : 8000 + Math.random() * 4000;
      customerTimer = window.setTimeout(spawnLoop, delay);
    };

    const vipLoop = () => {
      if (sceneManagerRef.current) {
        const vipTitles = ['Milyarder', 'Gurme Eleştirmen 🌟', 'Pop Yıldızı', 'Lüks Yat Sahibi'];
        const title = vipTitles[Math.floor(Math.random() * vipTitles.length)];
        sceneManagerRef.current.spawnCustomer(true, title);
      }
      vipTimer = window.setTimeout(vipLoop, 35000 + Math.random() * 25000);
    };

    customerTimer = window.setTimeout(spawnLoop, 2000);
    vipTimer = window.setTimeout(vipLoop, 15000);

    return () => {
      clearTimeout(customerTimer);
      clearTimeout(vipTimer);
    };
  }, [gamePhase]);

  // Courier Missions & Rush Hour Clock Tick Loop
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const interval = window.setInterval(() => {
      setGameState((prev) => {
        let changed = false;
        let newRushHourLeft = prev.rushHourTimeLeft;
        let newRushActive = prev.rushHourActive;

        if (newRushActive) {
          newRushHourLeft -= 1;
          if (newRushHourLeft <= 0) {
            newRushActive = false;
            newRushHourLeft = 0;
          }
          changed = true;
        }

        // Advance courier missions
        const couriers = prev.staff.filter((s) => s.role === 'courier');
        let newCash = prev.cash;
        let deliveriesDone = prev.stats.deliveriesCompleted;

        const updatedMissions = prev.courierMissions.map((mission) => {
          if (mission.status === 'delivering') {
            changed = true;
            const updatedTime = mission.timeRemainingSec - 1;
            if (updatedTime <= 0) {
              newCash += mission.reward;
              deliveriesDone += 1;
              sound.playCash();
              if (sceneManagerRef.current) {
                sceneManagerRef.current.addFloatingNote(
                  `+$${mission.reward} 🛵 Paket Teslim Edildi!`,
                  '#22c55e',
                  -12,
                  2.5,
                  -16
                );
              }
              // Set mission as completed, regenerate next
              return generateCourierMission(prev.level, deliveriesDone);
            }
            return { ...mission, timeRemainingSec: updatedTime };
          }
          return mission;
        });

        // If no missions, generate one
        if (updatedMissions.length === 0) {
          updatedMissions.push(generateCourierMission(prev.level, 0));
          changed = true;
        }

        if (!changed) return prev;

        return {
          ...prev,
          cash: newCash,
          rushHourActive: newRushActive,
          rushHourTimeLeft: newRushHourLeft,
          courierMissions: updatedMissions,
          stats: {
            ...prev.stats,
            deliveriesCompleted: deliveriesDone,
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gamePhase]);

  // Handlers
  const handleStartGame = () => {
    setGamePhase('playing');
    sound.playCash();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  const handleUnlockSecondFloor = () => {
    const cost = 1000;
    if (gameState.cash >= cost && !gameState.hasSecondFloor) {
      sound.playLevelUp();
      setGameState((prev) => {
        const updated = {
          ...prev,
          cash: prev.cash - cost,
          hasSecondFloor: true,
          currentFloorView: 2 as const,
        };
        if (sceneManagerRef.current) {
          sceneManagerRef.current.updateSecondFloor(true);
          sceneManagerRef.current.setCameraPreset('floor2');
          sceneManagerRef.current.addFloatingNote('🚀 2. KAT AÇILDI!', '#fbbf24', 0, 6, 0);
        }
        return updated;
      });
    }
  };

  const handleTriggerRushHour = () => {
    if (gameState.rushHourActive) return;
    sound.playBell();
    setGameState((prev) => ({
      ...prev,
      rushHourActive: true,
      rushHourTimeLeft: 30,
    }));
    if (sceneManagerRef.current) {
      sceneManagerRef.current.addFloatingNote('⚡ RUSH HOUR BAŞLADI!', '#f59e0b', 0, 3, 5);
      // Spawn burst of customers
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          sceneManagerRef.current?.spawnCustomer(i === 0, i === 0 ? 'Milyarder VIP' : undefined);
        }, i * 600);
      }
    }
  };

  // Build Mode Item Selection
  const handleSelectItemToPlace = (item: FurnitureCatalogItem) => {
    setItemToPlace(item);
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setBuildItem({
        id: item.id,
        modelType: item.modelType,
        floor: gameState.currentFloorView,
        width: item.width,
        depth: item.depth,
      });
    }
  };

  const handleConfirmPlacement = () => {
    if (!itemToPlace || !sceneManagerRef.current) return;
    if (gameState.cash < itemToPlace.cost) return;

    const coords = sceneManagerRef.current.previewCoords;
    const rotation = sceneManagerRef.current.buildRotation;

    const newItem: PlacedItem = {
      instanceId: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      itemId: itemToPlace.id,
      x: coords.x,
      z: coords.z,
      floor: coords.floor,
      rotation,
    };

    sound.playPlace();

    setGameState((prev) => {
      const updatedItems = [...prev.placedItems, newItem];
      const newCash = prev.cash - itemToPlace.cost;
      const decorScore = calculateDecorScore(updatedItems);
      const newBillboard = calculateBillboardRating(decorScore, 85, true, prev.stats.vipServed);

      if (sceneManagerRef.current) {
        sceneManagerRef.current.syncPlacedItems(updatedItems);
        sceneManagerRef.current.updateBillboard(newBillboard.stars, newBillboard.decorScore, prev.restaurantName);
        sceneManagerRef.current.addFloatingNote(
          `+${itemToPlace.decorRating} Puan ⭐`,
          '#fbbf24',
          coords.x,
          coords.floor === 2 ? 6 : 2.5,
          coords.z
        );
      }

      return {
        ...prev,
        cash: newCash,
        placedItems: updatedItems,
        billboard: newBillboard,
      };
    });

    // Clear placement preview
    sceneManagerRef.current.setBuildItem(undefined);
    setItemToPlace(undefined);
  };

  const handleCancelPlacement = () => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setBuildItem(undefined);
    }
    setItemToPlace(undefined);
  };

  const handleRotatePlacement = () => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.rotateBuildItem();
    }
  };

  // Staff Management
  const handleHireStaff = (role: StaffRole) => {
    const costs: Record<StaffRole, number> = { chef: 350, waiter: 250, courier: 300 };
    const cost = costs[role];
    if (gameState.cash < cost) return;

    const newMember = createNewStaffMember(role, gameState.staff.filter((s) => s.role === role).length);

    setGameState((prev) => {
      const updatedStaff = [...prev.staff, newMember];
      if (sceneManagerRef.current) {
        sceneManagerRef.current.syncStaff(updatedStaff);
        sceneManagerRef.current.addFloatingNote(
          `+1 ${role === 'chef' ? 'Aşçı' : role === 'courier' ? 'Kurye' : 'Garson'} İşe Alındı!`,
          '#38bdf8',
          0,
          2.5,
          0
        );
      }
      return {
        ...prev,
        cash: prev.cash - cost,
        staff: updatedStaff,
      };
    });
  };

  const handleUpgradeStaff = (staffId: string) => {
    const member = gameState.staff.find((s) => s.id === staffId);
    if (!member) return;
    const { cost, updated } = upgradeStaffMember(member);
    if (gameState.cash < cost) return;

    setGameState((prev) => ({
      ...prev,
      cash: prev.cash - cost,
      staff: prev.staff.map((s) => (s.id === staffId ? updated : s)),
    }));
  };

  // Menu Customization
  const handleUpdatePrice = (recipeId: string, newPrice: number) => {
    setGameState((prev) => ({
      ...prev,
      recipes: prev.recipes.map((r) => (r.id === recipeId ? { ...r, customPrice: newPrice } : r)),
    }));
  };

  const handleUnlockRecipe = (recipeId: string) => {
    setGameState((prev) => ({
      ...prev,
      recipes: prev.recipes.map((r) => (r.id === recipeId ? { ...r, unlocked: true } : r)),
    }));
  };

  const handleToggleActiveMenu = (recipeId: string) => {
    setGameState((prev) => ({
      ...prev,
      recipes: prev.recipes.map((r) =>
        r.id === recipeId ? { ...r, isActiveOnMenu: r.isActiveOnMenu === false ? true : false } : r
      ),
    }));
  };

  const handleAddNewCustomRecipe = (newRecipe: Recipe, cost: number) => {
    setGameState((prev) => {
      const updatedRecipes = [newRecipe, ...prev.recipes];
      if (sceneManagerRef.current) {
        sceneManagerRef.current.addFloatingNote(
          `✨ Yeni Özel Tarif: "${newRecipe.name}"!`,
          '#fbbf24',
          0,
          3,
          2
        );
      }
      return {
        ...prev,
        cash: Math.max(0, prev.cash - cost),
        recipes: updatedRecipes,
      };
    });
  };

  // Dispatch Courier
  const handleDispatchCourier = (missionId: string) => {
    setGameState((prev) => ({
      ...prev,
      courierMissions: prev.courierMissions.map((m) =>
        m.id === missionId ? { ...m, status: 'delivering' } : m
      ),
    }));
  };

  // Theme change
  const handleSelectTheme = (themeId: string) => {
    setGameState((prev) => ({ ...prev, currentTheme: themeId }));
  };

  // Floor view switch
  const handleToggleFloorView = (floor: 1 | 2) => {
    setGameState((prev) => ({ ...prev, currentFloorView: floor }));
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setCameraPreset(floor === 1 ? 'floor1' : 'floor2');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* 3D WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Title Screen Overlay */}
      {gamePhase === 'title' && (
        <TitleScreen onStartGame={handleStartGame} restaurantName={gameState.restaurantName} />
      )}

      {/* Playing Game HUD */}
      {gamePhase === 'playing' && (
        <GameHUD
          state={gameState}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenBuildMode={() => setActiveModal('build')}
          onOpenStaffModal={() => setActiveModal('staff')}
          onOpenMenuModal={() => setActiveModal('menu')}
          onOpenDeliveryModal={() => setActiveModal('delivery')}
          onOpenFriendsModal={() => setActiveModal('friends')}
          onUnlockSecondFloor={handleUnlockSecondFloor}
          onTriggerRushHour={handleTriggerRushHour}
          onCameraPreset={(preset) => sceneManagerRef.current?.setCameraPreset(preset)}
          isBuildModeActive={Boolean(itemToPlace)}
          onConfirmPlacement={handleConfirmPlacement}
          onCancelPlacement={handleCancelPlacement}
          onRotatePlacement={handleRotatePlacement}
          selectedBuildItemName={itemToPlace?.name}
          floorView={gameState.currentFloorView}
          onToggleFloorView={handleToggleFloorView}
        />
      )}

      {/* Modals */}
      {activeModal === 'build' && (
        <BuildModeDrawer
          cash={gameState.cash}
          level={gameState.level}
          hasSecondFloor={gameState.hasSecondFloor}
          currentFloorView={gameState.currentFloorView}
          onSelectItemToPlace={handleSelectItemToPlace}
          onClose={() => setActiveModal('none')}
          currentTheme={gameState.currentTheme}
          onSelectTheme={handleSelectTheme}
        />
      )}

      {activeModal === 'staff' && (
        <StaffManagementModal
          staff={gameState.staff}
          cash={gameState.cash}
          onHireStaff={handleHireStaff}
          onUpgradeStaff={handleUpgradeStaff}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'menu' && (
        <MenuCustomizerModal
          recipes={gameState.recipes}
          level={gameState.level}
          cash={gameState.cash}
          gems={gameState.gems}
          onUpdatePrice={handleUpdatePrice}
          onUnlockRecipe={handleUnlockRecipe}
          onToggleActiveMenu={handleToggleActiveMenu}
          onAddNewCustomRecipe={handleAddNewCustomRecipe}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'delivery' && (
        <DeliveryModal
          missions={gameState.courierMissions}
          couriers={gameState.staff.filter((s) => s.role === 'courier')}
          onDispatchCourier={handleDispatchCourier}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'friends' && (
        <FriendsLeaderboardModal
          state={gameState}
          onApplyCloudState={(newState) => setGameState((prev) => ({ ...prev, ...newState }))}
          onRewardGems={(amount) => setGameState((prev) => ({ ...prev, gems: prev.gems + amount }))}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
