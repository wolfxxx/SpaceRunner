// Advanced Hangar System for Space Invaders Roguelite
// Provides ship selection, comprehensive upgrades, and loadout customization

/* global Phaser, window */

// Ship definitions with unique stats and capabilities
const SHIP_VARIANTS = {
  'interceptor': {
    id: 'interceptor',
    name: 'Interceptor',
    description: 'Fast and agile, perfect for hit-and-run tactics',
    stats: {
      speed: 180,
      health: 80,
      fireRate: 0.25,
      shieldCapacity: 2,
      specialSlots: 1,
      weaponSlots: 2
    },
    startingWeapon: 'rapid_laser',
    unlockCost: 0, // Starting ship
    sprite: 'ship_interceptor',
    color: '#00ffff'
  },
  'cruiser': {
    id: 'cruiser',
    name: 'Cruiser',
    description: 'Balanced design with good armor and firepower',
    stats: {
      speed: 140,
      health: 120,
      fireRate: 0.35,
      shieldCapacity: 3,
      specialSlots: 2,
      weaponSlots: 3
    },
    startingWeapon: 'twin_laser',
    unlockCost: 150,
    sprite: 'ship_cruiser',
    color: '#ffaa00'
  },
  'dreadnought': {
    id: 'dreadnought',
    name: 'Dreadnought',
    description: 'Heavy assault ship with massive firepower',
    stats: {
      speed: 100,
      health: 180,
      fireRate: 0.5,
      shieldCapacity: 4,
      specialSlots: 3,
      weaponSlots: 4
    },
    startingWeapon: 'heavy_cannon',
    unlockCost: 300,
    sprite: 'ship_dreadnought',
    color: '#ff4444'
  }
};

// Comprehensive upgrade tree
const UPGRADE_CATEGORIES = {
  'hull': {
    name: 'Hull Systems',
    color: '#44ff44',
    upgrades: {
      'reinforced_hull': {
        id: 'reinforced_hull',
        name: 'Reinforced Hull',
        description: 'Start each run with +1 life',
        maxLevel: 3,
        costs: [60, 120, 200],
        effects: ['+1 life', '+2 lives', '+3 lives'],
        category: 'hull'
      },
      'adaptive_armor': {
        id: 'adaptive_armor',
        name: 'Adaptive Armor',
        description: 'Reduce damage taken after consecutive hits',
        maxLevel: 3,
        costs: [80, 150, 250],
        effects: ['10% reduction', '20% reduction', '30% reduction'],
        category: 'hull'
      },
      'emergency_repair': {
        id: 'emergency_repair',
        name: 'Emergency Repair',
        description: 'Automatically repair when health is critical',
        maxLevel: 2,
        costs: [100, 200],
        effects: ['1 repair/run', '2 repairs/run'],
        category: 'hull'
      }
    }
  },
  'weapons': {
    name: 'Weapon Systems',
    color: '#ff4444',
    upgrades: {
      'weapon_damage': {
        id: 'weapon_damage',
        name: 'Enhanced Targeting',
        description: 'Increase base weapon damage',
        maxLevel: 5,
        costs: [40, 80, 140, 220, 320],
        effects: ['+20%', '+40%', '+60%', '+80%', '+100%'],
        category: 'weapons'
      },
      'fire_rate': {
        id: 'fire_rate',
        name: 'Rapid Cycling',
        description: 'Increase weapon fire rate',
        maxLevel: 4,
        costs: [50, 100, 180, 280],
        effects: ['+15%', '+30%', '+50%', '+75%'],
        category: 'weapons'
      },
      'pierce_enhancement': {
        id: 'pierce_enhancement',
        name: 'Pierce Capacitor',
        description: 'Piercing shot charges faster',
        maxLevel: 3,
        costs: [45, 90, 160],
        effects: ['+25%', '+50%', '+100%'],
        category: 'weapons'
      }
    }
  },
  'systems': {
    name: 'Ship Systems',
    color: '#4444ff',
    upgrades: {
      'shield_capacity': {
        id: 'shield_capacity',
        name: 'Shield Matrix',
        description: 'Increase maximum shield capacity',
        maxLevel: 4,
        costs: [70, 130, 220, 350],
        effects: ['+1 shield', '+2 shields', '+3 shields', '+4 shields'],
        category: 'systems'
      },
      'combo_extension': {
        id: 'combo_extension',
        name: 'Combo Stabilizer',
        description: 'Combo multiplier decays slower',
        maxLevel: 3,
        costs: [60, 120, 200],
        effects: ['+2s duration', '+4s duration', '+6s duration'],
        category: 'systems'
      },
      'salvage_boost': {
        id: 'salvage_boost',
        name: 'Salvage Scanner',
        description: 'Increase salvage earned from all sources',
        maxLevel: 5,
        costs: [50, 100, 170, 260, 380],
        effects: ['+10%', '+20%', '+35%', '+50%', '+75%'],
        category: 'systems'
      }
    }
  }
};

// Active abilities system
const ACTIVE_ABILITIES = {
  'dash': {
    id: 'dash',
    name: 'Phase Dash',
    description: 'Rapid movement with brief invincibility',
    cooldown: 8,
    energyCost: 25,
    unlockCost: 50, // Halved from 100
    unlockCurrency: 'cores',
    maxLevel: 3,
    upgradeCosts: [25, 50], // Halved from [50, 100]
    effects: ['Basic dash', 'Longer distance', 'Damages enemies']
  },
  'time_slow': {
    id: 'time_slow',
    name: 'Temporal Field',
    description: 'Slow down time for precise maneuvering',
    cooldown: 15,
    energyCost: 40,
    unlockCost: 75, // Halved from 150
    unlockCurrency: 'cores',
    maxLevel: 3,
    upgradeCosts: [37, 75], // Halved from [75, 150]
    effects: ['3s duration', '5s duration', '7s + damage boost']
  },
  'orbital_strike': {
    id: 'orbital_strike',
    name: 'Orbital Strike',
    description: 'Call down devastating area damage',
    cooldown: 20,
    energyCost: 50,
    unlockCost: 100, // Halved from 200
    unlockCurrency: 'cores',
    maxLevel: 3,
    upgradeCosts: [50, 100], // Halved from [100, 200]
    effects: ['Single strike', 'Double strike', 'Triple strike']
  },
  'shield_burst': {
    id: 'shield_burst',
    name: 'Shield Burst',
    description: 'Temporary invincibility and damage reflection',
    cooldown: 12,
    energyCost: 30,
    unlockCost: 60, // Halved from 120
    unlockCurrency: 'cores',
    maxLevel: 3,
    upgradeCosts: [30, 60], // Halved from [60, 120]
    effects: ['2s invincible', '3s invincible', '4s + reflects damage']
  }
};

