window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const module = params.get('module') || 'career';

  // Deactivate all
  document.querySelectorAll('.module-content').forEach(el => el.classList.remove('active'));

  // Activate requested
  const target = document.getElementById(module);
  const moduleNameEl = document.getElementById('moduleName');
  if (target) {
    target.classList.add('active');
    if (moduleNameEl) {
      moduleNameEl.textContent = module.toUpperCase();
    }
  }
});
