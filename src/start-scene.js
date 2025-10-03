// Professional Start Scene for SPACERUNNER
// Clean, organized UI with professional panels

class StartScene extends Phaser.Scene {
  constructor() { 
    super('StartScene'); 
  } 
  
  create() { 
    this._startingGame = false; 
    console.log('[StartScene] Creating start scene');
    console.log('[StartScene] Window objects available:');
    console.log('[StartScene] - ENABLE_ROGUELITE:', !!window.ENABLE_ROGUELITE);
    console.log('[StartScene] - HangarScene:', !!window.HangarScene);
    console.log('[StartScene] - RunManager:', !!window.RunManager);
    console.log('[StartScene] - SET_ROGUELITE_MODE:', !!window.SET_ROGUELITE_MODE);
    
    const w = this.scale.width, h = this.scale.height; 
    
    this.ensureStartTextures();
    this.createBackgroundLayers(w, h);
    
    // Create main panels
    this.createMainPanels(w, h);
    
    // Header section
    this.createHeader(w, h);
    this.createTitleAnimations();
    
    // Main content area
    this.createMainContent(w, h);
    
    // Settings panel
    this.createSettingsPanel(w, h);
    
    // Leaderboard section
    this.createLeaderboardSection(w, h);
    
    // Cinematic asteroid pass
    this.createAsteroidFlyby(w, h);
    
    // Game launch logic
    this.setupGameLaunch();

    this.events.once('shutdown', () => this.cleanupStartSceneDynamics());
  }


  ensureStartTextures() {
    if (!this.textures.exists('start_star_small')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(4, 4, 4);
      g.generateTexture('start_star_small', 8, 8);
      g.destroy();
    }
    if (!this.textures.exists('start_star_large')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(6, 6, 6);
      g.fillStyle(0xa8d8ff, 0.6);
      g.fillCircle(6, 6, 4);
      g.generateTexture('start_star_large', 12, 12);
      g.destroy();
    }
    if (!this.textures.exists('start_starfield_far')) {
      this.createStarfieldTexture('start_starfield_far', 512, 180, [
        { color: 0xffffff, alphaMin: 0.18, alphaMax: 0.4, minSize: 0.8, maxSize: 1.8 },
        { color: 0x9fdcff, alphaMin: 0.12, alphaMax: 0.28, minSize: 0.8, maxSize: 1.5 }
      ]);
    }
    if (!this.textures.exists('start_starfield_near')) {
      this.createStarfieldTexture('start_starfield_near', 512, 110, [
        { color: 0xffffff, alphaMin: 0.45, alphaMax: 0.75, minSize: 1.6, maxSize: 2.8 },
        { color: 0xffece0, alphaMin: 0.40, alphaMax: 0.60, minSize: 1.4, maxSize: 2.4 },
        { color: 0x7bd7ff, alphaMin: 0.35, alphaMax: 0.55, minSize: 1.4, maxSize: 2.2 }
      ]);
    }
    if (!this.textures.exists('start_nebula')) {
      this.createNebulaTexture('start_nebula', 512, 512);
    }
    if (!this.textures.exists('start_asteroid_small')) {
      console.log('[StartScene] Creating small asteroid texture...');
      this.createAsteroidTexture('start_asteroid_small', 32, 0x78675a, 0x382f29);
      console.log('[StartScene] Small asteroid texture created');
    }
    if (!this.textures.exists('start_asteroid_large')) {
      console.log('[StartScene] Creating large asteroid texture...');
      this.createAsteroidTexture('start_asteroid_large', 44, 0x827062, 0x3f342d);
      console.log('[StartScene] Large asteroid texture created');
    }
    if (!this.textures.exists('start_ship_icon')) {
      this.createShipTexture('start_ship_icon', 128, 56);
    }
  }

