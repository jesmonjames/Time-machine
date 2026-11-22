/**
 * JOURNAL MODULE
 * Manages the chronological data stream of learning logs and project milestones.
 */

let notes = [];
let currentPage = 1;
const notesPerPage = 12; // Optimized for the single-column vertical list

// --- UI FEEDBACK ---
const grid = document.getElementById('journalGrid');
if (grid) {
  grid.innerHTML = '<div class="status-msg" style="color: var(--text-muted); padding: 20px;">[ .. ] LOADING_ENTRIES...</div>';
}

// --- DATA LOAD ---
fetch('../assets/data/journal.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP_ERROR_STATUS_${response.status}`);
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data)) throw new Error('INVALID_DATASET');
    // Sort by date (descending) to show newest updates first
    notes = data.slice().sort((a, b) => b.date.localeCompare(a.date));
    renderFilterTags();
    renderNotes();
    isInitial = false;
  })
  .catch(err => {
    console.error('JOURNAL_SYSTEM: LOAD_FAILURE:', err);
    if (grid) {
      grid.innerHTML = `
        <div class="status-msg" style="color: var(--accent-red); padding: 20px;">
          [ ERROR ] DATA_LOAD_FAILED: ${err.message}<br><br>
          <small style="opacity:0.8; line-height: 1.6;">
            NOTE: Modern browsers block "fetch" on local files (file://). <br>
            Please use a local web server (e.g. VS Code Live Server) to load journal.json.
          </small>
        </div>`;
    }
  })
  .finally(() => {
    // Force dismiss the global mini-loader once data attempt finishes
    const ml = document.getElementById('miniLoader');
    if (ml) {
      setTimeout(() => {
        ml.style.opacity = '0';
        setTimeout(() => ml.style.display = 'none', 300);
      }, 500);
    }
  });

/**
 * Renders filter chips based on note categories (e.g. LEARNING, PROJECT).
 */
function renderFilterTags() {
  const filterTags = document.getElementById('filterTags');
  const types = Array.from(new Set(notes.map(b => (b.type || 'other').toLowerCase())));
  filterTags.innerHTML = '<span class="tag filter-tag active" data-filter="all">ALL</span>' +
    types.map(type => `<span class="tag filter-tag" data-filter="${type}">${type.toUpperCase()}</span>`).join('');
}

let currentFilter = 'all';
let currentSearch = '';
let isInitial = true;

/**
 * Main render function for the journal list.
 * Includes search matching across titles, descriptions, and full content.
 */
function renderNotes(filter = currentFilter, page = currentPage, searchQuery = currentSearch, focusFirst = false) {
  currentFilter = filter;
  currentPage = page;
  currentSearch = searchQuery;
  const grid = document.getElementById('journalGrid');
  
  // Tactical Transition
  grid.classList.add('fading');
  setTimeout(() => {
    grid.innerHTML = '';
    
    const filteredNotes = notes.filter(note => {
      const type = (note.type || 'other').toLowerCase();
      const matchesFilter = filter === 'all' || filter === type;
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (note.description && note.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });

    const start = (page - 1) * notesPerPage;
    const end = start + notesPerPage;
    const pageNotes = filteredNotes.slice(start, end);

    pageNotes.forEach(note => {
      const type = (note.type || 'other').toLowerCase();
      const card = document.createElement('div');
      card.className = 'book-card';
      card.setAttribute('data-category', type);
      card.setAttribute('tabindex', '0'); 
      card.innerHTML = `
        <div class="book-title">${note.title}</div>
        <div class="book-author">— ${note.date || ''} ${note.type ? '&middot; ' + note.type.toUpperCase() : ''}</div>
        ${note.description ? `<p class="book-desc">${note.description}</p>` : ''}
        <div class="book-full" style="display:none;">${note.content || ''}</div>
        <button class="book-read-more">READ MORE</button>
      `;
      grid.appendChild(card);
    });

    // Re-attach tactical modal triggers
    document.querySelectorAll('.book-read-more').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        const card = btn.closest('.book-card');
        document.getElementById('modalNoteTitle').textContent = card.querySelector('.book-title').textContent;
        document.getElementById('modalNoteDate').textContent = card.querySelector('.book-author').textContent;
        const desc = card.querySelector('.book-desc');
        document.getElementById('modalNoteDesc').textContent = desc ? desc.textContent : '';
        document.getElementById('modalNoteFull').textContent = card.querySelector('.book-full').textContent;
        document.getElementById('noteDetailModal').classList.add('active');
        document.getElementById('noteDetailModal').setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setTimeout(() => { document.getElementById('closeNoteModal').focus(); }, 50);
      };
    });

    renderPagination(filteredNotes.length, page);

    setTimeout(() => {
      grid.classList.remove('fading');
      if (focusFirst) {
        const firstCard = document.querySelector('.journal-list .book-card');
        if (firstCard) firstCard.focus();
      }
    }, 10);
  }, isInitial ? 0 : 400); 
}

