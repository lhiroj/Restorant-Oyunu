import * as THREE from 'three';
import { 
  GameState, 
  PlacedItem, 
  CustomerEntity, 
  StaffMember 
} from '../../types/game';
import { 
  createWoodTableMesh, 
  createMarbleTableMesh, 
  createBeachTableMesh, 
  createKitchenStoveMesh, 
  createKitchenPrepMesh, 
  createKitchenFridgeMesh, 
  createKitchenPickupMesh, 
  createWallTvMesh, 
  createAcUnitMesh, 
  createNeonClockMesh, 
  createJukeboxMesh, 
  createPlantMesh, 
  createPaintingMesh, 
  createVipLoungeMesh, 
  createPalmTreeMesh, 
  createGardenLanternMesh, 
  createGlassRailingMesh, 
  createCocktailBarMesh, 
  createRobloxCharacter, 
  CharacterMeshController, 
  createOutdoorBillboardMesh,
  PBR_MATERIALS 
} from './proceduralModels';
import { calculateCustomerBill } from '../logic';
import { sound } from '../../audio/soundEffects';

export interface FloatingNotification {
  id: string;
  text: string;
  color: string;
  x: number;
  y: number;
  z: number;
  life: number;
}

export class RestaurantSceneManager {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private isSoftwareGl: boolean = false;
  private animFrameId: number = 0;
  private clock: THREE.Clock;

  // Scene Root Groups
  private environmentGroup: THREE.Group = new THREE.Group();
  private buildingGroup: THREE.Group = new THREE.Group();
  private secondFloorGroup: THREE.Group = new THREE.Group();
  private furnitureGroup: THREE.Group = new THREE.Group();
  private charactersGroup: THREE.Group = new THREE.Group();
  private effectsGroup: THREE.Group = new THREE.Group();

  // Billboard
  private billboardController?: { updateText: (stars: number, decor: number, name: string) => void };

  // Camera Orbit & Controls
  private cameraTarget: THREE.Vector3 = new THREE.Vector3(0, 2, 0);
  private cameraRadius: number = 28;
  private cameraTheta: number = Math.PI / 4; // Horizontal angle
  private cameraPhi: number = Math.PI / 3.2; // Elevation angle
  private isPointerDown: boolean = false;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;
  private isPanning: boolean = false;

  // Ocean Animation
  private oceanMesh?: THREE.Mesh;

  // Floating notifications
  public floatingNotes: FloatingNotification[] = [];

  // Characters & Pathfinding references
  private customerControllers = new Map<string, { controller: CharacterMeshController; entity: CustomerEntity }>();
  private staffControllers = new Map<string, { controller: CharacterMeshController; member: StaffMember; currentTarget?: [number, number, number] }>();

  // Game callbacks
  private onCustomerPayCallback?: (amount: number, tip: number, isVip: boolean) => void;
  private onCustomerServedCallback?: (isVip: boolean) => void;

