// Enhanced Gameplay Mechanics for Space Runner 2
// Advanced ship combat, dynamic mission generation, and deeper gameplay systems

/* global Phaser, window */

// === DYNAMIC DIFFICULTY SYSTEM ===
const DifficultyScaling = (() => {
  const SCALING_TYPES = {
    ADAPTIVE: 'adaptive',    // Based on player performance
    PROGRESSIVE: 'progressive', // Based on run progress
    HUNGRY: 'hungry',        // Gets harder with each level
    PLATEAU: 'plateau'      // Stays consistent
  };

  let currentScaling = SCALING_TYPES.ADAPTIVE;
  let performanceHistory = [];

  function updatePerformance(metrics) {
    performanceHistory.push({
      timestamp: Date.now(),
      levelTime: metrics.levelTime,
      damageTaken: metrics.damageTaken,
      hitsLanded: metrics.hitsLanded,
      accuracy: metrics.accuracy,
      comboReached: metrics.comboReached,
      powerupsUsed: metrics.powerupsUsed
    });
    
    // Keep only recent history
    const twentyMinutesAgo = Date.now() - 1200000;
    performanceHistory = performanceHistory.filter(h => h.timestamp > twentyMinutesAgo);
  }

  function getDifficultyMultiplier(context = {}) {
    const avgLevelTime = getAverageLevelTime();
    const recentDamage = getRecentDamageTaken();
    const baseDifficulty = 1.0;
    
    if (currentScaling === SCALING_TYPES.PROGRESSIVE) {
      return Math.min(2.5, baseDifficulty + (context.runProgress || 0) * 0.1);
    } else if (currentScaling === SCALING_TYPES.HUNGRY) {
      return Math.min(3.0, baseDifficulty + context.level * 0.15);
    } else if (currentScaling === SCALING_TYPES.ADAPTIVE && performanceHistory.length > 0) {
      // Adaptive based on recent performance
      if (avgLevelTime < 45000 && recentDamage < 0.3) {
        return Math.min(2.8, baseDifficulty + 0.4); // Player doing well - increase difficulty
      } else if (avgLevelTime > 80000 || recentDamage > 0.7) {
        return Math.max(0.6, baseDifficulty - 0.3); // Player struggling - decrease difficulty
      }
    }
    
    return baseDifficulty;
  }

  function getAverageLevelTime() {
    if (performanceHistory.length === 0) return 60000;
    const total = performanceHistory.reduce((sum, h) => sum + h.levelTime, 0);
    return total / performanceHistory.length;
  }

  function getRecentDamageTaken() {
    if (performanceHistory.length < 2) return 0.5;
    const recent = performanceHistory.slice(-5);
    return recent.reduce((sum, h) => sum + (h.damageTaken / 100), 0) / recent.length;
  }

  return {
    setScalingType: (type) => { currentScaling = type; },
    updatePerformance,
    getDifficultyMultiplier,
    SCALING_TYPES
  };
})();

