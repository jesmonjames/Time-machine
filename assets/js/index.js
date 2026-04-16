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
