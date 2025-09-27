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
    
    // Professional background
    this.add.rectangle(w/2, h/2, w, h, 0x001122, 0.95);
    
    // Create main panels
    this.createMainPanels(w, h);
    
    // Header section
    this.createHeader(w, h);
    
    // Main content area
    this.createMainContent(w, h);
    
    // Settings panel
    this.createSettingsPanel(w, h);
    
    // Leaderboard section
    this.createLeaderboardSection(w, h);
    
    // Game launch logic
    this.setupGameLaunch();
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
    this.add.text(w/2 - 100, 50, 'SPACERUNNER', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#00ffff',
      stroke: '#004444',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(30);
    
    // Subtitle
    this.add.text(w/2 - 100, 90, 'Modern Phaser Edition', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(30);
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
      color: '#0ff'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(30);
    
    // Add click handlers for settings
    this.setupSettingsHandlers(qText, crtText, rText, rogText);
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
