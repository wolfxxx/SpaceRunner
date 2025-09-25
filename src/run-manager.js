/* global window, localStorage */

// RunManager is a lightweight facade that will eventually orchestrate roguelite runs.
// For now it tracks persistent meta currency, scaffolds branching node data, and exposes
// hooks the game scenes can call into once integration work begins.
const RunManager = (() => {
  const STORAGE_KEY = 'si_meta_state_v1';
  const DEFAULT_META = {
    salvage: 0,
    cores: 0,
    unlocks: {},
    lastRun: null,
    version: 1,
    pendingLoadout: null,
  };

  const storageAvailable = (() => {
    try {
      if (typeof localStorage === 'undefined') return false;
      const probeKey = '__si_meta_probe__';
      localStorage.setItem(probeKey, '1');
      localStorage.removeItem(probeKey);
      return true;
    } catch (err) {
      return false;
    }
  })();

  let meta = readMeta();
  let currentRun = null;
  let graphResolver = null;

  function readMeta() {
    if (!storageAvailable) return { ...DEFAULT_META };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_META };
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_META, ...parsed };
    } catch (err) {
      console.warn('[RunManager] Failed to read meta state, resetting.', err);
      return { ...DEFAULT_META };
    }
  }

  function writeMeta() {
    if (!storageAvailable) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
    } catch (err) {
      console.warn('[RunManager] Failed to persist meta state.', err);
    }
  }

  function getMeta() {
    return JSON.parse(JSON.stringify(meta));
  }

  function adjustCurrencies(delta = {}) {
    meta.salvage = Math.max(0, (meta.salvage || 0) + (delta.salvage || 0));
    meta.cores = Math.max(0, (meta.cores || 0) + (delta.cores || 0));
    writeMeta();
  }

  function addUnlock(unlockKey, value = true) {
    meta.unlocks = meta.unlocks || {};
    meta.unlocks[unlockKey] = value;
    writeMeta();
  }

  function setMeta(newMeta) {
    meta = { ...DEFAULT_META, ...newMeta };
    writeMeta();
  }

  function resetMeta() {
    meta = { ...DEFAULT_META };
    writeMeta();
  }

  function addTestSalvage(amount = 500) {
    meta.salvage = (meta.salvage || 0) + amount;
    meta.cores = (meta.cores || 0) + 10;
    writeMeta();
    console.log(`Added ${amount} salvage and 10 cores for testing`);
  }

  function getPendingLoadout() {
    const current = meta.pendingLoadout ? JSON.parse(JSON.stringify(meta.pendingLoadout)) : null;
    return current;
  }

  function setPendingLoadout(loadout = null) {
    meta.pendingLoadout = loadout ? JSON.parse(JSON.stringify(loadout)) : null;
    writeMeta();
  }

  function consumePendingLoadout() {
    const current = meta.pendingLoadout ? JSON.parse(JSON.stringify(meta.pendingLoadout)) : null;
    if (meta.pendingLoadout) {
      meta.pendingLoadout = null;
      writeMeta();
    }
    return current;
  }

  function beginRun(options = {}) {
    const seed = options.seed || Date.now();
    currentRun = {
      id: 'run-' + seed,
      seed,
      graphId: options.graphId || 'sector-default',
      nodeIndex: 0,
      selectedNodes: [],
      salvageEarned: 0,
      coresEarned: 0,
      flags: { ...options.flags },
      status: 'in-progress',
      events: [],
    };
    return getRunSnapshot();
  }

  function getRunSnapshot() {
    if (!currentRun) return null;
    return JSON.parse(JSON.stringify(currentRun));
  }

  function getCurrentNodeId() {
    if (!currentRun) return null;
    if (currentRun.selectedNodes && currentRun.selectedNodes.length) {
      return currentRun.selectedNodes[currentRun.selectedNodes.length - 1];
    }
    return 'start';
  }

  function getGraphId() {
    if (currentRun) return currentRun.graphId;
    if (meta.lastRun && meta.lastRun.graphId) return meta.lastRun.graphId;
    return null;
  }

  async function getCurrentNode() {
    if (!currentRun) return null;
    const graph = await loadBranchingData(currentRun.graphId);
    const id = getCurrentNodeId();
    return graph.find(n => n && n.id === id) || null;
  }

  function setGraphResolver(resolver) {
    graphResolver = typeof resolver === 'function' ? resolver : null;
  }

  async function loadBranchingData(graphId) {
    if (typeof graphResolver === 'function') {
      try {
        const data = await graphResolver(graphId);
        console.log('[RunManager] Loaded graph data for', graphId, ':', data);
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.warn('[RunManager] Graph resolver failed.', err);
        return [];
      }
    }
    // Placeholder: until we have JSON assets, return a tiny mock graph.
    return [
      { id: 'start', type: 'wave', exits: ['mid-a', 'mid-b'], rewardPreview: { salvage: 20 } },
      { id: 'mid-a', type: 'wave', exits: ['boss'], modifier: 'elite-squad', rewardPreview: { salvage: 35 } },
      { id: 'mid-b', type: 'wave', exits: ['boss'], modifier: 'hazards-ionstorm', rewardPreview: { salvage: 40 } },
      { id: 'boss', type: 'boss', exits: [], rewardPreview: { salvage: 100, cores: 1 } },
    ];
  }

  async function previewNextNodes() {
    if (!currentRun) return [];
    const graph = await loadBranchingData(currentRun.graphId);
    const lastId = currentRun.selectedNodes.slice(-1)[0] || 'start';
    const current = graph.find(n => n.id === lastId);
    
    console.log('[RunManager] previewNextNodes debug:');
    console.log('  Current run:', currentRun);
    console.log('  Last selected node ID:', lastId);
    console.log('  Current node found:', current);
    console.log('  Current node exits:', current ? current.exits : 'none');
    
    if (!current) return [];
    const exits = current.exits || [];
    const nextNodes = exits.map(id => graph.find(n => n.id === id)).filter(Boolean);
    
    console.log('  Next nodes found:', nextNodes);
    return nextNodes;
  }

  function chooseNode(nodeId) {
    if (!currentRun) return null;
    currentRun.selectedNodes.push(nodeId);
    currentRun.nodeIndex = currentRun.selectedNodes.length;
    return getRunSnapshot();
  }

  function recordWaveResult(result = {}) {
    if (!currentRun) return;
    currentRun.salvageEarned += result.salvage || 0;
    currentRun.coresEarned += result.cores || 0;
    if (Array.isArray(currentRun.events)) currentRun.events.push({ ...result });
  }

  function completeRun(outcome = {}) {
    if (!currentRun) return null;
    currentRun.status = outcome.success ? 'success' : 'failed';
    currentRun.completedAt = Date.now();
    currentRun.summary = {
      salvageEarned: currentRun.salvageEarned,
      coresEarned: currentRun.coresEarned,
      notes: outcome.notes || null,
    };

    adjustCurrencies({
      salvage: currentRun.salvageEarned,
      cores: currentRun.coresEarned,
    });

    meta.lastRun = {
      id: currentRun.id,
      success: !!outcome.success,
      salvage: currentRun.salvageEarned,
      cores: currentRun.coresEarned,
      graphId: currentRun.graphId,
      timestamp: currentRun.completedAt,
    };
    writeMeta();

    const snapshot = getRunSnapshot();
    currentRun = null;
    return snapshot;
  }

  function abandonRun(reason = 'abandoned') {
    if (!currentRun) return null;
    currentRun.status = reason;
    const snapshot = getRunSnapshot();
    currentRun = null;
    return snapshot;
  }

  return {
    beginRun,
    getRunSnapshot,
    previewNextNodes,
    chooseNode,
    recordWaveResult,
    completeRun,
    abandonRun,
    getMeta,
    getGraphId,
    getCurrentNodeId,
    getCurrentNode,
    adjustCurrencies,
    addUnlock,
    setMeta,
    resetMeta,
    addTestSalvage,
    setGraphResolver,
    getPendingLoadout,
    setPendingLoadout,
    consumePendingLoadout,
  };
})();

try {
  window.RunManager = RunManager;
} catch (err) {
  // window may not exist in non-browser contexts.
}
