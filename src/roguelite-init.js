if (!window || !window.ENABLE_ROGUELITE) {
  // Early exit: roguelite scaffolding disabled unless flag is set via URL.
  if (window && window.RunManager) {
    window.RunManager.setGraphResolver(null);
  }
} else {
  (function initRoguelite(){
    const manager = window.RunManager;
    if (!manager) {
      console.warn('[RogueliteInit] RunManager missing; ensure run-manager.js is loaded first.');
      return;
    }

    const search = String(window.location.search || '');
    const debugHarnessEnabled = /rogueliteDebug=1/.test(search);

    let graphCache = null;

    async function fetchGraphs() {
      if (graphCache) return graphCache;
      try {
        const response = await fetch('src/data/run-graphs.json', { cache: 'no-cache' });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const json = await response.json();
        graphCache = json && json.graphs ? json.graphs : {};
      } catch (err) {
        console.warn('[RogueliteInit] Failed to load run graph data.', err);
        graphCache = {};
      }
      return graphCache;
    }

    manager.setGraphResolver(async (graphId) => {
      const graphs = await fetchGraphs();
      if (graphs && graphs[graphId]) {
        return graphs[graphId];
      }
      // Fallback: return default sector if requested id missing
      if (graphs && graphs['sector-default']) {
        return graphs['sector-default'];
      }
      return [];
    });

    // Expose helper for manual testing from console
    window.__roguelite = {
      async begin(graphId = 'sector-default', options = {}) {
        return manager.beginRun({ graphId, ...options });
      },
      snapshot() {
        return manager.getRunSnapshot();
      },
      async preview(graphId) {
        if (graphId) {
          await manager.beginRun({ graphId });
        } else if (!manager.getRunSnapshot()) {
          await manager.beginRun({ graphId: 'sector-default' });
        }
        const nodes = await manager.previewNextNodes();
        if (nodes && nodes.length) {
          console.table(nodes.map(n => ({ id: n.id, title: n.title, modifier: n.modifier })));
        } else {
          console.info('[Roguelite] No exits available from current node.');
        }
        return nodes;
      },
      async graph(graphId = 'sector-default') {
        const graphs = await fetchGraphs();
        return graphs[graphId] || [];
      },
      showSummary(summary) {
        if (window.PostRunSummaryOverlay) {
          window.PostRunSummaryOverlay.open(summary);
        }
      }
    };

    if (debugHarnessEnabled) {
      document.addEventListener('DOMContentLoaded', async () => {
        const graphs = await fetchGraphs();
        const graphId = graphs['sector-default'] ? 'sector-default' : Object.keys(graphs)[0];
        manager.beginRun({ graphId, flags: { debug: true } });
        const preview = await manager.previewNextNodes();
        // Pick first exit path for the mock
        if (preview && preview[0]) manager.chooseNode(preview[0].id);
        manager.recordWaveResult({ salvage: 120, cores: 0, label: 'Wave Clears' });
        manager.recordWaveResult({ salvage: 40, cores: 0, label: 'Combo Bonus' });
        manager.recordWaveResult({ salvage: 100, cores: 1, label: 'Boss Bonus' });
        const completed = manager.completeRun({ success: true, notes: 'Debug harness victory (placeholder data).' });
        if (window.PostRunSummaryOverlay && completed && completed.summary) {
          window.PostRunSummaryOverlay.open({
            success: completed.status === 'success',
            salvage: completed.summary.salvageEarned,
            cores: completed.summary.coresEarned,
            notes: completed.summary.notes,
            breakdown: [
              { label: 'Wave Clears', value: 120 },
              { label: 'Combo Bonus', value: 40 },
              { label: 'Boss Bonus', value: 100 }
            ]
          });
        }
      });
    }
  })();
}
