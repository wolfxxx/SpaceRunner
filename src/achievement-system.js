// Advanced Achievement System for Space Runner 2
// Provides comprehensive milestone tracking and reward systems

/* global window, localStorage */
const AchievementSystem = (() => {
  const STORAGE_KEY = 'si_achievements_v1';
  const DEFAULT_ACHIEVEMENTS = {
    unlocked: [],
    progress: {},
    completedRuns: [],
    skinsUnlocked: [],
    titlesUnlocked: []
  };

  // Comprehensive achievement definitions
  const ACHIEVEMENT_DEFINITIONS = {
    // First Play Milestones
    'first_run': {
      id: 'first_run',
      title: 'First Flight',
      description: 'Complete your first mission',
      icon: '🚀',
      category: 'basic',
      requirements: { type: 'run_completed', minCount: 1 }
    },
    'first_salvage': {
      id: 'first_salvage',
      title: 'Scavenger',
      description: 'Earn 100 salvage points',
      icon: '💎',
      category: 'currency',
      requirements: { type: 'salvage_earned', minAmount: 100 }
    },
    'first_core': {
      id: 'first_core',
      title: 'Energy Source',
      description: 'Harvest 10 energy cores',
      icon: '⚡',
      category: 'currency',
      requirements: { type: 'cores_earned', minAmount: 10 }
    },

    // Customization
    'ship_master': {
      id: 'ship_master',
      title: 'Hangar Master',
      description: 'Unlock all ship types',
      icon: '🛸',
      category: 'collection',
      requirements: { type: 'ships_unlocked', shipTypes: ['cruiser', 'dreadnought'] }
    },
    'upgrade_enthusiast': {
      id: 'upgrade_enthusiast',
      title: 'Systems Engineer',
      description: 'Purchase 20 total upgrades',
      icon: '⚙️',
      category: 'progress',
      requirements: { type: 'upgrades_purchased', minCount: 20 }
    },
    'ability_master': {
      id: 'ability_master',
      title: 'Specialist',
      description: 'Unlock all active abilities',
      icon: '✨',
      category: 'collection',
      requirements: { type: 'abilities_unlocked', abilityCount: 4 }
    },

    // Player Skill & Performance
    'combo_master': {
      id: 'combo_master',
      title: 'Chain Reaction',
      description: 'Reach 15x combo multiplier',
      icon: '🔥',
      category: 'skill',
      requirements: { type: 'combo_multiplier', minMultiplier: 15 }
    },
    'perfect_boss': {
      id: 'perfect_boss',
      title: 'Perfect Predator',
      description: 'Defeat a boss without taking damage',
      icon: '👑',
      category: 'skill',
      requirements: { type: 'boss_perfect_kill' }
    },
    'speed_demon': {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Complete a level in under 60 seconds',
      icon: '⚡',
      category: 'skill',
      requirements: { type: 'fast_level', maxTime: 60000 }
    },

    // Exploration & Discovery
    'explorer': {
      id: 'explorer',
      title: 'Sector Explorer',
      description: 'Visit all mission node types',
      icon: '🗺️',
      category: 'discovery',
      requirements: { type: 'node_types_visited', minTypes: 5 }
    },
    'pathfinder': {
      id: 'pathfinder',
      title: 'Pathfinder',
      description: 'Take all available routes in a run',
      icon: '🗺️',
      category: 'discovery',
      requirements: { type: 'routes_explored', percentage: 100 }
    },
    'modifier_expert': {
      id: 'modifier_expert',
      title: 'Adaptation Expert',
      description: 'Successfully complete missions with all hazard modifiers',
      icon: '🌪️',
      category: 'discovery',
      requirements: { type: 'modifiers_experienced', percentage: 100 }
    },

    // Long-term Progress
    'veteran_pilot': {
      id: 'veteran_pilot',
      title: 'Veteran Pilot',
      description: 'Complete 50 total runs',
      icon: '🏅',
      category: 'progress',
      requirements: { type: 'runs_completed', minCount: 50 }
    },
    'prestige_ready': {
      id: 'prestige_ready',
      title: 'Legend Status',
      description: 'Accumulate 10,000 lifetime salvage',
      icon: '💯',
      category: 'milestone',
      requirements: { type: 'lifetime_salvage', minAmount: 10000 }
    },
    'core_collector': {
      id: 'core_collector',
      title: 'Energy Specialist',
      description: 'Accumulate 200 cores',
      icon: '🔋',
      category: 'milestone',
      requirements: { type: 'lifetime_cores', minAmount: 200 }
    },

    // Exclusive Challenges
    'nightmare_mode': {
      id: 'nightmare_mode',
      title: 'Nightmare Pilot',
      description: 'Complete a run with no upgrades',
      icon: '😈',
      category: 'challenge',
      requirements: { type: 'no_upgrade_run_completion' }
    },
    'penniless': {
      id: 'penniless',
      title: 'Resource Minimalist',
      description: 'Complete 5 runs without spending salvage',
      icon: '🪙',
      category: 'challenge',
      requirements: { type: 'consecutive_no_spend_runs', count: 5 }
    }
  };

  // Achievement Categories for UI organization
  const CATEGORY_SYSTEM = {
    'basic': { name: 'First Steps', description: 'Introductory milestones', color: '#00ffff' },
    'currency': { name: 'Resources', description: 'Currency and collection milestones', color: '#ffaa00' },
    'collection': { name: 'Acquisition', description: 'Unlockable content achievements', color: '#8844ff' },
    'skill': { name: 'Pilot Skill', description: 'Skill-based challenges', color: '#ff4444' },
    'progress': { name: 'Station Progress', description: 'Long-term progression', color: '#44ff44' },
    'discovery': { name: 'Exploration', description: 'Discovery and exploration', color: '#44aaff' },
    'milestone': { name: 'Milestones', description: 'Major progression markers', color: '#ffff44' },
    'challenge': { name: 'Challenges', description: 'Optional difficult challenges', color: '#ff8888' }
  };

  let state = readState();

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_ACHIEVEMENTS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ACHIEVEMENTS, ...parsed };
    } catch (err) {
      console.warn('[AchievementSystem] Failed to read achievement state, resetting.', err);
      return { ...DEFAULT_ACHIEVEMENTS };
    }
  }

  function writeState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('[AchievementSystem] Failed to persist achievement state.', err);
    }
  }

  function checkAchievements(context = {}) {
    const completed = [];
    
    Object.keys(ACHIEVEMENT_DEFINITIONS).forEach(achievementId => {
      const achievement = ACHIEVEMENT_DEFINITIONS[achievementId];
      
      // Skip if already unlocked
      if (state.unlocked.includes(achievementId)) return;
      
      // Check if requirements are met
      if (checkRequirement(achievement.requirements, context)) {
        unlockAchievement(achievementId);
        completed.push(achievement);
      }
    });
    
    return completed;
  }

  function checkRequirement(req, context) {
    switch (req.type) {
      case 'run_completed':
        return (state.completedRuns || []).length >= req.minCount;
      
      case 'salvage_earned':
        const allSalvage = (state.completedRuns || [])
          .reduce((total, run) => total + (run.salvage || 0), 0);
        return allSalvage >= req.minAmount;
      
      case 'cores_earned':
        const allCores = (state.completedRuns || [])
          .reduce((total, run) => total + (run.cores || 0), 0);
        return allCores >= req.minAmount;
      
      case 'ships_unlocked':
        // Check against hangar ship unlocks
        const shipUnlocks = (state.progress.shipUnlocks || {});
        return req.shipTypes.every(ship => shipUnlocks[ship] === true);
      
      case 'upgrades_purchased':
        const upgradeCount = Object.values(state.progress.upgrades || {})
          .reduce((total, level) => total + (level || 0), 0);
        return upgradeCount >= req.minCount;
      
      case 'abilities_unlocked':
        const abilityCount = Object.values(state.progress.abilities || {})
          .filter(unlocked => unlocked === true).length;
        return abilityCount >= req.abilityCount;
      
      case 'combo_multiplier':
        return context.maxCombo >= req.minMultiplier;
      
      case 'boss_perfect_kill':
        return context.perfectBossKill === true;
      
      case 'fast_level':
        return context.levelTime <= req.maxTime;
      
      case 'node_types_visited':
        const nodeTypes = new Set((state.progress.visitedNodeTypes || []));
        return nodeTypes.size >= req.minTypes;
      
      case 'modifiers_experienced':
        const experiencedModifiers = new Set((state.progress.experiencedModifiers || []));
        const totalModifiers = Object.keys(ROGUELITE_MODIFIER_INFO || {}).length;
        const percentage = Math.floor((experiencedModifiers.size / totalModifiers) * 100);
        return percentage >= req.percentage;
      
      case 'runs_completed':
        return (state.completedRuns || []).length >= req.minCount;
      
      case 'lifetime_salvage':
      case 'lifetime_cores':
        return getLifetimeResource(req.type.replace('lifetime_', '')) >= req.minAmount;
      
      case 'no_upgrade_run_completion':
        return context.noUpgradeRunCompletion === true;
      
      case 'consecutive_no_spend_runs':
        return (state.progress.consecutiveNoSpendRuns || 0) >= req.count;
      
      default:
        console.warn('[AchievementSystem] Unknown requirement type:', req.type);
        return false;
    }
  }

  function getLifetimeResource(resourceType) {
    return (state.completedRuns || [])
      .reduce((total, run) => total + (run[resourceType] || 0), 0);
  }

  function unlockAchievement(achievementId) {
    if (!state.unlocked.includes(achievementId)) {
      state.unlocked.push(achievementId);
      state.unlocked.sort();
      writeState();
      
      // Notify other systems
      if (typeof window !== 'undefined' && window.RunManager) {
        try {
          window.RunManager.addUnlock(`achievement_${achievementId}`, true);
        } catch (e) {}
      }
      
      return ACHIEVEMENT_DEFINITIONS[achievementId];
    }
    return null;
  }

  function updateProgress(progressData) {
    Object.keys(progressData).forEach(key => {
      if (state.progress[key] !== undefined) {
        state.progress[key] = progressData[key];
      } else if (Array.isArray(state.progress[key]) && Array.isArray(progressData[key])) {
        // Merge arrays
        state.progress[key] = [...new Set([...state.progress[key], ...progressData[key]])];
      } else if (!Array.isArray(progressData[key])) {
        state.progress[key] = progressData[key];
      }
    });
    writeState();
  }

  function recordRunEvent(eventData) {
    state.completedRuns = (state.completedRuns || []).concat([{
      timestamp: Date.now(),
      ...eventData
    }]);
    writeState();
  }

  function getAchievementsByCategory() {
    const byCategory = {};
    Object.values(ACHIEVEMENT_DEFINITIONS).forEach(achievement => {
      const category = achievement.category || 'other';
      if (!byCategory[category]) byCategory[category] = [];
      
      byCategory[category].push({
        ...achievement,
        unlocked: state.unlocked.includes(achievement.id)
      });
    });
    return byCategory;
  }

  function getAllUnlocked() {
    return state.unlocked.map(id => ACHIEVEMENT_DEFINITIONS[id]).filter(Boolean);
  }

  function getProgressReport() {
    const total = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
    const unlocked = state.unlocked.length;
    const categories = Object.keys(CATEGORY_SYSTEM);
    
    return {
      totalAchievements: total,
      unlocked: unlocked,
      completionProgress: Math.floor((unlocked / total) * 100),
      lastUnlocked: state.unlocked.slice(-1)[0] || null,
      categoryProgress: categories.map(cat => {
        const memberAchievements = Object.values(ACHIEVEMENT_DEFINITIONS)
          .filter(a => a.category === cat);
        const unlockedCount = memberAchievements
          .filter(a => state.unlocked.includes(a.id)).length;
        return {
          name: cat,
          unlocked: unlockedCount,
          total: memberAchievements.length,
          progress: Math.floor((unlockedCount / memberAchievements.length) * 100)
        };
      })
    };
  }

  return {
    checkAchievements,
    updateProgress,
    recordRunEvent,
    getAchievementsByCategory,
    getAllUnlocked,
    getProgressReport,
    getCategorySystem: () => CATEGORY_SYSTEM,
    getDefinitions: () => ACHIEVEMENT_DEFINITIONS
  };
})();

// Export to window for use in scenes
if (typeof window !== 'undefined') {
  window.AchievementSystem = AchievementSystem;
}
