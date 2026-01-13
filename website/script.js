// Dummy Data
const categories = [
    { id: '1', name: 'Organic Farming', icon: '🌱' },
    { id: '2', name: 'Crop Management', icon: '🌾' },
    { id: '3', name: 'Soil Science', icon: '🌍' },
    { id: '4', name: 'Livestock Management', icon: '🐄' },
    { id: '5', name: 'Agricultural Technology', icon: '🚜' },
    { id: '6', name: 'Pest Control', icon: '🐛' },
    { id: '7', name: 'Irrigation Systems', icon: '💧' },
    { id: '8', name: 'Agricultural Economics', icon: '💰' },
    { id: '9', name: 'Sustainable Agriculture', icon: '♻️' },
    { id: '10', name: 'Horticulture', icon: '🌳' },
];

const authors = [
    {
        id: '1',
        name: 'Dr. John Smith',
        bio: 'Agricultural expert with 20+ years of experience in modern farming techniques.',
        booksCount: 15,
        rating: 4.8,
    },
    {
        id: '2',
        name: 'Jane Doe',
        bio: 'Renowned author specializing in organic farming and sustainable agriculture.',
        booksCount: 12,
        rating: 4.7,
    },
    {
        id: '3',
        name: 'Michael Johnson',
        bio: 'Crop scientist and researcher with expertise in crop management.',
        booksCount: 8,
        rating: 4.6,
    },
    {
        id: '4',
        name: 'Sarah Williams',
        bio: 'Agricultural economist focusing on farm business and economics.',
        booksCount: 10,
        rating: 4.9,
    },
];

const books = [
    {
        id: '1',
        title: 'Modern Agriculture Guide',
        author: authors[0],
        cover: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=600&fit=crop',
        price: 299,
        originalPrice: 399,
        rating: 4.5,
        reviews: 128,
        category: categories[1],
    },
    {
        id: '2',
        title: 'Organic Farming Essentials',
        author: authors[1],
        cover: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=600&fit=crop',
        price: 399,
        originalPrice: 499,
        rating: 4.8,
        reviews: 95,
        category: categories[0],
    },
    {
        id: '3',
        title: 'Crop Management Techniques',
        author: authors[2],
        cover: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=600&fit=crop',
        price: 349,
        originalPrice: 449,
        rating: 4.6,
        reviews: 156,
        category: categories[1],
    },
    {
        id: '4',
        title: 'Soil Science Fundamentals',
        author: authors[2],
        cover: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=600&fit=crop',
        price: 449,
        originalPrice: 549,
        rating: 4.7,
        reviews: 203,
        category: categories[2],
    },
    {
        id: '5',
        title: 'Sustainable Farming Practices',
        author: authors[0],
        cover: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=600&fit=crop',
        price: 0,
        originalPrice: 299,
        rating: 4.9,
        reviews: 312,
        category: categories[8],
    },
    {
        id: '6',
        title: 'Agricultural Economics',
        author: authors[3],
        cover: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=600&fit=crop',
        price: 499,
        originalPrice: 599,
        rating: 4.5,
        reviews: 87,
        category: categories[7],
    },
    {
        id: '7',
        title: 'Pest Management Guide',
        author: authors[1],
        cover: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=600&fit=crop',
        price: 379,
        originalPrice: 479,
        rating: 4.4,
        reviews: 142,
        category: categories[5],
    },
    {
        id: '8',
        title: 'Irrigation Systems',
        author: authors[2],
        cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=600&fit=crop',
        price: 329,
        originalPrice: 429,
        rating: 4.6,
        reviews: 98,
        category: categories[6],
    },
];

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Populate Categories
function populateCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;

    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <div class="category-icon">${category.icon}</div>
            <div class="category-name">${category.name}</div>
        `;
        categoriesGrid.appendChild(categoryCard);
    });
}

// Populate Books
function populateBooks() {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;

    books.slice(0, 8).forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        const isFree = book.price === 0;
        const priceDisplay = isFree 
            ? '<span class="book-price free">FREE</span>'
            : `<span class="book-price">₹${book.price}</span><span class="book-price original">₹${book.originalPrice}</span>`;
        
        bookCard.innerHTML = `
            <img src="${book.cover}" alt="${book.title}" class="book-cover" loading="lazy">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author.name}</p>
                <div class="book-meta">
                    <div class="book-rating">
                        <span>⭐</span>
                        <span>${book.rating}</span>
                        <span>(${book.reviews})</span>
                    </div>
                </div>
                <div class="book-price-container">
                    ${priceDisplay}
                </div>
            </div>
        `;
        booksGrid.appendChild(bookCard);
    });
}

// Populate Authors
function populateAuthors() {
    const authorsGrid = document.getElementById('authorsGrid');
    if (!authorsGrid) return;

    authors.forEach(author => {
        const authorCard = document.createElement('div');
        authorCard.className = 'author-card';
        const initials = author.name.split(' ').map(n => n[0]).join('');
        
        authorCard.innerHTML = `
            <div class="author-avatar">${initials}</div>
            <h3 class="author-name">${author.name}</h3>
            <p class="author-bio">${author.bio}</p>
            <div class="author-stats">
                <div class="author-stat">
                    <div class="author-stat-value">${author.booksCount}</div>
                    <div class="author-stat-label">Books</div>
                </div>
                <div class="author-stat">
                    <div class="author-stat-value">${author.rating}</div>
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

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = formatNumber(target);
            clearInterval(timer);
        } else {
            element.textContent = formatNumber(Math.floor(current));
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
                    animateNumber(element, target);
                }
                element.classList.add('fade-in-up');
            }
            observer.unobserve(element);
        }
    });
}, observerOptions);

// Observe all stat elements
document.addEventListener('DOMContentLoaded', () => {
    populateCategories();
    populateBooks();
    populateAuthors();

    // Observe stat numbers
    document.querySelectorAll('[data-target]').forEach(el => {
        observer.observe(el);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

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

// Update observer to handle decimal numbers
document.addEventListener('DOMContentLoaded', () => {
    const statValues = document.querySelectorAll('.stat-value[data-target]');
    statValues.forEach(element => {
        observer.observe(element);
        
        // Check if it's a decimal number
        const target = parseFloat(element.getAttribute('data-target'));
        if (target < 10 && target % 1 !== 0) {
            // It's a rating (decimal)
            element.addEventListener('animationstart', () => {
                animateDecimalNumber(element, target);
            });
        }
    });
});
