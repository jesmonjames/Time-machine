/**
 * GLOBAL SYSTEM SCRIPT
 * Manages core portfolio features: Loaders, Theme Engines, Tactical Tooltips, and Challenge Systems.
 */

// Global System Initialization
document.addEventListener('DOMContentLoaded', function() {
  // --- CROSS-PAGE BOOTSTRAP ---
  // Any logic that needs to run on every page after DOM is ready
});

window.addEventListener("load", function() {
  const loader = document.getElementById("loader");
  const bootLog = document.getElementById("bootLog");
  const bootLogRight = document.getElementById("bootLogRight");
  const bootStatus = document.getElementById("bootStatus");
  const decryptText = document.getElementById("decryptText");
  const canvas = document.getElementById("loaderCanvas");
  
  // Track if the system has performed a "Cold Boot" in this session
  const hasBooted = sessionStorage.getItem('sysBooted');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!hasBooted && !prefersReducedMotion) {
    // --- COLD BOOT SEQUENCE (First Visit) ---
    sessionStorage.setItem('sysBooted', '1');
    
    // Initialize Matrix-style Binary Rain Background
    if(canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const chars = "01010101ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789{}[]<>/\\|";
      const fontSize = 14;
      const columns = canvas.width / fontSize;
      const drops = Array(Math.floor(columns)).fill(1);
  
      function drawBinaryRain() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00ccff";
        ctx.font = fontSize + "px monospace";
        for (let i = 0; i < drops.length; i++) {
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
          drops[i]++;
        }
      }
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
      const rainInterval = setInterval(drawBinaryRain, 33);
      setTimeout(() => clearInterval(rainInterval), 5000); // Stop rain after boot
    }
  
    // Tactical Boot Logs
    const logLeft = [
      "[ OK ] ALLOCATING VIRTUAL BUFFER...",
      "[ OK ] LOADING ENCRYPTION MODULES...",
      "[ OK ] SCANNING TEMPORAL SIGNATURES...",
      "[ OK ] BYPASSING LOCAL FIREWALLS...",
      "[ .. ] ESTABLISHING SECURE_LINK_76.26...",
      "[ OK ] LINK ESTABLISHED."
    ];
  
    const logRight = [
      "[ OK ] KERNEL_INIT: 0x88492AF",
      "[ OK ] CACHE_SYNC: COMPLETE",
      "[ OK ] PERIPHERAL_BUS: ONLINE",
      "[ OK ] UI_RENDERER: INITIALIZED",
      "[ .. ] HANDSHAKE_REQUESTED...",
      "[ OK ] HANDSHAKE: ACCEPTED"
    ];
  
    let logIdx = 0;
    const logInt = setInterval(() => {
      if(logIdx < logLeft.length) {
        if(bootLog) bootLog.innerHTML += `<div>${logLeft[logIdx]}</div>`;
        if(bootLogRight) bootLogRight.innerHTML += `<div>${logRight[logIdx]}</div>`;
        logIdx++;
      } else {
        clearInterval(logInt);
      }
    }, 400);
  
    // Progress Percentage Simulation
    let percent = 0;
    const perInt = setInterval(() => {
      percent += Math.floor(Math.random() * 7) + 3;
      if(percent >= 100) {
        percent = 100;
        clearInterval(perInt);
      }
      if(decryptText) decryptText.textContent = `${percent}%`;
    }, 120);
  
    // Completion Sequence
    setTimeout(() => {
      if(bootStatus) bootStatus.textContent = "LOADING INTERFACE...";
      setTimeout(() => {
        if(bootStatus) bootStatus.textContent = "READY.";
        if(loader) {
            loader.style.opacity = "0";
            setTimeout(() => loader.style.display = "none", 900);
        }
      }, 900);
    }, 2600);
  } else {
    // --- WARM BOOT (Fast skip for return visits) ---
    if (loader) loader.style.display = "none";
    if (!hasBooted) sessionStorage.setItem('sysBooted', '1');
  }
  
  // Cross-page "Mini Loader" for smooth navigation transitions
  const miniLoader = document.getElementById("miniLoader");
  if(miniLoader && (hasBooted || !loader)) {
    miniLoader.style.display = "flex";
    miniLoader.style.opacity = "1";
    let mCount = 0;
    const miniLoadText = document.getElementById("miniLoadText");
    const mInt = setInterval(() => {
      mCount += Math.floor(Math.random() * 20) + 10;
      if(mCount >= 100) mCount = 100;
      if(miniLoadText) miniLoadText.textContent = `LOADING... ${mCount}%`;
      if(mCount >= 100) {
        clearInterval(mInt);
        setTimeout(() => {
          miniLoader.style.opacity = "0";
          setTimeout(() => miniLoader.style.display = "none", 300);
        }, 200);
      }
    }, 50);
  } else if (miniLoader) {
    miniLoader.style.display = "none";
  }

  // Initial timeline items visibility check
  checkTimelineItems();
});

