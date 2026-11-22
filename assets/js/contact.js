// Animated terminal comms log
const terminal = document.getElementById('commsTerminal');
if (terminal) {
  const logs = [
    { delay: 200,  text: '<span>[INFO]</span> Contact channels loaded.' },
    { delay: 800,  text: '<span>[OK]</span>  Email: kjjesmon@gmail.com' },
    { delay: 1400, text: '<span>[OK]</span>  LinkedIn and GitHub links verified.' },
    { delay: 2000, text: '<span>[INFO]</span> Based in Kochi, India — IST / UTC+5:30.' },
    { delay: 2800, text: '<span>[INFO]</span> Open to full-time, freelance and collaboration.' },
    { delay: 3600, text: '<span>[OK]</span>  Typical response time: 24–48 hours.' },
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

// Availability indicator
const signalEl = document.getElementById('signalStrength');
if (signalEl) {
  signalEl.textContent = 'OPEN';
}