  createStarfieldTexture(key, size, count, palette) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, size, size);
    for (let i = 0; i < count; i++) {
      const swatch = Phaser.Utils.Array.GetRandom(palette);
      const radiusMin = (swatch.minSize !== undefined) ? swatch.minSize : 1;
      const radiusMax = (swatch.maxSize !== undefined) ? swatch.maxSize : 2;
      const alphaMin = (swatch.alphaMin !== undefined) ? swatch.alphaMin : (swatch.alpha !== undefined ? swatch.alpha : 0.3);
      const alphaMax = (swatch.alphaMax !== undefined) ? swatch.alphaMax : (swatch.alpha !== undefined ? swatch.alpha : 0.6);
      const radius = Phaser.Math.FloatBetween(radiusMin, radiusMax);
      const alpha = Phaser.Math.FloatBetween(alphaMin, alphaMax);
      g.fillStyle(swatch.color, alpha);
      g.fillCircle(Phaser.Math.Between(0, size), Phaser.Math.Between(0, size), radius);
    }
    g.generateTexture(key, size, size);
    g.destroy();
  }

  createNebulaTexture(key, width, height) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, width, height);
    const palette = [0x351d77, 0x144b8d, 0x3d0f6b, 0x0a8cb8];
    for (let i = 0; i < 6; i++) {
      const color = Phaser.Utils.Array.GetRandom(palette);
      const radius = Phaser.Math.Between(180, 260);
      const alpha = Phaser.Math.FloatBetween(0.06, 0.16);
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      g.fillStyle(color, alpha);
      g.fillCircle(x, y, radius);
    }
    g.generateTexture(key, width, height);
    g.destroy();
  }

  createShipTexture(key, width, height) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, width, height);

    const midY = height / 2;
    const bodyWidth = width - 90;
    const bodyX = 50;

    // fuselage
    g.fillStyle(0x4bf3ff, 1);
    g.fillRoundedRect(bodyX, midY - 12, bodyWidth, 24, 12);
    g.lineStyle(2, 0x0e6d8f, 0.8);
    g.strokeRoundedRect(bodyX, midY - 12, bodyWidth, 24, 12);

    // nose cone
    g.fillStyle(0x9af7ff, 1);
    g.fillTriangle(width - 40, midY, width - 14, midY - 12, width - 14, midY + 12);
    g.lineStyle(2, 0x0e6d8f, 0.6);
    g.strokeTriangle(width - 40, midY, width - 14, midY - 12, width - 14, midY + 12);

    // cockpit
    g.fillStyle(0xffffff, 0.85);
    g.fillEllipse(bodyX + bodyWidth * 0.55, midY - 4, 18, 12);
    g.fillStyle(0xc7e2ff, 0.65);
    g.fillEllipse(bodyX + bodyWidth * 0.55 + 3, midY - 4, 12, 8);

    // wings
    g.fillStyle(0x45d6ff, 0.95);
    g.fillTriangle(bodyX + 4, midY, bodyX - 26, midY - 26, bodyX + 34, midY - 10);
    g.fillTriangle(bodyX + 4, midY, bodyX - 26, midY + 26, bodyX + 34, midY + 10);
    g.lineStyle(2, 0x1b7fa2, 0.8);
    g.strokeTriangle(bodyX + 4, midY, bodyX - 26, midY - 26, bodyX + 34, midY - 10);
    g.strokeTriangle(bodyX + 4, midY, bodyX - 26, midY + 26, bodyX + 34, midY + 10);

    // fin detail
    g.lineStyle(1, 0xb5ffff, 0.4);
    g.beginPath();
    g.moveTo(bodyX + bodyWidth * 0.45, midY - 9);
    g.lineTo(bodyX + bodyWidth * 0.45, midY + 9);
    g.strokePath();

    // engine glow
    const exhaustX = bodyX - 18;
    g.fillStyle(0xffb347, 0.8);
    g.fillEllipse(exhaustX, midY, 24, 8);
    g.fillStyle(0xffe8a6, 0.6);
    g.fillEllipse(exhaustX + 6, midY, 14, 4);
    g.fillStyle(0x00f7ff, 0.55);
    g.fillEllipse(exhaustX + 12, midY, 8, 2);

    g.generateTexture(key, width, height);
    g.destroy();
  }

  createAsteroidTexture(key, size, baseColor, edgeColor) {
    console.log(`[StartScene] Creating asteroid texture: ${key}, size: ${size}`);
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0);
    g.fillRect(0, 0, size, size);
    const radius = size / 2;
    g.fillStyle(baseColor, 1);
    g.fillCircle(radius, radius, radius - 1);
    g.lineStyle(2, edgeColor, 0.85);
    g.strokeCircle(radius, radius, radius - 1.5);
    const craterCount = Phaser.Math.Between(3, 5);
    for (let i = 0; i < craterCount; i++) {
      const cx = Phaser.Math.FloatBetween(radius - size * 0.25, radius + size * 0.25);
      const cy = Phaser.Math.FloatBetween(radius - size * 0.25, radius + size * 0.25);
      const cr = Phaser.Math.FloatBetween(size * 0.08, size * 0.18);
      g.fillStyle(0x000000, 0.2);
      g.fillCircle(cx, cy, cr);
      g.lineStyle(1, 0xffffff, 0.12);
      g.strokeCircle(cx, cy, cr + 1);
    }
    g.generateTexture(key, size, size);
    g.destroy();
    console.log(`[StartScene] Asteroid texture ${key} generated successfully`);
  }

  createBackgroundLayers(w, h) {
    const gradient = this.add.graphics({ x: 0, y: 0 });
    gradient.fillGradientStyle(0x050716, 0x050716, 0x08112b, 0x050716, 1);
    gradient.fillRect(0, 0, w, h);
    gradient.setDepth(-40);
    gradient.setScrollFactor(0);
    this.gradientBackground = gradient;

    this.bgNebula = this.add.tileSprite(w / 2, h / 2, w, h, 'start_nebula')
      .setDepth(-35)
      .setAlpha(0.58)
      .setScrollFactor(0);
    this.bgStarsFar = this.add.tileSprite(w / 2, h / 2, w, h, 'start_starfield_far')
      .setDepth(-30)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.55)
      .setScrollFactor(0);
    this.bgStarsNear = this.add.tileSprite(w / 2, h / 2, w, h, 'start_starfield_near')
      .setDepth(-25)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0.85)
      .setScrollFactor(0);

    this.backgroundOverlay = this.add.rectangle(w / 2, h / 2, w, h, 0x040b1a, 0.45)
      .setDepth(-15)
      .setScrollFactor(0);

    this.parallaxLayers = [
      { sprite: this.bgNebula, speedX: 0.01, speedY: 0.002 },
      { sprite: this.bgStarsFar, speedX: 0.04, speedY: 0.01 },
      { sprite: this.bgStarsNear, speedX: 0.07, speedY: 0.018 }
    ];
  }

  createTitleAnimations() {
    if (!this.titleText) return;
    this.tweens.add({
      targets: this.titleText,
      scale: { from: 1, to: 1.05 },
      alpha: { from: 1, to: 0.88 },
      duration: 2600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    this.titleHighlight = this.add.rectangle(
      this.titleText.x,
      this.titleText.y,
      this.titleText.displayWidth + 60,
      this.titleText.displayHeight + 18,
      0x00ffff,
      0.14
    ).setDepth(this.titleText.depth - 0.5).setBlendMode(Phaser.BlendModes.ADD).setScrollFactor(0);
    this.tweens.add({
      targets: this.titleHighlight,
      alpha: { from: 0.18, to: 0.05 },
      scaleX: { from: 1.02, to: 1.16 },
      duration: 2200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
    if (this.subtitleText) {
      this.tweens.add({
        targets: this.subtitleText,
        alpha: { from: 0.7, to: 1 },
        duration: 2000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }
  }

  createAsteroidFlyby(w, h) {
    console.log('[StartScene] Creating asteroid flyby system...');
    
    const configs = [
      { texture: 'start_asteroid_small', depth: -10, speedX: { min: -160, max: -110 }, scale: { start: 0.55, end: 0.32 }, frequency: 140 },
      { texture: 'start_asteroid_large', depth: -8, speedX: { min: -240, max: -170 }, scale: { start: 0.72, end: 0.46 }, frequency: 220 }
    ];

    const emitRect = new Phaser.Geom.Rectangle(-w * 0.25, -120, w + 360, h + 240);

    this.asteroidEmitters = configs.map(cfg => {
      console.log(`[StartScene] Creating asteroid emitter for ${cfg.texture}`);
      
      // Create particle emitter using modern Phaser 3.80 API
      const emitter = this.add.particles(0, 0, cfg.texture, {
        emitZone: { source: emitRect, type: 'random', quantity: 1 },
        lifespan: { min: 7000, max: 12000 },
        speedX: cfg.speedX,
        speedY: { min: -40, max: 40 },
        scale: cfg.scale,
        alpha: { start: 0.95, end: 0 },
        rotate: { min: -60, max: 60 },
        gravityY: 0,
        quantity: 2,
        frequency: cfg.frequency,
        emitting: true
      });

      // Set depth and scroll factor using modern API
      emitter.setDepth(cfg.depth).setScrollFactor(0);
      console.log(`[StartScene] Set asteroid depth to ${cfg.depth}`);

      // Create initial seed particles
      const seeds = Math.max(18, Math.ceil(w / 80));
      const originalZone = emitter.emitZone;
      emitter.emitZone = null;
      for (let i = 0; i < seeds; i++) {
        const seedX = Phaser.Math.Between(-w * 0.25, w + 160);
        const seedY = Phaser.Math.Between(-120, h + 120);
        emitter.emitParticleAt(seedX, seedY, 1);
      }
      emitter.emitZone = originalZone;

      console.log(`[StartScene] Created ${seeds} seed particles for ${cfg.texture}`);
      return emitter;
    });
    
    console.log('[StartScene] Asteroid flyby system created successfully');
    
    // Add a test asteroid sprite to verify textures are working
    const testAsteroid = this.add.image(w/2, h/2, 'start_asteroid_large')
      .setScale(0.5)
      .setDepth(-5)
      .setAlpha(0.8);
    console.log('[StartScene] Created test asteroid sprite');
    
    // Remove test asteroid after 3 seconds
    this.time.delayedCall(3000, () => {
      if (testAsteroid) {
        testAsteroid.destroy();
        console.log('[StartScene] Test asteroid removed');
      }
    });
  }

  cleanupStartSceneDynamics() {
    if (this.parallaxLayers) {
      this.parallaxLayers.forEach(layer => layer.sprite && layer.sprite.destroy());
      this.parallaxLayers = null;
    }
    this.bgNebula = null;
    this.bgStarsFar = null;
    this.bgStarsNear = null;
    if (this.backgroundOverlay) {
      this.backgroundOverlay.destroy();
      this.backgroundOverlay = null;
    }
    if (this.gradientBackground) {
      this.gradientBackground.destroy();
      this.gradientBackground = null;
    }
    if (this.titleHighlight) {
      this.titleHighlight.destroy();
      this.titleHighlight = null;
    }
    if (this.asteroidEmitters) {
      this.asteroidEmitters.forEach(emitter => {
        if (emitter) {
          emitter.stop();
          emitter.destroy();
        }
      });
      this.asteroidEmitters = null;
    }
  }

  update(time, delta) {
    if (this.parallaxLayers) {
      const factor = delta * 0.06;
      this.parallaxLayers.forEach(layer => {
        if (layer.sprite) {
          layer.sprite.tilePositionX += layer.speedX * factor;
          layer.sprite.tilePositionY += layer.speedY * factor;
        }
      });
    }
  }

  createMainPanels(w, h) {
    // Main content panel
    this.mainPanel = this.add.rectangle(w/2, h/2, w - 40, h - 40, 0x112233, 0.8)
      .setStrokeStyle(2, 0x334455)
      .setDepth(5);
    
    // Header panel
    this.headerPanel = this.add.rectangle(w/2, 80, w - 40, 100, 0x223344, 0.9)
      .setStrokeStyle(2, 0x445566)
      .setDepth(15);
    
    // Settings panel (top-right) - aligned with header panel
    this.settingsPanel = this.add.rectangle(w - 100, 80, 160, 100, 0x223344, 0.9)
      .setStrokeStyle(2, 0x445566)
      .setDepth(20);
    
    // Leaderboard panel (right side)
    this.leaderboardPanel = this.add.rectangle(w - 120, h/2 + 50, 200, 300, 0x223344, 0.8)
      .setStrokeStyle(2, 0x445566)
      .setDepth(15);
  }

  createHeader(w, h) {
    // Main title with professional styling
    this.titleText = this.add.text(w/2 - 100, 50, 'SPACERUNNER', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#00ffff',
      stroke: '#004444',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(30).setScrollFactor(0);
    
    // Subtitle
    this.subtitleText = this.add.text(w/2 - 100, 90, 'Modern Phaser Edition', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(30).setScrollFactor(0);
  }

  createMainContent(w, h) {
    // High score display
    const best = (() => { 
      try { 
        return parseInt(localStorage.getItem('si_highscore') || '0', 10) || 0; 
      } catch(e) { 
        return 0; 
      } 
    })();
    
    // High score panel
    const scorePanel = this.add.rectangle(w/2 - 100, h/2 - 50, 300, 60, 0x223344, 0.8)
      .setStrokeStyle(2, 0x445566)
      .setDepth(20);
    
    this.add.text(w/2 - 100, h/2 - 70, 'BEST SCORE', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(30);
    
    this.add.text(w/2 - 100, h/2 - 50, best.toString(), {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5).setDepth(30);
    
    // Start game button
    const startBtn = this.add.rectangle(w/2 - 100, h/2 + 20, 200, 50, 0x004400, 0.8)
      .setStrokeStyle(2, 0x006600)
      .setInteractive({ useHandCursor: true })
      .setDepth(20)
      .on('pointerdown', (pointer, localX, localY, event) => {
        if(event && event.stopPropagation) event.stopPropagation();
        this.launchGame();
      })
      .on('pointerover', function() { 
        this.setFillStyle(0x005500, 0.9);
        this.setStrokeStyle(2, 0x008800);
      })
      .on('pointerout', function() { 
        this.setFillStyle(0x004400, 0.8);
        this.setStrokeStyle(2, 0x006600);
      });
    
    this.add.text(w/2 - 100, h/2 + 20, 'START GAME', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5).setDepth(30);
    
    // Hangar button (always show if HangarScene is available)
    console.log('[StartScene] Checking hangar availability:');
    console.log('[StartScene] ENABLE_ROGUELITE:', !!window.ENABLE_ROGUELITE);
    console.log('[StartScene] HangarScene:', !!window.HangarScene);
    
    // Always create hangar button - force it to appear
    console.log('[StartScene] Creating hangar button');
    const hangarBtn = this.add.rectangle(w/2 - 100, h/2 + 80, 200, 40, 0x334455, 0.8)
      .setStrokeStyle(2, 0x556677)
      .setInteractive({ useHandCursor: true })
      .setDepth(20)
      .on('pointerdown', (pointer, localX, localY, event) => {
        if(event && event.stopPropagation) event.stopPropagation();
        console.log('[StartScene] Hangar button clicked');
        console.log('[StartScene] Starting HangarScene...');
        this.scene.start('HangarScene');
      })
      .on('pointerover', function() { 
        this.setFillStyle(0x445566, 0.9);
        this.setStrokeStyle(2, 0x667788);
      })
      .on('pointerout', function() { 
        this.setFillStyle(0x334455, 0.8);
        this.setStrokeStyle(2, 0x556677);
      });
    
    this.add.text(w/2 - 100, h/2 + 80, 'HANGAR BAY', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#00ffaa'
    }).setOrigin(0.5).setDepth(30);
    
    if(!window.HangarScene) {
      console.log('[StartScene] HangarScene not available - button will try to enable roguelite mode');
      console.log('[StartScene] ENABLE_ROGUELITE missing:', !window.ENABLE_ROGUELITE);
      console.log('[StartScene] HangarScene missing:', !window.HangarScene);
      
      // Show a message about how to enable the hangar
      if (!window.ENABLE_ROGUELITE) {
        console.log('[StartScene] To enable hangar: Add ?roguelite=1 to URL or run window.SET_ROGUELITE_MODE(true)');
      }
      
      // Create a fallback hangar button if HangarScene is available but roguelite is disabled
      if (window.HangarScene && !window.ENABLE_ROGUELITE) {
        console.log('[StartScene] Creating fallback hangar button');
        const fallbackBtn = this.add.rectangle(w/2 - 100, h/2 + 80, 200, 40, 0x334455, 0.8)
          .setStrokeStyle(2, 0x556677)
          .setInteractive({ useHandCursor: true })
          .setDepth(20)
          .on('pointerdown', (pointer, localX, localY, event) => {
            if(event && event.stopPropagation) event.stopPropagation();
            this.scene.start('HangarScene');
          })
          .on('pointerover', function() { 
            this.setFillStyle(0x445566, 0.9);
            this.setStrokeStyle(2, 0x667788);
          })
          .on('pointerout', function() { 
            this.setFillStyle(0x334455, 0.8);
            this.setStrokeStyle(2, 0x556677);
          });
        
        this.add.text(w/2 - 100, h/2 + 80, 'HANGAR BAY', {
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#00ffaa'
        }).setOrigin(0.5).setDepth(30);
      }
    }
    
    // Controls info
    this.add.text(w/2 - 100, h/2 + 130, 'Controls: ← → move, Space fire, P pause, M mute', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5).setDepth(30);
  }

  createSettingsPanel(w, h) {
    const t = { fontFamily: 'monospace', color: '#fff' };
    const settingsCenterX = w - 100; // Center of settings panel
    const settingsPanelTop = 30; // Top of settings panel (y=80 - height/2)
    
    // Settings title
    this.add.text(settingsCenterX, settingsPanelTop + 12, 'SETTINGS', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#00ffff'
    }).setOrigin(0.5).setDepth(30);
    
    // Quality setting
    const qModeInit = (Settings.getQualityMode && Settings.getQualityMode()) || 'auto';
    const qText = this.add.text(settingsCenterX, settingsPanelTop + 30, `Quality: ${qModeInit.toUpperCase()}`, {
      ...t,
      fontSize: '10px',
      color: '#0ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(30);
    
    // CRT setting
    const crtInit = (Settings.getCRT && Settings.getCRT());
    const crtText = this.add.text(settingsCenterX, settingsPanelTop + 45, `CRT: ${crtInit ? 'ON' : 'OFF'}`, {
      ...t,
      fontSize: '10px',
      color: '#0ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(30);
    
    // Renderer setting
    const rendInit = (Settings.getRenderer && Settings.getRenderer()) || 'auto';
    const rText = this.add.text(settingsCenterX, settingsPanelTop + 60, `Renderer: ${rendInit.toUpperCase()}`, {
      ...t,
      fontSize: '10px',
      color: '#0ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(30);
    
    // Roguelite setting
    const rogInit = !!(window && window.ENABLE_ROGUELITE);
    const rogText = this.add.text(settingsCenterX, settingsPanelTop + 75, `Roguelite: ${rogInit ? 'ON' : 'OFF'}`, {
      ...t,
      fontSize: '10px',
      color: rogInit ? '#0ff' : '#ff0000'  // Red if disabled, cyan if enabled
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(30);
    
    // Add click handlers for settings
    this.setupSettingsHandlers(qText, crtText, rText, rogText);
    
    // Special handler for roguelite - always force enable
    rogText.on('pointerdown', (p, lx, ly, ev) => {
      if(ev && ev.stopPropagation) ev.stopPropagation();
      console.log('[StartScene] Force enabling roguelite mode');
      if (window.FORCE_ENABLE_ROGUELITE) {
        window.FORCE_ENABLE_ROGUELITE();
      } else if (window.SET_ROGUELITE_MODE) {
        window.SET_ROGUELITE_MODE(true);
      }
      rogText.setText('Roguelite: ON').setColor('#0ff');
      this.showToast('Roguelite mode enabled');
    });
  }

  createLeaderboardSection(w, h) {
    const t = { fontFamily: 'monospace', color: '#fff' };
    const panelCenterY = h/2 + 50; // Center of the leaderboard panel
    
    // Leaderboard title
    this.add.text(w - 120, panelCenterY - 120, 'GLOBAL TOP 10', {
      ...t,
      fontSize: '16px',
      color: '#0ff'
    }).setOrigin(0.5).setDepth(30);
    
    // Leaderboard content
    const lbText = this.add.text(w - 120, panelCenterY - 30, 'Loading leaderboard...', {
      ...t,
      fontSize: '12px',
      color: '#bbb'
    }).setOrigin(0.5).setDepth(30);
    
    // Refresh button
    const refreshBtn = this.add.rectangle(w - 120, panelCenterY + 100, 100, 30, 0x0b0b12, 1)
      .setStrokeStyle(1, 0x00ffaa, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(20);
    
    this.add.text(w - 120, panelCenterY + 100, 'Refresh', {
      ...t,
      fontSize: '12px',
      color: '#0ff'
    }).setOrigin(0.5).setDepth(30);
    
    // Setup leaderboard functionality
    this.setupLeaderboard(lbText, refreshBtn);
  }

  setupGameLaunch() {
    const launchGame = () => {
      if(this._startingGame) return;
      this._startingGame = true;
      
      if(window.ENABLE_ROGUELITE && window.RunManager) {
        try {
          const mgr = window.RunManager;
          let run = mgr.getRunSnapshot ? mgr.getRunSnapshot() : null;
          if(!run || run.status !== 'in-progress') {
            run = mgr.beginRun({ graphId: 'sector-default', flags: { source: 'start-scene' } });
          }
          if(run && (!run.selectedNodes || !run.selectedNodes.length)) {
            mgr.chooseNode('start');
          }
        } catch(err) { 
          console.warn('[Roguelite] beginRun failed:', err); 
        }
      }
      this.scene.start('GameScene');
    };
    
    // Only listen for keyboard space - the start button already has its own click handler
    this.input.keyboard.once('keydown-SPACE', launchGame);
  }

  launchGame() {
    if(this._startingGame) return;
    this._startingGame = true;
    
    console.log('[StartScene] Launching game with countdown...');
    
    // Add a small delay to ensure countdown initializes properly
    this.time.delayedCall(100, () => {
      this.scene.start('GameScene');
    });
  }

  setupSettingsHandlers(qText, crtText, rText, rogText) {
    // Quality setting handler
    qText.on('pointerdown', (p, lx, ly, ev) => {
      if(ev && ev.stopPropagation) ev.stopPropagation();
      try {
        const cur = (Settings.getQualityMode && Settings.getQualityMode()) || 'auto';
        const order = ['auto', 'high', 'medium', 'low'];
        const i = Math.max(0, order.indexOf(cur));
        const next = order[(i + 1) % order.length];
        Settings.setQualityMode && Settings.setQualityMode(next);
        qText.setText(`Quality: ${next.toUpperCase()}`);
        this.showToast(`Quality set to ${next.toUpperCase()}`);
      } catch(e) {}
    });
    
    // CRT setting handler
    crtText.on('pointerdown', (p, lx, ly, ev) => {
      if(ev && ev.stopPropagation) ev.stopPropagation();
      try {
        const now = !Settings.getCRT();
        Settings.setCRT(now);
        Settings.applyCRTToDOM && Settings.applyCRTToDOM();
        crtText.setText(`CRT: ${now ? 'ON' : 'OFF'}`);
        this.showToast(`CRT Overlay ${now ? 'ON' : 'OFF'}`);
      } catch(e) {}
    });
    
    // Renderer setting handler
    rText.on('pointerdown', (p, lx, ly, ev) => {
      if(ev && ev.stopPropagation) ev.stopPropagation();
      try {
        const opts = ['auto', 'webgl', 'canvas'];
        const cur = (Settings.getRenderer && Settings.getRenderer()) || 'auto';
        const idx = Math.max(0, opts.indexOf(cur));
        const next = opts[(idx + 1) % opts.length];
        Settings.setRenderer && Settings.setRenderer(next);
        rText.setText(`Renderer: ${next.toUpperCase()}`);
        this.showToast(`Renderer set to ${next.toUpperCase()}. Reload to apply.`);
      } catch(e) {}
    });
  }

  setupLeaderboard(lbText, refreshBtn) {
    const w = this.scale.width, h = this.scale.height;
    
    const renderList = (list) => {
      if(!list || !list.length) {
        lbText.setText('No scores yet');
        return;
      }
      const lines = list.map((r, i) => {
        const d = r.createdAt ? new Date(r.createdAt) : new Date();
        const ds = d.toLocaleDateString();
        return `${String(i + 1).padStart(2, ' ')}. ${r.name.slice(0, 12).padEnd(12, ' ')} ${String(r.score).padStart(6, ' ')}`;
      });
      lbText.setText(lines.join('\n'));
    };
    
    const loadOnce = () => {
      try {
        if(window.Leaderboard && window.Leaderboard.getTop10) {
          window.Leaderboard.getTop10().then(renderList).catch(() => 
            lbText.setText('Leaderboard unavailable')
          );
        } else {
          lbText.setText('Enable leaderboard in index.html');
        }
      } catch(e) {
        lbText.setText('Leaderboard unavailable');
      }
    };
    
    loadOnce();
    setTimeout(() => {
      if(lbText.text.indexOf('\n') < 0 && lbText.text !== 'Leaderboard unavailable') {
        loadOnce();
      }
    }, 1500);
    
    refreshBtn.on('pointerdown', () => {
      lbText.setText('Loading leaderboard...');
      loadOnce();
    });
    
    refreshBtn.on('pointerover', () => {
      refreshBtn.setFillStyle(0x111522, 1);
    });
    
    refreshBtn.on('pointerout', () => {
      refreshBtn.setFillStyle(0x0b0b12, 1);
    });
  }

  showToast(msg) {
    const w = this.scale.width, h = this.scale.height;
    const g = this.add.container(w/2, h - 60).setDepth(2000);
    const bg = this.add.rectangle(0, 0, Math.min(660, w - 60), 34, 0x000000, 0.75)
      .setStrokeStyle(1, 0x00ffaa, 0.8);
    const tx = this.add.text(0, 0, msg, {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#0ff'
    }).setOrigin(0.5);
    g.add([bg, tx]);
    this.tweens.add({
      targets: g,
      alpha: { from: 1, to: 0 },
      duration: 1400,
      delay: 1400,
      onComplete: () => g.destroy()
    });
  }
}

// Make StartScene globally available
window.StartScene = StartScene;
console.log('[StartScene] StartScene loaded and available globally');

// Debug function to enable hangar
window.enableHangar = function() {
  console.log('[StartScene] Enabling hangar...');
  if (window.SET_ROGUELITE_MODE) {
    window.SET_ROGUELITE_MODE(true);
    console.log('[StartScene] Roguelite enabled, refreshing page...');
    location.reload();
  } else {
    console.log('[StartScene] SET_ROGUELITE_MODE not available');
  }
};
