import * as THREE from 'three';

// Shared PBR Materials to optimize memory & draw calls
const materialsCache = new Map<string, THREE.Material>();

function getMaterial(key: string, creator: () => THREE.Material): THREE.Material {
  if (!materialsCache.has(key)) {
    materialsCache.set(key, creator());
  }
  return materialsCache.get(key)!;
}

export const PBR_MATERIALS = {
  woodDark: () => getMaterial('woodDark', () => new THREE.MeshStandardMaterial({
    color: 0x5c3a21,
    roughness: 0.75,
    metalness: 0.05,
  })),
  woodLight: () => getMaterial('woodLight', () => new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    roughness: 0.65,
    metalness: 0.05,
  })),
  marbleWhite: () => getMaterial('marbleWhite', () => new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    metalness: 0.15,
  })),
  brassGold: () => getMaterial('brassGold', () => new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.25,
    metalness: 0.85,
  })),
  steelMetal: () => getMaterial('steelMetal', () => new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.35,
    metalness: 0.8,
  })),
  stoveDark: () => getMaterial('stoveDark', () => new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5,
    metalness: 0.5,
  })),
  cushionRed: () => getMaterial('cushionRed', () => new THREE.MeshStandardMaterial({
    color: 0xef4444,
    roughness: 0.8,
    metalness: 0.0,
  })),
  cushionBlue: () => getMaterial('cushionBlue', () => new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    roughness: 0.8,
    metalness: 0.0,
  })),
  cushionGold: () => getMaterial('cushionGold', () => new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.6,
    metalness: 0.2,
  })),
  screenBlack: () => getMaterial('screenBlack', () => new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.1,
    metalness: 0.9,
  })),
  glassClear: () => getMaterial('glassClear', () => new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.1,
    transmission: 0.9,
    ior: 1.5,
    thickness: 0.5,
  })),
  neonCyan: () => getMaterial('neonCyan', () => new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
  })),
  neonPink: () => getMaterial('neonPink', () => new THREE.MeshBasicMaterial({
    color: 0xec4899,
  })),
  plantGreen: () => getMaterial('plantGreen', () => new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.6,
    metalness: 0.0,
  })),
  terracotta: () => getMaterial('terracotta', () => new THREE.MeshStandardMaterial({
    color: 0xc2410c,
    roughness: 0.85,
    metalness: 0.0,
  })),
};

// --- PROCEDURAL PROCEDURAL MODELS (3-12 Parts Each) ---

// 1. Classic Wooden Table + 2 Chairs Group
export function createWoodTableMesh(): THREE.Group {
  const group = new THREE.Group();

  // Primary Silhouette: Tabletop
  const topGeo = new THREE.BoxGeometry(1.6, 0.1, 1.2);
  const topMesh = new THREE.Mesh(topGeo, PBR_MATERIALS.woodLight());
  topMesh.position.y = 0.95;
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  group.add(topMesh);

  // 4 Table Legs
  const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
  const legPositions = [
    [-0.65, 0.45, -0.45],
    [0.65, 0.45, -0.45],
    [-0.65, 0.45, 0.45],
    [0.65, 0.45, 0.45],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, PBR_MATERIALS.woodDark());
    leg.position.set(x, y, z);
    leg.castShadow = true;
    group.add(leg);
  });

  // Tablecloth / Napkin detail
  const clothGeo = new THREE.BoxGeometry(0.8, 0.02, 0.8);
  const clothMesh = new THREE.Mesh(clothGeo, PBR_MATERIALS.cushionRed());
  clothMesh.position.set(0, 1.01, 0);
  group.add(clothMesh);

  // Vase with flower accent
  const vaseGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.2, 8);
  const vase = new THREE.Mesh(vaseGeo, PBR_MATERIALS.marbleWhite());
  vase.position.set(0, 1.12, 0);
  const flowerGeo = new THREE.SphereGeometry(0.08, 6, 6);
  const flower = new THREE.Mesh(flowerGeo, PBR_MATERIALS.plantGreen());
  flower.position.set(0, 1.25, 0);
  group.add(vase);
  group.add(flower);

  // 2 Chairs (North & South)
  [-0.8, 0.8].forEach((zOffset) => {
    const chairGroup = new THREE.Group();
    // Chair Seat
    const seatGeo = new THREE.BoxGeometry(0.5, 0.06, 0.5);
    const seat = new THREE.Mesh(seatGeo, PBR_MATERIALS.woodDark());
    seat.position.y = 0.5;
    chairGroup.add(seat);

    // Chair Back
    const backGeo = new THREE.BoxGeometry(0.5, 0.45, 0.05);
    const back = new THREE.Mesh(backGeo, PBR_MATERIALS.woodLight());
    back.position.set(0, 0.75, zOffset > 0 ? 0.22 : -0.22);
    chairGroup.add(back);

    // 4 Chair Legs
    const chairLegGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 6);
    [
      [-0.2, 0.25, -0.2],
      [0.2, 0.25, -0.2],
      [-0.2, 0.25, 0.2],
      [0.2, 0.25, 0.2],
    ].forEach(([cx, cy, cz]) => {
      const cl = new THREE.Mesh(chairLegGeo, PBR_MATERIALS.woodDark());
      cl.position.set(cx, cy, cz);
      chairGroup.add(cl);
    });

    chairGroup.position.set(0, 0, zOffset);
    group.add(chairGroup);
  });

  return group;
}