  // Active Placement Preview in Build Mode
  private previewMesh?: THREE.Group;
  private previewValid: boolean = true;
  public buildItemToPlace?: { id: string; modelType: string; floor: 1 | 2; width: number; depth: number };
  public buildRotation: number = 0;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private floorPlane: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  public previewCoords: { x: number; z: number; floor: 1 | 2 } = { x: 0, z: 0, floor: 1 };

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. Detect Software GL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Setup Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth || 800, container.clientHeight || 600);
    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x7dd3fc); // Sky Blue
    this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.012);

    this.camera = new THREE.PerspectiveCamera(
      45,
      (container.clientWidth || 800) / (container.clientHeight || 600),
      0.5,
      250
    );
    this.updateCameraPosition();

    // 4. Lighting Rig
    this.setupLighting();

    // 5. Build Environment (Beach + Ocean + City Skyline)
    this.buildEnvironment();

    // 6. Build Restaurant Base Structure
    this.buildRestaurantBase();

    // 7. Add Groups to Scene
    this.scene.add(this.environmentGroup);
    this.scene.add(this.buildingGroup);
    this.scene.add(this.secondFloorGroup);
    this.scene.add(this.furnitureGroup);
    this.scene.add(this.charactersGroup);
    this.scene.add(this.effectsGroup);

    // 8. Event Listeners
    this.setupEventListeners();

    // 9. Start Loop
    this.startLoop();
  }

  private setupLighting() {
    // Warm Key Light (Sun)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    sunLight.position.set(25, 45, 20);
    sunLight.castShadow = !this.isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 100;
    const d = 25;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Cool Sky & Warm Beach Ground Fill
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0xfde047, 0.9);
    this.scene.add(hemiLight);

    // Soft Ambient
    const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambLight);
  }

  private buildEnvironment() {
    // 1. Golden Sand Ground (Beach)
    const sandGeo = new THREE.PlaneGeometry(160, 160);
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xfde047, // Golden Sand
      roughness: 0.9,
      metalness: 0.05,
    });
    const sandMesh = new THREE.Mesh(sandGeo, sandMat);
    sandMesh.rotation.x = -Math.PI / 2;
    sandMesh.position.y = -0.02;
    sandMesh.receiveShadow = true;
    this.environmentGroup.add(sandMesh);

    // 2. Turquoise Ocean (In Front, Z > 18)
    const oceanGeo = new THREE.PlaneGeometry(160, 70, 32, 16);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.88,
    });
    this.oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    this.oceanMesh.rotation.x = -Math.PI / 2;
    this.oceanMesh.position.set(0, 0.05, 52);
    this.environmentGroup.add(this.oceanMesh);

    // Ocean shore foam line
    const foam = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 1.2),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })
    );
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(0, 0.06, 17.5);
    this.environmentGroup.add(foam);

    // 3. Back City Road & City Skyline (Behind Restaurant, Z < -16)
    const roadGeo = new THREE.PlaneGeometry(160, 12);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, -22);
    this.environmentGroup.add(road);

    // Road dashed line
    for (let rx = -70; rx < 70; rx += 6) {
      const stripe = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.3), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(rx, 0.03, -22);
      this.environmentGroup.add(stripe);
    }

    // Modern Skyscrapers & City Buildings (Backdrop)
    const buildingColors = [0x1e293b, 0x0f172a, 0x334155, 0x475569, 0x1e3a8a, 0x064e3b];
    for (let bx = -65; bx <= 65; bx += 12) {
      const height = 22 + Math.abs(Math.sin(bx * 0.4)) * 32;
      const width = 8 + Math.random() * 4;
      const depth = 8 + Math.random() * 4;
      const bColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];

      const towerGeo = new THREE.BoxGeometry(width, height, depth);
      const towerMat = new THREE.MeshStandardMaterial({
        color: bColor,
        roughness: 0.3,
        metalness: 0.6,
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(bx + Math.random() * 3, height / 2, -34 - Math.random() * 10);
      this.environmentGroup.add(tower);

      // Skyscraper illuminated window panels
      const winGeo = new THREE.PlaneGeometry(width * 0.85, height * 0.8);
      const winMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.5 ? 0xfef08a : 0x38bdf8,
        transparent: true,
        opacity: 0.5,
      });
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(tower.position.x, tower.position.y, tower.position.z + depth / 2 + 0.05);
      this.environmentGroup.add(win);
    }

    // 4. Palm trees along the beach path
    const palmPositions = [
      [-16, 0, 10],
      [16, 0, 10],
      [-22, 0, 4],
      [22, 0, 4],
      [-14, 0, -10],
      [18, 0, -10],
    ];
    palmPositions.forEach(([px, py, pz]) => {
      const palm = createPalmTreeMesh();
      palm.position.set(px, py, pz);
      this.environmentGroup.add(palm);
    });

    // 5. Outdoor Dynamic LED Billboard (Placed on side walkway by beach)
    const billboard = createOutdoorBillboardMesh();
    billboard.group.position.set(-13, 0, 6);
    billboard.group.rotation.y = 0.35;
    this.billboardController = billboard;
    this.environmentGroup.add(billboard.group);

    // 6. Delivery Scooter Bay (Parked on sidewalk)
    const scooterGroup = new THREE.Group();
    const scooterBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 1.2), PBR_MATERIALS.cushionRed());
    scooterBody.position.set(0, 0.4, 0);
    const scooterBox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.5), PBR_MATERIALS.cushionGold());
    scooterBox.position.set(0, 0.8, -0.4);
    const wheel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12), PBR_MATERIALS.stoveDark());
    wheel1.rotation.z = Math.PI / 2;
    wheel1.position.set(0, 0.2, 0.5);
    const wheel2 = wheel1.clone();
    wheel2.position.set(0, 0.2, -0.5);
    scooterGroup.add(scooterBody);
    scooterGroup.add(scooterBox);
    scooterGroup.add(wheel1);
    scooterGroup.add(wheel2);
    scooterGroup.position.set(-12, 0, -16);
    scooterGroup.rotation.y = -Math.PI / 2;
    this.environmentGroup.add(scooterGroup);
  }

  private buildRestaurantBase() {
    // Floor 1 Main Slab (20 x 16 meters)
    const floorGeo = new THREE.BoxGeometry(20, 0.2, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Clean light marble/tile floor
      roughness: 0.4,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, 0.1, 0);
    floorMesh.receiveShadow = true;
    this.buildingGroup.add(floorMesh);

    // Back Wall (City side with Kitchen & Storage)
    const backWallGeo = new THREE.BoxGeometry(20, 4.2, 0.4);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.8,
    });
    const backWall = new THREE.Mesh(backWallGeo, wallMat);
    backWall.position.set(0, 2.2, -8);
    this.buildingGroup.add(backWall);

    // Left Wall (With stylish window cutouts)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 16), wallMat);
    leftWall.position.set(-10, 2.2, 0);
    this.buildingGroup.add(leftWall);

    // Right Wall (Opens to beach patio)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 8), wallMat);
    rightWall.position.set(10, 2.2, -4);
    this.buildingGroup.add(rightWall);

    // Front Glass Wall with Entrance (Facing the ocean)
    const frontPillarMat = PBR_MATERIALS.stoveDark();
    [-10, 0, 10].forEach((px) => {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.2, 0.4), frontPillarMat);
      pillar.position.set(px, 2.2, 8);
      this.buildingGroup.add(pillar);
    });

    // Glass Panes on front
    const glassPane1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.8, 0.08), PBR_MATERIALS.glassClear());
    glassPane1.position.set(-7.5, 2.1, 8);
    const glassPane2 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.8, 0.08), PBR_MATERIALS.glassClear());
    glassPane2.position.set(7.5, 2.1, 8);
    this.buildingGroup.add(glassPane1);
    this.buildingGroup.add(glassPane2);

    // Front Signboard ("SAHİL RESTORANI")
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(10, 1.0, 0.3), PBR_MATERIALS.stoveDark());
    signBoard.position.set(0, 4.4, 8.2);
    const neonSign = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.8, 0.05), PBR_MATERIALS.neonCyan());
    neonSign.position.set(0, 4.4, 8.36);
    this.buildingGroup.add(signBoard);
    this.buildingGroup.add(neonSign);

    // Kitchen Wall Divider (Separating kitchen in back-left from dining)
    const kitchenWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 8), wallMat);
    kitchenWall.position.set(-2, 2.0, -4);
    this.buildingGroup.add(kitchenWall);

    // Beach Wooden Patio Deck on the Right (Connecting to beach)
    const patioDeck = new THREE.Mesh(new THREE.BoxGeometry(8, 0.25, 12), PBR_MATERIALS.woodLight());
    patioDeck.position.set(14, 0.12, 2);
    patioDeck.receiveShadow = true;
    this.buildingGroup.add(patioDeck);

    // Spiral / Staircase up to 2nd Floor
    const stairGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.5), PBR_MATERIALS.woodDark());
      step.position.set(0, i * 0.35, i * 0.45);
      stairGroup.add(step);
    }
    stairGroup.position.set(-8.5, 0.2, 2);
    this.buildingGroup.add(stairGroup);
  }

  // Update or Toggle 2nd Floor
  public updateSecondFloor(hasFloor: boolean) {
    this.secondFloorGroup.clear();

    if (!hasFloor) return;

    // Floor 2 Terrace Slab
    const floor2Geo = new THREE.BoxGeometry(20, 0.25, 16);
    const floor2Mesh = new THREE.Mesh(floor2Geo, PBR_MATERIALS.woodLight());
    floor2Mesh.position.set(0, 4.35, 0);
    floor2Mesh.receiveShadow = true;
    this.secondFloorGroup.add(floor2Mesh);

    // Glass Balustrades around the 2nd floor perimeter
    // Front railing
    const railFront = createGlassRailingMesh();
    railFront.position.set(-5, 4.5, 7.8);
    this.secondFloorGroup.add(railFront);
    const railFront2 = createGlassRailingMesh();
    railFront2.position.set(5, 4.5, 7.8);
    this.secondFloorGroup.add(railFront2);

    // Right railing
    const railRight = createGlassRailingMesh();
    railRight.rotation.y = Math.PI / 2;
    railRight.position.set(9.8, 4.5, 0);
    this.secondFloorGroup.add(railRight);

    // Left railing
    const railLeft = createGlassRailingMesh();
    railLeft.rotation.y = -Math.PI / 2;
    railLeft.position.set(-9.8, 4.5, 0);
    this.secondFloorGroup.add(railLeft);

    // Canopy / VIP Pergola Roof on 2nd Floor
    const pergolaPillarMat = PBR_MATERIALS.stoveDark();
    [
      [-8, 6.2, -6],
      [8, 6.2, -6],
      [-8, 6.2, 2],
      [8, 6.2, 2],
    ].forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.6, 0.3), pergolaPillarMat);
      p.position.set(px, py, pz);
      this.secondFloorGroup.add(p);
    });

    // Striped Sun Canopy Roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(17, 0.15, 10), PBR_MATERIALS.cushionGold());
    roof.position.set(0, 8.0, -2);
    this.secondFloorGroup.add(roof);
  }

  // Sync Placed Furniture Items from GameState
  public syncPlacedItems(items: PlacedItem[]) {
    this.furnitureGroup.clear();

    items.forEach((item) => {
      const mesh = this.instantiateFurnitureMesh(item.itemId);
      if (mesh) {
        mesh.position.set(item.x, item.floor === 2 ? 4.4 : 0.2, item.z);
        mesh.rotation.y = (item.rotation * Math.PI) / 180;
        this.furnitureGroup.add(mesh);
      }
    });
  }

  private instantiateFurnitureMesh(itemId: string): THREE.Group | null {
    switch (itemId) {
      case 'table_wood_standard':
        return createWoodTableMesh();
      case 'table_luxury_marble':
        return createMarbleTableMesh();
      case 'table_beach_umbrella':
        return createBeachTableMesh();
      case 'table_vip_rooftop':
        return createVipLoungeMesh();
      case 'kitchen_stove_pro':
        return createKitchenStoveMesh();
      case 'kitchen_prep_counter':
        return createKitchenPrepMesh();
      case 'kitchen_fridge_double':
        return createKitchenFridgeMesh();
      case 'kitchen_pickup_counter':
        return createKitchenPickupMesh();
      case 'tech_tv_wall':
        return createWallTvMesh();
      case 'tech_ac_unit':
        return createAcUnitMesh();
      case 'tech_neon_clock':
        return createNeonClockMesh();
      case 'tech_jukebox':
        return createJukeboxMesh();
      case 'decor_plant_monstera':
        return createPlantMesh();
      case 'decor_wall_painting':
        return createPaintingMesh();
      case 'garden_palm_tree':
        return createPalmTreeMesh();
      case 'garden_lantern_light':
        return createGardenLanternMesh();
      case 'floor2_glass_railing':
        return createGlassRailingMesh();
      case 'floor2_cocktail_bar':
        return createCocktailBarMesh();
      default:
        return createWoodTableMesh();
    }
  }

  // Update Billboard Score
  public updateBillboard(stars: number, decor: number, name: string) {
    if (this.billboardController) {
      this.billboardController.updateText(stars, decor, name);
    }
  }

  // Register Callbacks
  public registerCallbacks(
    onPay: (amount: number, tip: number, isVip: boolean) => void,
    onServed: (isVip: boolean) => void
  ) {
    this.onCustomerPayCallback = onPay;
    this.onCustomerServedCallback = onServed;
  }

  // Set Camera View Preset
  public setCameraPreset(preset: 'overview' | 'floor1' | 'floor2' | 'patio' | 'kitchen') {
    switch (preset) {
      case 'overview':
        this.cameraRadius = 32;
        this.cameraTheta = Math.PI / 4;
        this.cameraPhi = Math.PI / 3.4;
        this.cameraTarget.set(0, 2, 0);
        break;
      case 'floor1':
        this.cameraRadius = 18;
        this.cameraTheta = 0.2;
        this.cameraPhi = Math.PI / 3.8;
        this.cameraTarget.set(2, 1, 0);
        break;
      case 'floor2':
        this.cameraRadius = 22;
        this.cameraTheta = -Math.PI / 4;
        this.cameraPhi = Math.PI / 3.2;
        this.cameraTarget.set(0, 5, 0);
        break;
      case 'patio':
        this.cameraRadius = 20;
        this.cameraTheta = Math.PI / 2.5;
        this.cameraPhi = Math.PI / 3.5;
        this.cameraTarget.set(12, 1, 2);
        break;
      case 'kitchen':
        this.cameraRadius = 14;
        this.cameraTheta = -Math.PI / 1.8;
        this.cameraPhi = Math.PI / 3.2;
        this.cameraTarget.set(-5, 1, -4);
        break;
    }
    this.updateCameraPosition();
  }

  // Spawn a new customer
  public spawnCustomer(isVip: boolean = false, vipTitle?: string) {
    const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const outfitColors = ['#f43f5e', '#3b82f6', '#10b981', '#a855f7', '#f59e0b', '#06b6d4'];
    const color = outfitColors[Math.floor(Math.random() * outfitColors.length)];

    const controller = createRobloxCharacter(isVip ? 'vip' : 'customer', color);
    
    // Spawn at beach entrance (Z = 16)
    const startX = -2 + Math.random() * 6;
    controller.group.position.set(startX, 0.2, 16);
    this.charactersGroup.add(controller.group);

    const customerEntity: CustomerEntity = {
      id,
      name: isVip ? (vipTitle || 'Milyarder') : `Müşteri #${Math.floor(Math.random() * 900) + 100}`,
      isVip,
      vipTitle,
      state: 'entering',
      pos: [startX, 0.2, 16],
      targetPos: [0, 0.2, 5], // Walk inside toward dining area
      patience: 100,
      satisfaction: 100,
      patienceTimer: 60,
      eatingTimer: 6,
      outfitColor: color,
      hairColor: '#334155',
      billAmount: 45,
      tipAmount: 15,
    };

    if (isVip) {
      sound.playVipFanfare();
      this.addFloatingNote('🌟 VIP MÜŞTERİ GELDİ!', '#fbbf24', startX, 3.5, 16);
    }

    this.customerControllers.set(id, { controller, entity: customerEntity });
  }

  // Sync and Spawn Staff (Chefs, Waiters, Couriers)
  public syncStaff(staffList: StaffMember[]) {
    // Keep or create controllers for staff
    staffList.forEach((member) => {
      if (!this.staffControllers.has(member.id)) {
        const controller = createRobloxCharacter(member.role, member.avatarColor);
        // Default positions
        if (member.role === 'chef') {
          controller.group.position.set(-5 + Math.random() * 2, 0.2, -4);
        } else if (member.role === 'courier') {
          controller.group.position.set(-11, 0.2, -14);
        } else {
          controller.group.position.set(0 + Math.random() * 3, 0.2, 0);
        }
        this.charactersGroup.add(controller.group);
        this.staffControllers.set(member.id, { controller, member });
      }
    });
  }

  // Add a 3D Floating Notification (e.g. "+$50", "🌟 VIP Bahşiş!", "🍕 Sipariş Hazır!")
  public addFloatingNote(text: string, color: string, x: number, y: number, z: number) {
    this.floatingNotes.push({
      id: Math.random().toString(),
      text,
      color,
      x,
      y,
      z,
      life: 1.0,
    });
  }

  // Build Mode Preview Setup
  public setBuildItem(item: { id: string; modelType: string; floor: 1 | 2; width: number; depth: number } | undefined) {
    this.buildItemToPlace = item;
    if (this.previewMesh) {
      this.scene.remove(this.previewMesh);
      this.previewMesh = undefined;
    }

    if (item) {
      const mesh = this.instantiateFurnitureMesh(item.id);
      if (mesh) {
        this.previewMesh = mesh;
        // Make preview semi-transparent
        this.previewMesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshBasicMaterial({
              color: 0x22c55e, // Green preview
              transparent: true,
              opacity: 0.6,
            });
          }
        });
        this.scene.add(this.previewMesh);
      }
    }
  }

  public rotateBuildItem() {
    this.buildRotation = (this.buildRotation + 90) % 360;
    if (this.previewMesh) {
      this.previewMesh.rotation.y = (this.buildRotation * Math.PI) / 180;
    }
  }

  // Pointer & Camera Controls
  private setupEventListeners() {
    const el = this.renderer.domElement;

    el.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.isPanning = e.button === 2; // Right click to pan
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
      this.isPanning = false;
    });

    window.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Update build mode preview position
      if (this.buildItemToPlace && this.previewMesh) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectPoint = new THREE.Vector3();
        const floorY = this.buildItemToPlace.floor === 2 ? 4.4 : 0.2;
        this.floorPlane.constant = -floorY;

        if (this.raycaster.ray.intersectPlane(this.floorPlane, intersectPoint)) {
          // Snap to 1-meter grid
          const snappedX = Math.round(intersectPoint.x);
          const snappedZ = Math.round(intersectPoint.z);
          this.previewCoords = { x: snappedX, z: snappedZ, floor: this.buildItemToPlace.floor };
          this.previewMesh.position.set(snappedX, floorY, snappedZ);
          this.previewMesh.rotation.y = (this.buildRotation * Math.PI) / 180;
        }
      }

      // Camera Orbit
      if (this.isPointerDown) {
        const dx = e.clientX - this.lastPointerX;
        const dy = e.clientY - this.lastPointerY;

        if (this.isPanning) {
          this.cameraTarget.x -= dx * 0.03;
          this.cameraTarget.z -= dy * 0.03;
        } else {
          this.cameraTheta -= dx * 0.008;
          this.cameraPhi = Math.max(0.15, Math.min(Math.PI / 2.1, this.cameraPhi + dy * 0.008));
        }

        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        this.updateCameraPosition();
      }
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraRadius = Math.max(10, Math.min(55, this.cameraRadius + e.deltaY * 0.03));
      this.updateCameraPosition();
    }, { passive: false });

    window.addEventListener('resize', () => {
      if (!this.container) return;
      const w = this.container.clientWidth || 800;
      const h = this.container.clientHeight || 600;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  private updateCameraPosition() {
    this.camera.position.x = this.cameraTarget.x + this.cameraRadius * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    this.camera.position.y = this.cameraTarget.y + this.cameraRadius * Math.cos(this.cameraPhi);
    this.camera.position.z = this.cameraTarget.z + this.cameraRadius * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);
    this.camera.lookAt(this.cameraTarget);
  }

  // Autonomous Customer & Staff Tick
  private updateSimulation(dt: number) {
    // 1. Animate Ocean Waves
    if (this.oceanMesh) {
      this.oceanMesh.position.y = 0.05 + Math.sin(Date.now() * 0.002) * 0.04;
    }

    // 2. Animate Customers
    this.customerControllers.forEach(({ controller, entity }, id) => {
      const curPos = controller.group.position;
      const target = entity.targetPos;
      const dist = Math.hypot(target[0] - curPos.x, target[2] - curPos.z);

      if (entity.state === 'entering') {
        if (dist > 0.3) {
          const moveSpeed = (entity.isVip ? 3.0 : 2.5) * dt;
          curPos.x += ((target[0] - curPos.x) / dist) * moveSpeed;
          curPos.z += ((target[2] - curPos.z) / dist) * moveSpeed;
          controller.group.rotation.y = Math.atan2(target[0] - curPos.x, target[2] - curPos.z);
          controller.updateAnimation(dt, true);
        } else {
          // Reached lobby, find an available table
          entity.state = 'waiting_table';
          entity.targetPos = [2 + (Math.random() - 0.5) * 6, curPos.y, -1 + (Math.random() - 0.5) * 4];
          controller.updateAnimation(dt, false);
        }
      } else if (entity.state === 'waiting_table') {
        // Move towards assigned table
        if (dist > 0.2) {
          const moveSpeed = 2.0 * dt;
          curPos.x += ((target[0] - curPos.x) / dist) * moveSpeed;
          curPos.z += ((target[2] - curPos.z) / dist) * moveSpeed;
          controller.group.rotation.y = Math.atan2(target[0] - curPos.x, target[2] - curPos.z);
          controller.updateAnimation(dt, true);
        } else {
          entity.state = 'ordering';
          controller.updateAnimation(dt, false);
          sound.playBell();
          this.addFloatingNote(entity.isVip ? '👑 VIP Sipariş!' : '🍽️ Sipariş Verdi', '#38bdf8', curPos.x, 2.5, curPos.z);
        }
      } else if (entity.state === 'ordering') {
        entity.patienceTimer -= dt;
        if (entity.patienceTimer <= 55) { // Food arrives
          entity.state = 'eating';
          sound.playSizzle();
          this.addFloatingNote('😋 Yemek Geldi', '#22c55e', curPos.x, 2.5, curPos.z);
          if (this.onCustomerServedCallback) {
            this.onCustomerServedCallback(entity.isVip);
          }
        }
      } else if (entity.state === 'eating') {
        entity.eatingTimer -= dt;
        controller.updateAnimation(dt, false, 'eating');
        if (entity.eatingTimer <= 0) {
          entity.state = 'paying';
        }
      } else if (entity.state === 'paying') {
        // Customer pays and leaves tip
        const { bill, tip } = calculateCustomerBill(45, entity.isVip, 80, true);
        const total = bill + tip;
        sound.playCash();

        this.addFloatingNote(
          `+$${total} ${entity.isVip ? '💎 VIP!' : '💵'}`,
          entity.isVip ? '#fbbf24' : '#22c55e',
          curPos.x,
          2.6,
          curPos.z
        );

        if (this.onCustomerPayCallback) {
          this.onCustomerPayCallback(bill, tip, entity.isVip);
        }

        entity.state = 'leaving';
        entity.targetPos = [curPos.x > 0 ? 15 : -15, curPos.y, 18];
      } else if (entity.state === 'leaving') {
        if (dist > 0.5) {
          const moveSpeed = 3.0 * dt;
          curPos.x += ((target[0] - curPos.x) / dist) * moveSpeed;
          curPos.z += ((target[2] - curPos.z) / dist) * moveSpeed;
          controller.group.rotation.y = Math.atan2(target[0] - curPos.x, target[2] - curPos.z);
          controller.updateAnimation(dt, true);
        } else {
          // Despawn
          this.charactersGroup.remove(controller.group);
          this.customerControllers.delete(id);
        }
      }
    });

    // 3. Animate Autonomous Staff (Chefs & Waiters)
    this.staffControllers.forEach(({ controller, member }) => {
      if (member.role === 'chef') {
        controller.updateAnimation(dt, false, 'cooking');
      } else if (member.role === 'waiter') {
        // Waiter walks between tables and kitchen
        const time = Date.now() * 0.001 * member.speed;
        const targetX = Math.sin(time * 0.7) * 4;
        const targetZ = Math.cos(time * 0.5) * 3;
        const curPos = controller.group.position;
        const dist = Math.hypot(targetX - curPos.x, targetZ - curPos.z);

        if (dist > 0.2) {
          curPos.x += (targetX - curPos.x) * dt * 0.8;
          curPos.z += (targetZ - curPos.z) * dt * 0.8;
          controller.group.rotation.y = Math.atan2(targetX - curPos.x, targetZ - curPos.z);
          controller.updateAnimation(dt, true);
        } else {
          controller.updateAnimation(dt, false);
        }
      }
    });

    // 4. Update floating notifications
    for (let i = this.floatingNotes.length - 1; i >= 0; i--) {
      const note = this.floatingNotes[i];
      note.y += dt * 1.5;
      note.life -= dt * 0.8;
      if (note.life <= 0) {
        this.floatingNotes.splice(i, 1);
      }
    }
  }

  // Game Loop
  private startLoop() {
    const tick = () => {
      const dt = Math.min(this.clock.getDelta(), 0.05);

      this.updateSimulation(dt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.animFrameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.animFrameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.animFrameId = window.setTimeout(cb, 60);
      }
    };
    this.animFrameId = window.setTimeout(poll, 5);
  }

  public dispose() {
    cancelAnimationFrame(this.animFrameId);
    clearTimeout(this.animFrameId);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