// === ADVANCED WEAPON SYSTEMS ===
const WeaponSystems = (() => {
  const WEAPON_TYPES = {
    LASER: {
      id: 'laser',
      name: 'Laser Cannon',
      damage: 1,
      fireRate: 250,
      energyCost: 10,
      projectileSpeed: 400,
      specialEffects: ['pierce_trail', 'charge_sound']
    },
    MISSILES: {
      id: 'missiles',
      name: 'Missile Battery',
      damage: 3,
      fireRate: 1200,
      energyCost: 40,
      projectileSpeed: 200,
      specialEffects: ['seeking', 'explosion']
    },
    PLASMA: {
      id: 'plasma',
      name: 'Plasma Cannon',
      damage: 2,
      fireRate: 400,
      energyCost: 20,
      projectileSpeed: 280,
      specialEffects: ['orbital_pattern', 'chain_reaction']
    }
  };

  let equippedWeapons = [{ type: 'laser', level: 1 }];

  function fireWeapon(scene, ship, weaponIndex = 0) {
    const weapon = equippedWeapons[weaponIndex];
    if (!weapon) return false;

    const config = WEAPON_TYPES[weapon.type.toUpperCase()];
    if (!config) return false;

    // Create weapon-specific projectile
    createWeaponProjectile(scene, ship, config, weapon.level);
    return true;
  }

  function createWeaponProjectile(scene, ship, config, level) {
    const bullet = scene.physics.add.sprite(ship.x, ship.y - 20, config.id);
    if (!bullet) return;

    bullet.setScale(1 + level * 0.1); // Slightly larger with upgrades
    
    // Apply weapon-specific behaviors
    if (config.specialEffects.includes('seeking')) {
      makeSeekingMissile(scene, bullet);
    } else if (config.specialEffects.includes('orbital_pattern')) {
      makeOrbitalProjectile(scene, bullet);
    } else {
      // Standard projectile
      bullet.setVelocityY(-config.projectileSpeed);
    }

    // Add weapon trails and effects
    if (config.specialEffects.includes('pierce_trail')) {
      addTrailEffect(scene, bullet, 'pierce');
    }

    // Enable collision for all projectiles
    scene.projectiles.add(bullet);
    scene.physics.add.overlap(bullet, scene.enemies, scene.hitProjectile, null, scene);
  }

  function makeSeekingMissile(scene, missile) {
    missile.seeking = true;
    missile.missileSpeed = 150;
    missile.turnRate = 0.05;
    
    // Update method to seek nearest enemy
    scene.events.on('update', function() {
      if (!missile || !missile.active) return;
      
      const nearest = findNearestEnemy(scene, missile);
      if (nearest) {
        const angleToTarget = Phaser.Math.Angle.Between(
          missile.x, missile.y, 
          nearest.x, nearest.y
        );
        missile.rotation = angleToTarget;
        missile.setVelocity(
          Math.cos(angleToTarget) * missile.missileSpeed,
          Math.sin(angleToTarget) * missile.missileSpeed
        );
      }
    });
  }

  function makeOrbitalProjectile(scene, bullet) {
    bullet.orbital = true;
    bullet.orbitRadius = 50;
    bullet.orbitSpeed = 0.1;
    bullet.baseX = bullet.x;
    bullet.baseY = bullet.y;
    
    scene.events.on('update', function() {
      if (!bullet || !bullet.active) return;
      
      const t = scene.time.now * bullet.orbitSpeed;
      bullet.setPosition(
        bullet.baseX + Math.cos(t) * bullet.orbitRadius,
        bullet.baseY + Math.sin(t) * bullet.orbitRadius
      );
    });
  }

  function addTrailEffect(scene, projectile, trailType) {
    const trail = scene.add.graphics();
    const trailData = {
      x: projectile.x,
      y: projectile.y,
      time: scene.time.now
    };
    
    scene.events.on('update', function() {
      if (!projectile || !projectile.active) return;
      
      const age = scene.time.now - trailData.time;
      if (age > 1000) return; // Trail lifespan
      
      trail.clear();
      trail.lineStyle(2, 0x00ffff, 1 - (age / 1000));
      
      trail.beginPath();
      trail.moveTo(projectile.x - projectile.getVelocityX() * 0.5, 
                   projectile.y - projectile.getVelocityY() * 0.5);
      trail.lineTo(projectile.x, projectile.y);
      trail.stroke();
    });
  }

  function findNearestEnemy(scene, fromProjectile) {
    if (!scene.enemies) return null;
    
    let nearest = null;
    let distance = Infinity;
    
    scene.enemies.getChildren().forEach(enemy => {
      const dist = Phaser.Math.Distance.Between(fromProjectile.x, fromProjectile.y, 
                                                enemy.x, enemy.y);
      if (dist < distance) {
        distance = dist;
        nearest = enemy;
      }
    });
    
    return nearest;
  }

  return {
    equipWeapon: (weaponType, slot = 0) => {
      equippedWeapons[slot] = { type: weaponType, level: 1 };
    },
    fireWeapon,
    getEquippedWeapons: () => equippedWeapons,
    upgradeWeapon: (slot, increment = 1) => {
      if (equippedWeapons[slot]) {
        equippedWeapons[slot].level += increment;
      }
    },
    WEAPON_TYPES
  };
})();

// === MISSION TIMERS AND OBJECTIVES ===
const MissionObjectives = (() => {
  let currentObjectives = [];
  let missionTimer = null;

  function createObjective(type, config) {
    const objective = {
      id: `obj_${Date.now()}_${Math.random()}`,
      type: type,
      config: config,
      completed: false,
      data: {}
    };
    
    currentObjectives.push(objective);
    return objective;
  }

  function completeObjective(objectiveId) {
    const obj = currentObjectives.find(o => o.id === objectiveId);
    if (obj && !obj.completed) {
      obj.completed = true;
      return obj;
    }
    return null;
  }

  function checkObjectiveCompletion(scene, objectiveId) {
    const obj = currentObjectives.find(o => o.id === objectiveId);
    if (!obj || obj.completed) return;
    
    let isComplete = false;
    
    switch (obj.type) {
      case 'timeLimit':
        isComplete = obj.config.targetTime > (scene.time.now - obj.config.startTime);
        break;
        
      case 'destroyEnemies':
        isComplete = (obj.data.enemiesDestroyed || 0) >= obj.config.minDestroyed;
        break;
        
      case 'protectTarget':
        isComplete = obj.data.targetHealth > 0 && obj.config.minHealth;
        break;
        
      case 'collectSalvage':
        isComplete = (obj.data.salvageCollected || 0) >= obj.config.minAmount;
        break;
    }
    
    if (isComplete) {
      return completeObjective(objectiveId);
    }
    
    return null;
  }

  // Objective template generators
  function generateTimeLimitSecured(customConfig = {}) {
    return createObjective('timeLimit', {
      description: 'Survive for [time] seconds',
      targetTime: 120000, // 2 minutes default
      startTime: Date.now(),
      ...customConfig
    });
  }

  function generateEnemyElimination(customConfig = {}) {
    return createObjective('destroyEnemies', {
      description: 'Eliminate [count] enemies',
      minDestroyed: 15,
      ...customConfig
    });
  }

  function generateProtectionEscort(customConfig = {}) {
    return createObjective('protectTarget', {
      description: 'Protect cargo drone until it reaches safety',
      targetHealth: 100,
      ...customConfig
    });
  }

  function getAllCurrentObjectives() {
    return currentObjectives.filter(obj => !obj.completed);
  }

  function isMissionComplete() {
    return currentObjectives.every(obj => obj.completed);
  }

  function clearAllObjectives() {
    currentObjectives = [];
  }

  return {
    createObjective,
    completeObjective,
    checkObjectiveCompletion,
    generateTimeLimitSecured,
    generateEnemyElimination,
    generateProtectionEscort,
    getAllCurrentObjectives,
    isMissionComplete,
    clearAllObjectives,
    getAllObjectives: () => currentObjectives
  };
})();