// 2. Luxury Marble Table + 4 Chairs
export function createMarbleTableMesh(): THREE.Group {
  const group = new THREE.Group();

  // Round Marble Top
  const topGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.1, 24);
  const top = new THREE.Mesh(topGeo, PBR_MATERIALS.marbleWhite());
  top.position.y = 0.95;
  top.castShadow = true;
  group.add(top);

  // Brass Gold Pedestal & Base
  const stemGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.85, 16);
  const stem = new THREE.Mesh(stemGeo, PBR_MATERIALS.brassGold());
  stem.position.y = 0.45;
  group.add(stem);

  const baseGeo = new THREE.CylinderGeometry(0.6, 0.65, 0.08, 20);
  const base = new THREE.Mesh(baseGeo, PBR_MATERIALS.brassGold());
  base.position.y = 0.04;
  group.add(base);

  // Center candle ornament
  const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.2, 8);
  const candle = new THREE.Mesh(candleGeo, PBR_MATERIALS.cushionGold());
  candle.position.set(0, 1.1, 0);
  group.add(candle);

  // 4 Velvet Chairs in cardinal directions
  const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  angles.forEach((angle) => {
    const chair = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 16), PBR_MATERIALS.cushionBlue());
    seat.position.y = 0.52;
    chair.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.06), PBR_MATERIALS.cushionBlue());
    back.position.set(0, 0.78, 0.25);
    chair.add(back);

    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.5, 8), PBR_MATERIALS.brassGold());
    leg.position.y = 0.25;
    chair.add(leg);

    chair.position.set(Math.cos(angle) * 1.3, 0, Math.sin(angle) * 1.3);
    chair.rotation.y = -angle - Math.PI / 2;
    group.add(chair);
  });

  return group;
}

// 3. Beach Umbrella & Patio Table
export function createBeachTableMesh(): THREE.Group {
  const group = new THREE.Group();

  // Round wooden deck table
  const tableTop = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 20), PBR_MATERIALS.woodLight());
  tableTop.position.y = 0.9;
  group.add(tableTop);

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.5, 12), PBR_MATERIALS.brassGold());
  pole.position.y = 1.25;
  group.add(pole);

  // Striped Beach Umbrella Canopy (Cone with bright colors)
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.7, 16), PBR_MATERIALS.cushionRed());
  canopy.position.y = 2.4;
  group.add(canopy);

  // Umbrella Cap
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), PBR_MATERIALS.brassGold());
  cap.position.y = 2.75;
  group.add(cap);

  // 2 Beach Loungers / Chairs
  [-1.0, 1.0].forEach((xOff) => {
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.9), PBR_MATERIALS.woodLight());
    chair.position.set(xOff, 0.2, 0);
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.85), PBR_MATERIALS.neonCyan());
    cushion.position.set(xOff, 0.42, 0);
    group.add(chair);
    group.add(cushion);
  });

  return group;
}

