// DIAGNOSTICS MODAL LOGIC (Specific to Dashboard)
document.addEventListener('DOMContentLoaded', () => {
  const viewLogsBtn = document.getElementById("viewLogsBtn");
  const diagnosticsModal = document.getElementById("diagnosticsModal");
  const closeModal = document.getElementById("closeModal");
  const hexStream = document.getElementById("hexStream");

  if(viewLogsBtn && diagnosticsModal) {
    viewLogsBtn.onclick = () => {
      diagnosticsModal.style.display = "flex";
      document.body.style.overflow = "hidden"; // Lock scroll
      startHexStream();
    };
  }

  if(closeModal && diagnosticsModal) {
    closeModal.onclick = () => {
      diagnosticsModal.style.display = "none";
      document.body.style.overflow = "auto"; // Unlock scroll
      stopHexStream();
    };
  }

  let hexInterval;
  function startHexStream() {
    if(hexInterval) clearInterval(hexInterval);
    hexInterval = setInterval(() => {
      if(!hexStream) return;
      const addr = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
      const data = Array.from({length: 8}, () => 
        Math.floor(Math.random() * 0xFF).toString(16).toUpperCase().padStart(2, '0')
      ).join(' ');
      
      const div = document.createElement('div');
      div.className = 'hex-line';
      div.innerHTML = `<span class="hex-addr">0x${addr}</span> ${data}`;
      hexStream.appendChild(div);
      
      // Auto scroll to bottom
      hexStream.scrollTop = hexStream.scrollHeight;
      
      // Limit lines
      if(hexStream.childNodes.length > 100) {
        hexStream.removeChild(hexStream.firstChild);
      }
    }, 100);
  }

  function stopHexStream() {
    clearInterval(hexInterval);
  }
});

/* Site updates dropdown (index header) — data: assets/data/site-updates.json */
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.getElementById('siteUpdatesWrap');
  const btn = document.getElementById('siteUpdatesBtn');
  const panel = document.getElementById('siteUpdatesPanel');
  const list = document.getElementById('siteUpdatesList');
  if (!wrap || !btn || !panel || !list) return;

  const MAX_ITEMS = 6;
  const UPDATES_URL = 'assets/data/site-updates.json';

  function closePanel() {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }

  function openPanel() {
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }

  function togglePanel() {
    if (panel.hidden) openPanel();
    else closePanel();
  }

  function renderUpdates(items) {
    list.innerHTML = '';
    items.slice(0, MAX_ITEMS).forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      const href = item.href || '#';
      a.href = href;
      if (href.startsWith('http')) a.rel = 'noopener noreferrer';
      a.innerHTML = `
        <div class="top-bar-updates-date">${escapeHtml(item.date || '')}</div>
        <div class="top-bar-updates-title">${escapeHtml(item.title || '')}</div>
        <div class="top-bar-updates-detail">${escapeHtml(item.detail || '')}</div>
      `;
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderError(msg) {
    list.innerHTML = `<li class="top-bar-updates-msg">${escapeHtml(msg)}</li>`;
  }

  // Cache-bust so newly published uplinks appear immediately.
  fetch(`${UPDATES_URL}?v=${Date.now()}`, { cache: 'no-store' })
    .then((r) => {
      if (!r.ok) throw new Error('UPLINK_FAIL');
      return r.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) return;
      const sorted = [...data].sort((a, b) => {
        const byDate = (b.date || '').localeCompare(a.date || '');
        if (byDate !== 0) return byDate;
        return (Number(b.rank) || 0) - (Number(a.rank) || 0);
      });
      renderUpdates(sorted);
    })
    .catch(() => {
      renderError('Could not load updates manifest. Open the field journal for logs.');
    });

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanel();
  });

  document.addEventListener('click', (e) => {
    if (!panel.hidden && !wrap.contains(e.target)) closePanel();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
  });
});
