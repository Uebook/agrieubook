// API Configuration
const API_BASE_URL = window.location.origin.includes('localhost') 
    ? 'http://localhost:3000' 
    : (window.location.origin.includes('3001') ? 'http://localhost:3000' : window.location.origin);

// Global state
let websiteContent = {};
let books = [];
let authors = [];
let categories = [];

// App Download Modal
function createAppDownloadModal() {
    const modal = document.createElement('div');
    modal.id = 'appDownloadModal';
    modal.className = 'app-download-modal';
    modal.innerHTML = `
        <div class="app-download-overlay"></div>
        <div class="app-download-content">
            <button class="app-download-close" onclick="closeAppDownloadModal()">&times;</button>
            <h2>Download Agribook App</h2>
            <p>Get the Agribook app on your mobile device to access thousands of agricultural books and resources.</p>
            <div class="app-download-buttons">
                ${websiteContent.android_app_url ? `
                    <a href="${websiteContent.android_app_url}" target="_blank" class="app-download-btn android">
                        <span class="app-icon">🤖</span>
                        <div>
                            <span class="app-label">Get it on</span>
                            <span class="app-name">Google Play</span>
                        </div>
                    </a>
                ` : ''}
                ${websiteContent.ios_app_url ? `
                    <a href="${websiteContent.ios_app_url}" target="_blank" class="app-download-btn ios">
                        <span class="app-icon">🍎</span>
                        <div>
                            <span class="app-label">Download on the</span>
                            <span class="app-name">App Store</span>
                        </div>
                    </a>
                ` : ''}
            </div>
            ${!websiteContent.android_app_url && !websiteContent.ios_app_url ? `
                <p style="text-align: center; color: #666; margin-top: 20px;">
                    App download links will be available soon!
                </p>
            ` : ''}
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function showAppDownloadModal() {
    const modal = document.getElementById('appDownloadModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeAppDownloadModal() {
    const modal = document.getElementById('appDownloadModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Close modal when clicking overlay
document.addEventListener('click', (e) => {
    const modal = document.getElementById('appDownloadModal');
    if (modal && e.target.classList.contains('app-download-overlay')) {
        closeAppDownloadModal();
    }
});

// Fetch Website Content
async function fetchWebsiteContent() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/website-content`);
        if (!response.ok) throw new Error('Failed to fetch website content');
        websiteContent = await response.json();
        updateWebsiteContent();
    } catch (error) {
        console.error('Error fetching website content:', error);
        // Use defaults if API fails
        websiteContent = {
            logo_text: 'Agribook',
            logo_url: null,
            hero_title: 'Your Agricultural Knowledge Hub',
            hero_subtitle: 'Discover thousands of eBooks, audiobooks, and expert resources to transform your farming practices',
            stat_books: 500,
            stat_authors: 50,
            stat_readers: 10000,
        };
        updateWebsiteContent();
    }
}

// Fetch Books
async function fetchBooks() {
    try {
        const bookIds = websiteContent.featured_book_ids || [];
        if (bookIds.length === 0) {
            // Fetch published books if no featured books selected
            const response = await fetch(`${API_BASE_URL}/api/books?status=published&limit=8`);
            if (!response.ok) throw new Error('Failed to fetch books');
            const data = await response.json();
            books = data.books || [];
        } else {
            // Fetch specific featured books
            const promises = bookIds.map(id => 
                fetch(`${API_BASE_URL}/api/books/${id}`).then(r => r.json()).then(data => data.book)
            );
            const results = await Promise.all(promises);
            books = results.filter(b => b && !b.error);
        }
        populateBooks();
    } catch (error) {
        console.error('Error fetching books:', error);
        books = [];
    }
}

// Fetch Authors
async function fetchAuthors() {
    try {
        const authorIds = websiteContent.featured_author_ids || [];
        if (authorIds.length === 0) {
            // Fetch all authors if no featured authors selected
            const response = await fetch(`${API_BASE_URL}/api/authors?limit=4`);
            if (!response.ok) throw new Error('Failed to fetch authors');
            const data = await response.json();
            authors = data.authors || [];
        } else {
            // Fetch specific featured authors
            const promises = authorIds.map(id => 
                fetch(`${API_BASE_URL}/api/authors/${id}`).then(r => r.json()).then(data => data.author)
            );
            const results = await Promise.all(promises);
            authors = results.filter(a => a && !a.error);
        }
        populateAuthors();
    } catch (error) {
        console.error('Error fetching authors:', error);
        authors = [];
    }
}