// 4. Kitchen Industrial Stove & Oven
export function createKitchenStoveMesh(): THREE.Group {
  const group = new THREE.Group();

  // Stove Main Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.1), PBR_MATERIALS.stoveDark());
  body.position.y = 0.55;
  body.castShadow = true;
  group.add(body);

  // Stainless Top Plate
  const topPlate = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.06, 1.12), PBR_MATERIALS.steelMetal());
  topPlate.position.y = 1.13;
  group.add(topPlate);

  // 4 Burner Grates (Dark rings)
  const burnerGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16);
  const burnerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
  [
    [-0.45, 1.16, -0.28],
    [0.45, 1.16, -0.28],
    [-0.45, 1.16, 0.28],
    [0.45, 1.16, 0.28],
  ].forEach(([x, y, z]) => {
    const b = new THREE.Mesh(burnerGeo, burnerMat);
    b.position.set(x, y, z);
    group.add(b);
  });

  // Hot Pan on burner 1
  const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.08, 16), PBR_MATERIALS.steelMetal());
  pan.position.set(-0.45, 1.22, -0.28);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 0.04), PBR_MATERIALS.woodDark());
  handle.position.set(-0.25, 1.24, -0.28);
  group.add(pan);
  group.add(handle);

  // Front Control Knobs & Oven Window
  const ovenGlass = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 0.02), PBR_MATERIALS.screenBlack());
  ovenGlass.position.set(0, 0.5, 0.56);
  group.add(ovenGlass);

  [-0.6, -0.2, 0.2, 0.6].forEach((kx) => {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), PBR_MATERIALS.brassGold());
    knob.rotation.x = Math.PI / 2;
    knob.position.set(kx, 0.95, 0.57);
    group.add(knob);
  });

  return group;
}

// 5. Kitchen Prep Counter
export function createKitchenPrepMesh(): THREE.Group {
  const group = new THREE.Group();

  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.0, 1.0), PBR_MATERIALS.steelMetal());
  cabinet.position.y = 0.5;
  group.add(cabinet);

  // Wooden Cutting Board on top
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.5), PBR_MATERIALS.woodLight());
  board.position.set(-0.2, 1.03, 0);
  group.add(board);

  // Vegetable slices (Tomato/Lettuce)
  const tomato = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 8), PBR_MATERIALS.cushionRed());
  tomato.position.set(-0.2, 1.07, 0);
  group.add(tomato);

  // Knife
  const knife = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.05), PBR_MATERIALS.steelMetal());
  knife.position.set(0.35, 1.02, 0);
  knife.rotation.y = 0.4;
  group.add(knife);

  return group;
}

// 6. Smart Refrigerator
export function createKitchenFridgeMesh(): THREE.Group {
  const group = new THREE.Group();

  // Tall Brushed Steel Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.1), PBR_MATERIALS.steelMetal());
  body.position.y = 1.1;
  group.add(body);

  // 2 Front Door Panes with split
  const splitLine = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.18, 0.02), PBR_MATERIALS.stoveDark());
  splitLine.position.set(0, 1.1, 0.56);
  group.add(splitLine);

  // Handles
  [-0.1, 0.1].forEach((hx) => {
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.06), PBR_MATERIALS.stoveDark());
    handle.position.set(hx, 1.1, 0.59);
    group.add(handle);
  });

  // Digital Temperature Display
  const display = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.02), PBR_MATERIALS.neonCyan());
  display.position.set(-0.35, 1.6, 0.56);
  group.add(display);

  return group;
}

// 7. Order Pickup Counter
export function createKitchenPickupMesh(): THREE.Group {
  const group = new THREE.Group();

  const bar = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.05, 0.8), PBR_MATERIALS.woodDark());
  bar.position.y = 0.525;
  group.add(bar);

  const top = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.9), PBR_MATERIALS.woodLight());
  top.position.y = 1.07;
  group.add(top);

  // Brass Service Bell
  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), PBR_MATERIALS.brassGold());
  bell.position.set(0.6, 1.15, 0);
  group.add(bell);

  // Ready Food Plate
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.03, 16), PBR_MATERIALS.marbleWhite());
  plate.position.set(-0.4, 1.12, 0);
  const burger = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), PBR_MATERIALS.woodDark());
  burger.scale.set(1, 0.6, 1);
  burger.position.set(-0.4, 1.2, 0);
  group.add(plate);
  group.add(burger);

  return group;
}

// 8. Wall TV (Animated canvas texture or colorful display)
export function createWallTvMesh(): THREE.Group {
  const group = new THREE.Group();

  // Frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 0.08), PBR_MATERIALS.stoveDark());
  frame.position.y = 2.4;
  group.add(frame);

  // Display Screen
  const screen = new THREE.Mesh(new THREE.BoxGeometry(2.08, 1.18, 0.02), PBR_MATERIALS.neonCyan());
  screen.position.set(0, 2.4, 0.05);
  group.add(screen);

  // Wall Mount Bracket
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.1), PBR_MATERIALS.stoveDark());
  bracket.position.set(0, 2.4, -0.08);
  group.add(bracket);

  return group;
}

