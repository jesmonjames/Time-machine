/**
 * TEMPORAL SKILL ACADEMY ENGINE
 * Dynamically loads independent JSON datasets, manages live sandboxes, 
 * scores graded interactive quizzes, tracks page study progress, and handles link sharing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. EXTRACT PARAMS & FETCH DATA
  const params = new URLSearchParams(window.location.search);
  const skillId = params.get('skill') || 'html';
  
  // Set title in top bar coords
  const moduleNameEl = document.getElementById('moduleName');
  if (moduleNameEl) {
    moduleNameEl.textContent = `ACADEMY_${skillId.toUpperCase()}`;
  }

  // Update Sharing Input Box with current URL
  const shareUrlBox = document.getElementById('shareUrlBox');
  if (shareUrlBox) {
    shareUrlBox.textContent = window.location.href;
  }

  let skillData = null;
  const readModules = new Set();
  const completedQuizzes = new Set();

  fetch(`../assets/data/skills/${skillId}.json`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch skill course.');
      }
      return response.json();
    })
    .then(data => {
      skillData = data;
      populatePage(data);
    })
    .catch(error => {
      console.warn('Skill dataset not found, loading core HTML fallback...', error);
      // Fallback redirect or fallback render to prevent broken screens
      fetch('../assets/data/skills/html.json')
        .then(res => res.json())
        .then(fallbackData => {
          skillData = fallbackData;
          populatePage(fallbackData);
        });
    });

  // 2. POPULATE SKILL DETAIL PAGE
  function populatePage(data) {
    // Basic Details
    document.getElementById('skillNameBadge').textContent = `${data.name} TRAINING CELL`;
    document.getElementById('skillFullName').textContent = data.fullName;
    document.getElementById('skillTagline').textContent = data.tagline;
    document.getElementById('skillDifficulty').textContent = data.difficulty.toUpperCase();
    document.getElementById('skillEstTime').textContent = data.estTime.toUpperCase();
    document.getElementById('skillOverview').textContent = data.overview;
    document.getElementById('skillTimeTravelLog').textContent = data.timeTravelLog;

    // Apply color accents if defined
    if (data.color) {
      document.documentElement.style.setProperty('--text-main', data.color);
    }

    // Load Syllabus Accordion
    const accordion = document.getElementById('syllabusAccordion');
    accordion.innerHTML = '';
    
    data.syllabus.forEach((module, index) => {
      const item = document.createElement('div');
      item.className = 'module-accordion-item';
      item.id = `module-item-${index}`;

      const header = document.createElement('div');
      header.className = 'module-header';
      header.innerHTML = `
        <span>${module.title}</span>
        <span class="module-arrow" style="font-size: 10px;">▶</span>
      `;

      const body = document.createElement('div');
      body.className = 'module-body';
      body.innerHTML = `
        <p>${module.content}</p>
        <div class="code-snippet-box">${escapeHTML(module.codeExample)}</div>
        <div class="interactive-tip-box">
          <strong>ENG_TIP:</strong> ${module.interactiveTip}
        </div>
      `;

      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Deactivate all
        document.querySelectorAll('.module-accordion-item').forEach(el => {
          el.classList.remove('active');
          el.querySelector('.module-arrow').textContent = '▶';
        });

        if (!isActive) {
          item.classList.add('active');
          header.querySelector('.module-arrow').textContent = '▼';
          
          // Mark module as studied for progress synchronization
          readModules.add(index);
          updateSyncProgress();
        }
      });

      item.appendChild(header);
      item.appendChild(body);
      accordion.appendChild(item);
    });

    // Load Sandbox initial code
    const sandboxEditor = document.getElementById('sandboxCode');
    if (sandboxEditor && data.sandboxInitialCode) {
      sandboxEditor.value = data.sandboxInitialCode;
      // Auto-trigger first run simulation
      runSimulation();
    }

    // Load Quest Details
    document.getElementById('questTitle').textContent = data.quest.title;
    document.getElementById('questChallenge').textContent = data.quest.challenge;
    
    const instructionsList = document.getElementById('questInstructions');
    instructionsList.innerHTML = '';
    data.quest.instructions.forEach(inst => {
      const li = document.createElement('li');
      li.style.marginBottom = '8px';
      li.textContent = inst;
      instructionsList.appendChild(li);
    });

    // Load Quiz Question cards
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = '';
    
    data.quiz.forEach((q, qIndex) => {
      const qCard = document.createElement('div');
      qCard.className = 'quiz-question-card';
      
      const qTitle = document.createElement('div');
      qTitle.className = 'quiz-question-title';
      qTitle.textContent = `[ Q_${qIndex + 1} ] ${q.question}`;
      qCard.appendChild(qTitle);

      const optsList = document.createElement('div');
      optsList.className = 'quiz-options-list';

      const feedback = document.createElement('div');
      feedback.id = `quiz-feedback-${qIndex}`;
      feedback.className = 'quiz-feedback-box';

      q.options.forEach((opt, optIndex) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = opt;
        
        btn.addEventListener('click', () => {
          // Disable all buttons in this question card on click
          const buttons = optsList.querySelectorAll('.quiz-option-btn');
          buttons.forEach(b => b.classList.remove('selected', 'correct', 'incorrect'));
          
          btn.classList.add('selected');

          if (optIndex === q.answer) {
            btn.classList.add('correct');
            // Disable further clicks
            buttons.forEach(b => b.setAttribute('disabled', 'true'));
            
            feedback.className = 'quiz-feedback-box correct';
            feedback.innerHTML = `<strong>ACCESS GRANTED:</strong> ${q.explanation}`;
            
            completedQuizzes.add(qIndex);
            updateSyncProgress();
          } else {
            btn.classList.add('incorrect');
            feedback.className = 'quiz-feedback-box incorrect';
            feedback.innerHTML = `<strong>ACCESS DENIED // CALIBRATING SYSTEM:</strong> Try again! ${q.explanation}`;
          }
        });
        
        optsList.appendChild(btn);
      });

      qCard.appendChild(optsList);
      qCard.appendChild(feedback);
      quizContainer.appendChild(qCard);
    });

    // Reset progress tracking
    updateSyncProgress();
  }

  // 3. SECURE SYNAPSE PROGRESS CALCULATIONS
  function updateSyncProgress() {
    if (!skillData) return;
    
    const totalTasks = skillData.syllabus.length + skillData.quiz.length;
    const completedTasks = readModules.size + completedQuizzes.size;
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const progressFill = document.getElementById('syncProgress');
    const progressText = document.getElementById('syncProgressText');
    
    if (progressFill && progressText) {
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `${percentage}%`;
    }
  }

  // Helper function to escape HTML tags in code example boxes
  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  // 4. INTERACTIVE SANDBOX CODE EXECUTION
  window.runSimulation = function() {
    const code = document.getElementById('sandboxCode').value;
    const preview = document.getElementById('sandboxPreview');
    if (!preview) return;

    preview.innerHTML = ''; // clear preview
    
    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '260px';
    iframe.style.border = 'none';
    iframe.style.background = '#ffffff';
    preview.appendChild(iframe);
    
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(code);
      iframeDoc.close();
    } catch (e) {
      preview.innerHTML = `<div style="color:red; font-family:monospace; padding:10px;">Simulation compile error: ${e.message}</div>`;
    }
  };

  // 5. SECURE LINK TRANSMISSION (DEEP LINK COPY)
  window.copyDeepLink = function() {
    const tempInput = document.createElement('input');
    tempInput.value = window.location.href;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);

    // Show dynamic neon cyber toast notification
    const toast = document.getElementById('cyberToast');
    if (toast) {
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          toast.style.display = 'none';
          toast.style.opacity = '1';
        }, 300);
      }, 2500);
    }
  };
});