// === ENHANCED AI BEHAVIORS ===
const EnhancedAI = (() => {
  const BEHAVIOR_PATTERNS = {
    SWARM: {
      name: 'Swarm',
      aggressionLevel: 0.6,
      movementPattern: 'flocking',
      specialTraits: ['forming_position']
    },
    HUNTER: {
      name: 'Hunter',
      aggressionLevel: 0.9,
      movementPattern: 'player_seeking',
      specialTraits: ['improved_accuracy', 'fake_out_hover']
    },
    DEFENDER: {
      name: 'Defender',
      aggressionLevel: 0.4,
      movementPattern: 'area_protection',
      specialTraits: ['shield_barriers', 'defensive_formation']
    },
    STALKER: {
      name: 'Stalker',
      aggressionLevel: 0.8,
      movementPattern: 'ambush_positions',
      specialTraits: ['sound_production', 'camouflaging']
    }
  };

  function applyBehaviorPattern(enemyShip, patternName) {
    const pattern = BEHAVIOR_PATTERNS[patternName] || BEHAVIOR_PATTERNS.SWARM;
    
    enemyShip.behavior = {
      aggressive: pattern.aggressionLevel,
      onUpdate: null,
      specialActive: {}
    };

    // Apply pattern-specific behavior based on specialTraits
    if (pattern.specialTraits.includes('forming_position')) {
      setFlockingBehavior(enemyShip);
    }
    if (pattern.specialTraits.includes('player_seeking')) {
      setSearchingBehavior(enemyShip);
    }
    if (pattern.specialTraits.includes('shield_barriers')) {
      createShieldForEnemy(enemyShip);
    }
    
    return enemyShip.behavior;
  }

  function setFlockingBehavior(enemyShip) {
    let flockCenterX = 0, flockCenterY = 0;
    let flockCount = 0;
    
    enemyShip.behavior.onUpdate = function(scene) {
      if (!enemyShip || !enemyShip.active) return;
      
      // Seek other bearers of this pattern and form formations
      const nearby = scene.physics.world.overlap(enemyShip.getBounds(), 
        scene.enemies.getChildren().filter(e => e.behavior && 
          e.behavior.onUpdate === this));
      
      if (nearby) {
        const offsetX = (Math.sin(scene.time.now * 0.002) * 50);
        const offsetY = (Math.cos(scene.time.now * 0.002) * 50);
        
        enemyShip.setVelocity(
          (flockCenterX + offsetX - enemyShip.x) * 0.02,
          (flockCenterY + offsetY - enemyShip.y) * 0.02
        );
      }
    };
  }

  function setSearchingBehavior(enemyShip) {
    enemyShip.behavior.onUpdate = function(scene) {
      if (!enemyShip || !enemyShip.active || !scene.player) return;
      
      // Hunt player character
      const speedTarget = scene.settings.hunterSpeed || 3;
      const angleToPlayer = Phaser.Math.Angle.Between(enemyShip.x, enemyShip.y, 
        scene.player.x, scene.player.y);
      
      if (Math.abs(angleToPlayer - enemyShip.rotation) < 0.1) { 
        Phaser.Math.Linear.moveTo2DObject(enemyShip, scene.player, speedTarget);
      } else {
        Phaser.Math.Linear.rotateToAngle2DObject(enemyShip, angleToPlayer, 0.02);
      }
    };
  }

  function createShieldForEnemy(enemyShip) {
    const scene = enemyShip.scene || {};
    enemyShip.behavior.specialActive.shield = {
      totalHp: 6,
      remainingHp: 6,
      regenDelay: 5000,
      lastDamage: scene.time ? scene.time.now : 0
    };
  }

  return {
    applyBehaviorPattern,
    BEHAVIOR_PATTERNS,
    setFlockingBehavior,
    setSearchingBehavior
  };
})();

// Exports
if (typeof window !== 'undefined') {
  window.DifficultyScaling = DifficultyScaling;
  window.WeaponSystems = WeaponSystems;
  window.MissionObjectives = MissionObjectives;
  window.EnhancedAI = EnhancedAI;
}