/**
 * Trigger dynamic out-transition military loader globally.
 * @param {string|function} action - URL to navigate to or function to execute.
 * @param {boolean} isSlow - If true, the progress bar moves slower for effect.
 */
window.triggerMiniLoader = function(action, isSlow = false) {
  const miniLoader = document.getElementById("miniLoader");
  if(miniLoader) {
    miniLoader.style.display = "flex";
    setTimeout(() => { miniLoader.style.opacity = "1"; }, 10);
    let mCount = 0;
    const miniLoadText = document.getElementById("miniLoadText");
    if(miniLoadText) miniLoadText.textContent = `LOADING... 0%`;
    const mInt = setInterval(() => {
      mCount += isSlow ? (Math.floor(Math.random() * 8) + 4) : (Math.floor(Math.random() * 20) + 10);
      if(mCount >= 100) mCount = 100;
      if(miniLoadText) miniLoadText.textContent = `LOADING... ${mCount}%`;
      if(mCount >= 100) {
        clearInterval(mInt);
        if (typeof action === 'function') {
          action();
          const delay = isSlow ? 600 : 200;
          setTimeout(() => {
            miniLoader.style.opacity = "0";
            setTimeout(() => miniLoader.style.display = "none", 300);
          }, delay);
        } else if (typeof action === 'string') {
          window.location.href = action;
        }
      }
    }, 50);
  } else {
    if (typeof action === 'function') action();
    else if (typeof action === 'string') window.location.href = action;
  }
};

// --- NAVIGATION HOOKS ---
const startBtn = document.getElementById("startJourney");
if(startBtn) {
  startBtn.onclick = function() {
    triggerMiniLoader('pages/about.html');
  };
}

// --- TIMELINE SCROLL ENGINE ---
// Fades in cards as they enter the viewport
const timelineItems = document.querySelectorAll(".timeline-item");

function checkTimelineItems() {
  timelineItems.forEach(item => {
    const rect = item.getBoundingClientRect();
    if(rect.top < window.innerHeight - 50) {
      item.classList.add("visible");
    }
  });
}

// Safety net: never leave the dashboard cards invisible if an observer or
// scroll event is missed (for example on very short viewports).
setTimeout(() => {
  timelineItems.forEach(item => item.classList.add("visible"));
}, 1500);

// Handle scroll events for the main layout grid or window
const mainLayout = document.querySelector(".main-layout");
if(mainLayout) {
  mainLayout.addEventListener("scroll", checkTimelineItems);
}
window.addEventListener("scroll", checkTimelineItems);


// --- SYSTEM DATA ENGINE ---
// Manages real-time Clock and Uptime
const clockEl = document.getElementById("clock");
const uptimeEl = document.getElementById("uptime");
let startTime = Date.now();

