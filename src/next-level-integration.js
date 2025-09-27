// Integration System for Next-Level Enhancement Features
// Coordinates all new systems and ties them into the existing game architecture

/* global window */

// === ENHANCEMENT ORCHESTRATOR ===
const NextLevelOrchestrator = (() => {
  let enhancements = [];
  let integrationState = {
    systemsLoaded: false,
    featuresActive: {},
    compatibilityMode: false
  };

  function initializeAllSystems() {
    console.log('[NextLevel] Initializing enhanced game systems...');
    
    const systemInitializers = [
      { name: 'AchievementSystem', module: window.AchievementSystem },
      { name: 'ParticleEffects', module: window.ParticleEffectsSystem },
      { name: 'AdaptiveAudio', module: window.AdaptiveAudio },
      { name: 'DynamicLighting', module: window.DynamicLighting },
      { name: 'CameraEffects', module: window.CameraEffects },
      { name: 'EnhancedAI', module: window.EnhancedAI },
      { name: 'WeaponSystems', module: window.WeaponSystems },
      { name: 'MissionObjectives', module: window.MissionObjectives },
      { name: 'DifficultyScaling', module: window.DifficultyScaling },
      { name: 'CooperativePlay', module: window.CooperativePlay }
    ];
    
    systemInitializers.forEach(init => {
      try {
        if (init.module && typeof init.module.initialize === 'function') {
          init.module.initialize();
          integrationState.featuresActive[init.name] = true;
          console.log('[NextLevel] System initialized:', init.name);
        }
      } catch (err) {
        console.warn(`[NextLevel] Failed to initialize ${init.name}:`, err);
      }
    });
    
    integrationState.systemsLoaded = true;
    performSystemIntegrations();
    
    return integrationState;
  }

  function performSystemIntegrations() {
    console.log('[NextLevel] Integrating systems with existing game...');
    
    try {
      // Hook into game start events only if they don't already exist
      if (!window.__nextLevelHooked) {
        window.__nextLevelHooked = true;
        
        window.addEventListener('gameStart', handleGameStart);
        window.addEventListener('gameEnd', handleGameEnd);
        window.addEventListener('levelComplete', handleLevelComplete);
        
        // Hook into existing roguelike events
        if (window.RunManager) {
          // Extend existing functions rather than replace them
          const originalBeginRun = window.RunManager.beginRun;
          const originalCompleteRun = window.RunManager.completeRun;
          
          window.RunManager.beginRun = function(options) {
            const result = originalBeginRun.call(this, options);
            integrateRunStart(result);
            return result;
          };
          
          window.RunManager.completeRun = function(outcome) {
            const result = originalCompleteRun.call(this, outcome);
            integrateRunComplete(result);
            return result;
          };
        }
        
        // Integrate with achievements
        if (window.AchievementSystem) {
          integrateAchievements();
        }
        
        console.log('[NextLevel] System integration hooks established');
      }
    } catch (err) {
      console.warn('[NextLevel] Integration warnings - running in compatibility mode:', err);
    }
  }

  function integrateRunStart(runData) {
    console.log('[NextLevel] Run started - integrating enhanced features');
    
    if (window.DifficultyScaling) {
      window.DifficultyScaling.updatePlayerPerformance({
        levelTime: 60000,
        damageTaken: 0.2,
        accuracy: 0.85
      });
    }
    
    if (window.MissionObjectives) {
      // Generate objectives based on sector
      window.MissionObjectives.generateEnemyElimination({
        target: 25,
        objectiveTitle: 'Elite Squadron Hunt'
      });
    }
    
    if (window.EnhancedAI) {
      // Adjust enemy patterns dynamically
      window.EnhancedAI.applyBehaviorPatternToScene?.(
        window.GameScene, 'HUNTER_STALK', aggressionLevel
      );
    }
  }

  function integrateRunComplete(runData) {
    if (window.AchievementSystem && window.RunManager) {
      const achievementContext = {
        runSuccess: runData.success,
        runProgress: runData.nodeIndex,
        salvageEarned: runData.salvageEarned,
        coresEarned: runData.coresEarned
      };
      
      window.AchievementSystem.checkAchievements(achievementContext);
      window.AchievementSystem.recordRunEvent(achievementContext);
    }
    
    // Notify leaderboards
    if (window.ExtendedLeaderboards && runData.success) {
      window.ExtendedLeaderboards.updatePlayerScore('roguelike_runs', runData.salvageEarned, {
        coresEarned: runData.coresEarned,
        runTime: runData.nodeIndex,
        difficulty: 'generated'
      });
    }
  }

  function integrateAchievements() {
    if (!window.RunManager || !window.AchievementSystem) return;
    
    const originalAdjustCurrencies = window.RunManager.adjustCurrencies.bind(window.RunManager);
    window.RunManager.adjustCurrencies = function(delta) {
      const result = originalAdjustCurrencies(delta);
      
      // Trigger achievement checks
      window.AchievementSystem.updateProgress(delta);
      
      return result;
    };
  }

  function handleGameStart(event) {
    console.log('[NextLevel] Game starting - enabling enhanced features');
    if (window.ParticleEffectsSystem) {
      window.ParticleEffectsSystem.enableEnhancedVisuals();
    }
    
    if (window.AdaptiveAudio) {
      window.AdaptiveAudio.enhanceMusicWithGameplay();
    }
    
    if (window.DynamicLighting) {
      window.DynamicLighting.enableDynamicLighting();
    }
  }

  function handleGameEnd(event) {
    console.log('[NextLevel] Game ending - processing enhanced feedback');
    if (window.AchievementSystem) {
      window.AchievementSystem.checkAchievements({
        levelCompleted: true,
        timeElapsed: event.detail?.timeElapsed,
        perfectLevel: event.detail?.perfect
      });
    }
  }

  function handleLevelComplete(event) {
    const levelData = event.detail || {};
    if (window.MissionObjectives && window.MissionObjectives.isMissionComplete()) {
      window.MissionObjectives.completeMissionSummary({
        final_salvage: levelData.salvage,
        missionObjectives: window.MissionObjectives.getAllObjectives()
      });
    }
  }

  function checkSystemCompatibility() {
    const missingSystems = [];
    const essentialModules = [
      'AchievementSystem', 'ParticleEffectsSystem', 'AdaptiveAudio'
    ];
    
    essentialModules.forEach(moduleName => {
      if (!window[moduleName]) {
        missingSystems.push(moduleName);
      }
    });
    
    if (missingSystems.length > 0) {
      console.warn('[NextLevel] Missing essential systems:', missingSystems.join(', '));
      integrationState.compatibilityMode = true;
    }
  }

  function initializeGameIntegration() {
    console.log('[NextLevel] Connecting enhanced systems to existing game architecture...');
    
    checkSystemCompatibility();
    if (!integrationState.compatibilityMode) {
      initializeAllSystems();
    } else {
      console.log('[NextLevel] Running in compatibility mode');
    }
    
    window.__nextLevel = {
      getIntegrationState: () => integrationState,
      reloadIntegrations: performSystemIntegrations
    };
  }

  return {
    initializeGameIntegration,
    checkSystemCompatibility,
    integrateRunStart,
    integrateRunComplete
  };
})();