// Fetch Categories
async function fetchCategories() {
    try {
        const categoryIds = websiteContent.featured_category_ids || [];
        if (categoryIds.length === 0) {
            // Fetch all categories if no featured categories selected
            const response = await fetch(`${API_BASE_URL}/api/categories?limit=1000`);
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            categories = data.categories || [];
        } else {
            // Fetch specific featured categories
            const promises = categoryIds.map(id => 
                fetch(`${API_BASE_URL}/api/categories/${id}`).then(r => r.json()).then(data => data.category)
            );
            const results = await Promise.all(promises);
            categories = results.filter(c => c && !c.error);
        }
        populateCategories();
    } catch (error) {
        console.error('Error fetching categories:', error);
        categories = [];
    }
}

// Update Website Content
function updateWebsiteContent() {
    // Update logo image
    const logoImage = document.getElementById('logoImage');
    const footerLogoImage = document.getElementById('footerLogoImage');
    const logoText = document.querySelector('.logo-text');
    
    if (logoImage && websiteContent.logo_url) {
        logoImage.src = websiteContent.logo_url;
        logoImage.style.display = 'block';
    } else if (logoImage) {
        logoImage.style.display = 'none';
    }
    
    if (footerLogoImage && websiteContent.logo_url) {
        footerLogoImage.src = websiteContent.logo_url;
        footerLogoImage.style.display = 'block';
    } else if (footerLogoImage) {
        footerLogoImage.style.display = 'none';
    }
    
    if (logoText && websiteContent.logo_text) logoText.textContent = websiteContent.logo_text;

    // Update hero section
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroTitle && websiteContent.hero_title) heroTitle.textContent = websiteContent.hero_title;
    if (heroSubtitle && websiteContent.hero_subtitle) heroSubtitle.textContent = websiteContent.hero_subtitle;

    // Update hero image
    const heroImage = document.querySelector('.hero-image-wrapper img');
    if (heroImage && websiteContent.hero_image_url) {
        heroImage.src = websiteContent.hero_image_url;
    }

    // Update hero buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    if (heroButtons[0] && websiteContent.hero_button_1_text) {
        heroButtons[0].textContent = websiteContent.hero_button_1_text;
        if (websiteContent.hero_button_1_link) heroButtons[0].href = websiteContent.hero_button_1_link;
    }
    if (heroButtons[1] && websiteContent.hero_button_2_text) {
        heroButtons[1].textContent = websiteContent.hero_button_2_text;
        if (websiteContent.hero_button_2_link) heroButtons[1].href = websiteContent.hero_button_2_link;
    }

    // Update stats
    const statBooks = document.querySelector('.stat-number[data-target]');
    if (statBooks && websiteContent.stat_books) {
        statBooks.setAttribute('data-target', websiteContent.stat_books);
        statBooks.textContent = '0';
    }
    const statAuthors = document.querySelectorAll('.stat-number[data-target]');
    if (statAuthors[1] && websiteContent.stat_authors) {
        statAuthors[1].setAttribute('data-target', websiteContent.stat_authors);
        statAuthors[1].textContent = '0';
    }
    const statReaders = document.querySelectorAll('.stat-number[data-target]');
    if (statReaders[2] && websiteContent.stat_readers) {
        statReaders[2].setAttribute('data-target', websiteContent.stat_readers);
        statReaders[2].textContent = '0';
    }

    // Update features section
    if (websiteContent.features_title) {
        const featuresTitle = document.querySelector('#features .section-title');
        if (featuresTitle) featuresTitle.textContent = websiteContent.features_title;
    }
    if (websiteContent.features_subtitle) {
        const featuresSubtitle = document.querySelector('#features .section-subtitle');
        if (featuresSubtitle) featuresSubtitle.textContent = websiteContent.features_subtitle;
    }
    populateFeatures();
    populateStatistics();
    populateAbout();

    // Update categories section
    if (websiteContent.categories_title) {
        const categoriesTitle = document.querySelector('.categories .section-title');
        if (categoriesTitle) categoriesTitle.textContent = websiteContent.categories_title;
    }
    if (websiteContent.categories_subtitle) {
        const categoriesSubtitle = document.querySelector('.categories .section-subtitle');
        if (categoriesSubtitle) categoriesSubtitle.textContent = websiteContent.categories_subtitle;
    }

    // Update section titles
    if (websiteContent.books_title) {
        const booksTitle = document.querySelector('#books .section-title');
        if (booksTitle) booksTitle.textContent = websiteContent.books_title;
    }
    if (websiteContent.books_subtitle) {
        const booksSubtitle = document.querySelector('#books .section-subtitle');
        if (booksSubtitle) booksSubtitle.textContent = websiteContent.books_subtitle;
    }
    if (websiteContent.authors_title) {
        const authorsTitle = document.querySelector('#authors .section-title');
        if (authorsTitle) authorsTitle.textContent = websiteContent.authors_title;
    }
    if (websiteContent.authors_subtitle) {
        const authorsSubtitle = document.querySelector('#authors .section-subtitle');
        if (authorsSubtitle) authorsSubtitle.textContent = websiteContent.authors_subtitle;
    }

    // Update navigation links
    populateNavigationLinks();

    // Update CTA section
    populateCTA();

    // Update footer
    populateFooter();

    // Update meta tags
    if (websiteContent.meta_title) {
        document.title = websiteContent.meta_title;
        const metaTitle = document.querySelector('meta[property="og:title"]');
        if (metaTitle) metaTitle.setAttribute('content', websiteContent.meta_title);
    }
    if (websiteContent.meta_description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', websiteContent.meta_description);
    }
}

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Populate Navigation Links
function populateNavigationLinks() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    const links = websiteContent.navigation_links || [];
    navLinks.innerHTML = '';
    
    links.forEach(link => {
        if (link && link.label && link.href) {
            const li = document.createElement('li');
            const isGetStarted = link.label.toLowerCase().includes('get started') || link.label.toLowerCase().includes('start');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.label;
            if (isGetStarted) {
                a.className = 'btn-primary';
            }
            li.appendChild(a);
            navLinks.appendChild(li);
        }
    });
}

