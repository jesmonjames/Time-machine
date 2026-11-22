window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);

  // Whitelist of valid modules and their human-readable labels.
  const MODULES = {
    'career-education': 'CAREER & EDUCATION',
    'skills': 'SKILLS',
    'projects': 'PROJECTS',
    'gallery': 'GALLERY',
    'comms': 'CONTACT'
  };

  const requested = params.get('module');
  const module = requested && MODULES[requested] ? requested : 'career-education';

  // Deactivate all
  document.querySelectorAll('.module-content').forEach(el => el.classList.remove('active'));

  // Activate requested (or the safe default)
  const target = document.getElementById(module);
  const moduleNameEl = document.getElementById('moduleName');
  if (target) {
    target.classList.add('active');
    if (moduleNameEl) {
      moduleNameEl.textContent = MODULES[module];
    }
  }
});