// === PROGRESSIVE ENHANCEMENT ACTIVATOR ===
const ProgressiveEnhancementLoader = (() => {
  const loadSequence = [];
  
  // Phase 1: Core Enhancements (compatible with any game state)
  loadSequence.push(() => {
    if (window.AchievementSystem) window.AchievementSystem.initialize();
    if (window.AdaptiveAudio) window.AdaptiveAudio.initialize();
  });
  
  // Phase 2: Enhanced UI & Visual Effects  
  loadSequence.push(() => {
    if (window.ParticleEffectsSystem && window.DynamicLighting) {
      console.log('[Progressive] Enhancing game visual effects');
      return true;
    }
    return false;
  });
  
  // Phase 3: Advanced Gameplay (requires game world initialization)
  loadSequence.push(() => {
    const initialized = (window.WeaponSystems && 
                        window.EnhancedAI && 
                        window.MissionObjectives);
    console.log('[Progressive] Advanced gameplay systems initialized:', initialized);
    return initialized;
  });
  
  function progressively_enhance_game() {
    console.log('[Progressive] Starting progressive enhancement sequence...');
    
    let successCount = 0;
    loadSequence.forEach((phase, index) => {
      const success = phase(); 
      if (success === true) {
        successCount++;
      }
    });
    
    console.log(`[Progressive] Enhancement phases active: ${successCount}/${loadSequence.length}`);
  }
  
  // Auto-load enhancements when page/hangar fully loaded
  const activator = function execute_if_final_hangar_ready(){
      // Prevent multiple execution
      if (window.__nextLevelActivated) return;
      
      let ok = window.RunManager !== undefined;
      if (ok && window.HangarScene && window.StartScene) {
          window.__nextLevelActivated = true;
          progressively_enhance_game();
      } else {
          setTimeout(execute_if_final_hangar_ready, 1200);
      }
  }

  return {
    loadAllEnhancements: progressively_enhance_game,
    executeWhenGameRady: () => setTimeout(activator, 100)
  };
})();

// === FINAL INTEGRATION ACTIVATOR ===
(function NextLevelBootstrap() {
  if (typeof window === 'undefined') return; // NodeJS or deno server protection

  window.ModulesTrackable = {
    AchievementSystem: !!window.AchievementSystem,
    EnhancedGameplay: !!window.EnhancedAI || (!!window.WeaponSystems || !!window.EnhancedAI),
    VisualAudio: !!window.ParticleEffectsSystem || !!window.AdaptiveAudio || !!window.DynamicLighting,
    Naming: {
      orchestrator: NextLevelOrchestrator,
      loader: ProgressiveEnhancementLoader
    }
  };
  
  const bootstrap = () => {
    console.log('[NextLevel] 🚀 Starting Next-Level Enhancement Protocol...');
    window.NextLevelOrchestrator?.initializeGameIntegration();
    window.ProgressiveEnhancementLoader?.executeWhenGameRady(); 
  };
  
  // Activate when scene scripts loaded or after short delay
  const activationTimeout = 333;
  if (typeof document != 'undefined' && document.body) bootstrap();
  else setTimeout(bootstrap, activationTimeout); 
})();

// Export main modules for external consumption
if (typeof window !== 'undefined') {
  window.NextLevelOrchestrator = NextLevelOrchestrator;
  window.ProgressiveEnhancementLoader = ProgressiveEnhancementLoader;
  
  // Flag as "Next-Level Enhancement Ready" for boot-time detection
  window.__NEXT_LEVEL_READY = true;
}
