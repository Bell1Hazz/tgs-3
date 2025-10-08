class SimpleArticleManager {
    constructor() {
        this.articles = [];
        this.currentArticles = [];
        this.articlesPerLoad = 6;
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.loadedArticles = 0;
        
        this.init();
    }

    async init() {
        await this.loadArticles();
        this.bindEvents();
        this.displayArticles();
    }

    async loadArticles() {
        try {
            const response = await fetch('articles.json');
            const data = await response.json();
            this.articles = data.articles;
            this.filterArticles();
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showError('Gagal memuat artikel. Silakan coba lagi nanti.');
        }
    }

bindEvents() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', SimpleArticleManager.toggleTheme);
        
        // Search toggle
        document.getElementById('searchToggle').addEventListener('click', this.toggleSearch);
        
        // Navigation toggle (mobile)
        document.getElementById('navToggle').addEventListener('click', this.toggleMobileNav);
        
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Load more button
        document.getElementById('loadMoreBtn').addEventListener('click', () => this.loadMore());

        // Newsletter subscription
        document.getElementById('subscribeBtn').addEventListener('click', this.handleNewsletter);

        // Modal functionality
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('articleModal').addEventListener('click', (e) => {
            if (e.target.id === 'articleModal') {
                this.closeModal();
            }
        });

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', this.handleNavigation);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('articleModal');
                const searchBar = document.getElementById('searchBar');
                
                if (modal.classList.contains('active')) {
                    this.closeModal();
                } else if (searchBar.classList.contains('active')) {
                    this.toggleSearch();
                }
            }
        });
    }

    filterArticles() {
        this.currentArticles = this.articles.filter(article => {
            const matchesCategory = this.currentFilter === 'all' || article.category === this.currentFilter;
            const matchesSearch = this.searchTerm === '' || 
                article.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                article.summary.toLowerCase().includes(this.searchTerm.toLowerCase());
            
            return matchesCategory && matchesSearch;
        });
        
        this.loadedArticles = 0;
    }

    displayArticles() {
        const container = document.getElementById('articlesGrid');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        if (this.loadedArticles === 0) {
            container.innerHTML = '';
        }

        const articlesToShow = this.currentArticles.slice(
            this.loadedArticles, 
            this.loadedArticles + this.articlesPerLoad
        );

        if (articlesToShow.length === 0 && this.loadedArticles === 0) {
            this.showNoResults();
            loadMoreBtn.style.display = 'none';
            return;
        }

        articlesToShow.forEach(article => {
            const articleCard = this.createArticleCard(article);
            articleCard.classList.add('fade-in');
            container.appendChild(articleCard);
        });

        this.loadedArticles += articlesToShow.length;

        // Show/hide load more button
        if (this.loadedArticles >= this.currentArticles.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }

    createArticleCard(article) {
        const card = document.createElement('div');
        card.className = 'article-card';
        card.innerHTML = `
            <div class="article-image">
                <img src="${article.image}" alt="${article.title}" loading="lazy">
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <span class="article-category">${article.category}</span>
                    <span class="article-author">${article.author}</span>
                    <span class="article-date">${article.date}</span>
                </div>
                <h3 class="article-title">${article.title}</h3>
                <p class="article-summary">${article.summary}</p>
                <div class="article-footer">
                    <button class="read-more-btn">
                        <span>Read More</span>
                        <span>→</span>
                    </button>
                    <span class="read-time">
                        <span>🕒</span>
                        ${article.readTime}
                    </span>
                </div>
            </div>
        `;

        // Add click events
        card.querySelector('.read-more-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openModal(article);
        });

        card.addEventListener('click', () => {
            this.openModal(article);
        });

        return card;
    }

    openModal(article) {
        const modal = document.getElementById('articleModal');
        document.getElementById('modalTitle').textContent = article.title;
        document.getElementById('modalAuthor').textContent = article.author;
        document.getElementById('modalDate').textContent = article.date;
        document.getElementById('modalCategory').textContent = article.category;
        document.getElementById('modalImage').src = article.image;
        document.getElementById('modalImage').alt = article.title;
        document.getElementById('modalContent').textContent = article.content;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('articleModal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    handleFilter(e) {
        const filterBtn = e.target;
        const category = filterBtn.dataset.category;

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        filterBtn.classList.add('active');

        // Update current filter and refresh articles
        this.currentFilter = category;
        this.filterArticles();
        this.displayArticles();
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        this.searchTerm = searchInput.value.trim();
        this.filterArticles();
        this.displayArticles();
    }

    loadMore() {
        this.displayArticles();
    }

    showNoResults() {
        const container = document.getElementById('articlesGrid');
        container.innerHTML = `
            <div class="no-results">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">🔍</div>
                <h3>No Articles Found</h3>
                <p>Try adjusting your search terms or filters</p>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('articlesGrid');
        container.innerHTML = `
            <div class="no-results">
                <div style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;">⚠️</div>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Static methods
    static toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    static toggleSearch() {
        const searchBar = document.getElementById('searchBar');
        const searchInput = document.getElementById('searchInput');
        
        searchBar.classList.toggle('active');
        
        if (searchBar.classList.contains('active')) {
            setTimeout(() => searchInput.focus(), 300);
        }
    }

    static toggleMobileNav() {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        navMenu.classList.toggle('active');
        
        // Update hamburger icon
        if (navMenu.classList.contains('active')) {
            navToggle.textContent = '✕';
        } else {
            navToggle.textContent = '☰';
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        
        if (targetId.startsWith('#')) {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        // Update active navigation link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        e.target.classList.add('active');

        // Close mobile menu
        const navMenu = document.getElementById('navMenu');
        if (navMenu.classList.contains('active')) {
            this.toggleMobileNav();
        }
    }


    static handleNewsletter() {
        const emailInput = document.getElementById('newsletterEmail');
        const email = emailInput.value.trim();
        
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        if (!email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }
        
        alert('Thank you for subscribing to our newsletter!');
        emailInput.value = '';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    
    // Initialize Simple Article Manager
    new SimpleArticleManager();
});
