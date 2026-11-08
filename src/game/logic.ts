import { 
  GameState, 
  PlacedItem, 
  CustomerEntity, 
  StaffMember, 
  BillboardRating, 
  CourierMission,
  StaffRole,
  Recipe 
} from '../types/game';
import { FURNITURE_CATALOG, INITIAL_RECIPES, THEME_PRESETS } from './constants';

export function calculateDecorScore(placedItems: PlacedItem[]): number {
  let score = 0;
  for (const item of placedItems) {
    const catalogEntry = FURNITURE_CATALOG.find(c => c.id === item.itemId);
    if (catalogEntry) {
      score += catalogEntry.decorRating;
    }
  }
  return score;
}

export function calculateCapacity(placedItems: PlacedItem[]): number {
  let cap = 0;
  for (const item of placedItems) {
    const catalogEntry = FURNITURE_CATALOG.find(c => c.id === item.itemId);
    if (catalogEntry?.capacityBonus) {
      cap += catalogEntry.capacityBonus;
    }
  }
  return Math.max(cap, 2); // At least 2 capacity
}

export function calculateBillboardRating(
  decorScore: number,
  avgPatience: number,
  hasStaff: boolean,
  vipCount: number
): BillboardRating {
  // Decor score contribution (0-40)
  const decorPart = Math.min(decorScore / 4, 40);
  // Speed/Hygiene contribution (0-40)
  const speedPart = hasStaff ? Math.min(avgPatience * 0.4, 40) : 15;
  // VIP/Service prestige (0-20)
  const prestigePart = Math.min(vipCount * 5 + 10, 20);

  const totalScore = Math.max(10, Math.min(100, Math.round(decorPart + speedPart + prestigePart)));
  const stars = Number((Math.max(1.0, Math.min(5.0, (totalScore / 20)))).toFixed(1));

  let recentReview = 'Lezzetli sahil burgeri, manzara şahane!';
  if (stars >= 4.8) {
    recentReview = '🌟 5 YILDIZ! VIP teras katı ve sahil esintisi büyüleyici, kesinlikle tavsiye!';
  } else if (stars >= 4.0) {
    recentReview = '✨ Harika deniz kenarı ambiansı, servis oldukça hızlı ve yemekler sıcak.';
  } else if (stars >= 3.0) {
    recentReview = '👍 Güzel bir sahil mekanı, birkaç dekorasyon ve klima eklenirse harika olur.';
  } else {
    recentReview = '⚠️ Sıra biraz yavaş, daha fazla garson ve masa gerekiyor.';
  }

  const trend: 'up' | 'down' | 'stable' = totalScore > 75 ? 'up' : totalScore < 40 ? 'down' : 'stable';

  return {
    stars,
    reviewCount: 30 + Math.floor(decorScore / 3) + (vipCount * 4),
    hygieneScore: Math.min(99, 70 + Math.floor(decorScore / 10)),
    decorScore: Math.min(100, Math.round(decorPart * 2.5)),
    speedScore: Math.min(100, Math.round(speedPart * 2.5)),
    recentReview,
    trend,
  };
}

export function calculateCustomerBill(
  basePrice: number,
  isVip: boolean,
  decorScore: number,
  hasJukebox: boolean
): { bill: number; tip: number } {
  const decorBonusMultiplier = 1 + Math.min(decorScore / 200, 0.5); // Up to +50% from decor
  const jukeboxBonus = hasJukebox ? 1.2 : 1.0;

  let bill = Math.round(basePrice * decorBonusMultiplier);
  let tipPercent = 0.15; // 15% standard tip

  if (isVip) {
    // VIP Billionaires / Celebrities pay 5x - 10x tip!
    tipPercent = 0.8 + Math.random() * 0.4; // 80% to 120% tip!
    bill = Math.round(bill * 2.5); // VIP ordering expensive gourmet additions
  }

  const tip = Math.round(bill * tipPercent * jukeboxBonus);
  return { bill, tip };
}