function updateTime() {
  const now = new Date();
  
  if(clockEl) {
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hh = String(hours).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss} ${ampm}`;
  }
  
  if(uptimeEl) {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    uptimeEl.textContent = `${h}:${m}:${s}`;
  }
}

setInterval(updateTime, 1000);
updateTime();

// --- THEME & VITRUVIAN ENGINE ---
// Manages the seven proportional visual states and their geometry marks.
const themeBtns = document.querySelectorAll('.theme-btn');
let savedTheme = sessionStorage.getItem('portfolio-theme') || 'theme-circle';

const svgOpen = '<svg viewBox="0 0 100 100" class="vitruvian-svg"><g class="vitruvian-spin">';
const svgText = (label, size) => `<text x="50" y="50" dominant-baseline="central" font-family="Share Tech Mono, monospace" font-size="${size}" font-weight="bold" text-anchor="middle" fill="currentColor">${label}</text>`;
const svgClose = '</g></svg>';

const vitruvianLogos = {
  'theme-base': svgOpen +
    '<circle cx="50" cy="30" r="11" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M50 41V68 M50 68L35 86 M50 68L65 86 M50 50L28 62 M50 50L72 62" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M18 90H82 M18 86V94 M82 86V94" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    svgText('1', 13) + svgClose,
  'theme-module': svgOpen +
    '<circle cx="50" cy="50" r="31" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M19 50H81 M50 19V81" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 4"/>' +
    '<path d="M50 19V81 M19 50H81" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.45"/>' +
    '<circle cx="50" cy="50" r="7" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
    svgText('8', 12) + svgClose,
  'theme-cubit': svgOpen +
    '<rect x="18" y="38" width="64" height="24" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M34 38V52 M50 38V62 M66 38V52" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
    '<path d="M18 32V44 M82 32V44" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    svgText('6', 12) + svgClose,
  'theme-square': svgOpen +
    '<rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<path d="M50 20V80 M20 50H80" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 5"/>' +
    '<path d="M20 20L80 80 M80 20L20 80" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>' +
    svgText('4', 12) + svgClose,
  'theme-circle': svgOpen +
    '<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<rect x="24" y="24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 5"/>' +
    '<path d="M50 12V88 M12 50H88" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>' +
    '<circle cx="50" cy="50" r="4" fill="currentColor"/>' +
    svgText('H', 12) + svgClose,
  'theme-golden': svgOpen +
    '<rect x="16" y="16" width="68" height="68" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
    '<path d="M58 16V84 M16 58H84" fill="none" stroke="currentColor" stroke-width="1.2"/>' +
    '<path d="M84 58 A42 42 0 0 1 42 16 A26 26 0 0 1 16 42 A16 16 0 0 1 32 58" fill="none" stroke="currentColor" stroke-width="2"/>' +
    svgText('φ', 14) + svgClose,
  'theme-canon': svgOpen +
    '<circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<rect x="22" y="18" width="56" height="64" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
    '<circle cx="50" cy="30" r="8" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M50 38V64 M50 64L38 82 M50 64L62 82 M50 46L30 56 M50 46L70 56" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
    svgText('V', 12) + svgClose
};

// --- TACTICAL TOOLTIP ENGINE ---
// Renders the glassmorphic tactical tooltips on hover targets
const tooltip = document.createElement('div');
tooltip.id = 'tacticalTooltip';
tooltip.innerHTML = '<span class="tt-label"></span><span class="tt-value"></span>';
document.body.appendChild(tooltip);

const ttLabel = tooltip.querySelector('.tt-label');
const ttValue = tooltip.querySelector('.tt-value');

document.querySelectorAll('.h-target').forEach(target => {
  target.addEventListener('mouseenter', (e) => {
    const label = target.getAttribute('data-label');
    const value = target.getAttribute('data-value');
    if(!label) return;
    
    ttLabel.textContent = `// ${label}`;
    ttValue.textContent = value;
    tooltip.style.display = 'block';
  });

  target.addEventListener('mousemove', (e) => {
    tooltip.style.left = (e.clientX + 15) + 'px';
    tooltip.style.top = (e.clientY + 15) + 'px';
  });

  target.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });
});

const validThemes = ['theme-base', 'theme-module', 'theme-cubit', 'theme-square', 'theme-circle', 'theme-golden', 'theme-canon'];
if (!validThemes.includes(savedTheme)) {
  savedTheme = 'theme-circle';
}

/**
 * Applies the selected theme and updates persistence.
 * @param {string} themeName - Class name of the theme to apply.
 */
window.applyTheme = function(themeName) {
  // Preserve any non-theme body classes instead of wiping the class attribute.
  Array.from(document.body.classList).filter(name => name.startsWith('theme-')).forEach(name => document.body.classList.remove(name));
  document.body.classList.add(themeName);
  sessionStorage.setItem('portfolio-theme', themeName);
  
  themeBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-theme') === themeName) {
      btn.classList.add('active');
    }
  });

  const logoContainer = document.getElementById('vitruvianLogo');
  if (logoContainer && vitruvianLogos[themeName]) {
    logoContainer.innerHTML = vitruvianLogos[themeName];
  }
}

// Initial application on load
applyTheme(savedTheme);

themeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.getAttribute('data-theme');
    triggerMiniLoader(() => applyTheme(theme), true);
  });
});

// --- TIC-TAC-TOE CHALLENGE LOGIC ---
// Access gate that requires a win to proceed to certain pages
let tttTargetUrl = '';
let tttBoard = Array(9).fill(null);
let tttActive = false;

/**
 * Entry point for navigation links protected by the TTT challenge.
 * @param {string} url - Destination URL.
 */
