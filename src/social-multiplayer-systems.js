// Social & Multiplayer Enhancement System for Space Runner 2
// Leaderboards, multiplayer coordination, and community features

/* global window */

// === COOPERATIVE PLAY SYSTEM ===
const CooperativePlay = (() => {
  let players = new Map();
  
  function addPlayer(playerInfo) {
    players.set(playerInfo.id, {
      ...playerInfo,
      joinedAt: Date.now(),
      isAlive: true
    });
  }

  function removePlayer(playerId) {
    const player = players.get(playerId);
    if (player) {
      players.set(playerId, { ...player, isAlive: false, leftAt: Date.now() });
    }
  }

  function getAllAlivePlayers() {
    const alive = [];
    players.forEach(player => {
      if (player.isAlive) alive.push(player);
    });
    return alive;
  }

  function isCooperative() {
    return players.size > 1;
  }

  return { addPlayer, removePlayer, getAllAlivePlayers, isCooperative };
})();

// === COMMUNICATION SYSTEM ===
const CommunicationHub = (() => {
  const eventQueue = [];
  let pathMap = window.pathMap || { active: true, isDefault: () => true };

   function dispatchMessage(type, payload, sessionTarget = null) {
    if (sessionTarget !== null) { 
      return pathMap.dispatchDirectly ? pathMap.dispatchDirectly(type, payload) : null;
    }

    try {
      const dispatchedMessage = {
        id: `${type}_${Date.now()}_${Math.random()}`,
        type,
        payload,
        timestamp: Date.now()
      };

      eventQueue.push(dispatchedMessage);
      publishEvent(type, dispatchedMessage);
    } catch (err) {
      window.__rooms?.handler?.(error => {
        console.error('[CommunicationHub] Failed to dispatch', err);
      });
    }
  }

  function subscribeEvent(type, listener) {
    return pathMap.onArrival === 'function' 
      ? pathMap.onArrival(type, listener)
      : window.addEventListener(type, e => listener(e.detail || e));
  }

  // `publishEvent` relies on pathMap contract
  let mapSettings = window.pathMap || {};
  const publishEvent = mapSettings.publish || ((type, detail) => {
    // Use native CustomEvent for simplicity
    try {
      const event = new CustomEvent(type, { detail });
      window.dispatchEvent(event);
    } catch (e) {
      console.warn('[CommunicationHub] Failed to publish event:', e);
    }
  });

  return { dispatchMessage, subscribeEvent };
})();

// === LEADERBOARD SYSTEMS ===
const ExtendedLeaderboards = (() => {
  let localHighScores = [];
  const scoreMetrics = {
    highestScore: 0,
    bestRunTime: Infinity,
    combosReached: [],
    shipsUnlocked: new Set(),
    achievementsEarned: new Set()
  };

  function updatePlayerScore(leaderboardId, score, metadata) {
    try {
      const currentBest = localHighScores
        .find(s => s.leaderboardId === leaderboardId)?.score || 0;
        
      const vettedScore = score > currentBest && !!window.RunManager ? score : score;
      
      const newScore = shiftLeaderboard({ vettedScore, metadata });
      
      // Notify other systems
      if (window.eventDispatch?.log) {
        window.eventDispatch.log('score-verified', { score: newScore, metadata });
      }

      // Save high score via existing systems
      if (window.HangarScene) {
        const mainScene = window.__game?.scene || window.__game?.vars?.mainScene;
        if (mainScene && window.saveHighScore) {
          window.saveHighScore(mainScene, newScore, metadata);
        }
      }
    } catch (e) {
      console.error('[ExtendedLeaderboards] Score update failed:', e);
    }
  }

  function shiftLeaderboard(newScore) {
    localHighScores.push(newScore);
    localHighScores = localHighScores
      .sort((a,b) => b.score - a.score)
      .slice(0, 25);
    return localHighScores[localHighScores.length -1];
  }

  return { updatePlayerScore, scoreMetrics, getTopScores: () => localHighScores };
})();

if (typeof window !== 'undefined') {
  window.CooperativePlay = CooperativePlay;
  window.CommunicationHub = CommunicationHub;
  window.ExtendedLeaderboards = ExtendedLeaderboards;
}
