/**
 * LIBRARY MODULE
 * Manages the fetching, filtering, pagination, and searching of the book collection.
 */

let books = [];
let currentPage = 1;
const booksPerPage = 12; // Grid layout optimization

// --- DATA INITIALIZATION ---
fetch('../assets/data/books.json')
  .then(response => response.json())
  .then(data => {
    books = data;
    renderFilterTags();
    renderBooks();
    renderPagination();
  });

/**
 * Dynamically generates category tags based on the book types in the database.
 */
function renderFilterTags() {
  const filterTags = document.getElementById('filterTags');
  const types = Array.from(new Set(books.map(b => (b.type || 'other').toLowerCase())));
  filterTags.innerHTML = '<span class="tag filter-tag active" data-filter="all">ALL</span>' +
    types.map(type => `<span class="tag filter-tag" data-filter="${type}">${type.toUpperCase()}</span>`).join('');
}

let currentFilter = 'all';
let currentSearch = '';

/**
 * Main render loop for the book grid.
 * Handles filtering, search matching, and pagination slicing.
 */
function renderBooks(filter = currentFilter, page = currentPage, searchQuery = currentSearch) {
  currentFilter = filter;
  currentPage = page;
  currentSearch = searchQuery;
  const grid = document.getElementById('libraryGrid');
  
  // Tactical Fade Transition
  grid.classList.add('fading');
  setTimeout(() => {
    grid.innerHTML = '';
    
    // Core filtering logic
    const filteredBooks = books.filter(book => {
      const type = (book.type || 'other').toLowerCase();
      const matchesFilter = filter === 'all' || filter === type;
      const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });

    // Pagination slicing
    const start = (page - 1) * booksPerPage;
    const end = start + booksPerPage;
    const pageBooks = filteredBooks.slice(start, end);

    // Build Tactical Cards
    pageBooks.forEach(book => {
      const type = (book.type || 'other').toLowerCase();
      const card = document.createElement('div');
      card.className = 'book-card';
      card.setAttribute('data-category', type);
      card.setAttribute('tabindex', '0'); 
      card.innerHTML = `
        <div class="book-title">${book.name}</div>
        <div class="book-author">— ${book.author || ''} ${book.type ? '&middot; ' + book.type.toUpperCase() : ''}</div>
        ${book.short_description ? `<p class="book-desc">${book.short_description}</p>` : ''}
        <div class="book-full" style="display:none;">${book.detailed_description || ''}</div>
        <button class="book-read-more">READ MORE</button>
      `;
      grid.appendChild(card);
    });

    // Re-attach modal triggers
    document.querySelectorAll('.book-read-more').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        const card = btn.closest('.book-card');
        document.getElementById('modalBookTitle').textContent = card.querySelector('.book-title').textContent;
        document.getElementById('modalBookAuthor').textContent = card.querySelector('.book-author').textContent;
        const desc = card.querySelector('.book-desc');
        document.getElementById('modalBookDesc').textContent = desc ? desc.textContent : '';
        document.getElementById('modalBookFull').textContent = card.querySelector('.book-full').textContent;
        document.getElementById('bookDetailModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => { document.getElementById('closeBookModal').focus(); }, 50);
      };
    });

    renderPagination(filteredBooks.length, page);

    // Fade back in
    setTimeout(() => {
      grid.classList.remove('fading');
      const firstCard = document.querySelector('.library-grid .book-card');
      if (firstCard) firstCard.focus();
    }, 10);
  }, 400);
}

/**
 * Renders pagination controls based on total counts.
 */
function renderPagination(totalBooks = books.length, page = currentPage) {
  let pagination = document.getElementById('pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.id = 'pagination';
    document.querySelector('.card-body').appendChild(pagination);
  }
  pagination.innerHTML = '';
  const totalPages = Math.ceil(totalBooks / booksPerPage);
  
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  pagination.style.display = '';

  // PREV ACTION
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Prev';
  prevBtn.disabled = page === 1;
  prevBtn.className = 'pagination-btn';
  prevBtn.onclick = () => {
    renderBooks(currentFilter, page - 1, currentSearch);
    setTimeout(() => {
      const firstCard = document.querySelector('.library-grid .book-card');
      if (firstCard) firstCard.focus();
    }, 0);
  };
  pagination.appendChild(prevBtn);

  // NUMERIC PAGES
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    pageBtn.className = 'pagination-btn' + (i === page ? ' active' : '');
    pageBtn.disabled = i === page;
    pageBtn.onclick = () => {
      renderBooks(currentFilter, i, currentSearch);
      setTimeout(() => {
        const firstCard = document.querySelector('.library-grid .book-card');
        if (firstCard) firstCard.focus();
      }, 0);
    };
    pagination.appendChild(pageBtn);
  }

  // NEXT ACTION
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.disabled = page === totalPages;
  nextBtn.className = 'pagination-btn';
  nextBtn.onclick = () => {
    renderBooks(currentFilter, page + 1, currentSearch);
    setTimeout(() => {
      const firstCard = document.querySelector('.library-grid .book-card');
      if (firstCard) firstCard.focus();
    }, 0);
  };
  pagination.appendChild(nextBtn);
}

// --- MODAL ENGINE ---
const closeBookModal = document.getElementById('closeBookModal');
if (closeBookModal) {
  closeBookModal.onclick = function () {
    document.getElementById('bookDetailModal').classList.remove('active');
    document.body.style.overflow = '';
  };
}

const bookDetailModal = document.getElementById('bookDetailModal');
if (bookDetailModal) {
  bookDetailModal.onclick = function (e) {
    if (e.target === this) {
      this.classList.remove('active');
      document.body.style.overflow = '';
    }
  };
}

// --- CATEGORY FILTERING ---
const filterTagsContainer = document.getElementById('filterTags');
if (filterTagsContainer) {
  filterTagsContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('filter-tag')) {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      renderBooks(filter, 1, currentSearch);
    }
  });
}

// --- SEARCH & AUTOCOMPLETE ENGINE ---
const searchInput = document.getElementById('librarySearch');
const autocompleteList = document.getElementById('searchAutocomplete');

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    // Clear autocomplete if query is short
    if (query.length < 2) {
      autocompleteList.classList.add('hidden');
      renderBooks(currentFilter, 1, query);
      return;
    }

    // Filter matches for tactical suggestions
    const matches = books.filter(b => 
      b.name.toLowerCase().includes(query) || 
      (b.author && b.author.toLowerCase().includes(query))
    ).slice(0, 6);

    if (matches.length > 0) {
      autocompleteList.innerHTML = matches.map(m => `
        <li class="autocomplete-item" data-name="${m.name}">
          <span style="color:var(--text-main)">${m.name}</span>
          <br><small style="opacity:0.6">${m.author || ''}</small>
        </li>
      `).join('');
      autocompleteList.classList.remove('hidden');
    } else {
      autocompleteList.classList.add('hidden');
    }
    
    renderBooks(currentFilter, 1, query);
  });

  // Handle autocomplete selection
  autocompleteList.addEventListener('click', (e) => {
    const item = e.target.closest('.autocomplete-item');
    if (item) {
      const selectedName = item.getAttribute('data-name');
      searchInput.value = selectedName;
      autocompleteList.classList.add('hidden');
      
      // Pivot to 'all' to ensure the selection is visible regardless of current tag
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      const allTag = document.querySelector('[data-filter="all"]');
      if (allTag) allTag.classList.add('active');
      
      renderBooks('all', 1, selectedName);
    }
  });

  // Global dismiss for autocomplete
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
      autocompleteList.classList.add('hidden');
    }
  });
}