export function createNewStaffMember(role: StaffRole, index: number): StaffMember {
  const names = {
    chef: ['Usta Ahmet', 'Aşçı Selim', 'Gurme Deniz', 'Şef Emre', 'Chef Gordon'],
    waiter: ['Garson Can', 'Garson Melis', 'Garson Berk', 'Garson Aslı', 'Garson Efe'],
    courier: ['Kurye Hakan', 'Kurye Burak', 'Kurye Tolga', 'Kurye Cem', 'Kurye Serkan'],
  };

  const nameList = names[role];
  const name = nameList[index % nameList.length];
  const avatarColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return {
    id: `staff_${role}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    role,
    level: 1,
    speed: 1.0,
    skill: 1.0,
    stamina: 100,
    salary: role === 'courier' ? 15 : role === 'chef' ? 25 : 18,
    avatarColor: avatarColors[index % avatarColors.length],
    state: 'idle',
    pos: [0, 0, 0],
  };
}

export function upgradeStaffMember(staff: StaffMember): { cost: number; updated: StaffMember } {
  const cost = staff.level * 200;
  return {
    cost,
    updated: {
      ...staff,
      level: staff.level + 1,
      speed: Number((staff.speed + 0.2).toFixed(1)),
      skill: Number((staff.skill + 0.25).toFixed(2)),
      stamina: staff.stamina + 10,
    },
  };
}

export function createCustomDish(
  name: string,
  base: { id: string; name: string; category: 'street' | 'seafood' | 'gourmet' | 'drinks' | 'dessert'; basePrice: number; cookTimeSec: number; icon: string },
  selectedIngredients: { id: string; name: string; cost: number; starBoost: number }[],
  customPrice: number,
  customIcon?: string
): Recipe {
  let ingredientsCost = 0;
  let totalStarBoost = 0;
  const ingredientNames: string[] = [];

  selectedIngredients.forEach((ing) => {
    ingredientsCost += ing.cost;
    totalStarBoost += ing.starBoost;
    ingredientNames.push(ing.name);
  });

  const calculatedBasePrice = base.basePrice + Math.round(ingredientsCost * 0.7);
  const stars = Math.min(5, Math.max(3, Math.round(3 + totalStarBoost)));

  return {
    id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim() || `Şefin Özel ${base.name}`,
    category: base.category,
    basePrice: calculatedBasePrice,
    customPrice: Math.max(calculatedBasePrice, customPrice || Math.round(calculatedBasePrice * 1.3)),
    cookTimeSec: base.cookTimeSec + Math.min(selectedIngredients.length, 3),
    unlocked: true,
    requiredLevel: 1,
    icon: customIcon || base.icon,
    stars,
    isCustom: true,
    ingredients: ingredientNames,
    isActiveOnMenu: true,
    ordersCount: 0,
    totalRevenue: 0,
    description: `Şefin özel kreasyonu: ${ingredientNames.slice(0, 3).join(', ')} ile hazırlandı.`,
  };
}

export function generateCourierMission(level: number, existingCount: number): CourierMission {
  const customerNames = ['Kerem Bey', 'Ayşe Hanım', 'Murat Bey', 'Gamze Hanım', 'Metin Bey'];
  const addresses = [
    'Palmiye Rezidans No: 4',
    'Sahil Marina Villaları D: 2',
    'Gökdelen Plaza Kat 24',
    'Denizkızı Sahil Yolu No: 12',
    'Akasya Caddesi Köşe Ev',
  ];
  const menuItems = ['Sahil Burgeri x2', 'Karışık Pizza', 'Buzlu Limonata x2', 'Çıtır Kalamar', 'Waffle'];

  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
  const address = addresses[Math.floor(Math.random() * addresses.length)];
  const items = [
    menuItems[Math.floor(Math.random() * menuItems.length)],
    menuItems[Math.floor(Math.random() * menuItems.length)],
  ];
  
  const baseReward = 75 + level * 30 + Math.floor(Math.random() * 40);
  const totalTimeSec = 15; // 15 seconds delivery run

  return {
    id: `mission_${Date.now()}_${existingCount}`,
    customerName,
    address,
    items,
    reward: baseReward,
    timeRemainingSec: totalTimeSec,
    totalTimeSec,
    status: 'pending',
  };
}

export function serializeCloudSave(state: GameState): string {
  const savePayload = {
    v: 1,
    name: state.restaurantName,
    cash: state.cash,
    gems: state.gems,
    level: state.level,
    xp: state.xp,
    hasSecondFloor: state.hasSecondFloor,
    unlockedGarden: state.unlockedGarden,
    items: state.placedItems,
    staff: state.staff.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      level: s.level,
      speed: s.speed,
      skill: s.skill,
      avatarColor: s.avatarColor,
    })),
    recipes: state.recipes.map(r => ({
      id: r.id,
      unlocked: r.unlocked,
      customPrice: r.customPrice,
    })),
    theme: state.currentTheme,
    stats: state.stats,
    cloudSyncId: state.cloudSyncId,
    timestamp: Date.now(),
  };

  const jsonStr = JSON.stringify(savePayload);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(jsonStr, 'utf-8').toString('base64');
  }
  return btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}

export function deserializeCloudSave(encoded: string, current: GameState): Partial<GameState> | null {
  try {
    let raw = '';
    if (typeof Buffer !== 'undefined') {
      raw = Buffer.from(encoded, 'base64').toString('utf-8');
    } else {
      raw = decodeURIComponent(Array.prototype.map.call(atob(encoded), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 1) return null;

    return {
      restaurantName: parsed.name || current.restaurantName,
      cash: typeof parsed.cash === 'number' ? parsed.cash : current.cash,
      gems: typeof parsed.gems === 'number' ? parsed.gems : current.gems,
      level: typeof parsed.level === 'number' ? parsed.level : current.level,
      xp: typeof parsed.xp === 'number' ? parsed.xp : current.xp,
      hasSecondFloor: Boolean(parsed.hasSecondFloor),
      unlockedGarden: Boolean(parsed.unlockedGarden),
      placedItems: Array.isArray(parsed.items) ? parsed.items : current.placedItems,
      currentTheme: parsed.theme || current.currentTheme,
      stats: parsed.stats || current.stats,
      lastCloudSaveTimestamp: parsed.timestamp || Date.now(),
    };
  } catch (err) {
    return null;
  }
}

export function createInitialGameState(): GameState {
  // Pre-seed restaurant with basic 1st floor setup
  const initialItems: PlacedItem[] = [
    // Kitchen zone (Back corner)
    { instanceId: 'k1', itemId: 'kitchen_stove_pro', x: -6, z: -5, floor: 1, rotation: 0 },
    { instanceId: 'k2', itemId: 'kitchen_prep_counter', x: -4, z: -5, floor: 1, rotation: 0 },
    { instanceId: 'k3', itemId: 'kitchen_pickup_counter', x: -5, z: -2, floor: 1, rotation: 0 },
    { instanceId: 'k4', itemId: 'kitchen_fridge_double', x: -8, z: -5, floor: 1, rotation: 90 },

    // Dining area (Center & Near Window)
    { instanceId: 't1', itemId: 'table_wood_standard', x: 2, z: -3, floor: 1, rotation: 0 },
    { instanceId: 't2', itemId: 'table_wood_standard', x: 2, z: 2, floor: 1, rotation: 0 },
    { instanceId: 't3', itemId: 'table_luxury_marble', x: 6, z: -1, floor: 1, rotation: 0 },

    // Tech & Decor items (Wall & Corners)
    { instanceId: 'e1', itemId: 'tech_tv_wall', x: 0, z: -7, floor: 1, rotation: 0 },
    { instanceId: 'e2', itemId: 'tech_ac_unit', x: 7, z: -7, floor: 1, rotation: 0 },
    { instanceId: 'e3', itemId: 'tech_neon_clock', x: 4, z: -7, floor: 1, rotation: 0 },
    { instanceId: 'd1', itemId: 'decor_plant_monstera', x: 8, z: 4, floor: 1, rotation: 0 },
    { instanceId: 'd2', itemId: 'decor_wall_painting', x: -2, z: -7, floor: 1, rotation: 0 },

    // Beach Garden Patio
    { instanceId: 'g1', itemId: 'table_beach_umbrella', x: 3, z: 9, floor: 1, rotation: 0 },
    { instanceId: 'g2', itemId: 'garden_palm_tree', x: -6, z: 10, floor: 1, rotation: 0 },
    { instanceId: 'g3', itemId: 'garden_lantern_light', x: 7, z: 8, floor: 1, rotation: 0 },
  ];

  const defaultStaff: StaffMember[] = [
    {
      id: 'staff_chef_1',
      name: 'Şef Deniz',
      role: 'chef',
      level: 1,
      speed: 1.0,
      skill: 1.0,
      stamina: 100,
      salary: 20,
      avatarColor: '#f43f5e',
      state: 'idle',
      pos: [-5, 0, -4],
    },
    {
      id: 'staff_waiter_1',
      name: 'Garson Selim',
      role: 'waiter',
      level: 1,
      speed: 1.0,
      skill: 1.0,
      stamina: 100,
      salary: 15,
      avatarColor: '#3b82f6',
      state: 'idle',
      pos: [0, 0, 0],
    },
  ];

  const decorScore = calculateDecorScore(initialItems);
  const billboard = calculateBillboardRating(decorScore, 85, true, 0);

  return {
    restaurantName: 'Sahil Lezzet Restoranı 🌴',
    cash: 500,
    gems: 25,
    level: 1,
    xp: 0,
    hasSecondFloor: false,
    unlockedGarden: true,
    currentFloorView: 1,
    placedItems: initialItems,
    staff: defaultStaff,
    recipes: INITIAL_RECIPES,
    currentTheme: 'beach_tropic',
    lightingTime: 'day',
    courierMissions: [
      {
        id: 'mission_init',
        customerName: 'Kerem Bey',
        address: 'Palmiye Rezidans No: 4',
        items: ['Sahil Burgeri x2', 'Buzlu Limonata'],
        reward: 95,
        timeRemainingSec: 15,
        totalTimeSec: 15,
        status: 'pending',
      },
    ],
    billboard,
    cloudSyncId: `SYNC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    lastCloudSaveTimestamp: Date.now(),
    rushHourActive: false,
    rushHourTimeLeft: 0,
    stats: {
      totalCustomersServed: 0,
      totalEarnings: 0,
      vipServed: 0,
      deliveriesCompleted: 0,
    },
  };
}