// 9. Modern AC (Klima) Unit
export function createAcUnitMesh(): THREE.Group {
  const group = new THREE.Group();

  // Main white box
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.45), PBR_MATERIALS.marbleWhite());
  box.position.y = 2.6;
  group.add(box);

  // Vent grill slats
  const vent = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.02), PBR_MATERIALS.stoveDark());
  vent.position.set(0, 2.45, 0.23);
  group.add(vent);

  // Cool Blue LED light
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), PBR_MATERIALS.neonCyan());
  led.position.set(0.65, 2.6, 0.23);
  group.add(led);

  return group;
}

// 10. Neon Wall Clock
export function createNeonClockMesh(): THREE.Group {
  const group = new THREE.Group();

  const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.08, 24), PBR_MATERIALS.stoveDark());
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 2.5;
  group.add(rim);

  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.02, 24), PBR_MATERIALS.neonCyan());
  face.rotation.x = Math.PI / 2;
  face.position.set(0, 2.5, 0.05);
  group.add(face);

  const handH = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.02), PBR_MATERIALS.screenBlack());
  handH.position.set(0, 2.58, 0.07);
  const handM = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.02), PBR_MATERIALS.screenBlack());
  handM.position.set(0.09, 2.5, 0.07);
  handM.rotation.z = -Math.PI / 3;
  group.add(handH);
  group.add(handM);

  return group;
}

// 11. Retro Jukebox
export function createJukeboxMesh(): THREE.Group {
  const group = new THREE.Group();

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 0.8), PBR_MATERIALS.woodDark());
  base.position.y = 0.7;
  group.add(base);

  // Dome Arch top
  const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.8, 16, 1, false, 0, Math.PI), PBR_MATERIALS.cushionRed());
  dome.rotation.z = Math.PI / 2;
  dome.rotation.x = Math.PI / 2;
  dome.position.y = 1.4;
  group.add(dome);

  // Neon rainbow arch trim
  const neonArch = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 16, Math.PI), PBR_MATERIALS.neonPink());
  neonArch.position.set(0, 1.4, 0.41);
  group.add(neonArch);

  // Center glass record viewer
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.05), PBR_MATERIALS.neonCyan());
  glass.position.set(0, 1.0, 0.41);
  group.add(glass);

  return group;
}

// 12. Potted Plant (Tropik Monstera)
export function createPlantMesh(): THREE.Group {
  const group = new THREE.Group();

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.6, 12), PBR_MATERIALS.terracotta());
  pot.position.y = 0.3;
  pot.castShadow = true;
  group.add(pot);

  const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.05, 12), PBR_MATERIALS.woodDark());
  soil.position.y = 0.58;
  group.add(soil);

  // 4 Broad tropical leaves
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + 0.3;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), PBR_MATERIALS.plantGreen());
    leaf.scale.set(1.2, 0.1, 0.7);
    leaf.position.set(Math.cos(angle) * 0.3, 0.8 + (i % 2) * 0.15, Math.sin(angle) * 0.3);
    leaf.rotation.y = angle;
    leaf.rotation.z = 0.4;
    group.add(leaf);
  }

  return group;
}

// 13. Sunset Painting
export function createPaintingMesh(): THREE.Group {
  const group = new THREE.Group();

  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 0.06), PBR_MATERIALS.brassGold());
  frame.position.y = 2.2;
  group.add(frame);

  const canvas = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.98, 0.02), PBR_MATERIALS.cushionGold());
  canvas.position.set(0, 2.2, 0.04);
  group.add(canvas);

  return group;
}

// 14. 2nd Floor VIP Lounge Set
export function createVipLoungeMesh(): THREE.Group {
  const group = new THREE.Group();

  // Luxury curved couch
  const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.8), PBR_MATERIALS.cushionGold());
  sofa.position.y = 0.3;
  group.add(sofa);

  const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 0.3), PBR_MATERIALS.cushionGold());
  sofaBack.position.set(0, 0.8, -0.3);
  group.add(sofaBack);

  // Low glass coffee table
  const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.8), PBR_MATERIALS.marbleWhite());
  coffeeTable.position.set(0, 0.4, 0.7);
  group.add(coffeeTable);

  const brassLegs = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), PBR_MATERIALS.brassGold());
  brassLegs.position.set(0, 0.2, 0.7);
  group.add(brassLegs);

  // Champagne bucket
  const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.16, 8), PBR_MATERIALS.brassGold());
  bucket.position.set(0, 0.52, 0.7);
  group.add(bucket);

  return group;
}