// Populate CTA Section
function populateCTA() {
    const ctaTitle = document.querySelector('.cta-title');
    const ctaSubtitle = document.querySelector('.cta-subtitle');
    const ctaButtons = document.getElementById('ctaButtons');
    
    if (ctaTitle && websiteContent.cta_title) {
        ctaTitle.textContent = websiteContent.cta_title;
    }
    if (ctaSubtitle && websiteContent.cta_subtitle) {
        ctaSubtitle.textContent = websiteContent.cta_subtitle;
    }
    if (ctaButtons) {
        ctaButtons.innerHTML = '';
        if (websiteContent.cta_button_1_text) {
            const btn1 = document.createElement('a');
            btn1.href = websiteContent.cta_button_1_link || '#books';
            btn1.className = 'btn btn-primary btn-large';
            btn1.textContent = websiteContent.cta_button_1_text;
            ctaButtons.appendChild(btn1);
        }
        if (websiteContent.cta_button_2_text) {
            const btn2 = document.createElement('a');
            btn2.href = websiteContent.cta_button_2_link || '#features';
            btn2.className = 'btn btn-secondary btn-large';
            btn2.textContent = websiteContent.cta_button_2_text;
            ctaButtons.appendChild(btn2);
        }
    }
}

// Populate Footer
function populateFooter() {
    // Footer description
    if (websiteContent.footer_description) {
        const footerDesc = document.querySelector('.footer-description');
        if (footerDesc) footerDesc.textContent = websiteContent.footer_description;
    }
    
    // Footer quick links
    const footerQuickLinks = document.getElementById('footerQuickLinks');
    if (footerQuickLinks) {
        footerQuickLinks.innerHTML = '';
        const links = websiteContent.footer_quick_links || [];
        links.forEach(link => {
            if (link && link.label && link.href) {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = link.href;
                a.textContent = link.label;
                li.appendChild(a);
                footerQuickLinks.appendChild(li);
            }
        });
    }
    
    // Footer categories
    const footerCategories = document.getElementById('footerCategories');
    if (footerCategories) {
        footerCategories.innerHTML = '';
        const categories = websiteContent.footer_categories || [];
        categories.forEach(category => {
            if (category && category.label && category.href) {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = category.href;
                a.textContent = category.label;
                li.appendChild(a);
                footerCategories.appendChild(li);
            }
        });
    }
    
    // Footer contact
    const footerContact = document.getElementById('footerContact');
    if (footerContact) {
        footerContact.innerHTML = '';
        if (websiteContent.footer_email) {
            const emailLi = document.createElement('li');
            emailLi.textContent = `Email: ${websiteContent.footer_email}`;
            footerContact.appendChild(emailLi);
        }
        if (websiteContent.footer_phone) {
            const phoneLi = document.createElement('li');
            phoneLi.textContent = `Phone: ${websiteContent.footer_phone}`;
            footerContact.appendChild(phoneLi);
        }
        if (websiteContent.footer_support_email) {
            const supportLi = document.createElement('li');
            supportLi.textContent = `Support: ${websiteContent.footer_support_email}`;
            footerContact.appendChild(supportLi);
        }
    }
    
    // Footer copyright
    if (websiteContent.footer_copyright) {
        const footerCopyright = document.querySelector('.footer-bottom p');
        if (footerCopyright) footerCopyright.textContent = websiteContent.footer_copyright;
    }
}

