export type StaffRole = 'chef' | 'waiter' | 'courier';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  level: number;
  speed: number; // multiplier
  skill: number; // food quality or tip boost
  stamina: number;
  salary: number; // cost per min
  avatarColor: string;
  state: 'idle' | 'walking' | 'cooking' | 'serving' | 'delivering';
  currentTaskId?: string;
  pos: [number, number, number];
}

export type ItemCategory = 
  | 'tables' 
  | 'kitchen' 
  | 'tech' 
  | 'decor' 
  | 'garden' 
  | 'floor2';

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: ItemCategory;
  cost: number;
  decorRating: number; // boosts billboard score
  capacityBonus?: number; // extra seats
  speedBonus?: number; // cooking or serving speed boost
  description: string;
  icon: string;
  modelType: string;
  width: number;
  depth: number;
  floorLevel: 1 | 2 | 'any';
  unlockedAtLevel: number;
}

export interface PlacedItem {
  instanceId: string;
  itemId: string;
  x: number;
  z: number;
  floor: 1 | 2;
  rotation: number; // 0, 90, 180, 270 in degrees
}

export interface Recipe {
  id: string;
  name: string;
  category: 'street' | 'seafood' | 'gourmet' | 'drinks' | 'dessert';
  basePrice: number;
  customPrice: number;
  cookTimeSec: number;
  unlocked: boolean;
  requiredLevel: number;
  icon: string;
  stars: number;
  isCustom?: boolean;
  ingredients?: string[];
  isActiveOnMenu?: boolean;
  ordersCount?: number;
  totalRevenue?: number;
  description?: string;
}

export interface CustomerEntity {
  id: string;
  name: string;
  isVip: boolean; // celebrity or billionaire
  vipTitle?: string; // 'Milyarder', 'Gurme Eleştirmen', 'Pop Yıldızı'
  state: 'entering' | 'waiting_table' | 'ordering' | 'waiting_food' | 'eating' | 'paying' | 'leaving';
  tableId?: string;
  seatIndex?: number;
  orderedRecipeId?: string;
  pos: [number, number, number];
  targetPos: [number, number, number];
  patience: number; // 0-100
  satisfaction: number; // 0-100
  patienceTimer: number;
  eatingTimer: number;
  outfitColor: string;
  hairColor: string;
  hatType?: string;
  billAmount: number;
  tipAmount: number;
}

export interface CourierMission {
  id: string;
  customerName: string;
  address: string;
  items: string[];
  reward: number;
  timeRemainingSec: number;
  totalTimeSec: number;
  status: 'pending' | 'delivering' | 'completed';
  courierId?: string;
}

export interface BillboardRating {
  stars: number; // 1.0 - 5.0
  reviewCount: number;
  hygieneScore: number; // 0 - 100
  decorScore: number; // 0 - 100
  speedScore: number; // 0 - 100
  recentReview: string;
  trend: 'up' | 'down' | 'stable';
}

export interface ThemeConfig {
  id: string;
  name: string;
  wallColor: string;
  floorColor: string;
  roofColor: string;
  accentColor: string;
  lightingTone: 'day' | 'sunset' | 'night';
}

export interface FriendRestaurant {
  id: string;
  ownerName: string;
  restaurantName: string;
  stars: number;
  dailyRevenue: number;
  theme: string;
  level: number;
  hasSecondFloor: boolean;
  tableCount: number;
  avatarSeed: string;
}

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  restaurantName: string;
  stars: number;
  netWorth: number;
  ratingScore: number;
  level: number;
  isSelf?: boolean;
}

export interface GameState {
  restaurantName: string;
  cash: number;
  gems: number;
  level: number;
  xp: number;
  hasSecondFloor: boolean;
  unlockedGarden: boolean;
  currentFloorView: 1 | 2;
  placedItems: PlacedItem[];
  staff: StaffMember[];
  recipes: Recipe[];
  currentTheme: string;
  lightingTime: 'day' | 'sunset' | 'night';
  courierMissions: CourierMission[];
  billboard: BillboardRating;
  cloudSyncId: string;
  lastCloudSaveTimestamp: number;
  rushHourActive: boolean;
  rushHourTimeLeft: number;
  stats: {
    totalCustomersServed: number;
    totalEarnings: number;
    vipServed: number;
    deliveriesCompleted: number;
  };
}