// 15. Palm Tree (Lush Tropical Fronds)
export function createPalmTreeMesh(): THREE.Group {
  const group = new THREE.Group();

  // Segmented textured trunk with slight natural lean
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.38, 4.4, 10);
  const trunk = new THREE.Mesh(trunkGeo, PBR_MATERIALS.woodDark());
  trunk.position.y = 2.2;
  trunk.rotation.z = 0.09;
  trunk.castShadow = true;
  group.add(trunk);

  // Trunk rings
  for (let ry = 0.8; ry <= 4.0; ry += 0.5) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24 - (ry * 0.02), 0.04, 6, 12), PBR_MATERIALS.woodLight());
    ring.rotation.x = Math.PI / 2;
    ring.position.set(trunk.position.x + ry * 0.04, ry, 0);
    group.add(ring);
  }

  // Multi-tier arching tropical palm fronds
  const frondCount = 10;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i * 2 * Math.PI) / frondCount;
    const tier = i % 2 === 0 ? 4.3 : 4.45;
    const frondGroup = new THREE.Group();
    frondGroup.position.set(0.18, tier, 0);
    frondGroup.rotation.y = angle;

    // Stem
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 2.4), PBR_MATERIALS.plantGreen());
    stem.position.set(0, 0, 1.2);
    stem.rotation.x = 0.32 + (i % 2) * 0.1;
    frondGroup.add(stem);

    // Leaflets along stem
    for (let lz = 0.4; lz <= 2.2; lz += 0.35) {
      const leafWidth = 0.8 - (lz * 0.25);
      const leaflet = new THREE.Mesh(new THREE.PlaneGeometry(leafWidth, 0.22), PBR_MATERIALS.plantGreen());
      leaflet.rotation.x = -Math.PI / 2;
      leaflet.position.set(0, -lz * 0.12, lz);
      frondGroup.add(leaflet);
    }

    group.add(frondGroup);
  }

  // 4 Coconuts
  const coconutMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
  [
    [-0.18, 4.15, 0.15],
    [0.18, 4.15, 0.15],
    [-0.15, 4.15, -0.15],
    [0.15, 4.15, -0.15],
  ].forEach(([cx, cy, cz]) => {
    const coconut = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), coconutMat);
    coconut.position.set(cx + 0.18, cy, cz);
    group.add(coconut);
  });

  return group;
}

// 16. Garden Lantern
export function createGardenLanternMesh(): THREE.Group {
  const group = new THREE.Group();

  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 2.2, 8), PBR_MATERIALS.stoveDark());
  post.position.y = 1.1;
  group.add(post);

  const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.35), PBR_MATERIALS.cushionGold());
  lantern.position.y = 2.2;
  group.add(lantern);

  const lanternCap = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.2, 4), PBR_MATERIALS.stoveDark());
  lanternCap.position.y = 2.5;
  lanternCap.rotation.y = Math.PI / 4;
  group.add(lanternCap);

  return group;
}

// 17. 2nd Floor Glass Railing
export function createGlassRailingMesh(): THREE.Group {
  const group = new THREE.Group();

  const glass = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.0, 0.06), PBR_MATERIALS.glassClear());
  glass.position.y = 0.5;
  group.add(glass);

  // Top chrome rail
  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.65, 8), PBR_MATERIALS.steelMetal());
  rail.rotation.z = Math.PI / 2;
  rail.position.y = 1.02;
  group.add(rail);

  // Posts
  [-1.7, 0, 1.7].forEach((px) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), PBR_MATERIALS.steelMetal());
    post.position.set(px, 0.5, 0);
    group.add(post);
  });

  return group;
}

