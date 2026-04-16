let notes = [];
let currentPage = 1;
const notesPerPage = 12;

const grid = document.getElementById('journalGrid');
if (grid) {
  grid.innerHTML = '<div class="status-msg" style="color: var(--text-muted); padding: 20px;">[ .. ] INITIALIZING_DATA_STREAM...</div>';
}

fetch('../assets/data/journal.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP_ERROR_STATUS_${response.status}`);
    return response.json();
  })
  .then(data => {
    notes = data.sort((a, b) => b.date.localeCompare(a.date));
    renderFilterTags();
    renderNotes();
    isInitial = false;
  })
  .catch(err => {
    console.error('JOURNAL_SYSTEM: LOAD_FAILURE:', err);
    if (grid) {
      grid.innerHTML = `
        <div class="status-msg" style="color: var(--accent-red); padding: 20px;">
          [ ERROR ] DATA_UPLINK_FAILED: ${err.message}<br><br>
          <small style="opacity:0.8; line-height: 1.6;">
            NOTE: Modern browsers block "fetch" on local files (file://). <br>
            Please use a local web server (e.g. VS Code Live Server) to load journal.json.
          </small>
        </div>`;
    }
  })
  .finally(() => {
    // Force hide loader if fetch completes or fails
    const ml = document.getElementById('miniLoader');
    if (ml) {
      console.log('JOURNAL_SYSTEM: DISMISSING_LOADER_FORCE_MUTE');
      setTimeout(() => {
        ml.style.opacity = '0';
        setTimeout(() => ml.style.display = 'none', 300);
      }, 500);
    }
  });

function renderFilterTags() {
  const filterTags = document.getElementById('filterTags');
  const types = Array.from(new Set(notes.map(b => (b.type || 'other').toLowerCase())));
  filterTags.innerHTML = '<span class="tag filter-tag active" data-filter="all">ALL</span>' +
    types.map(type => `<span class="tag filter-tag" data-filter="${type}">${type.toUpperCase()}</span>`).join('');
}

let currentFilter = 'all';
function renderNotes(filter = currentFilter, page = currentPage) {
  currentFilter = filter;
  currentPage = page;
  const grid = document.getElementById('journalGrid');
  // Fade out
  grid.classList.add('fading');
  setTimeout(() => {
    grid.innerHTML = '';
    // Filter books
    const filteredNotes = notes.filter(note => {
      const type = (note.type || 'other').toLowerCase();
      return filter === 'all' || filter === type;
    });
    // Pagination
    const start = (page - 1) * notesPerPage;
    const end = start + notesPerPage;
    const pageNotes = filteredNotes.slice(start, end);
    pageNotes.forEach(note => {
      const type = (note.type || 'other').toLowerCase();
      const card = document.createElement('div');
      card.className = 'book-card';
      card.setAttribute('data-category', type);
      card.setAttribute('tabindex', '0'); // Make focusable
      card.innerHTML = `
        <div class="book-title">${note.title}</div>
        <div class="book-author">— ${note.date || ''} ${note.type ? '&middot; ' + note.type.toUpperCase() : ''}</div>
        ${note.description ? `<p class="book-desc">${note.description}</p>` : ''}
        <div class="book-full" style="display:none;">${note.content || ''}</div>
        <button class="book-read-more">READ MORE</button>
      `;
      grid.appendChild(card);
    });
    // Attach modal logic
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
        document.body.style.overflow = 'hidden';
        setTimeout(() => { document.getElementById('closeNoteModal').focus(); }, 50);
      };
    });
    renderPagination(filteredNotes.length, page);
    // Fade in
    setTimeout(() => {
      grid.classList.remove('fading');
      const firstCard = document.querySelector('.journal-list .book-card');
      if (firstCard) firstCard.focus();
    }, 10);
  }, isInitial ? 0 : 400); // No delay on initial load
}
let isInitial = true;

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
  // Prev button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Prev';
  prevBtn.disabled = page === 1;
  prevBtn.className = 'pagination-btn';
  prevBtn.onclick = () => {
    renderNotes(currentFilter, page - 1);
    setTimeout(() => {
      const firstCard = document.querySelector('.journal-list .book-card');
      if (firstCard) firstCard.focus();
    }, 0);
  };
  pagination.appendChild(prevBtn);
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.className = 'pagination-btn' + (i === page ? ' active' : '');
    pageBtn.disabled = i === page;
    pageBtn.onclick = () => {
      renderNotes(currentFilter, i);
      setTimeout(() => {
        const firstCard = document.querySelector('.journal-list .book-card');
        if (firstCard) firstCard.focus();
      }, 0);
    };
    pagination.appendChild(pageBtn);
  }
  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.disabled = page === totalPages;
  nextBtn.className = 'pagination-btn';
  nextBtn.onclick = () => {
    renderNotes(currentFilter, page + 1);
    setTimeout(() => {
      const firstCard = document.querySelector('.journal-list .book-card');
      if (firstCard) firstCard.focus();
    }, 0);
  };
  pagination.appendChild(nextBtn);
}

// Modal close logic
const closeNoteModal = document.getElementById('closeNoteModal');
if (closeNoteModal) {
  closeNoteModal.onclick = function () {
    document.getElementById('noteDetailModal').classList.remove('active');
    document.body.style.overflow = '';
  };
}

const noteDetailModal = document.getElementById('noteDetailModal');
if (noteDetailModal) {
  noteDetailModal.onclick = function (e) {
    if (e.target === this) {
      this.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
}

// Filter logic (case-insensitive)
const filterTags = document.getElementById('filterTags');
if (filterTags) {
  filterTags.addEventListener('click', function (e) {
    if (e.target.classList.contains('filter-tag')) {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      renderNotes(filter, 1);
    }
  });
}

// Read More toggle
function toggleBook(btn) {
  const card = btn.closest('.book-card');
  card.classList.toggle('expanded');
  btn.textContent = card.classList.contains('expanded') ? 'COLLAPSE' : 'READ MORE';
}

// Accessibility
document.addEventListener('DOMContentLoaded', function () {
  const style = document.createElement('style');
  style.innerHTML = `.book-card { outline: none; }`;
  document.head.appendChild(style);
});