// Hangar Scene - Complete UI system
class HangarScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HangarScene' });
    this.selectedShip = 'interceptor';
    this.activeTab = 'ships';
    this.selectedUpgrade = null;
    this.currentLoadout = {};
  }

  create() {
    console.log('[Hangar] HangarScene create() called');
    const { width, height } = this.scale;
    console.log(`[Hangar] Screen dimensions: ${width}x${height}`);
    
    // Professional background with gradient effect
    this.add.rectangle(width/2, height/2, width, height, 0x001122, 0.95);
    
    // Create main UI panels
    this.createMainPanels();
    
    // Header with professional styling
    this.createHeader();
    
    // Currency display in top-right
    this.createCurrencyDisplay();
    
    // Set initial active tab before creating UI elements
    this.activeTab = 'ships';
    
    // Navigation tabs with professional styling
    this.createTabSystem();
    
    // Main content area with proper container
    this.contentContainer = this.add.container(0, 0).setDepth(10);
    console.log('[Hangar] Content container created');
    
    // Navigation buttons with professional styling
    this.createNavigationButtons();
    
    // Initialize with ships tab content
    console.log('[Hangar] Initializing with ships tab...');
    this.switchTab('ships');
  }

  createMainPanels() {
    const { width, height } = this.scale;
    
    // Main content panel
    this.mainPanel = this.add.rectangle(width/2, height/2 + 20, width - 40, height - 120, 0x112233, 0.8)
      .setStrokeStyle(2, 0x334455)
      .setDepth(5);
    
    // Header panel
    this.headerPanel = this.add.rectangle(width/2, 60, width - 40, 80, 0x223344, 0.9)
      .setStrokeStyle(2, 0x445566)
      .setDepth(15);
    
    // Tab panel
    this.tabPanel = this.add.rectangle(width/2, 120, width - 40, 50, 0x223344, 0.7)
      .setStrokeStyle(1, 0x445566)
      .setDepth(20);
    
    // Footer panel
    this.footerPanel = this.add.rectangle(width/2, height - 40, width - 40, 60, 0x223344, 0.9)
      .setStrokeStyle(2, 0x445566)
      .setDepth(15);
  }

  createHeader() {
    const { width } = this.scale;
    
    // Main title with professional styling
    this.add.text(width/2, 40, 'HANGAR BAY', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#00ffff',
      stroke: '#004444',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(30);
    
    // Subtitle
    this.add.text(width/2, 70, 'Ship Configuration & Loadout', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(30);
    
    // Help button
    this.createHelpButton();
  }

  createHelpButton() {
    const { width, height } = this.scale;
    
    // Help button in top-left corner to avoid UI overlap
    const helpBtn = this.add.text(30, 30, '?', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#00ffff',
      backgroundColor: '#001133',
      padding: { x: 12, y: 8 }
    }).setOrigin(0, 0).setInteractive({ useHandCursor: true }).setDepth(40);
    
    helpBtn.on('pointerdown', () => this.showHelpMenu());
    helpBtn.on('pointerover', () => helpBtn.setColor('#ffffff'));
    helpBtn.on('pointerout', () => helpBtn.setColor('#00ffff'));
  }

  createNavigationButtons() {
    const { width, height } = this.scale;
    const footerCenterY = height - 40; // Center of the footer panel
    const footerLeft = 20; // Left edge of footer panel
    const footerRight = width - 20; // Right edge of footer panel
    
    // Back button with professional styling
    const backBtn = this.add.rectangle(footerLeft + 100, footerCenterY, 160, 40, 0x334455, 0.8)
      .setStrokeStyle(2, 0x556677)
      .setInteractive({ useHandCursor: true })
      .setDepth(50)
      .on('pointerdown', () => this.scene.start('StartScene'))
      .on('pointerover', function() { 
        this.setFillStyle(0x445566, 0.9);
        this.setStrokeStyle(2, 0x667788);
      })
      .on('pointerout', function() { 
        this.setFillStyle(0x334455, 0.8);
        this.setStrokeStyle(2, 0x556677);
      });
    
    this.add.text(footerLeft + 100, footerCenterY, '← Back to Menu', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(51);

    // Launch button with professional styling
    const launchBtn = this.add.rectangle(footerRight - 100, footerCenterY, 180, 40, 0x004400, 0.8)
      .setStrokeStyle(2, 0x006600)
      .setInteractive({ useHandCursor: true })
      .setDepth(50)
      .on('pointerdown', () => this.launchMission())
      .on('pointerover', function() { 
        this.setFillStyle(0x005500, 0.9);
        this.setStrokeStyle(2, 0x008800);
      })
      .on('pointerout', function() { 
        this.setFillStyle(0x004400, 0.8);
        this.setStrokeStyle(2, 0x006600);
      });
    
    this.add.text(footerRight - 100, footerCenterY, 'Launch Mission →', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5).setDepth(51);
  }

  createCurrencyDisplay() {
    const { width } = this.scale;
    const meta = this.getMetaState();
    const salvage = meta.salvage || 0;
    const cores = meta.cores || 0;

    // Currency panel background
    const currencyPanel = this.add.rectangle(width - 120, 60, 200, 50, 0x223344, 0.9)
      .setStrokeStyle(2, 0x445566)
      .setDepth(25);
    
    // Salvage display
    this.add.text(width - 140, 50, 'SALVAGE', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(30);
    
    this.salvageText = this.add.text(width - 140, 65, salvage.toString(), {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5).setDepth(30);
    
    // Cores display
    this.add.text(width - 100, 50, 'CORES', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(30);
    
    this.coresText = this.add.text(width - 100, 65, cores.toString(), {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#8844ff'
    }).setOrigin(0.5).setDepth(30);
  }

  createTabSystem() {
    const { width } = this.scale;
    const tabPanelWidth = width - 40; // Tab panel width
    const tabWidth = 80; // Individual tab width
    const tabSpacing = (tabPanelWidth - (4 * tabWidth)) / 5; // Equal spacing between tabs
    const startX = 20 + tabSpacing; // Start position with margin
    
    const tabs = [
      { key: 'ships', label: 'Ships', x: startX + (tabWidth + tabSpacing) * 0 },
      { key: 'upgrades', label: 'Upgrades', x: startX + (tabWidth + tabSpacing) * 1 },
      { key: 'abilities', label: 'Abilities', x: startX + (tabWidth + tabSpacing) * 2 },
      { key: 'loadout', label: 'Loadout', x: startX + (tabWidth + tabSpacing) * 3 }
    ];

    this.tabButtons = {};
    
    tabs.forEach(tab => {
      // Tab button background
      const isActive = this.activeTab === tab.key;
      const tabBg = this.add.rectangle(tab.x, 120, 80, 35, 
        isActive ? 0x445566 : 0x334455, 
        isActive ? 0.9 : 0.7)
        .setStrokeStyle(2, isActive ? 0x00ffff : 0x556677)
        .setInteractive({ useHandCursor: true })
        .setDepth(100)
        .on('pointerdown', () => {
          console.log(`[Hangar] Switching to tab: ${tab.key}`);
          this.switchTab(tab.key);
        })
        .on('pointerover', function() { 
          if (!isActive) {
            this.setFillStyle(0x445566, 0.8);
            this.setStrokeStyle(2, 0x667788);
          }
        })
        .on('pointerout', function() { 
          if (!isActive) {
            this.setFillStyle(0x334455, 0.7);
            this.setStrokeStyle(2, 0x556677);
          }
        });

      // Tab button text
      const button = this.add.text(tab.x, 120, tab.label, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: isActive ? '#00ffff' : '#aaaaaa'
      }).setOrigin(0.5).setDepth(101);

      this.tabButtons[tab.key] = { bg: tabBg, text: button };
      console.log(`[Hangar] Created tab button: ${tab.key} at (${tab.x}, 120)`);
    });
  }

  switchTab(tabKey) {
    console.log(`[Hangar] switchTab called with: ${tabKey}`);
    this.activeTab = tabKey;
    
    // Update tab button colors and backgrounds
    Object.keys(this.tabButtons).forEach(key => {
      const tab = this.tabButtons[key];
      const isActive = key === tabKey;
      
      // Update background
      tab.bg.setFillStyle(isActive ? 0x445566 : 0x334455, isActive ? 0.9 : 0.7);
      tab.bg.setStrokeStyle(2, isActive ? 0x00ffff : 0x556677);
      
      // Update text
      tab.text.setColor(isActive ? '#00ffff' : '#aaaaaa');
    });

    // Clear all content - remove all objects created in previous tabs
    this.clearAllContent();

    // Show appropriate content
    switch(tabKey) {
      case 'ships':
        console.log('[Hangar] Showing ships tab');
        this.showShipsTab();
        break;
      case 'upgrades':
        console.log('[Hangar] Showing upgrades tab');
        this.showUpgradesTab();
        break;
      case 'abilities':
        console.log('[Hangar] Showing abilities tab');
        this.showAbilitiesTab();
        break;
      case 'loadout':
        console.log('[Hangar] Showing loadout tab');
        this.showLoadoutTab();
        break;
      default:
        console.warn(`[Hangar] Unknown tab: ${tabKey}`);
    }
  }

  clearAllContent() {
    console.log('[Hangar] Clearing all content...');
    
    // Ensure contentContainer exists
    if (!this.contentContainer) {
      console.warn('[Hangar] contentContainer not found, creating it');
      this.contentContainer = this.add.container(0, 0);
    }
    
    // Log how many objects are being removed
    const objectCount = this.contentContainer.length;
    console.log(`[Hangar] Removing ${objectCount} objects from content container`);
    
    // Only clear content from the content container - this is the safe way
    this.contentContainer.removeAll(true);
    
    // Verify clearing worked
    const remainingCount = this.contentContainer.length;
    console.log(`[Hangar] Content clearing complete. Remaining objects: ${remainingCount}`);
  }

  showShipsTab() {
    const { width, height } = this.scale;
    const startY = height/2 - 80; // Position higher to avoid footer interference
    
    // Ship selection grid
    const shipKeys = Object.keys(SHIP_VARIANTS);
    const meta = this.getMetaState();
    
    console.log('[Hangar] showShipsTab - meta state:', meta);
    
    shipKeys.forEach((shipKey, index) => {
      const ship = SHIP_VARIANTS[shipKey];
      const x = width/2 - 200 + (index * 200); // Center ships horizontally
      const y = startY + 50;
      
      // Ship card background
      const isSelected = this.selectedShip === shipKey;
      const isUnlocked = ship.unlockCost === 0 || (meta.unlocks && meta.unlocks[`ship_${shipKey}`]);
      
      console.log(`Ship ${shipKey}: unlockCost=${ship.unlockCost}, isUnlocked=${isUnlocked}, meta.unlocks=`, meta.unlocks);
      console.log(`Ship ${shipKey}: Looking for unlock key 'ship_${shipKey}' in meta.unlocks:`, meta.unlocks && meta.unlocks[`ship_${shipKey}`]);
      
      const cardBg = this.add.rectangle(x, y, 180, 240, 0x112233, 0.8)
        .setStrokeStyle(2, isSelected ? 0x00ffff : (isUnlocked ? 0x444444 : 0x884444))
        .setDepth(20); // Background depth
      
      if (isUnlocked) {
        cardBg.setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.selectShip(shipKey));
      }

      // Ship visual representation (placeholder)
      const shipVisual = this.add.rectangle(x, y - 60, 60, 40, parseInt(ship.color.replace('#', '0x')))
        .setDepth(25); // Visual depth
      
      // Ship name
      const shipName = this.add.text(x, y - 10, ship.name, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: isUnlocked ? '#ffffff' : '#666666'
      }).setOrigin(0.5).setDepth(30); // Text depth

      // Ship description
      const shipDesc = this.add.text(x, y + 10, ship.description, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: isUnlocked ? '#cccccc' : '#555555',
        wordWrap: { width: 160 }
      }).setOrigin(0.5).setDepth(30); // Text depth
      
      // Add all elements to contentContainer
      this.contentContainer.add([cardBg, shipVisual, shipName, shipDesc]);

      // Stats display
      const statsY = y + 50;
      const stats = [
        `Speed: ${ship.stats.speed}`,
        `Health: ${ship.stats.health}`,
        `Shields: ${ship.stats.shieldCapacity}`,
        `Weapon Slots: ${ship.stats.weaponSlots}`
      ];

      const statTexts = [];
      stats.forEach((stat, i) => {
        const statText = this.add.text(x, statsY + (i * 12), stat, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: isUnlocked ? '#aaaaaa' : '#444444'
        }).setOrigin(0.5).setDepth(30); // Text depth
        statTexts.push(statText);
      });
      
      // Add stats to contentContainer
      this.contentContainer.add(statTexts);

      // Unlock cost (if locked)
      if (!isUnlocked) {
        const unlockCostText = this.add.text(x, y + 100, `Unlock: ${ship.unlockCost} Salvage`, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#ff6666'
        }).setOrigin(0.5).setDepth(30); // Text depth
        
        this.contentContainer.add(unlockCostText);

        // Unlock button
        if ((meta.salvage || 0) >= ship.unlockCost) {
          console.log(`Ship ${shipKey}: Player has ${meta.salvage} salvage, costs ${ship.unlockCost} - showing unlock button`);
          const unlockBtn = this.add.text(x, y + 115, '[UNLOCK]', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#00ff00'
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          .setDepth(40) // High depth for interactive elements
          .on('pointerdown', () => {
            console.log(`Attempting to unlock ship ${shipKey}`);
            this.unlockShip(shipKey);
          });
          
          this.contentContainer.add(unlockBtn);
        } else {
          console.log(`Ship ${shipKey}: Player has ${meta.salvage} salvage, costs ${ship.unlockCost} - NOT showing unlock button`);
        }
      }

      // Show ship status
      if (isUnlocked) {
        // Show ship stats for unlocked ships
        const statsText = this.add.text(x, y + 130, `Speed: ${ship.stats.speed} | Health: ${ship.stats.health}`, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(30);
        
        this.contentContainer.add(statsText);
      } else {
        // For locked ships, show lock status
        const lockStatus = this.add.text(x, y + 130, 'LOCKED', {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#ff6666'
        }).setOrigin(0.5).setDepth(30);
        
        this.contentContainer.add(lockStatus);
      }
    });
  }

  showUpgradesTab() {
    console.log('[Hangar] showUpgradesTab called');
    console.log('[Hangar] RunManager available:', !!window.RunManager);
    console.log('[Hangar] ENABLE_ROGUELITE:', !!window.ENABLE_ROGUELITE);
    
    const { width, height } = this.scale;
    const startY = height/2 - 80; // Position higher to avoid footer interference
    const meta = this.getMetaState();
    
    // Category tabs
    const categories = Object.keys(UPGRADE_CATEGORIES);
    const categoryHeaderY = startY - 40; // Position headers higher up
    const upgradesStartY = startY + 20; // Position upgrade blocks below headers
    
    console.log('[Hangar] Categories to display:', categories);
    
    categories.forEach((catKey, index) => {
      const category = UPGRADE_CATEGORIES[catKey];
      const x = 100 + (index * 150);
      
      const categoryText = this.add.text(x, categoryHeaderY, category.name, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: category.color
      }).setOrigin(0.5);
      
      this.contentContainer.add(categoryText);

      // Upgrades in this category
      const upgradeKeys = Object.keys(category.upgrades);
      upgradeKeys.forEach((upgradeKey, upgradeIndex) => {
        const upgrade = category.upgrades[upgradeKey];
        const upgradeY = upgradesStartY + (upgradeIndex * 80);
        
        // Current level
        const currentLevel = (meta.unlocks && meta.unlocks[upgradeKey]) || 0;
        const maxLevel = upgrade.maxLevel;
        const canUpgrade = currentLevel < maxLevel;
        const cost = canUpgrade ? upgrade.costs[currentLevel] : 0;
        const canAfford = (meta.salvage || 0) >= cost;
        
        console.log('[Hangar] Upgrade level calculation for', upgradeKey, ':', {
          currentLevel,
          maxLevel,
          canUpgrade,
          cost,
          canAfford,
          metaUnlocks: meta.unlocks,
          upgradeKeyInUnlocks: meta.unlocks && meta.unlocks[upgradeKey]
        });
        console.log('[Hangar] Affordability check for', upgradeKey, ':', {
          salvage: meta.salvage,
          cost: cost,
          canAfford: canAfford,
          salvageType: typeof meta.salvage,
          costType: typeof cost,
          comparison: `${meta.salvage} >= ${cost} = ${canAfford}`
        });
        
        console.log('[Hangar] Upgrade display:', upgradeKey, {
          currentLevel,
          maxLevel,
          canUpgrade,
          cost,
          canAfford,
          meta: meta.unlocks,
          upgrade: upgrade
        });

        // Upgrade card - larger to prevent text overlap
        const cardBg = this.add.rectangle(x, upgradeY, 160, 90, 0x223344, 0.7)
          .setStrokeStyle(1, canUpgrade && canAfford ? 0x00ff00 : 0x444444)
          .setDepth(20);
        
        this.contentContainer.add(cardBg);

        // Upgrade name and level
        const nameText = this.add.text(x, upgradeY - 25, upgrade.name, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#ffffff'
        }).setOrigin(0.5).setDepth(30);
        
        this.contentContainer.add(nameText);

        const levelText = this.add.text(x, upgradeY - 10, `Level ${currentLevel}/${maxLevel}`, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(30);
        
        this.contentContainer.add(levelText);

        // Current effect
        if (currentLevel > 0) {
          const effectText = this.add.text(x, upgradeY + 5, upgrade.effects[currentLevel - 1], {
            fontFamily: 'monospace',
            fontSize: '9px',
            color: '#00ff00',
            wordWrap: { width: 140 }
          }).setOrigin(0.5).setDepth(30);
          
          this.contentContainer.add(effectText);
        }

        // Upgrade button
        if (canUpgrade) {
          console.log('[Hangar] Creating upgrade button for:', upgradeKey, 'cost:', cost, 'canAfford:', canAfford);
          const buttonColor = canAfford ? '#00ff00' : '#666666';
          console.log('[Hangar] Button color will be:', buttonColor, 'for upgrade:', upgradeKey);
          const upgradeBtn = this.add.text(x, upgradeY + 30, `Upgrade (${cost})`, {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: buttonColor
          }).setOrigin(0.5).setDepth(40);

          if (canAfford) {
            console.log('[Hangar] Setting up interactive button for:', upgradeKey);
            upgradeBtn.setInteractive({ useHandCursor: true })
              .on('pointerdown', (pointer, localX, localY, event) => {
                console.log('[Hangar] Button clicked for upgrade:', upgradeKey);
                if(event && event.stopPropagation) event.stopPropagation();
                this.purchaseUpgrade(upgradeKey, cost);
              })
              .on('pointerover', function() {
                console.log('[Hangar] Button hovered:', upgradeKey);
                this.setColor('#ffffff');
              })
              .on('pointerout', function() {
                console.log('[Hangar] Button unhovered:', upgradeKey);
                this.setColor(buttonColor);
              });
            
            // Test if button is actually interactive
            console.log('[Hangar] Button interactive state:', upgradeBtn.input);
            console.log('[Hangar] Button position:', { x: upgradeBtn.x, y: upgradeBtn.y, visible: upgradeBtn.visible });
            console.log('[Hangar] Button depth:', upgradeBtn.depth);
            console.log('[Hangar] Button parent:', upgradeBtn.parent);
          } else {
            console.log('[Hangar] Button created but NOT interactive for:', upgradeKey, 'because canAfford is false');
          }
          
          this.contentContainer.add(upgradeBtn);
        } else {
          const maxLevelText = this.add.text(x, upgradeY + 25, 'MAX LEVEL', {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#ffaa00'
          }).setOrigin(0.5);
          
          this.contentContainer.add(maxLevelText);
        }
      });
    });
  }

  showAbilitiesTab() {
    const { width, height } = this.scale;
    const startY = height/2 - 80; // Position higher to avoid footer interference
    const meta = this.getMetaState();
    
    // Abilities grid
    const abilityKeys = Object.keys(ACTIVE_ABILITIES);
    
    abilityKeys.forEach((abilityKey, index) => {
      const ability = ACTIVE_ABILITIES[abilityKey];
      const x = width/2 - 150 + (index % 2) * 300; // Center abilities horizontally
      const y = startY + Math.floor(index / 2) * 140; // Increased spacing
      
      const isUnlocked = meta.unlocks && meta.unlocks[`ability_${abilityKey}`];
      const currentLevel = (meta.unlocks && meta.unlocks[`${abilityKey}_level`]) || 0;
      
      // Check if ability can be afforded (for unlockable abilities)
      const canAfford = !isUnlocked && (meta[ability.unlockCurrency] || 0) >= ability.unlockCost;
      
      console.log('[Hangar] Ability affordability check for', abilityKey, ':', {
        isUnlocked,
        currentLevel,
        unlockCurrency: ability.unlockCurrency,
        metaCurrency: meta[ability.unlockCurrency],
        unlockCost: ability.unlockCost,
        canAfford,
        comparison: `${meta[ability.unlockCurrency]} >= ${ability.unlockCost} = ${canAfford}`
      });
      
      // Ability card - larger to prevent overlap
      const cardBg = this.add.rectangle(x, y, 280, 120, 0x332244, 0.8)
        .setStrokeStyle(2, isUnlocked ? 0x8844ff : (canAfford ? 0x00ff88 : 0x444444))
        .setDepth(20);

      // Ability name - bright if unlocked or affordable
      const nameColor = isUnlocked ? '#ffffff' : (canAfford ? '#00ff00' : '#888888');
      console.log('[Hangar] Ability name color for', abilityKey, ':', nameColor, '(isUnlocked:', isUnlocked, ', canAfford:', canAfford, ')');
      const nameText = this.add.text(x, y - 40, ability.name, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: nameColor
      }).setOrigin(0.5).setDepth(30);
      
      this.contentContainer.add(nameText);

      // Description - bright if unlocked or affordable
      const descColor = isUnlocked ? '#cccccc' : (canAfford ? '#88ff88' : '#777777');
      console.log('[Hangar] Ability description color for', abilityKey, ':', descColor, '(isUnlocked:', isUnlocked, ', canAfford:', canAfford, ')');
      const descText = this.add.text(x, y - 20, ability.description, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: descColor,
        wordWrap: { width: 260 }
      }).setOrigin(0.5).setDepth(30);
      
      this.contentContainer.add(descText);

      // Stats - bright if unlocked or affordable
      const statsText = this.add.text(x, y, `Cooldown: ${ability.cooldown}s | Energy: ${ability.energyCost}`, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: isUnlocked ? '#aaaaaa' : (canAfford ? '#88ff88' : '#666666')
      }).setOrigin(0.5).setDepth(30);
      
      this.contentContainer.add(statsText);

      // Unlock/Upgrade button
      if (!isUnlocked) {
        const cost = ability.unlockCost;
        const currency = ability.unlockCurrency;
        const canAfford = (meta[currency] || 0) >= cost;
        
        const unlockText = this.add.text(x, y + 20, `Unlock: ${cost} ${currency}`, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: canAfford ? '#00ff00' : '#ff6666'
        }).setOrigin(0.5).setDepth(30);
        
        this.contentContainer.add(unlockText);

        if (canAfford) {
          const unlockBtn = this.add.text(x, y + 40, '[UNLOCK]', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#00ff00'
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          .setDepth(40)
          .on('pointerdown', () => this.unlockAbility(abilityKey));
          
          this.contentContainer.add(unlockBtn);
        }
      } else if (currentLevel < ability.maxLevel) {
        const cost = ability.upgradeCosts[currentLevel - 1]; // Fix: currentLevel-1 because array is 0-indexed
        const currency = ability.unlockCurrency; // Use the same currency as unlock (cores)
        const canAfford = (meta[currency] || 0) >= cost;
        
        const upgradeText = this.add.text(x, y + 20, `Level ${currentLevel + 1}/${ability.maxLevel} (${cost} ${currency})`, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: canAfford ? '#00ff00' : '#ff6666'
        }).setOrigin(0.5).setDepth(30);
        
        this.contentContainer.add(upgradeText);

        if (canAfford) {
          const upgradeBtn = this.add.text(x, y + 40, '[UPGRADE]', {
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#00ff00'
          }).setOrigin(0.5).setInteractive({ useHandCursor: true })
          .setDepth(40)
          .on('pointerdown', () => this.upgradeAbility(abilityKey, cost));
          
          this.contentContainer.add(upgradeBtn);
        }
      } else {
        const maxText = this.add.text(x, y + 20, `Level ${currentLevel}/${ability.maxLevel} - MAX`, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#ffaa00'
        }).setOrigin(0.5).setDepth(30);
        
        this.contentContainer.add(maxText);
      }

      this.contentContainer.add(cardBg);
    });
  }

  showLoadoutTab() {
    const { width, height } = this.scale;
    const startY = height/2 - 120; // Position higher to avoid footer interference
    const meta = this.getMetaState();
    
    // Current ship display
    const ship = SHIP_VARIANTS[this.selectedShip];
    const shipText = this.add.text(width/2, startY, `Current Ship: ${ship.name}`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#00ffff'
    }).setOrigin(0.5).setDepth(30);
    
    this.contentContainer.add(shipText);

    // Ship stats display
    const statsText = this.add.text(width/2, startY + 30, `Speed: ${ship.stats.speed} | Health: ${ship.stats.health} | Shields: ${ship.stats.shieldCapacity}`, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(30);
    
    this.contentContainer.add(statsText);

    // Active upgrades section
    const upgradesY = startY + 80;
    const upgradesHeader = this.add.text(width/2, upgradesY, 'Active Upgrades', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(30);
    
    this.contentContainer.add(upgradesHeader);

    let upgradeY = upgradesY + 40;
    let hasUpgrades = false;

    // List all active upgrades in organized cards
    Object.keys(UPGRADE_CATEGORIES).forEach(catKey => {
      const category = UPGRADE_CATEGORIES[catKey];
      Object.keys(category.upgrades).forEach(upgradeKey => {
        const upgrade = category.upgrades[upgradeKey];
        const level = (meta.unlocks && meta.unlocks[upgradeKey]) || 0;
        
        if (level > 0) {
          hasUpgrades = true;
          
          // Upgrade card
          const cardBg = this.add.rectangle(width/2, upgradeY, 400, 40, 0x223344, 0.7)
            .setStrokeStyle(1, 0x00ff00)
            .setDepth(20);
          
          this.contentContainer.add(cardBg);
          
          const upgradeNameText = this.add.text(width/2, upgradeY, `${upgrade.name} (Level ${level})`, {
            fontFamily: 'monospace',
            fontSize: '14px',
            color: '#00ff00'
          }).setOrigin(0.5).setDepth(30);
          
          this.contentContainer.add(upgradeNameText);
          
          const upgradeEffectText = this.add.text(width/2, upgradeY + 15, upgrade.effects[level - 1], {
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#aaaaaa'
          }).setOrigin(0.5).setDepth(30);
          
          this.contentContainer.add(upgradeEffectText);
          
          upgradeY += 50;
        }
      });
    });

    if (!hasUpgrades) {
      const noUpgradesText = this.add.text(width/2, upgradeY, 'No upgrades purchased yet', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#666666'
      }).setOrigin(0.5).setDepth(30);
      
      this.contentContainer.add(noUpgradesText);
    }

    // Active abilities section
    const abilitiesY = upgradeY + 30;
    const abilitiesHeader = this.add.text(width/2, abilitiesY, 'Active Abilities', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(30);
    
    this.contentContainer.add(abilitiesHeader);

    let abilityY = abilitiesY + 40;
    let hasAbilities = false;

    Object.keys(ACTIVE_ABILITIES).forEach(abilityKey => {
      const ability = ACTIVE_ABILITIES[abilityKey];
      const isUnlocked = meta.unlocks && meta.unlocks[`ability_${abilityKey}`];
      
      if (isUnlocked) {
        hasAbilities = true;
        const level = (meta.unlocks && meta.unlocks[`${abilityKey}_level`]) || 1;
        
        // Ability card
        const cardBg = this.add.rectangle(width/2, abilityY, 400, 40, 0x332244, 0.7)
          .setStrokeStyle(1, 0x8844ff)
          .setDepth(20);
        
        this.contentContainer.add(cardBg);
        
        const abilityNameText = this.add.text(width/2, abilityY, `${ability.name} (Level ${level})`, {
          fontFamily: 'monospace',
          fontSize: '14px',
          color: '#8844ff'
        }).setOrigin(0.5).setDepth(30);
        
        this.contentContainer.add(abilityNameText);
        
        const abilityEffectText = this.add.text(width/2, abilityY + 15, ability.effects[level - 1], {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(30);
        
        this.contentContainer.add(abilityEffectText);
        
        abilityY += 50;
      }
    });

    if (!hasAbilities) {
      const noAbilitiesText = this.add.text(width/2, abilityY, 'No abilities unlocked yet', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#666666'
      }).setOrigin(0.5).setDepth(30);
      
      this.contentContainer.add(noAbilitiesText);
    }
  }

  selectShip(shipKey) {
    this.selectedShip = shipKey;
    this.showShipsTab(); // Refresh display
  }

  unlockShip(shipKey) {
    const ship = SHIP_VARIANTS[shipKey];
    console.log(`unlockShip called for ${shipKey}, cost: ${ship.unlockCost}`);
    
    if (window.RunManager) {
      const currentMeta = window.RunManager.getMeta();
      console.log(`Current salvage: ${currentMeta.salvage}, required: ${ship.unlockCost}`);
      
      if (currentMeta.salvage < ship.unlockCost) {
        console.error(`Insufficient salvage! Have ${currentMeta.salvage}, need ${ship.unlockCost}`);
        return;
      }
      
      try {
        // Deduct salvage cost
        console.log(`Deducting ${ship.unlockCost} salvage...`);
        window.RunManager.adjustCurrencies({ salvage: -ship.unlockCost });
        
        // Add ship unlock to RunManager's meta state
        if (window.RunManager.addUnlock) {
          console.log(`Using addUnlock method for ship_${shipKey}`);
          window.RunManager.addUnlock(`ship_${shipKey}`, true);
        } else {
          console.log(`Using fallback unlock method for ship_${shipKey}`);
          // Fallback: update meta state directly
          const meta = window.RunManager.getMeta();
          meta.unlocks = meta.unlocks || {};
          meta.unlocks[`ship_${shipKey}`] = true;
          console.log(`Updated meta.unlocks:`, meta.unlocks);
          // Force RunManager to save its state
          if (window.RunManager.setMeta) {
            window.RunManager.setMeta(meta);
            console.log(`Saved meta state via setMeta`);
          }
        }
        
        this.updateCurrencyDisplay();
        this.showShipsTab();
        console.log(`Ship ${shipKey} unlocked successfully!`);
      } catch (e) {
        console.error('Failed to unlock ship:', e);
      }
    } else {
      console.error('RunManager not available!');
    }
  }

  purchaseUpgrade(upgradeKey, cost) {
    console.log('[Hangar] purchaseUpgrade called:', upgradeKey, cost);
    console.log('[Hangar] RunManager available:', !!window.RunManager);
    console.log('[Hangar] RunManager.getMeta available:', !!(window.RunManager && window.RunManager.getMeta));
    console.log('[Hangar] RunManager.adjustCurrencies available:', !!(window.RunManager && window.RunManager.adjustCurrencies));
    
    if (window.RunManager) {
      try {
        console.log('[Hangar] Adjusting currencies by:', -cost);
        window.RunManager.adjustCurrencies({ salvage: -cost });
        
        // Update upgrade level in RunManager
        const meta = window.RunManager.getMeta();
        console.log('[Hangar] Current meta:', meta);
        meta.unlocks = meta.unlocks || {};
        const currentLevel = meta.unlocks[upgradeKey] || 0;
        console.log('[Hangar] Current level for', upgradeKey, ':', currentLevel);
        console.log('[Hangar] Upgrading', upgradeKey, 'from level', currentLevel, 'to level', currentLevel + 1);
        window.RunManager.addUnlock(upgradeKey, currentLevel + 1);
        
        console.log('[Hangar] Upgrade purchased successfully');
        this.updateCurrencyDisplay();
        this.showUpgradesTab();
      } catch (e) {
        console.warn('Failed to purchase upgrade:', e);
      }
    } else {
      console.log('[Hangar] RunManager not available, using fallback method');
      // Fallback: use localStorage directly
      try {
        const meta = this.getMetaState();
        console.log('[Hangar] Current meta (fallback):', meta);
        
        // Check if we have enough salvage
        if (meta.salvage < cost) {
          console.warn('[Hangar] Not enough salvage for upgrade');
          return;
        }
        
        // Deduct cost
        meta.salvage -= cost;
        meta.unlocks = meta.unlocks || {};
        const currentLevel = meta.unlocks[upgradeKey] || 0;
        meta.unlocks[upgradeKey] = currentLevel + 1;
        
        console.log('[Hangar] Upgrading', upgradeKey, 'from level', currentLevel, 'to level', currentLevel + 1);
        
        // Save to localStorage
        this.saveMetaState(meta);
        
        console.log('[Hangar] Upgrade purchased successfully (fallback)');
        this.updateCurrencyDisplay();
        this.showUpgradesTab();
      } catch (e) {
        console.warn('Failed to purchase upgrade (fallback):', e);
      }
    }
  }

  unlockAbility(abilityKey) {
    const ability = ACTIVE_ABILITIES[abilityKey];
    if (window.RunManager) {
      try {
        const delta = {};
        delta[ability.unlockCurrency] = -ability.unlockCost;
        window.RunManager.adjustCurrencies(delta);
        
        // Add ability unlocks to RunManager
        window.RunManager.addUnlock(`ability_${abilityKey}`, true);
        window.RunManager.addUnlock(`${abilityKey}_level`, 1);
        
        this.updateCurrencyDisplay();
        this.showAbilitiesTab();
      } catch (e) {
        console.warn('Failed to unlock ability:', e);
      }
    }
  }

  upgradeAbility(abilityKey, cost) {
    if (window.RunManager) {
      try {
        const ability = ACTIVE_ABILITIES[abilityKey];
        const currency = ability.unlockCurrency; // Use the correct currency (cores)
        
        window.RunManager.adjustCurrencies({ [currency]: -cost });
        
        // Update ability level in RunManager
        const meta = window.RunManager.getMeta();
        const currentLevel = (meta.unlocks && meta.unlocks[`${abilityKey}_level`]) || 1;
        window.RunManager.addUnlock(`${abilityKey}_level`, currentLevel + 1);
        
        this.updateCurrencyDisplay();
        this.showAbilitiesTab();
      } catch (e) {
        console.warn('Failed to upgrade ability:', e);
      }
    }
  }

  launchMission() {
    // Save selected ship and loadout
    const loadout = {
      ship: this.selectedShip,
      upgrades: this.getActiveUpgrades(),
      abilities: this.getActiveAbilities()
    };
    
    console.log('[Hangar] Launching mission with loadout:', loadout);
    console.log('[Hangar] Active upgrades:', this.getActiveUpgrades());
    console.log('[Hangar] Active abilities:', this.getActiveAbilities());

    if (window.RunManager) {
      try {
        window.RunManager.setPendingLoadout(loadout);
        console.log('[Hangar] Loadout set in RunManager');
      } catch (e) {
        console.warn('Failed to set loadout:', e);
      }
    }

    // Start the game
    this.scene.start('GameScene');
  }

  getActiveUpgrades() {
    const meta = this.getMetaState();
    const activeUpgrades = {};
    
    if (meta.unlocks) {
      Object.keys(UPGRADE_CATEGORIES).forEach(catKey => {
        const category = UPGRADE_CATEGORIES[catKey];
        Object.keys(category.upgrades).forEach(upgradeKey => {
          const level = meta.unlocks[upgradeKey] || 0;
          if (level > 0) {
            activeUpgrades[upgradeKey] = level;
          }
        });
      });
    }
    
    return activeUpgrades;
  }

  getActiveAbilities() {
    const meta = this.getMetaState();
    const activeAbilities = {};
    
    if (meta.unlocks) {
      Object.keys(ACTIVE_ABILITIES).forEach(abilityKey => {
        const isUnlocked = meta.unlocks[`ability_${abilityKey}`];
        if (isUnlocked) {
          const level = meta.unlocks[`${abilityKey}_level`] || 1;
          activeAbilities[abilityKey] = level;
        }
      });
    }
    
    return activeAbilities;
  }

  updateCurrencyDisplay() {
    const meta = this.getMetaState();
    const salvage = meta.salvage || 0;
    const cores = meta.cores || 0;
    
    if (this.salvageText) {
      this.salvageText.setText(salvage.toString());
    }
    if (this.coresText) {
      this.coresText.setText(cores.toString());
    }
  }

  getMetaState() {
    console.log('[Hangar] getMetaState called');
    console.log('[Hangar] RunManager available:', !!window.RunManager);
    console.log('[Hangar] RunManager.getMeta available:', !!(window.RunManager && window.RunManager.getMeta));
    
    if (window.RunManager && window.RunManager.getMeta) {
      const meta = window.RunManager.getMeta();
      console.log('[Hangar] Using RunManager meta:', meta);
      return meta;
    }
    
    // Fallback to localStorage
    console.log('[Hangar] Using fallback localStorage system');
    try {
      const raw = localStorage.getItem('si_meta_state_v1');
      console.log('[Hangar] Raw localStorage data:', raw);
      const meta = raw ? JSON.parse(raw) : { salvage: 0, cores: 0, unlocks: {} };
      console.log('[Hangar] Fallback meta:', meta);
      return meta;
    } catch (e) {
      console.warn('[Hangar] Failed to read fallback meta:', e);
      return { salvage: 0, cores: 0, unlocks: {} };
    }
  }

  saveMetaState(meta) {
    console.log('[Hangar] saveMetaState called with:', meta);
    try {
      localStorage.setItem('si_meta_state_v1', JSON.stringify(meta));
      console.log('[Hangar] Successfully saved to localStorage');
    } catch (e) {
      console.warn('Failed to save meta state:', e);
    }
  }

  // ===== HELP SYSTEM =====
  showHelpMenu() {
    const { width, height } = this.scale;
    
    // Create help overlay
    this.helpOverlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.8).setDepth(100);
    
    // Help panel
    this.helpPanel = this.add.rectangle(width/2, height/2, width - 40, height - 40, 0x001122, 0.95)
      .setStrokeStyle(3, 0x00ffff).setDepth(101);
    
    // Close button
    this.helpCloseBtn = this.add.text(width - 30, 30, '✕', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ff6666',
      backgroundColor: '#330000',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(102);
    
    this.helpCloseBtn.on('pointerdown', () => this.hideHelpMenu());
    this.helpCloseBtn.on('pointerover', () => this.helpCloseBtn.setColor('#ffaaaa'));
    this.helpCloseBtn.on('pointerout', () => this.helpCloseBtn.setColor('#ff6666'));
    
    // Help title
    this.helpTitle = this.add.text(width/2, 50, 'UPGRADE & ABILITY GUIDE', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#00ffff'
    }).setOrigin(0.5).setDepth(102);
    
    // Create scrollable help content
    this.createHelpContent();
  }

  hideHelpMenu() {
    if (this.helpOverlay) {
      this.helpOverlay.destroy();
      this.helpOverlay = null;
    }
    if (this.helpPanel) {
      this.helpPanel.destroy();
      this.helpPanel = null;
    }
    if (this.helpContent) {
      this.helpContent.destroy();
      this.helpContent = null;
    }
    if (this.helpScrollContainer) {
      this.helpScrollContainer.destroy();
      this.helpScrollContainer = null;
    }
    if (this.helpMask) {
      this.helpMask.destroy();
      this.helpMask = null;
    }
    if (this.helpMaskGraphics) {
      this.helpMaskGraphics.destroy();
      this.helpMaskGraphics = null;
    }
    if (this.helpCloseBtn) {
      this.helpCloseBtn.destroy();
      this.helpCloseBtn = null;
    }
    if (this.helpTitle) {
      this.helpTitle.destroy();
      this.helpTitle = null;
    }
    if (this.helpScrollTop) {
      this.helpScrollTop.destroy();
      this.helpScrollTop = null;
    }
    if (this.helpScrollBottom) {
      this.helpScrollBottom.destroy();
      this.helpScrollBottom = null;
    }
  }

  updateScrollIndicators() {
    if (this.helpScrollTop && this.helpScrollBottom) {
      // Hide top indicator when at top
      this.helpScrollTop.setVisible(this.helpScrollY > 0);
      // Hide bottom indicator when at bottom
      this.helpScrollBottom.setVisible(this.helpScrollY < this.helpMaxScroll);
    }
  }

  createHelpContent() {
    const { width, height } = this.scale;
    
    // Create scrollable container
    this.helpScrollContainer = this.add.container(0, 0).setDepth(102);
    
    // Create mask to keep content within the frame
    this.helpMaskGraphics = this.add.graphics();
    this.helpMaskGraphics.fillStyle(0xffffff);
    this.helpMaskGraphics.fillRect(30, 80, width - 60, height - 160);
    this.helpMask = this.helpMaskGraphics.createGeometryMask();
    this.helpScrollContainer.setMask(this.helpMask);
    
    // Help content sections
    const sections = [
      this.getShipVariantsHelp(),
      this.getHullUpgradesHelp(),
      this.getWeaponUpgradesHelp(),
      this.getSystemUpgradesHelp(),
      this.getActiveAbilitiesHelp()
    ];
    
    let yOffset = 80;
    sections.forEach(section => {
      const sectionText = this.add.text(30, yOffset, section, {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#cccccc',
        wordWrap: { width: width - 80 }
      }).setOrigin(0, 0).setDepth(102);
      
      this.helpScrollContainer.add(sectionText);
      yOffset += sectionText.height + 20;
    });
    
    // Add scroll functionality
    this.helpScrollY = 0;
    this.helpMaxScroll = Math.max(0, yOffset - height + 60);
    
    // Add scroll instructions
    const scrollInstructions = this.add.text(width/2, height - 60, 'Use ↑↓ Arrow Keys or Mouse Wheel to Scroll', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#00ffff'
    }).setOrigin(0.5).setDepth(102);
    
    // Add scroll indicators if content is scrollable
    if (this.helpMaxScroll > 0) {
      // Top scroll indicator
      this.helpScrollTop = this.add.text(width/2, 70, '↑', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#00ffff'
      }).setOrigin(0.5).setDepth(102);
      
      // Bottom scroll indicator
      this.helpScrollBottom = this.add.text(width/2, height - 80, '↓', {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#00ffff'
      }).setOrigin(0.5).setDepth(102);
    }
    
    this.input.keyboard.on('keydown-DOWN', () => {
      this.helpScrollY = Math.min(this.helpMaxScroll, this.helpScrollY + 20);
      this.helpScrollContainer.y = -this.helpScrollY;
      this.updateScrollIndicators();
    });
    
    this.input.keyboard.on('keydown-UP', () => {
      this.helpScrollY = Math.max(0, this.helpScrollY - 20);
      this.helpScrollContainer.y = -this.helpScrollY;
      this.updateScrollIndicators();
    });
    
    // Add mouse wheel scrolling
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
      if (deltaY > 0) {
        // Scroll down
        this.helpScrollY = Math.min(this.helpMaxScroll, this.helpScrollY + 30);
      } else if (deltaY < 0) {
        // Scroll up
        this.helpScrollY = Math.max(0, this.helpScrollY - 30);
      }
      this.helpScrollContainer.y = -this.helpScrollY;
      this.updateScrollIndicators();
    });
  }

  getShipVariantsHelp() {
    return 'SHIP VARIANTS\n\nINTERCEPTOR (Starting Ship)\n• Speed: 180 | Health: 80 (2 lives) | Fire Rate: 0.25s\n• Shield Capacity: 2 | Special Slots: 1 | Weapon Slots: 2\n• Fast and agile, perfect for hit-and-run tactics\n\nCRUISER (150 salvage)\n• Speed: 140 | Health: 120 (3 lives) | Fire Rate: 0.35s\n• Shield Capacity: 3 | Special Slots: 2 | Weapon Slots: 3\n• Balanced design with good armor and firepower\n\nDREADNOUGHT (300 salvage)\n• Speed: 100 | Health: 180 (4-5 lives) | Fire Rate: 0.5s\n• Shield Capacity: 4 | Special Slots: 3 | Weapon Slots: 4\n• Heavy assault ship with massive firepower';
  }

  getHullUpgradesHelp() {
    return 'HULL SYSTEMS UPGRADES\n\nREINFORCED HULL (60->120->200 salvage)\n• Level 1: +1 life (4 total) | Level 2: +2 lives (5 total) | Level 3: +3 lives (6 total)\n• Start each run with additional lives\n\nADAPTIVE ARMOR (80->150->250 salvage)\n• Level 1: 10% damage reduction | Level 2: 20% reduction | Level 3: 30% reduction\n• Reduces damage taken after consecutive hits\n\nEMERGENCY REPAIR (100->200 salvage)\n• Level 1: 1 auto-repair per run | Level 2: 2 auto-repairs per run\n• Automatically repair when health is critical';
  }

  getWeaponUpgradesHelp() {
    return 'WEAPON SYSTEMS UPGRADES\n\nENHANCED TARGETING (40->80->140->220->320 salvage)\n• Level 1: +20% damage | Level 2: +40% | Level 3: +60% | Level 4: +80% | Level 5: +100%\n• Increase base weapon damage\n\nRAPID CYCLING (50->100->180->280 salvage)\n• Level 1: +15% fire rate | Level 2: +30% | Level 3: +50% | Level 4: +75%\n• Increase weapon fire rate\n\nPIERCE CAPACITOR (45->90->160 salvage)\n• Level 1: +25% charge rate | Level 2: +50% | Level 3: +100%\n• Piercing shot charges faster';
  }

  getSystemUpgradesHelp() {
    return 'SHIP SYSTEMS UPGRADES\n\nSHIELD MATRIX (70->130->220->350 salvage)\n• Level 1: +1 shield | Level 2: +2 shields | Level 3: +3 shields | Level 4: +4 shields\n• Increase maximum shield capacity\n\nCOMBO STABILIZER (60->120->200 salvage)\n• Level 1: +2s duration | Level 2: +4s duration | Level 3: +6s duration\n• Combo multiplier decays slower\n\nSALVAGE SCANNER (50->100->170->260->380 salvage)\n• Level 1: +10% salvage | Level 2: +20% | Level 3: +35% | Level 4: +50% | Level 5: +75%\n• Increase salvage earned from all sources';
  }

  getActiveAbilitiesHelp() {
    return 'ACTIVE ABILITIES (Use number keys 1-4)\n\nPHASE DASH (50 cores + 25->50 cores)\n• Cooldown: 8s | Energy: 25\n• Level 1: Basic dash (100px, 300ms invincibility)\n• Level 2: Longer distance (150px)\n• Level 3: Damages enemies (200px + damage)\n\nTEMPORAL FIELD (75 cores + 37->75 cores)\n• Cooldown: 15s | Energy: 40\n• Level 1: 2s time slow | Level 2: 4s duration | Level 3: 6s + 2x damage boost\n• Slow down time for precise maneuvering\n\nORBITAL STRIKE (100 cores + 50->100 cores)\n• Cooldown: 20s | Energy: 50\n• Level 1: Single strike | Level 2: Double strike | Level 3: Triple strike\n• Call down devastating area damage\n\nSHIELD BURST (60 cores + 30->60 cores)\n• Cooldown: 12s | Energy: 30\n• Level 1: 2s invincibility | Level 2: 3s duration | Level 3: 4s + reflects damage\n• Temporary invincibility and damage reflection\n\nCONTROLS: Use arrow keys to scroll this help menu, or click the X to close.';
  }
}