// 18. 2nd Floor Cocktail Bar
export function createCocktailBarMesh(): THREE.Group {
  const group = new THREE.Group();

  const counter = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.15, 0.8), PBR_MATERIALS.woodDark());
  counter.position.y = 0.575;
  group.add(counter);

  const marbleTop = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.08, 0.95), PBR_MATERIALS.marbleWhite());
  marbleTop.position.y = 1.18;
  group.add(marbleTop);

  // 3 Bar Stools
  [-1.0, 0, 1.0].forEach((bx) => {
    const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 12), PBR_MATERIALS.cushionGold());
    stool.position.set(bx, 0.8, 0.65);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), PBR_MATERIALS.brassGold());
    leg.position.set(bx, 0.4, 0.65);
    group.add(stool);
    group.add(leg);
  });

  // Bottle shelf with colored glassware
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.5, 0.15), PBR_MATERIALS.screenBlack());
  shelf.position.set(0, 1.6, -0.4);
  group.add(shelf);

  [-0.8, -0.4, 0, 0.4, 0.8].forEach((bx, idx) => {
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.3, 8), idx % 2 === 0 ? PBR_MATERIALS.neonCyan() : PBR_MATERIALS.neonPink());
    bottle.position.set(bx, 1.5, -0.35);
    group.add(bottle);
  });

  return group;
}

// --- ROBLOX CHARACTER AVATARS (Chef, Waiter, Customer, VIP, Courier) ---

export interface CharacterMeshController {
  group: THREE.Group;
  head: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  heldProp?: THREE.Mesh;
  updateAnimation: (dt: number, isMoving: boolean, action?: string) => void;
}

export function createRobloxCharacter(
  type: 'chef' | 'waiter' | 'customer' | 'vip' | 'courier',
  primaryColorHex: string = '#3b82f6'
): CharacterMeshController {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
  const torsoMat = new THREE.MeshStandardMaterial({
    color: type === 'vip' ? 0xf59e0b : new THREE.Color(primaryColorHex),
    roughness: type === 'vip' ? 0.2 : 0.7,
    metalness: type === 'vip' ? 0.6 : 0.05,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: type === 'chef' ? 0xffffff : type === 'waiter' ? 0x1e293b : 0x334155,
    roughness: 0.7,
  });

  // Torso (Blocky Roblox torso)
  const torsoGeo = new THREE.BoxGeometry(0.6, 0.7, 0.35);
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 0.95;
  torso.castShadow = true;
  group.add(torso);

  // Head
  const headGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.55;
  head.castShadow = true;
  group.add(head);

  // Eyes & Smile on Head
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), eyeMat);
  eyeL.position.set(-0.1, 1.58, 0.21);
  const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.02), eyeMat);
  eyeR.position.set(0.1, 1.58, 0.21);
  const smile = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.02), eyeMat);
  smile.position.set(0, 1.48, 0.21);
  group.add(eyeL);
  group.add(eyeR);
  group.add(smile);

  // Arms (Left & Right)
  const armGeo = new THREE.BoxGeometry(0.22, 0.65, 0.25);
  const leftArm = new THREE.Mesh(armGeo, torsoMat);
  leftArm.position.set(-0.43, 0.95, 0);
  const rightArm = new THREE.Mesh(armGeo, torsoMat);
  rightArm.position.set(0.43, 0.95, 0);
  group.add(leftArm);
  group.add(rightArm);

  // Legs (Left & Right)
  const legGeo = new THREE.BoxGeometry(0.24, 0.65, 0.28);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.16, 0.35, 0);
  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.16, 0.35, 0);
  group.add(leftLeg);
  group.add(rightLeg);

  let heldProp: THREE.Mesh | undefined;

  // Custom Accessories by Character Type
  if (type === 'chef') {
    // Tall Chef Toque Hat
    const hatBase = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 12), PBR_MATERIALS.marbleWhite());
    hatBase.position.set(0, 1.78, 0);
    const hatPuff = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.25, 0.35, 12), PBR_MATERIALS.marbleWhite());
    hatPuff.position.set(0, 1.95, 0);
    group.add(hatBase);
    group.add(hatPuff);

    // Red neckerchief
    const kerchief = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.38), PBR_MATERIALS.cushionRed());
    kerchief.position.set(0, 1.32, 0);
    group.add(kerchief);

    // Spatula prop in right hand
    heldProp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.03), PBR_MATERIALS.steelMetal());
    heldProp.position.set(0.43, 0.7, 0.2);
    group.add(heldProp);
  } else if (type === 'waiter') {
    // Black Bowtie
    const bowtie = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.05), PBR_MATERIALS.stoveDark());
    bowtie.position.set(0, 1.3, 0.2);
    group.add(bowtie);

    // Waiter Serving Tray with plate
    heldProp = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.03, 16), PBR_MATERIALS.brassGold());
    heldProp.position.set(0, 0.95, 0.35);
    const cover = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), PBR_MATERIALS.steelMetal());
    cover.position.set(0, 1.05, 0.35);
    group.add(heldProp);
    group.add(cover);
  } else if (type === 'vip') {
    // Gold Crown & Sunglasses
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.22, 0.18, 5), PBR_MATERIALS.brassGold());
    crown.position.set(0, 1.82, 0);
    group.add(crown);

    const shades = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.05), PBR_MATERIALS.screenBlack());
    shades.position.set(0, 1.58, 0.22);
    group.add(shades);
  } else if (type === 'courier') {
    // Helmet
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 12), PBR_MATERIALS.cushionRed());
    helmet.position.set(0, 1.62, 0);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.1), PBR_MATERIALS.screenBlack());
    visor.position.set(0, 1.58, 0.2);
    group.add(helmet);
    group.add(visor);

    // Large Square Thermal Delivery Backpack
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.45), PBR_MATERIALS.cushionRed());
    backpack.position.set(0, 1.0, -0.4);
    group.add(backpack);
  } else {
    // Customer with hair or cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 12), PBR_MATERIALS.cushionBlue());
    cap.position.set(0, 1.78, 0);
    group.add(cap);
  }

  // Contact shadow disc on floor
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.4, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  group.add(shadow);

  let walkCycle = 0;
  const updateAnimation = (dt: number, isMoving: boolean, action?: string) => {
    if (isMoving) {
      walkCycle += dt * 8;
      const swing = Math.sin(walkCycle) * 0.45;
      leftLeg.rotation.x = swing;
      rightLeg.rotation.x = -swing;
      leftArm.rotation.x = -swing * 0.7;
      rightArm.rotation.x = swing * 0.7;
      group.position.y = Math.abs(Math.sin(walkCycle)) * 0.06;
    } else {
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = 0;
      rightArm.rotation.x = 0;
      group.position.y = 0;

      if (action === 'cooking') {
        const cookSpeed = Date.now() * 0.01;
        rightArm.rotation.x = Math.sin(cookSpeed) * 0.5 + 0.3;
      }
    }
  };

  return {
    group,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    heldProp,
    updateAnimation,
  };
}

