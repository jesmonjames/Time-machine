// Animated terminal comms log
const terminal = document.getElementById('commsTerminal');
if (terminal) {
  const logs = [
    { delay: 200,  text: '<span>[SYS]</span> COMMS_ARRAY initialized. Scanning frequencies...' },
    { delay: 800,  text: '<span>[OK]</span>  Security handshake: ENCRYPTED_v2' },
    { delay: 1400, text: '<span>[OK]</span>  Channel bandwidth: 1.2 Tbps' },
    { delay: 2000, text: '<span>[TX]</span>  BROADCASTING identity signature...' },
    { delay: 2800, text: '<span>[RX]</span>  FREQ_76.26: OPEN — Awaiting input.' },
    { delay: 3600, text: '<span>[SYS]</span> All channels <span style="color:#39ff14">LIVE</span>. Operative reachable.' },
  ];

  logs.forEach(({ delay, text }) => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = 'msg-line';
      line.style.animationDelay = '0s';
      line.innerHTML = text;
      terminal.insertBefore(line, terminal.lastElementChild);
    }, delay);
  });
}

// Live signal strength fluctuation
const signalEl = document.getElementById('signalStrength');
if (signalEl) {
  setInterval(() => {
    signalEl.textContent = (97 + Math.random() * 2.8).toFixed(1) + '%';
  }, 2000);
}