// Export for use in main game
if (typeof window !== 'undefined') {
  console.log('[Hangar] Exporting HangarScene to window');
  window.HangarScene = HangarScene;
  console.log('[Hangar] HangarScene exported successfully:', !!window.HangarScene);
  window.SHIP_VARIANTS = SHIP_VARIANTS;
  window.UPGRADE_CATEGORIES = UPGRADE_CATEGORIES;
  window.ACTIVE_ABILITIES = ACTIVE_ABILITIES;
  
  // Debug function to check localStorage
  window.debugSalvage = function() {
    console.log('=== SALVAGE DEBUG ===');
    console.log('RunManager available:', !!window.RunManager);
    if (window.RunManager) {
      console.log('RunManager meta:', window.RunManager.getMeta());
    }
    console.log('localStorage raw:', localStorage.getItem('si_meta_state_v1'));
    try {
      const parsed = JSON.parse(localStorage.getItem('si_meta_state_v1') || '{}');
      console.log('localStorage parsed:', parsed);
    } catch (e) {
      console.log('localStorage parse error:', e);
    }
    console.log('===================');
  };
  
  // Debug function to add test salvage
  window.addTestSalvage = function(amount = 500) {
    console.log('[Hangar] Adding test salvage:', amount);
    if (window.RunManager) {
      console.log('[Hangar] Using RunManager to add salvage');
      window.RunManager.adjustCurrencies({ salvage: amount });
      console.log('[Hangar] Salvage added via RunManager');
    } else {
      console.log('[Hangar] Using localStorage to add salvage');
      try {
        const meta = JSON.parse(localStorage.getItem('si_meta_state_v1') || '{}');
        meta.salvage = (meta.salvage || 0) + amount;
        localStorage.setItem('si_meta_state_v1', JSON.stringify(meta));
        console.log('[Hangar] Salvage added via localStorage');
      } catch (e) {
        console.log('[Hangar] Failed to add salvage:', e);
      }
    }
    console.log('[Hangar] Test salvage added, refreshing display...');
  };
  
  // Debug function to reset all upgrades
  window.resetAllUpgrades = function() {
    console.log('[Hangar] Resetting all upgrades to 0...');
    if (window.RunManager) {
      console.log('[Hangar] Using RunManager to reset upgrades');
      // Reset to default meta state
      window.RunManager.setMeta({
        salvage: 1000,  // Give some starting salvage
        cores: 0,
        unlocks: {},    // Clear all upgrades
        lastRun: null,
        version: 1,
        pendingLoadout: null
      });
      console.log('[Hangar] Upgrades reset via RunManager');
      console.log('[Hangar] Current RunManager meta after reset:', window.RunManager.getMeta());
    } else {
      console.log('[Hangar] Using localStorage to reset upgrades');
      try {
        const resetMeta = {
          salvage: 1000,  // Give some starting salvage
          cores: 0,
          unlocks: {},    // Clear all upgrades
          lastRun: null,
          version: 1,
          pendingLoadout: null
        };
        localStorage.setItem('si_meta_state_v1', JSON.stringify(resetMeta));
        console.log('[Hangar] Upgrades reset via localStorage');
        console.log('[Hangar] Current localStorage after reset:', localStorage.getItem('si_meta_state_v1'));
      } catch (e) {
        console.log('[Hangar] Failed to reset upgrades:', e);
      }
    }
    console.log('[Hangar] All upgrades reset to 0, salvage set to 1000');
    console.log('[Hangar] Refresh the page to see changes');
  };
  
  // Debug function to force clear all data
  window.forceReset = function() {
    console.log('[Hangar] Force resetting all data...');
    // Clear localStorage completely
    try {
      localStorage.removeItem('si_meta_state_v1');
      console.log('[Hangar] localStorage cleared');
    } catch (e) {
      console.log('[Hangar] Failed to clear localStorage:', e);
    }
    
    // Reset RunManager if available
    if (window.RunManager) {
      try {
        window.RunManager.resetMeta();
        console.log('[Hangar] RunManager reset');
      } catch (e) {
        console.log('[Hangar] Failed to reset RunManager:', e);
      }
    }
    
    console.log('[Hangar] Force reset complete - refresh the page');
  };
  
  // Debug function to manually set all upgrades to 0
  window.setAllUpgradesToZero = function() {
    console.log('[Hangar] Manually setting all upgrades to level 0...');
    
    // Get all upgrade keys
    const allUpgradeKeys = [];
    Object.keys(window.UPGRADE_CATEGORIES).forEach(catKey => {
      const category = window.UPGRADE_CATEGORIES[catKey];
      Object.keys(category.upgrades).forEach(upgradeKey => {
        allUpgradeKeys.push(upgradeKey);
      });
    });
    
    console.log('[Hangar] Found upgrade keys:', allUpgradeKeys);
    
    if (window.RunManager) {
      console.log('[Hangar] Using RunManager to set upgrades to 0');
      allUpgradeKeys.forEach(upgradeKey => {
        window.RunManager.addUnlock(upgradeKey, 0);
      });
      console.log('[Hangar] All upgrades set to 0 via RunManager');
    } else {
      console.log('[Hangar] Using localStorage to set upgrades to 0');
      try {
        const meta = JSON.parse(localStorage.getItem('si_meta_state_v1') || '{}');
        meta.unlocks = {};
        allUpgradeKeys.forEach(upgradeKey => {
          meta.unlocks[upgradeKey] = 0;
        });
        meta.salvage = 1000;
        localStorage.setItem('si_meta_state_v1', JSON.stringify(meta));
        console.log('[Hangar] All upgrades set to 0 via localStorage');
      } catch (e) {
        console.log('[Hangar] Failed to set upgrades to 0:', e);
      }
    }
    
    console.log('[Hangar] All upgrades manually set to 0 - refresh the page');
  };
  
  // Debug function to test upgrade purchase directly
  window.testUpgradePurchase = function(upgradeKey) {
    console.log('[Hangar] Testing direct upgrade purchase for:', upgradeKey);
    
    // Get the upgrade details
    let upgrade = null;
    let category = null;
    for (const catKey in window.UPGRADE_CATEGORIES) {
      const cat = window.UPGRADE_CATEGORIES[catKey];
      if (cat.upgrades[upgradeKey]) {
        upgrade = cat.upgrades[upgradeKey];
        category = cat;
        break;
      }
    }
    
    if (!upgrade) {
      console.log('[Hangar] Upgrade not found:', upgradeKey);
      return;
    }
    
    // Get current meta
    const meta = window.HangarScene ? window.HangarScene.getMetaState() : null;
    if (!meta) {
      console.log('[Hangar] No meta state available');
      return;
    }
    
    const currentLevel = (meta.unlocks && meta.unlocks[upgradeKey]) || 0;
    const cost = upgrade.costs[currentLevel];
    const canAfford = (meta.salvage || 0) >= cost;
    
    console.log('[Hangar] Upgrade details:', {
      upgradeKey,
      currentLevel,
      cost,
      canAfford,
      salvage: meta.salvage
    });
    
    if (canAfford) {
      console.log('[Hangar] Attempting direct purchase...');
      if (window.HangarScene) {
        window.HangarScene.purchaseUpgrade(upgradeKey, cost);
      } else {
        console.log('[Hangar] HangarScene not available for direct purchase');
      }
    } else {
      console.log('[Hangar] Cannot afford upgrade - need', cost, 'have', meta.salvage);
    }
  };
  
  // Debug function to manually unlock a ship
  window.unlockShip = function(shipKey) {
    console.log('[Hangar] Manually unlocking ship:', shipKey);
    
    if (window.RunManager) {
      console.log('[Hangar] Using RunManager to unlock ship');
      window.RunManager.addUnlock(`ship_${shipKey}`, true);
      console.log('[Hangar] Ship unlocked via RunManager');
    } else {
      console.log('[Hangar] Using localStorage to unlock ship');
      try {
        const meta = JSON.parse(localStorage.getItem('si_meta_state_v1') || '{}');
        meta.unlocks = meta.unlocks || {};
        meta.unlocks[`ship_${shipKey}`] = true;
        localStorage.setItem('si_meta_state_v1', JSON.stringify(meta));
        console.log('[Hangar] Ship unlocked via localStorage');
      } catch (e) {
        console.log('[Hangar] Failed to unlock ship:', e);
      }
    }
    
    console.log('[Hangar] Ship unlocked - refresh the page to see changes');
  };
  
  // Debug function to test upgrade purchase
  window.testUpgrade = function(upgradeKey, cost) {
    console.log('[Hangar] Testing upgrade purchase:', upgradeKey, cost);
    if (window.RunManager) {
      console.log('[Hangar] Using RunManager for test');
      window.RunManager.adjustCurrencies({ salvage: -cost });
      const meta = window.RunManager.getMeta();
      meta.unlocks = meta.unlocks || {};
      const currentLevel = meta.unlocks[upgradeKey] || 0;
      window.RunManager.addUnlock(upgradeKey, currentLevel + 1);
      console.log('[Hangar] Test upgrade completed via RunManager');
    } else {
      console.log('[Hangar] Using localStorage for test');
      try {
        const meta = JSON.parse(localStorage.getItem('si_meta_state_v1') || '{}');
        meta.salvage = (meta.salvage || 0) - cost;
        meta.unlocks = meta.unlocks || {};
        const currentLevel = meta.unlocks[upgradeKey] || 0;
        meta.unlocks[upgradeKey] = currentLevel + 1;
        localStorage.setItem('si_meta_state_v1', JSON.stringify(meta));
        console.log('[Hangar] Test upgrade completed via localStorage');
      } catch (e) {
        console.log('[Hangar] Test upgrade failed:', e);
      }
    }
  };
  
  // Debug function to add salvage for testing button colors
  window.addTestSalvage = function(amount = 1000) {
    console.log('[Hangar] Adding test salvage:', amount);
    
    if (window.RunManager && window.RunManager.adjustCurrencies) {
      window.RunManager.adjustCurrencies({ salvage: amount });
      console.log('[Hangar] Salvage added via RunManager');
    } else {
      console.log('[Hangar] Using localStorage to add salvage');
      try {
        const meta = JSON.parse(localStorage.getItem('si_meta_state_v1') || '{}');
        meta.salvage = (meta.salvage || 0) + amount;
        localStorage.setItem('si_meta_state_v1', JSON.stringify(meta));
        console.log('[Hangar] Salvage added via localStorage');
      } catch (e) {
        console.log('[Hangar] Failed to add salvage:', e);
      }
    }
    
    console.log('[Hangar] Test salvage added - refresh the hangar to see changes');
  };
  
  // Debug function to add cores for testing ability buttons
  window.addTestCores = function(amount = 100) {
    console.log('[Hangar] Adding test cores:', amount);
    
    if (window.RunManager && window.RunManager.adjustCurrencies) {
      window.RunManager.adjustCurrencies({ cores: amount });
      console.log('[Hangar] Cores added via RunManager');
    } else {
      console.log('[Hangar] Using localStorage to add cores');
      try {
        const meta = JSON.parse(localStorage.getItem('si_meta_state_v1') || '{}');
        meta.cores = (meta.cores || 0) + amount;
        localStorage.setItem('si_meta_state_v1', JSON.stringify(meta));
        console.log('[Hangar] Cores added via localStorage');
      } catch (e) {
        console.log('[Hangar] Failed to add cores:', e);
      }
    }
    
    console.log('[Hangar] Test cores added - refresh the hangar to see changes');
  };
}