// --- TACTICAL AI BRIDGE ---
window.addEventListener('tacticalPageCommand', (e) => {
  const { type, query } = e.detail;
  if (type === 'search') {
    const searchInput = document.getElementById('journalSearch');
    if (searchInput) {
      searchInput.value = query;
      searchInput.dispatchEvent(new Event('input'));
    }
  } else if (type === 'open') {
    const cards = document.querySelectorAll('.book-card');
    cards.forEach(card => {
      const title = card.querySelector('.book-title').textContent.toLowerCase();
      if (title.includes(query.toLowerCase())) {
        const btn = card.querySelector('.book-read-more');
        if (btn) btn.click();
      }
    });
  }
});

/**
 * Handles pagination UI generation.
 */
function renderPagination(totalNotes = notes.length, page = currentPage) {
  let pagination = document.getElementById('pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.id = 'pagination';
    document.querySelector('.card-body').appendChild(pagination);
  }
  pagination.innerHTML = '';
  const totalPages = Math.ceil(totalNotes / notesPerPage);
  
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  pagination.style.display = '';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Prev';
  prevBtn.disabled = page === 1;
  prevBtn.className = 'pagination-btn';
  prevBtn.onclick = () => {
    renderNotes(currentFilter, page - 1, currentSearch, true);
  };
  pagination.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.className = 'pagination-btn' + (i === page ? ' active' : '');
    pageBtn.disabled = i === page;
    pageBtn.onclick = () => {
      renderNotes(currentFilter, i, currentSearch, true);
    };
    pagination.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.disabled = page === totalPages;
  nextBtn.className = 'pagination-btn';
  nextBtn.onclick = () => {
    renderNotes(currentFilter, page + 1, currentSearch, true);
  };
  pagination.appendChild(nextBtn);
}

// --- MODAL ENGINE ---
const noteDetailModal = document.getElementById('noteDetailModal');
const closeNoteModal = document.getElementById('closeNoteModal');

function closeNoteDetail() {
  if (noteDetailModal) {
    noteDetailModal.classList.remove('active');
    noteDetailModal.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
}

if (closeNoteModal) {
  closeNoteModal.onclick = closeNoteDetail;
}

if (noteDetailModal) {
  noteDetailModal.onclick = function (e) {
    if (e.target === this) closeNoteDetail();
  };
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && noteDetailModal && noteDetailModal.classList.contains('active')) {
    closeNoteDetail();
  }
});

// --- FILTER DELEGATION ---
const filterTagsContainer = document.getElementById('filterTags');
if (filterTagsContainer) {
  filterTagsContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('filter-tag')) {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      renderNotes(filter, 1, currentSearch, true);
    }
  });
}

// --- SEARCH & AUTOCOMPLETE ENGINE ---
const searchInput = document.getElementById('journalSearch');
const autocompleteList = document.getElementById('searchAutocomplete');

if (searchInput) {
  let searchDebounce = null;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      if (query.length < 2) {
        autocompleteList.classList.add('hidden');
        renderNotes(currentFilter, 1, query);
        return;
      }

      const matches = notes.filter(n =>
        n.title.toLowerCase().includes(query) ||
        (n.description && n.description.toLowerCase().includes(query))
      ).slice(0, 6);

      if (matches.length > 0) {
        autocompleteList.innerHTML = matches.map(m => `
          <li class="autocomplete-item" data-title="${m.title}">
            <span style="color:var(--text-main)">${m.title}</span>
            <br><small style="opacity:0.6">${m.date} &middot; ${(m.type || 'other').toUpperCase()}</small>
          </li>
        `).join('');
        autocompleteList.classList.remove('hidden');
      } else {
        autocompleteList.classList.add('hidden');
      }

      renderNotes(currentFilter, 1, query);
    }, 180);
  });

  autocompleteList.addEventListener('click', (e) => {
    const item = e.target.closest('.autocomplete-item');
    if (item) {
      const selectedTitle = item.getAttribute('data-title');
      searchInput.value = selectedTitle;
      autocompleteList.classList.add('hidden');

      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      const allTag = document.querySelector('[data-filter="all"]');
      if (allTag) allTag.classList.add('active');

      renderNotes('all', 1, selectedTitle, true);
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
      autocompleteList.classList.add('hidden');
    }
  });
}