// 19. Exterior LED Billboard with live rating score
export function createOutdoorBillboardMesh(): { group: THREE.Group; canvas: HTMLCanvasElement; texture: THREE.CanvasTexture; updateText: (stars: number, decor: number, name: string) => void } {
  const group = new THREE.Group();

  // Support steel pillar
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 4.5, 12), PBR_MATERIALS.stoveDark());
  pillar.position.y = 2.25;
  pillar.castShadow = true;
  group.add(pillar);

  // Large billboard board frame
  const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 0.3), PBR_MATERIALS.stoveDark());
  boardFrame.position.y = 5.2;
  group.add(boardFrame);

  // Dynamic Canvas Texture for live LED text
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const displayMat = new THREE.MeshBasicMaterial({ map: texture });
  const displayMesh = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.2, 0.02), displayMat);
  displayMesh.position.set(0, 5.2, 0.16);
  group.add(displayMesh);

  // Glowing neon frame trim
  const neonTop = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.08, 0.04), PBR_MATERIALS.neonCyan());
  neonTop.position.set(0, 6.35, 0.17);
  group.add(neonTop);

  const updateText = (stars: number, decor: number, name: string) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 256);

    // Border glow
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 244);

    // Restaurant Name
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name.substring(0, 24), 256, 48);

    // Stars & Rating
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 58px sans-serif';
    ctx.fillText(`★ ${stars.toFixed(1)} / 5.0`, 256, 125);

    // Sub-metrics
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`DEKOR PUANI: ${decor}  •  CANLI SAHİL PUANI`, 256, 175);

    // Status banner
    ctx.fillStyle = stars >= 4.5 ? '#22c55e' : '#eab308';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(stars >= 4.5 ? '🏆 ŞEHRİN EN İYİ SAHİL RESTORANI' : '✨ POPÜLER SAHİL MEKANI', 256, 220);

    texture.needsUpdate = true;
  };

  updateText(4.5, 120, 'Sahil Restoranı');

  return { group, canvas, texture, updateText };
}
