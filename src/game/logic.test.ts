import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateDecorScore, 
  calculateCapacity, 
  calculateBillboardRating, 
  calculateCustomerBill, 
  upgradeStaffMember, 
  serializeCloudSave, 
  deserializeCloudSave, 
  createInitialGameState,
  createCustomDish 
} from './logic';
import { PlacedItem, StaffMember } from '../types/game';

test('calculateDecorScore sums items correctly', () => {
  const items: PlacedItem[] = [
    { instanceId: '1', itemId: 'tech_tv_wall', x: 0, z: 0, floor: 1, rotation: 0 }, // 18 pts
    { instanceId: '2', itemId: 'tech_ac_unit', x: 0, z: 0, floor: 1, rotation: 0 }, // 22 pts
    { instanceId: '3', itemId: 'decor_plant_monstera', x: 0, z: 0, floor: 1, rotation: 0 }, // 8 pts
  ];

  const score = calculateDecorScore(items);
  assert.equal(score, 18 + 22 + 8);
});

test('calculateCapacity calculates seating seats correctly', () => {
  const items: PlacedItem[] = [
    { instanceId: '1', itemId: 'table_wood_standard', x: 0, z: 0, floor: 1, rotation: 0 }, // 2 seats
    { instanceId: '2', itemId: 'table_luxury_marble', x: 0, z: 0, floor: 1, rotation: 0 }, // 4 seats
  ];

  const capacity = calculateCapacity(items);
  assert.equal(capacity, 6);
});

test('calculateBillboardRating returns stars and reviews within valid ranges', () => {
  const rating = calculateBillboardRating(120, 85, true, 2);
  assert.ok(rating.stars >= 1.0 && rating.stars <= 5.0, `Stars ${rating.stars} should be between 1.0 and 5.0`);
  assert.ok(rating.decorScore >= 0 && rating.decorScore <= 100);
  assert.ok(rating.speedScore >= 0 && rating.speedScore <= 100);
  assert.ok(typeof rating.recentReview === 'string');
});

test('VIP customers pay higher bill and huge tips', () => {
  const normal = calculateCustomerBill(50, false, 50, false);
  const vip = calculateCustomerBill(50, true, 50, false);

  assert.ok(vip.bill > normal.bill, 'VIP bill should be significantly higher');
  assert.ok(vip.tip > normal.tip * 3, 'VIP tip should be at least 3x higher than normal tip');
});

test('upgradeStaffMember scales level and stats', () => {
  const staff: StaffMember = {
    id: 's1',
    name: 'Chef Gordon',
    role: 'chef',
    level: 1,
    speed: 1.0,
    skill: 1.0,
    stamina: 100,
    salary: 20,
    avatarColor: '#f43f5e',
    state: 'idle',
    pos: [0, 0, 0],
  };

  const { cost, updated } = upgradeStaffMember(staff);
  assert.equal(cost, 200);
  assert.equal(updated.level, 2);
  assert.equal(updated.speed, 1.2);
  assert.ok(updated.skill > 1.0);
});

test('cloud save serialization and deserialization retains game state', () => {
  const initial = createInitialGameState();
  initial.cash = 3450;
  initial.restaurantName = 'Deniz Feneri Restoran';
  
  const encoded = serializeCloudSave(initial);
  assert.ok(typeof encoded === 'string');
  assert.ok(encoded.length > 50);

  const restored = deserializeCloudSave(encoded, initial);
  assert.ok(restored !== null);
  assert.equal(restored?.cash, 3450);
  assert.equal(restored?.restaurantName, 'Deniz Feneri Restoran');
});

test('createCustomDish calculates base price, ingredients and stars properly', () => {
  const custom = createCustomDish(
    'Altın Trüflü Sahil Burgeri',
    { id: 'base_burger', name: 'Özel Brioche Burger', category: 'street', basePrice: 35, cookTimeSec: 4, icon: '🍔' },
    [
      { id: 'truffle', name: 'Siyah Trüf Mantarı', cost: 60, starBoost: 0.8 },
      { id: 'gold_leaf', name: '24K Altın Varak', cost: 120, starBoost: 1.0 },
    ],
    220,
    '🍔'
  );

  assert.equal(custom.name, 'Altın Trüflü Sahil Burgeri');
  assert.equal(custom.isCustom, true);
  assert.equal(custom.stars, 5);
  assert.ok(custom.basePrice > 35, 'Base price should increase with premium ingredients');
  assert.equal(custom.customPrice, 220);
  assert.equal(custom.isActiveOnMenu, true);
  assert.equal(custom.ingredients?.length, 2);
});
