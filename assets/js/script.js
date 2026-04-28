// Global System Initialization
document.addEventListener('DOMContentLoaded', function() {
  // Global cross-page initializations can go here
});
window.addEventListener("load", function() {
  const loader = document.getElementById("loader");
  const bootLog = document.getElementById("bootLog");
  const bootLogRight = document.getElementById("bootLogRight");
  const bootStatus = document.getElementById("bootStatus");
  const decryptText = document.getElementById("decryptText");
  const canvas = document.getElementById("loaderCanvas");
  
  const hasBooted = sessionStorage.getItem('sysBooted');

  if (!hasBooted) {
    sessionStorage.setItem('sysBooted', '1');
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
      setTimeout(() => clearInterval(rainInterval), 5000);
    }
  
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
  
    let percent = 0;
    const perInt = setInterval(() => {
      percent += Math.floor(Math.random() * 5) + 1;
      if(percent >= 100) {
        percent = 100;
        clearInterval(perInt);
      }
      if(decryptText) decryptText.textContent = `${percent}%`;
    }, 150);
  
    setTimeout(() => {
      if(bootStatus) bootStatus.textContent = "UPLOADING TACTICAL INTERFACE...";
      setTimeout(() => {
        if(bootStatus) bootStatus.textContent = "SYSTEM READY.";
        if(loader) {
            loader.style.opacity = "0";
            setTimeout(() => loader.style.display = "none", 1000);
        }
      }, 1500);
    }, 4000);
  } else {
    // Fast boot on return visits
    if (loader) loader.style.display = "none";
  }
  
  const miniLoader = document.getElementById("miniLoader");
  if(miniLoader && (hasBooted || !loader)) {
    miniLoader.style.display = "flex";
    miniLoader.style.opacity = "1";
    let mCount = 0;
    const miniLoadText = document.getElementById("miniLoadText");
    const mInt = setInterval(() => {
      mCount += Math.floor(Math.random() * 20) + 10;
      if(mCount >= 100) mCount = 100;
      if(miniLoadText) miniLoadText.textContent = `SYNCING... ${mCount}%`;
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

  // Initialize timeline items visibility
  checkTimelineItems();
});

// Trigger dynamic out-transition military loader globally
window.triggerMiniLoader = function(action, isSlow = false) {
  const miniLoader = document.getElementById("miniLoader");
  if(miniLoader) {
    miniLoader.style.display = "flex";
    setTimeout(() => { miniLoader.style.opacity = "1"; }, 10);
    let mCount = 0;
    const miniLoadText = document.getElementById("miniLoadText");
    if(miniLoadText) miniLoadText.textContent = `SYNCING... 0%`;
    const mInt = setInterval(() => {
      mCount += isSlow ? (Math.floor(Math.random() * 8) + 4) : (Math.floor(Math.random() * 20) + 10);
      if(mCount >= 100) mCount = 100;
      if(miniLoadText) miniLoadText.textContent = `SYNCING... ${mCount}%`;
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

// Scroll/Navigate logic
const startBtn = document.getElementById("startJourney");
if(startBtn) {
  startBtn.onclick = function() {
    triggerMiniLoader('pages/about.html');
  };
}

// Timeline effect (Fade in cards when scrolling)
const timelineItems = document.querySelectorAll(".timeline-item");

function checkTimelineItems() {
  timelineItems.forEach(item => {
    const rect = item.getBoundingClientRect();
    if(rect.top < window.innerHeight - 50) {
      item.classList.add("visible");
    }
  });
}

// To support the new scrolling panel constraint in CSS Grid layout
const mainLayout = document.querySelector(".main-layout");
if(mainLayout) {
  mainLayout.addEventListener("scroll", checkTimelineItems);
}
window.addEventListener("scroll", checkTimelineItems);


// Clock and Uptime
const clockEl = document.getElementById("clock");
const uptimeEl = document.getElementById("uptime");
const sysStatEl = document.getElementById("sysStat");
let startTime = Date.now();

function updateTime() {
  const now = new Date();
  
  if(clockEl) {
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
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

function updateSysStats() {
  if(!sysStatEl) return;
  const load = (Math.random() * (0.85 - 0.05) + 0.05).toFixed(2);
  const ram = navigator.deviceMemory || 16;
  sysStatEl.innerHTML = `LOAD: ${load}% | RAM: ${ram}GB`;
}

setInterval(updateTime, 1000);
setInterval(updateSysStats, 3000);
updateSysStats();
updateTime();

// Theme Switcher Logic
const themeBtns = document.querySelectorAll('.theme-btn');
let savedTheme = sessionStorage.getItem('portfolio-theme') || 'theme-throat';

const chakraLogos = {
  'theme-root': '<svg viewBox="0 0 100 100" class="chakra-svg"><g class="chakra-spin"><circle cx="50" cy="25" r="15" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="75" r="15" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="25" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="75" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="2"/><rect x="35" y="35" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" stroke-width="2"/></g><text x="50" y="50" dominant-baseline="central" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="currentColor">लं</text></svg>',
  'theme-sacral': '<svg viewBox="0 0 100 100" class="chakra-svg"><g class="chakra-spin"><path d="M 36,25.8 Q 23,8 50,2 Q 77,8 64,25.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M 36,25.8 Q 23,8 50,2 Q 77,8 64,25.8" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(60 50 50)"/><path d="M 36,25.8 Q 23,8 50,2 Q 77,8 64,25.8" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(120 50 50)"/><path d="M 36,25.8 Q 23,8 50,2 Q 77,8 64,25.8" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(180 50 50)"/><path d="M 36,25.8 Q 23,8 50,2 Q 77,8 64,25.8" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(240 50 50)"/><path d="M 36,25.8 Q 23,8 50,2 Q 77,8 64,25.8" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(300 50 50)"/><circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 4"/><path d="M 33,56 A 17,17 0 0,1 67,56 A 22,22 0 0,0 33,56 Z" fill="none" stroke="currentColor" stroke-width="1.5"/></g><text x="50" y="48" dominant-baseline="central" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="currentColor">वं</text></svg>',
  'theme-solar': '<svg viewBox="0 0 100 100" class="chakra-svg"><g class="chakra-spin"><path d="M 41.97,25.3 Q 35,10 50,0 Q 65,10 58.03,25.3" fill="none" stroke="currentColor" stroke-width="1.5" /><path d="M 41.97,25.3 Q 35,10 50,0 Q 65,10 58.03,25.3" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(36 50 50)" /><path d="M 41.97,25.3 Q 35,10 50,0 Q 65,10 58.03,25.3" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(72 50 50)" /><path d="M 41.97,25.3 Q 35,10 50,0 Q 65,10 58.03,25.3" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(108 50 50)" /><path d="M 41.97,25.3 Q 35,10 50,0 Q 65,10 58.03,25.3" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(144 50 50)" /><path d="M 41.97,25.3 Q 35,10 50,0 Q 65,10 58.03,25.3" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(180 50 50)" /><path d="M 41.97,25.3 Q 35,10 50,0 Q 65,10 58.03,25.3" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(216 50 50)" /><path d="M 41.97,25.3 Q 35,10 50,0 Q 65,10 58.03,25.3" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(252 50 50)" /><path d="M 41.97,25.3 Q 35,10 50,0 Q 65,10 58.03,25.3" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(288 50 50)" /><path d="M 41.97,25.3 Q 35,10 50,0 Q 65,10 58.03,25.3" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(324 50 50)" /><circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="50,76 27.5,37 72.5,37" fill="none" stroke="currentColor" stroke-width="2"/></g><text x="50" y="50" dominant-baseline="central" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="currentColor">रं</text></svg>',
  'theme-heart': '<svg viewBox="0 0 100 100" class="chakra-svg"><g class="chakra-spin"><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="10 9.8"/><circle cx="50" cy="50" r="31" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="50,22 25,65 75,65" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="50,78 25,35 75,35" fill="none" stroke="currentColor" stroke-width="2"/></g><text x="50" y="50" dominant-baseline="central" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="currentColor">यं</text></svg>',
  'theme-throat': '<svg viewBox="0 0 100 100" class="chakra-svg"><g class="chakra-spin"><circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="8" stroke-dasharray="8 6.9"/><circle cx="50" cy="50" r="31" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="50,75 28,38 72,38" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="21" fill="none" stroke="currentColor" stroke-width="2"/></g><text x="50" y="50" dominant-baseline="central" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="currentColor">हं</text></svg>',
  'theme-third-eye': '<svg viewBox="0 0 100 100" class="chakra-svg"><g class="chakra-spin"><path d="M 5 50 Q 50 10 95 50 Q 50 90 5 50" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" stroke-width="2"/><polygon points="50,70 30,35 70,35" fill="none" stroke="currentColor" stroke-width="2"/></g><text x="50" y="50" dominant-baseline="central" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="currentColor">ॐ</text></svg>',
  'theme-crown': '<svg viewBox="0 0 100 100" class="chakra-svg"><g class="chakra-spin"><circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="3 3"/><circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="4 3"/><circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" stroke-width="6" stroke-dasharray="6 3"/><circle cx="50" cy="50" r="21" fill="none" stroke="currentColor" stroke-width="2"/></g><text x="50" y="50" dominant-baseline="central" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="currentColor">अँ</text></svg>'
};



// TACTICAL TOOLTIP ENGINE
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

const validThemes = ['theme-root', 'theme-sacral', 'theme-solar', 'theme-heart', 'theme-throat', 'theme-third-eye', 'theme-crown'];
if (!validThemes.includes(savedTheme)) {
  savedTheme = 'theme-throat';
}

function applyTheme(themeName) {
  document.body.className = themeName;
  sessionStorage.setItem('portfolio-theme', themeName);
  
  themeBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-theme') === themeName) {
      btn.classList.add('active');
    }
  });

  const logoContainer = document.getElementById('chakraLogo');
  if (logoContainer && chakraLogos[themeName]) {
    logoContainer.innerHTML = chakraLogos[themeName];
  }
}

// Initial application
applyTheme(savedTheme);

themeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const theme = btn.getAttribute('data-theme');
    triggerMiniLoader(() => applyTheme(theme), true);
  });
});

// TIC-TAC-TOE CHALLENGE LOGIC
let tttTargetUrl = '';
let tttBoard = Array(9).fill(null);
let tttActive = false;

function handleTacticalLink(url) {
  tttTargetUrl = url;
  const tttModal = document.getElementById('tttModal');
  if (tttModal) {
    tttModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    resetTTT();
  } else {
    window.location.href = url;
  }
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

function aiMove() {
  if (!tttActive) return;
  const available = tttBoard.map((v, i) => v === null ? i : null).filter(v => v !== null);
  if (available.length === 0) return;
  
  const move = available[Math.floor(Math.random() * available.length)];
  makeMove(move, 'O');
}

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
      if (tttStatus) {
        tttStatus.textContent = 'ACCESS_GRANTED // REDIRECTING...';
        tttStatus.style.color = 'var(--accent-green)';
      }
      result.line.forEach(idx => tttCells[idx].classList.add('win-cell'));
      setTimeout(() => {
        const tttModal = document.getElementById('tttModal');
        if (tttModal) tttModal.style.display = 'none';

        // Instead of redirecting, show the "LOCKED" modal
        const lockModal = document.getElementById('lockModal');
        if (lockModal) {
          lockModal.style.display = 'flex';
        } else {
           // Fallback if lockModal missing
           document.body.style.overflow = 'auto';
           if (typeof triggerMiniLoader === 'function') {
              triggerMiniLoader(tttTargetUrl);
           } else {
              window.location.href = tttTargetUrl;
           }
        }
      }, 1000);
    } else if (result.winner === 'O') {
      if (tttStatus) {
        tttStatus.textContent = 'ACCESS_DENIED // SYSTEM_WIN';
        tttStatus.style.color = 'var(--accent-red)';
      }
      if (tttReset) tttReset.style.display = 'block';
    } else {
      if (tttStatus) {
        tttStatus.textContent = 'ACCESS_STALLED // DRAW';
      }
      if (tttReset) tttReset.style.display = 'block';
    }
  } else if (player === 'X') {
    setTimeout(aiMove, 500);
  }
}

// Global initialization for TTT cells and buttons
document.addEventListener('DOMContentLoaded', () => {
  const tttGrid = document.getElementById('tttGrid');
  if (tttGrid) {
    tttGrid.addEventListener('click', (e) => {
      const cell = e.target.closest('.ttt-cell');
      if (cell && tttActive) {
        const index = parseInt(cell.getAttribute('data-index'));
        makeMove(index, 'X');
      }
    });
  }

  const tttCancel = document.getElementById('tttCancel');
  if (tttCancel) {
    tttCancel.onclick = () => {
      const tttModal = document.getElementById('tttModal');
      if (tttModal) tttModal.style.display = 'none';
      document.body.style.overflow = 'auto';
    };
  }

  const tttResetBtn = document.getElementById('tttReset');
  if (tttResetBtn) {
    tttResetBtn.onclick = resetTTT;
  }
});

function closeLockModal() {
  const lockModal = document.getElementById('lockModal');
  if (lockModal) lockModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}
