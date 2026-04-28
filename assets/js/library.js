let books = [];
let currentPage = 1;
const booksPerPage = 12;

fetch('../assets/data/books.json')
  .then(response => response.json())
  .then(data => {
    books = data;
    renderFilterTags();
    renderBooks();
    renderPagination();
  });

function renderFilterTags() {
  const filterTags = document.getElementById('filterTags');
  const types = Array.from(new Set(books.map(b => (b.type || 'other').toLowerCase())));
  filterTags.innerHTML = '<span class="tag filter-tag active" data-filter="all">ALL</span>' +
    types.map(type => `<span class="tag filter-tag" data-filter="${type}">${type.toUpperCase()}</span>`).join('');
}

let currentFilter = 'all';
let currentSearch = '';

function renderBooks(filter = currentFilter, page = currentPage, searchQuery = currentSearch) {
  currentFilter = filter;
  currentPage = page;
  currentSearch = searchQuery;
  const grid = document.getElementById('libraryGrid');
  // Fade out
  grid.classList.add('fading');
  setTimeout(() => {
    grid.innerHTML = '';
    // Filter books
    const filteredBooks = books.filter(book => {
      const type = (book.type || 'other').toLowerCase();
      const matchesFilter = filter === 'all' || filter === type;
      const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
    // Pagination
    const start = (page - 1) * booksPerPage;
    const end = start + booksPerPage;
    const pageBooks = filteredBooks.slice(start, end);
    pageBooks.forEach(book => {
      const type = (book.type || 'other').toLowerCase();
      const card = document.createElement('div');
      card.className = 'book-card';
      card.setAttribute('data-category', type);
      card.setAttribute('tabindex', '0'); // Make focusable
      card.innerHTML = `
        <div class="book-title">${book.name}</div>
        <div class="book-author">— ${book.author || ''} ${book.type ? '&middot; ' + book.type.toUpperCase() : ''}</div>
        ${book.short_description ? `<p class="book-desc">${book.short_description}</p>` : ''}
        <div class="book-full" style="display:none;">${book.detailed_description || ''}</div>
        <button class="book-read-more">READ MORE</button>
      `;
      grid.appendChild(card);
    });
    // Attach modal logic
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
    // Fade in
    setTimeout(() => {
      grid.classList.remove('fading');
      // Focus first card after fade in
      const firstCard = document.querySelector('.library-grid .book-card');
      if (firstCard) firstCard.focus();
    }, 10);
  }, 400);
}

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
  // Prev button
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
  // Page numbers
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
  // Next button
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

// Modal close logic
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

// Filter logic (case-insensitive)
const filterTags = document.getElementById('filterTags');
if (filterTags) {
  filterTags.addEventListener('click', function (e) {
    if (e.target.classList.contains('filter-tag')) {
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      renderBooks(filter, 1, currentSearch);
    }
  });
}

// Read More toggle
function toggleBook(btn) {
  const card = btn.closest('.book-card');
  card.classList.toggle('expanded');
  btn.textContent = card.classList.contains('expanded') ? 'COLLAPSE' : 'READ MORE';
}

// Search & Autocomplete Logic
const searchInput = document.getElementById('librarySearch');
const autocompleteList = document.getElementById('searchAutocomplete');

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    // Clear autocomplete if query is short
    if (query.length < 2) {
      autocompleteList.classList.add('hidden');
      renderBooks(currentFilter, 1, query); // Still filter for short queries if user types them
      return;
    }

    // Filter matches for autocomplete
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
      
      // Pivot to 'all' when a specific book is selected to ensure it shows up regardless of current tag
      document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
      const allTag = document.querySelector('[data-filter="all"]');
      if (allTag) allTag.classList.add('active');
      
      renderBooks('all', 1, selectedName);
    }
  });

  // Close autocomplete on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
      autocompleteList.classList.add('hidden');
    }
  });
}

// Accessibility
document.addEventListener('DOMContentLoaded', function () {
  const style = document.createElement('style');
  style.innerHTML = `.book-card { outline: none; }`;
  document.head.appendChild(style);
});