// Populate About Section
function populateAbout() {
    // Update about title
    const aboutTitle = document.querySelector('#about .section-title');
    if (aboutTitle && websiteContent.about_title) {
        aboutTitle.textContent = websiteContent.about_title;
    }
    
    // Update about description
    const aboutDescriptionContainer = document.getElementById('aboutDescription');
    if (aboutDescriptionContainer && websiteContent.about_description) {
        // Split description by newlines to create multiple paragraphs
        const descriptionText = websiteContent.about_description;
        const paragraphs = descriptionText.split('\n').filter(p => p.trim());
        
        aboutDescriptionContainer.innerHTML = '';
        paragraphs.forEach(para => {
            const p = document.createElement('p');
            p.className = 'about-description';
            p.textContent = para.trim();
            aboutDescriptionContainer.appendChild(p);
        });
    }
    
    // Update about image
    const aboutImage = document.querySelector('.about-image img');
    if (aboutImage && websiteContent.about_image_url) {
        aboutImage.src = websiteContent.about_image_url;
    }
    
    // Update about features
    const aboutFeaturesContainer = document.querySelector('.about-features');
    if (aboutFeaturesContainer && websiteContent.about_features) {
        aboutFeaturesContainer.innerHTML = '';
        websiteContent.about_features.forEach(feature => {
            if (feature && feature.trim()) {
                const featureDiv = document.createElement('div');
                featureDiv.className = 'about-feature';
                featureDiv.innerHTML = `
                    <span class="check-icon">✓</span>
                    <span>${feature}</span>
                `;
                aboutFeaturesContainer.appendChild(featureDiv);
            }
        });
    }
}

// Populate Statistics
function populateStatistics() {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;

    const statistics = websiteContent.statistics || [];
    statsGrid.innerHTML = '';
    
    statistics.forEach(stat => {
        const statCard = document.createElement('div');
        statCard.className = 'stat-card';
        
        const iconHtml = stat.icon_url 
            ? `<img src="${stat.icon_url}" alt="${stat.label || 'Stat'}" class="stat-icon-image" loading="lazy">`
            : `<div class="stat-icon">📊</div>`;
        
        // Determine if value needs special formatting
        const value = stat.value || '0';
        const isDecimal = value.includes('.');
        const isKFormat = value.toUpperCase().includes('K');
        
        statCard.innerHTML = `
            ${iconHtml}
            <div class="stat-value" data-target="${value}" ${isDecimal ? 'data-decimal="true"' : ''} ${isKFormat ? 'data-format="k"' : ''}>0</div>
            <div class="stat-label">${stat.label || ''}</div>
        `;
        statsGrid.appendChild(statCard);
    });
    
    // Re-observe stat numbers for animation
    setTimeout(() => {
        document.querySelectorAll('#statsGrid .stat-value[data-target]').forEach(el => {
            observer.observe(el);
        });
    }, 100);
}

// Populate Features
function populateFeatures() {
    const featuresGrid = document.getElementById('featuresGrid') || document.querySelector('.features-grid');
    if (!featuresGrid) return;

    const features = websiteContent.features || [];
    featuresGrid.innerHTML = '';
    
    features.forEach(feature => {
        const featureCard = document.createElement('div');
        featureCard.className = 'feature-card';
        
        const imageHtml = feature.image_url 
            ? `<img src="${feature.image_url}" alt="${feature.title || 'Feature'}" class="feature-image" loading="lazy">`
            : `<div class="feature-icon">📚</div>`;
        
        featureCard.innerHTML = `
            ${imageHtml}
            <h3 class="feature-title">${feature.title || ''}</h3>
            <p class="feature-description">${feature.description || ''}</p>
        `;
        featuresGrid.appendChild(featureCard);
    });
}

