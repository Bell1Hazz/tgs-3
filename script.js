class ArticleManager {
    constructor() {
        this.articles = [];
        this.currentArticles = [];
        this.articlesPerLoad = 6;
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.loadedArticles = 0;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        await this.loadArticles();
        this.bindEvents();
        this.displayArticles();
    }

    async loadArticles() {
        try {
            this.showLoading(true);
            const response = await fetch('articles.json');
            const data = await response.json();
            this.articles = data.articles;
            this.filterArticles();
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showError('Gagal memuat artikel. Silakan coba lagi nanti.');
        } finally {
            this.showLoading(false);
        }
    }

    bindEvents() {
        // Navigation
        document.getElementById('navToggle').addEventListener('click', this.toggleMobileNav);
        document.getElementById('themeToggle').addEventListener('click', this.toggleTheme);
        document.getElementById('searchToggle').addEventListener('click', this.toggleSearch);
        
        // Search
        document.getElementById('searchBtn').addEventListener('click', this.handleSearch.bind(this));
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Load More
        document.getElementById('loadMoreBtn').addEventListener('click', this.loadMore.bind(this));

        // Newsletter
        document.getElementById('subscribeBtn').addEventListener('click', this.handleNewsletter);

        // Modal
        document.getElementById('modalClose').addEventListener('click', this.closeModal);
        document.getElementById('articleModal').addEventListener('click', (e) => {
            if (e.target.id === 'articleModal') {
                this.closeModal();
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', this.handleNavigation);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Scroll effects
        window.addEventListener('scroll', this.handleScroll);
    }

    filterArticles() {
        this.currentArticles = this.articles.filter(article => {
            const matchesCategory = this.currentFilter === 'all' || article.category === this.currentFilter;
            const matchesSearch = this.searchTerm === '' || 
                article.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                article.summary.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                article.content.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                article.tags.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));
            
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

        articlesToShow.forEach((article, index) => {
            const articleCard = this.createArticleCard(article);
            articleCard.style.animationDelay = `${index * 0.1}s`;
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
                    <button class="read-more-btn" data-article-id="${article.id}">
                        <span>Read More</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <span class="read-time">
                        <i class="fas fa-clock"></i>
                        ${article.readTime}
                    </span>
                </div>
            </div>
        `;

        // Add click event for read more
        card.querySelector('.read-more-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.openModal(article);
        });

        // Add click event for entire card
        card.addEventListener('click', () => {
            this.openModal(article);
        });

        return card;
    }

    openModal(article) {
        const modal = document.getElementById('articleModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalAuthor = document.getElementById('modalAuthor');
        const modalDate = document.getElementById('modalDate');
        const modalCategory = document.getElementById('modalCategory');
        const modalImage = document.getElementById('modalImage');
        const modalContent = document.getElementById('modalContent');

        modalTitle.textContent = article.title;
        modalAuthor.textContent = article.author;
        modalDate.textContent = article.date;
        modalCategory.textContent = article.category;
        modalImage.src = article.image;
        modalImage.alt = article.title;
        modalContent.textContent = article.content;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Track article view
        this.trackArticleView(article.id);
    }

    closeModal() {
        const modal = document.getElementById('articleModal');
        modal.classList.remove('active');
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

        // Animate filter change
        const container = document.getElementById('articlesGrid');
        container.style.opacity = '0.5';
        setTimeout(() => {
            container.style.opacity = '1';
        }, 150);
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        this.searchTerm = searchInput.value.trim();
        this.filterArticles();
        this.displayArticles();

        // Close search bar on mobile after search
        if (window.innerWidth <= 768) {
            this.toggleSearch();
        }
    }

    loadMore() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const originalText = loadMoreBtn.innerHTML;
        
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        loadMoreBtn.disabled = true;

        // Simulate loading delay for better UX
        setTimeout(() => {
            this.displayArticles();
            loadMoreBtn.innerHTML = originalText;
            loadMoreBtn.disabled = false;
            this.isLoading = false;
        }, 500);
    }

    showLoading(show) {
        const skeleton = document.querySelector('.loading-skeleton');
        const articlesGrid = document.getElementById('articlesGrid');
        
        if (show) {
            skeleton.style.display = 'grid';
            articlesGrid.style.display = 'none';
        } else {
            skeleton.style.display = 'none';
            articlesGrid.style.display = 'grid';
        }
    }

    showNoResults() {
        const container = document.getElementById('articlesGrid');
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Articles Found</h3>
                <p>Try adjusting your search terms or filters</p>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('articlesGrid');
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }

    // Static methods for UI interactions
    static toggleMobileNav() {
        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        
        navMenu.classList.toggle('active');
        
        // Update hamburger icon
        const icon = navToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    }

    static toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    static toggleSearch() {
        const searchBar = document.getElementById('searchBar');
        const searchInput = document.getElementById('searchInput');
        
        searchBar.classList.toggle('active');
        
        if (searchBar.classList.contains('active')) {
            setTimeout(() => searchInput.focus(), 300);
        }
    }

    static handleNavigation(e) {
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
            ArticleManager.toggleMobileNav();
        }
    }

    static handleNewsletter() {
        const emailInput = document.getElementById('newsletterEmail');
        const email = emailInput.value.trim();
        
        if (!email) {
            alert('Please enter your email address');
            return;
        }
        
        if (!ArticleManager.isValidEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Simulate newsletter subscription
        alert('Thank you for subscribing to our newsletter!');
        emailInput.value = '';
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static handleScroll() {
        const header = document.querySelector('.header');
        
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }

        // Animate elements on scroll
        const animateElements = document.querySelectorAll('.article-card:not(.animated)');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated', 'slide-up');
                }
            });
        }, { threshold: 0.1 });

        animateElements.forEach(el => observer.observe(el));
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K to open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            ArticleManager.toggleSearch();
        }
        
        // Escape to close modal or search
        if (e.key === 'Escape') {
            const modal = document.getElementById('articleModal');
            const searchBar = document.getElementById('searchBar');
            
            if (modal.classList.contains('active')) {
                this.closeModal();
            } else if (searchBar.classList.contains('active')) {
                ArticleManager.toggleSearch();
            }
        }
    }

    trackArticleView(articleId) {
        // Track article views for analytics
        console.log(`Article ${articleId} viewed`);
        
        // Update view count in localStorage
        const viewCounts = JSON.parse(localStorage.getItem('articleViews')) || {};
        viewCounts[articleId] = (viewCounts[articleId] || 0) + 1;
        localStorage.setItem('articleViews', JSON.stringify(viewCounts));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    // Bind static event listeners
    document.getElementById('navToggle').addEventListener('click', ArticleManager.toggleMobileNav);
    document.getElementById('themeToggle').addEventListener('click', ArticleManager.toggleTheme);
    document.getElementById('searchToggle').addEventListener('click', ArticleManager.toggleSearch);
    document.getElementById('subscribeBtn').addEventListener('click', ArticleManager.handleNewsletter);
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', ArticleManager.handleNavigation);
    });
    
    window.addEventListener('scroll', ArticleManager.handleScroll);
    
    // Initialize Article Manager
    new ArticleManager();
    
    // Add loading animation to page
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
});