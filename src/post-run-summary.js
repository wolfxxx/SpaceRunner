/* global document, window */

// PostRunSummaryOverlay creates a lightweight DOM overlay that we will wire up once
// the run manager hands back earnings. It is non-functional right now, but allows us
// to iterate on layout and copy without touching Phaser scenes.
class PostRunSummaryOverlay {
  constructor() {
    this.root = null;
  }

  open(summary = {}) {
    injectStyles();
    if (this.root) this.close();
    this.root = document.createElement('div');
    this.root.className = 'post-run-overlay';
    this.root.innerHTML = this.render(summary);
    this.root.tabIndex = -1;
    document.body.appendChild(this.root);
    this.bindActions(summary);
    try { this.root.focus({ preventScroll: true }); } catch (err) {
      try { this.root.focus(); } catch (e) {}
    }
    return this.root;
  }

  bindActions(summary) {
    if (!this.root) return;
    const buttons = Array.from(this.root.querySelectorAll('button[data-action]')) || [];
    const dispatch = (action) => {
      if (!action) return;
      try {
        window.dispatchEvent(new CustomEvent('post-run-summary-action', { detail: { action, summary } }));
      } catch (err) {
        try { console.warn('[PostRunSummaryOverlay] action dispatch failed', err); } catch (_) {}
      }
      if (action !== 'noop') this.close();
    };
    this._buttonHandlers = [];
    buttons.forEach(btn => {
      const handler = (event) => {
        event.preventDefault();
        event.stopPropagation();
        dispatch(btn.getAttribute('data-action'));
      };
      btn.addEventListener('click', handler);
      this._buttonHandlers.push({ btn, handler });
    });
    const keyHandler = (event) => {
      if (!event) return;
      const key = event.key;
      if (key === 'Escape') {
        event.preventDefault();
        this.close();
        return;
      }
      if (key === 'Enter') {
        event.preventDefault();
        dispatch('continue');
        return;
      }
      if (key === ' ' || key === 'Spacebar') {
        event.preventDefault();
        dispatch('retry');
      }
    };
    this._keyHandler = keyHandler;
    this.root.addEventListener('keydown', keyHandler);
    const defaultBtn = this.root.querySelector('button[data-action="continue"]') || buttons[0];
    if (defaultBtn) {
      try { defaultBtn.focus(); } catch (err) {}
    }
  }

  close() {
    if (!this.root) return;
    if (Array.isArray(this._buttonHandlers)) {
      this._buttonHandlers.forEach(({ btn, handler }) => {
        try { if (btn && handler) btn.removeEventListener('click', handler); } catch (err) {}
      });
    }
    if (this._keyHandler) {
      try { this.root.removeEventListener('keydown', this._keyHandler); } catch (err) {}
    }
    try {
      document.body.removeChild(this.root);
    } catch (err) {
      // ignore
    }
    this._buttonHandlers = null;
    this._keyHandler = null;
    this.root = null;
  }

  render(summary) {
    const salvage = summary.salvage || 0;
    const cores = summary.cores || 0;
    const success = summary.success ? 'Victory' : 'Defeat';
    const notes = summary.notes || '';
    const rows = (summary.breakdown || [
      { label: 'Wave Clears', value: 0 },
      { label: 'Combo Bonus', value: 0 },
      { label: 'Boss Bonus', value: 0 },
    ]);

    const lines = rows.map(row => `
      <tr>
        <td>${row.label}</td>
        <td class="value">+${row.value}</td>
      </tr>
    `).join('');

    return `
      <div class="post-run-panel">
        <header>
          <h2>${success}</h2>
          <p class="subtitle">Run Summary</p>
        </header>
        <section class="earnings">
          <div class="currency salvage">
            <span class="label">Salvage</span>
            <span class="amount">${salvage}</span>
          </div>
          <div class="currency cores">
            <span class="label">Cores</span>
            <span class="amount">${cores}</span>
          </div>
        </section>
        <section class="breakdown">
          <table>
            <tbody>${lines}</tbody>
          </table>
        </section>
        <section class="notes">${notes}</section>
        <footer>
          <button class="primary" data-action="continue">Continue</button>
          <button class="secondary" data-action="retry">Retry</button>
        </footer>
      </div>
    `;
  }
}

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('post-run-overlay-styles')) return;
  const style = document.createElement('style');
  style.id = 'post-run-overlay-styles';
  style.textContent = `
    .post-run-overlay {
      position: fixed;
      inset: 0;
      background: rgba(4, 8, 16, 0.84);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: 'Courier New', monospace;
      color: #fff;
    }
    .post-run-panel {
      width: min(600px, 90vw);
      background: rgba(12, 18, 32, 0.95);
      border: 1px solid #00ffaa;
      box-shadow: 0 0 22px rgba(0, 255, 170, 0.35);
      padding: 24px;
      border-radius: 8px;
    }
    .post-run-panel header {
      text-align: center;
      margin-bottom: 16px;
    }
    .post-run-panel header h2 {
      margin: 0;
      font-size: 32px;
      letter-spacing: 4px;
    }
    .post-run-panel header .subtitle {
      margin: 4px 0 0;
      font-size: 14px;
      color: #8cf8ff;
    }
    .post-run-panel .earnings {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 16px;
    }
    .post-run-panel .currency {
      background: rgba(0, 255, 170, 0.08);
      border: 1px solid rgba(0, 255, 170, 0.3);
      padding: 12px 16px;
      border-radius: 6px;
      min-width: 140px;
      text-align: center;
    }
    .post-run-panel .currency.cores {
      border-color: rgba(255, 102, 255, 0.4);
      background: rgba(255, 102, 255, 0.08);
    }
    .post-run-panel .currency .label {
      display: block;
      font-size: 14px;
      color: #9bdcf2;
      margin-bottom: 4px;
    }
    .post-run-panel .currency .amount {
      font-size: 28px;
    }
    .post-run-panel .breakdown table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
    }
    .post-run-panel .breakdown td {
      padding: 6px 0;
      font-size: 14px;
    }
    .post-run-panel .breakdown td.value {
      text-align: right;
      color: #ffd700;
      font-weight: bold;
    }
    .post-run-panel .notes {
      min-height: 40px;
      font-size: 13px;
      color: #cccccc;
      margin-bottom: 18px;
    }
    .post-run-panel footer {
      display: flex;
      justify-content: center;
      gap: 12px;
    }
    .post-run-panel button {
      padding: 10px 24px;
      border-radius: 4px;
      border: 1px solid #00ffaa;
      background: transparent;
      color: #00ffaa;
      cursor: pointer;
      font-size: 15px;
      letter-spacing: 1px;
    }
    .post-run-panel button.primary {
      background: #00ffaa;
      color: #041018;
      font-weight: bold;
    }
    .post-run-panel button.secondary {
      border-color: #8cf8ff;
      color: #8cf8ff;
    }
    .post-run-panel button:focus {
      outline: 2px solid #ffd700;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
}

if (typeof window !== 'undefined') {
  window.PostRunSummaryOverlay = (window.PostRunSummaryOverlay || new PostRunSummaryOverlay());
}