// Populate Categories
function populateCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = '';
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-icon">${category.icon || '📚'}</div>
            <div class="category-name">${category.name}</div>
        `;
        categoriesGrid.appendChild(categoryCard);
    });
}

// Populate Books
function populateBooks() {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;

    booksGrid.innerHTML = '';
    books.slice(0, 8).forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.style.cursor = 'pointer';
        
        const authorName = book.author?.name || 'Unknown Author';
        const coverImage = book.cover_image_url || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=600&fit=crop';
        const rating = book.rating || 0;
        const reviews = book.reviews_count || 0;
        
        bookCard.innerHTML = `
            <img src="${coverImage}" alt="${book.title}" class="book-cover" loading="lazy">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${authorName}</p>
                <div class="book-meta">
                    <div class="book-rating">
                        <span>⭐</span>
                        <span>${rating.toFixed(1)}</span>
                        <span>(${reviews})</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add click handler to show app download modal
        bookCard.addEventListener('click', () => {
            showAppDownloadModal();
        });
        
        booksGrid.appendChild(bookCard);
    });
}

// Populate Authors
function populateAuthors() {
    const authorsGrid = document.getElementById('authorsGrid');
    if (!authorsGrid) return;

    authorsGrid.innerHTML = '';
    authors.forEach(author => {
        const authorCard = document.createElement('div');
        authorCard.className = 'author-card';
        const initials = author.name ? author.name.split(' ').map(n => n[0]).join('') : 'AA';
        const bio = author.bio || 'Agricultural expert';
        const booksCount = author.books_count || 0;
        const rating = author.rating || 0;
        
        authorCard.innerHTML = `
            <div class="author-avatar">${initials}</div>
            <h3 class="author-name">${author.name}</h3>
            <p class="author-bio">${bio}</p>
            <div class="author-stats">
                <div class="author-stat">
                    <div class="author-stat-value">${booksCount}</div>
                    <div class="author-stat-label">Books</div>
                </div>
                <div class="author-stat">
                    <div class="author-stat-value">${rating.toFixed(1)}</div>
                    <div class="author-stat-label">Rating</div>
                </div>
            </div>
        `;
        authorsGrid.appendChild(authorCard);
    });
}

// Animate Numbers
function animateNumber(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    const isDecimal = element.hasAttribute('data-decimal');
    const isKFormat = element.hasAttribute('data-format') && element.getAttribute('data-format') === 'k';

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            if (isDecimal) {
                element.textContent = target.toFixed(1);
            } else if (isKFormat && target >= 1000) {
                element.textContent = (target / 1000).toFixed(1) + 'K';
            } else {
                element.textContent = formatNumber(target);
            }
            clearInterval(timer);
        } else {
            if (isDecimal) {
                element.textContent = current.toFixed(1);
            } else if (isKFormat && current >= 1000) {
                element.textContent = (current / 1000).toFixed(1) + 'K';
            } else {
                element.textContent = formatNumber(Math.floor(current));
            }
        }
    }, 16);
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const target = parseFloat(element.getAttribute('data-target'));
            
            if (!isNaN(target)) {
                if (element.classList.contains('stat-number') || element.classList.contains('stat-value')) {
                    const isDecimal = element.hasAttribute('data-decimal');
                    if (isDecimal) {
                        animateDecimalNumber(element, target);
                    } else {
                        animateNumber(element, target);
                    }
                }
                element.classList.add('fade-in-up');
            }
            observer.unobserve(element);
        }
    });
}, observerOptions);

// Handle special case for decimal numbers (ratings)
function animateDecimalNumber(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toFixed(1);
            clearInterval(timer);
        } else {
            element.textContent = current.toFixed(1);
        }
    }, 16);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', async () => {
    // Create app download modal
    createAppDownloadModal();
    
    // Fetch all data - websiteContent first, then others that depend on it
    await fetchWebsiteContent();
    // Categories need websiteContent.featured_category_ids, so fetch after
    await fetchCategories();
    await fetchBooks();
    await fetchAuthors();
    
    // Features are populated in updateWebsiteContent() after fetchWebsiteContent()

    // Add click handlers to "Get Started" buttons and CTA buttons
    document.querySelectorAll('a[href="#contact"], .btn-primary, .btn-secondary, .cta-buttons a').forEach(btn => {
        if (btn.textContent.includes('Get Started') || btn.textContent.includes('Explore Books') || btn.closest('.cta-buttons')) {
            btn.addEventListener('click', (e) => {
                const href = btn.getAttribute('href');
                if (href === '#contact' || href === '#books' || btn.closest('.cta-buttons')) {
                    e.preventDefault();
                    showAppDownloadModal();
                }
            });
        }
    });

    // Observe stat numbers
    document.querySelectorAll('[data-target]').forEach(el => {
        observer.observe(el);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#contact' || href === '#books') {
                e.preventDefault();
                showAppDownloadModal();
                return;
            }
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