function handleTacticalLink(url) {
  tttTargetUrl = url;
  const tttModal = document.getElementById('tttModal');
  if (tttModal) {
    tttModal.style.display = 'flex';
    tttModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock scroll
    resetTTT();
    const firstCell = tttModal.querySelector('.ttt-cell');
    if (firstCell) setTimeout(() => firstCell.focus(), 50);
  } else {
    window.location.href = url;
  }
}

function closeTTT() {
  const tttModal = document.getElementById('tttModal');
  tttActive = false;
  if (tttModal) {
    tttModal.style.display = 'none';
    tttModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
}

function resetTTT() {
  tttBoard = Array(9).fill(null);
  tttActive = true;
  const tttStatus = document.getElementById('tttStatus');
  const tttReset = document.getElementById('tttReset');
  const tttCells = document.querySelectorAll('.ttt-cell');
  
  if (tttStatus) {
    tttStatus.textContent = 'SUBSYSTEM_LOCKED: WIN_TO_PROCEED';
    tttStatus.style.color = 'var(--text-muted)';
  }
  if (tttReset) tttReset.style.display = 'none';
  
  tttCells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('occupied', 'win-cell');
    cell.removeAttribute('data-marker');
  });
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diags
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (!board.includes(null)) return { winner: 'TIE' };
  return null;
}

/**
 * Basic AI logic for the TTT challenge.
 */
function aiMove() {
  if (!tttActive) return;
  const available = tttBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
  if (available.length === 0) return;
  
  const move = available[Math.floor(Math.random() * available.length)];
  makeMove(move, 'O');
}

/**
 * Core game loop for TTT.
 */
function makeMove(index, player) {
  if (!tttActive || tttBoard[index] !== null) return;
  
  tttBoard[index] = player;
  const tttCells = document.querySelectorAll('.ttt-cell');
  const tttStatus = document.getElementById('tttStatus');
  const tttReset = document.getElementById('tttReset');
  const cell = tttCells[index];
  
  if (cell) {
    cell.textContent = player;
    cell.classList.add('occupied');
    cell.setAttribute('data-marker', player);
  }
  
  const result = checkWinner(tttBoard);
  if (result) {
    tttActive = false;
    if (result.winner === 'X') {
      // User won: Access granted
      if (tttStatus) {
        tttStatus.textContent = 'ACCESS_GRANTED // REDIRECTING...';
        tttStatus.style.color = 'var(--accent-green)';
      }
      result.line.forEach(idx => tttCells[idx].classList.add('win-cell'));
      setTimeout(() => {
        closeTTT();
        triggerMiniLoader(tttTargetUrl);
      }, 1000);
    } else if (result.winner === 'O') {
      // AI won: Access denied
      if (tttStatus) {
        tttStatus.textContent = 'ACCESS_DENIED // SYSTEM_WIN';
        tttStatus.style.color = 'var(--accent-red)';
      }
      if (tttReset) tttReset.style.display = 'block';
    } else {
      // Draw: Access stalled
      if (tttStatus) {
        tttStatus.textContent = 'ACCESS_STALLED // DRAW';
      }
      if (tttReset) tttReset.style.display = 'block';
    }
  } else if (player === 'X') {
    // Switch to AI turn
    setTimeout(aiMove, 500);
  }
}

// Global initialization for TTT cells and buttons
document.addEventListener('DOMContentLoaded', () => {
  const tttGrid = document.getElementById('tttGrid');
  if (tttGrid) {
    const playCell = (cell) => {
      if (!cell || !tttActive) return;
      const index = parseInt(cell.getAttribute('data-index'), 10);
      makeMove(index, 'X');
    };

    tttGrid.addEventListener('click', (e) => {
      playCell(e.target.closest('.ttt-cell'));
    });

    // Keyboard parity: the cells are divs, so Enter/Space must play them.
    tttGrid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
      const cell = e.target.closest('.ttt-cell');
      if (!cell) return;
      e.preventDefault();
      playCell(cell);
    });
  }

  const tttCancel = document.getElementById('tttCancel');
  if (tttCancel) {
    tttCancel.onclick = closeTTT;
  }

  const tttResetBtn = document.getElementById('tttReset');
  if (tttResetBtn) {
    tttResetBtn.onclick = resetTTT;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const tttModal = document.getElementById('tttModal');
    if (tttModal && tttModal.style.display === 'flex') closeTTT();
  });
});
