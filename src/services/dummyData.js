/**
 * Dummy Data Service
 * Provides mock data for development and testing
 */

export const categories = [
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

export const authors = [
  {
    id: '1',
    name: 'Dr. John Smith',
    bio: 'Agricultural expert with 20+ years of experience in modern farming techniques.',
    image: null,
    booksCount: 15,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Jane Doe',
    bio: 'Renowned author specializing in organic farming and sustainable agriculture.',
    image: null,
    booksCount: 12,
    rating: 4.7,
  },
  {
    id: '3',
    name: 'Michael Johnson',
    bio: 'Crop scientist and researcher with expertise in crop management.',
    image: null,
    booksCount: 8,
    rating: 4.6,
  },
  {
    id: '4',
    name: 'Sarah Williams',
    bio: 'Agricultural economist focusing on farm business and economics.',
    image: null,
    booksCount: 10,
    rating: 4.9,
  },
];

export const books = [
  {
    id: '1',
    title: 'Modern Agriculture Guide',
    author: authors[0],
    authorId: '1',
    cover: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=600&fit=crop',
    coverImages: [
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=600&fit=crop',
    ],
    summary: 'A comprehensive guide to modern agricultural practices, covering everything from soil management to advanced farming techniques. This book provides practical insights for both beginners and experienced farmers.',
    price: 299,
    originalPrice: 399,
    rating: 4.5,
    reviews: 128,
    views: 12500,
    pages: 350,
    language: 'English',
    category: categories[1], // Crop Management
    categoryId: '2',
    publishedDate: '2024-01-15',
    isbn: '978-1234567890',
    isFree: false,
    isDownloaded: true,
    readingProgress: 45,
    lastRead: '2 hours ago',
    sampleText: 'Chapter 1: Introduction to Modern Agriculture\n\nModern agriculture has evolved significantly over the past few decades. With the advent of new technologies and sustainable practices, farmers can now achieve higher yields while maintaining environmental balance...',
  },
  {
    id: '2',
    title: 'Organic Farming Essentials',
    author: authors[1],
    authorId: '2',
    cover: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=600&fit=crop',
    coverImages: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=600&fit=crop',
    ],
    summary: 'Learn the fundamentals of organic farming and how to transition from conventional to organic methods. This book covers certification, soil health, pest management, and marketing strategies.',
    price: 399,
    originalPrice: 499,
    rating: 4.8,
    reviews: 95,
    views: 9800,
    pages: 280,
    language: 'English',
    category: categories[0], // Organic Farming
    categoryId: '1',
    publishedDate: '2024-02-20',
    isbn: '978-1234567891',
    isFree: false,
    isDownloaded: false,
    readingProgress: 0,
    lastRead: 'Never',
    sampleText: 'Introduction to Organic Farming\n\nOrganic farming represents a holistic approach to agriculture that emphasizes the use of natural inputs and processes...',
  },
  {
    id: '3',
    title: 'Crop Management Techniques',
    author: authors[2],
    authorId: '3',
    cover: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=600&fit=crop',
    summary: 'Advanced crop management strategies for maximizing yield and quality. Includes chapters on irrigation, fertilization, pest control, and harvest management.',
    price: 349,
    originalPrice: 449,
    rating: 4.6,
    reviews: 156,
    views: 15200,
    pages: 420,
    language: 'English',
    category: categories[1], // Crop Management
    categoryId: '2',
    publishedDate: '2024-01-10',
    isbn: '978-1234567892',
    isFree: false,
    isDownloaded: true,
    readingProgress: 30,
    lastRead: '1 day ago',
    sampleText: 'Chapter 1: Understanding Crop Growth\n\nEffective crop management begins with a deep understanding of plant growth cycles and environmental factors...',
  },
  {
    id: '4',
    title: 'Soil Science Fundamentals',
    author: authors[2],
    authorId: '3',
    cover: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=600&fit=crop',
    summary: 'A detailed exploration of soil composition, chemistry, and biology. Essential reading for anyone serious about sustainable agriculture.',
    price: 449,
    originalPrice: 549,
    rating: 4.7,
    reviews: 203,
    views: 19800,
    pages: 380,
    language: 'English',
    category: categories[2], // Soil Science
    categoryId: '3',
    publishedDate: '2023-12-05',
    isbn: '978-1234567893',
    isFree: false,
    isDownloaded: false,
    readingProgress: 0,
    lastRead: 'Never',
    sampleText: 'Introduction to Soil Science\n\nSoil is the foundation of agriculture. Understanding its composition and properties is crucial for successful farming...',
  },
  {
    id: '5',
    title: 'Sustainable Farming Practices',
    author: authors[0],
    authorId: '1',
    cover: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=600&fit=crop',
    coverImages: [
      'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=600&fit=crop',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=600&fit=crop',
    ],
    summary: 'Learn how to implement sustainable farming practices that protect the environment while ensuring profitability.',
    price: 0,
    originalPrice: 299,
    rating: 4.9,
    reviews: 312,
    views: 30500,
    pages: 320,
    language: 'English',
    category: categories[8], // Sustainable Agriculture
    categoryId: '9',
    publishedDate: '2024-03-01',
    isbn: '978-1234567894',
    isFree: true,
    isDownloaded: true,
    readingProgress: 0,
    lastRead: 'Never',
    sampleText: 'Chapter 1: The Importance of Sustainability\n\nSustainable farming is not just a trend—it\'s a necessity for the future of agriculture...',
  },
  {
    id: '6',
    title: 'Agricultural Economics',
    author: authors[3],
    authorId: '4',
    cover: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=600&fit=crop',
    summary: 'Understanding the economic principles that drive agricultural markets and farm business decisions.',
    price: 499,
    originalPrice: 599,
    rating: 4.5,
    reviews: 87,
    views: 8500,
    pages: 450,
    language: 'English',
    category: categories[7], // Agricultural Economics
    categoryId: '8',
    publishedDate: '2024-02-15',
    isbn: '978-1234567895',
    isFree: false,
    isDownloaded: false,
    readingProgress: 0,
    lastRead: 'Never',
    sampleText: 'Introduction to Agricultural Economics\n\nAgricultural economics bridges the gap between farming practices and market dynamics...',
  },
  {
    id: '7',
    title: 'Pest Management Guide',
    author: authors[1],
    authorId: '2',
    cover: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=600&fit=crop',
    summary: 'Comprehensive guide to identifying, preventing, and managing pests in agricultural settings using integrated pest management strategies.',
    price: 379,
    originalPrice: 479,
    rating: 4.4,
    reviews: 142,
    views: 13800,
    pages: 290,
    language: 'English',
    category: categories[5], // Pest Control
    categoryId: '6',
    publishedDate: '2023-11-20',
    isbn: '978-1234567896',
    isFree: false,
    isDownloaded: false,
    readingProgress: 0,
    lastRead: 'Never',
    sampleText: 'Chapter 1: Understanding Agricultural Pests\n\nEffective pest management requires knowledge of pest biology, behavior, and life cycles...',
  },
  {
    id: '8',
    title: 'Irrigation Systems',
    author: authors[2],
    authorId: '3',
    cover: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=600&fit=crop',
    summary: 'Modern irrigation techniques and systems for efficient water management in agriculture.',
    price: 329,
    originalPrice: 429,
    rating: 4.6,
    reviews: 98,
    views: 9600,
    pages: 260,
    language: 'English',
    category: categories[6], // Irrigation Systems
    categoryId: '7',
    publishedDate: '2024-01-25',
    isbn: '978-1234567897',
    isFree: false,
    isDownloaded: false,
    readingProgress: 0,
    lastRead: 'Never',
    sampleText: 'Introduction to Irrigation\n\nWater is one of the most critical resources in agriculture. Efficient irrigation systems can significantly improve crop yields...',
  },
];

export const trendingBooks = books.slice(0, 5);

export const recommendedBooks = [books[0], books[2], books[4], books[5]];

export const continueReadingBooks = books.filter((book) => book.readingProgress > 0);

export const myLibraryBooks = [books[0], books[2], books[4]];

export const wishlistBooks = [books[1], books[3], books[6], books[4], books[7]];

export const reviews = [
  {
    id: '1',
    bookId: '1',
    userId: '1',
    userName: 'Rajesh Kumar',
    userAvatar: null,
    rating: 5,
    comment: 'Excellent book! Very comprehensive and well-written. Highly recommended for anyone interested in modern agriculture. The author has done a fantastic job explaining complex concepts in simple terms.',
    date: '2024-03-15',
    likes: 12,
    dislikes: 0,
    verified: true,
  },
  {
    id: '2',
    bookId: '1',
    userId: '2',
    userName: 'Priya Sharma',
    userAvatar: null,
    rating: 4,
    comment: 'Good content but could use more illustrations. Overall a solid read with practical examples that farmers can actually use.',
    date: '2024-03-10',
    likes: 8,
    dislikes: 1,
    verified: false,
  },
  {
    id: '3',
    bookId: '2',
    userId: '3',
    userName: 'Amit Patel',
    userAvatar: null,
    rating: 5,
    comment: 'Best book on organic farming I\'ve read. Practical and actionable advice that has helped me transition to organic methods successfully.',
    date: '2024-03-12',
    likes: 15,
    dislikes: 0,
    verified: true,
  },
  {
    id: '4',
    bookId: '1',
    userId: '4',
    userName: 'Suresh Reddy',
    userAvatar: null,
    rating: 5,
    comment: 'Outstanding guide! The step-by-step approach makes it easy to implement modern agricultural techniques. Worth every rupee.',
    date: '2024-03-08',
    likes: 20,
    dislikes: 0,
    verified: true,
  },
  {
    id: '5',
    bookId: '2',
    userId: '5',
    userName: 'Meera Singh',
    userAvatar: null,
    rating: 4,
    comment: 'Great introduction to organic farming. The book covers all the basics and provides good references for further reading.',
    date: '2024-03-05',
    likes: 10,
    dislikes: 2,
    verified: false,
  },
  {
    id: '6',
    bookId: '3',
    userId: '6',
    userName: 'Vikram Malhotra',
    userAvatar: null,
    rating: 5,
    comment: 'Comprehensive guide on crop management. The author\'s expertise shines through every chapter. Highly recommended for serious farmers.',
    date: '2024-03-18',
    likes: 18,
    dislikes: 0,
    verified: true,
  },
  {
    id: '7',
    bookId: '3',
    userId: '7',
    userName: 'Anita Desai',
    userAvatar: null,
    rating: 4,
    comment: 'Very informative book with practical tips. The irrigation section was particularly helpful for my farm setup.',
    date: '2024-03-14',
    likes: 9,
    dislikes: 1,
    verified: false,
  },
  {
    id: '8',
    bookId: '4',
    userId: '8',
    userName: 'Ravi Iyer',
    userAvatar: null,
    rating: 5,
    comment: 'Excellent resource on soil science. The detailed explanations help understand the fundamentals of soil health and management.',
    date: '2024-03-11',
    likes: 14,
    dislikes: 0,
    verified: true,
  },
  {
    id: '9',
    bookId: '5',
    userId: '9',
    userName: 'Kavita Nair',
    userAvatar: null,
    rating: 5,
    comment: 'Free book with premium content! The sustainable farming practices outlined here have transformed my approach to agriculture.',
    date: '2024-03-09',
    likes: 25,
    dislikes: 0,
    verified: true,
  },
  {
    id: '10',
    bookId: '6',
    userId: '10',
    userName: 'Deepak Joshi',
    userAvatar: null,
    rating: 4,
    comment: 'Good overview of agricultural economics. Helps understand the business side of farming better.',
    date: '2024-03-07',
    likes: 7,
    dislikes: 0,
    verified: false,
  },
];

export const orders = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-03-15',
    books: [books[0], books[2]],
    total: 648,
    status: 'completed',
    invoiceUrl: null,
    paymentMethod: 'UPI',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-03-10',
    books: [books[1]],
    total: 399,
    status: 'completed',
    invoiceUrl: null,
    paymentMethod: 'Credit Card',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    date: '2024-03-05',
    books: [books[3], books[4]],
    total: 449,
    status: 'completed',
    invoiceUrl: null,
    paymentMethod: 'Debit Card',
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    date: '2024-02-28',
    books: [books[5]],
    total: 499,
    status: 'completed',
    invoiceUrl: null,
    paymentMethod: 'Net Banking',
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    date: '2024-02-20',
    books: [books[6], books[7]],
    total: 708,
    status: 'completed',
    invoiceUrl: null,
    paymentMethod: 'UPI',
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    date: '2024-02-15',
    books: [books[0], books[1], books[2]],
    total: 1047,
    status: 'completed',
    invoiceUrl: null,
    paymentMethod: 'Credit Card',
  },
  {
    id: '7',
    orderNumber: 'ORD-2024-007',
    date: '2024-02-10',
    books: [books[3]],
    total: 449,
    status: 'completed',
    invoiceUrl: null,
    paymentMethod: 'Wallet',
  },
];

export const userProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  mobile: '+91 9876543210',
  avatar: null,
  role: 'reader',
  preferredCategories: ['2', '5', '7'], // Non-fiction, Agriculture, Business
  joinDate: '2024-01-15',
};

export const userSettings = {
  // Privacy Settings
  privacy: {
    profileVisibility: 'public', // 'public', 'private', 'friends'
    showEmail: true,
    showMobile: false,
    showReadingProgress: true,
    allowMessages: true,
    dataSharing: false,
    analyticsTracking: true,
  },
  // Notification Settings
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    newBookReleases: true,
    priceDrops: true,
    orderUpdates: true,
    readingReminders: true,
    recommendations: true,
    reviewsAndRatings: true,
    promotionalOffers: false,
  },
  // App Preferences
  preferences: {
    language: 'English',
    theme: 'light', // 'light', 'dark', 'auto'
    fontSize: 'medium', // 'small', 'medium', 'large'
    autoDownload: false,
    wifiOnlyDownload: true,
    readingMode: 'scroll', // 'scroll', 'page'
    nightMode: false,
  },
  // Account Settings
  account: {
    twoFactorAuth: false,
    biometricLogin: true,
    autoBackup: true,
    syncAcrossDevices: true,
  },
};

// Helper functions
export const getBookById = (id) => {
  return books.find((book) => book.id === id);
};

export const getBooksByCategory = (categoryId) => {
  return books.filter((book) => book.categoryId === categoryId);
};

export const getBooksByAuthor = (authorId) => {
  return books.filter((book) => book.authorId === authorId);
};

export const searchBooks = (query) => {
  const lowerQuery = query.toLowerCase();
  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.name.toLowerCase().includes(lowerQuery) ||
      book.summary.toLowerCase().includes(lowerQuery)
  );
};

export const sortBooks = (booksList, sortBy) => {
  const sorted = [...booksList];
  switch (sortBy) {
    case 'popularity':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'latest':
      return sorted.sort(
        (a, b) => new Date(b.publishedDate) - new Date(a.publishedDate)
      );
    case 'price_low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'views':
      return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
    default:
      return sorted;
  }
};

export const filterBooks = (booksList, filters) => {
  let filtered = [...booksList];

  if (filters.category) {
    filtered = filtered.filter((book) => book.categoryId === filters.category);
  }

  if (filters.author) {
    filtered = filtered.filter((book) => book.authorId === filters.author);
  }

  if (filters.priceMin !== undefined) {
    filtered = filtered.filter((book) => book.price >= filters.priceMin);
  }

  if (filters.priceMax !== undefined) {
    filtered = filtered.filter((book) => book.price <= filters.priceMax);
  }

  if (filters.rating) {
    filtered = filtered.filter((book) => book.rating >= filters.rating);
  }

  if (filters.language) {
    filtered = filtered.filter((book) => book.language === filters.language);
  }

  return filtered;
};

export const youtubeChannels = [
  {
    id: '1',
    name: 'Farmers Edge',
    description: 'Learn modern farming techniques, crop management, and agricultural innovations.',
    subscriberCount: '2.5M',
    videoCount: 450,
    thumbnail: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=400&fit=crop',
    categoryIds: ['2', '5'], // Crop Management, Agricultural Technology
    verified: true,
    channelUrl: 'https://youtube.com/@farmersedge',
  },
  {
    id: '2',
    name: 'Organic Farming Academy',
    description: 'Complete guide to organic farming, sustainable practices, and natural pest control.',
    subscriberCount: '1.8M',
    videoCount: 320,
    thumbnail: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop',
    categoryIds: ['1', '9'], // Organic Farming, Sustainable Agriculture
    isSubscribed: true,
    verified: true,
    channelUrl: 'https://youtube.com/@organicfarming',
  },
  {
    id: '3',
    name: 'Soil Science Hub',
    description: 'Deep dive into soil chemistry, biology, and management for better crop yields.',
    subscriberCount: '950K',
    videoCount: 280,
    thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
    categoryIds: ['3'], // Soil Science
    isSubscribed: false,
    verified: true,
    channelUrl: 'https://youtube.com/@soilsciencehub',
  },
  {
    id: '4',
    name: 'Livestock Management Pro',
    description: 'Expert tips on cattle, poultry, and livestock care, breeding, and health management.',
    subscriberCount: '1.2M',
    videoCount: 380,
    thumbnail: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=400&fit=crop',
    categoryIds: ['4'], // Livestock Management
    isSubscribed: false,
    verified: true,
    channelUrl: 'https://youtube.com/@livestockpro',
  },
  {
    id: '5',
    name: 'AgriTech Innovations',
    description: 'Latest agricultural technology, smart farming, drones, and IoT in agriculture.',
    subscriberCount: '3.1M',
    videoCount: 520,
    thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=400&fit=crop',
    categoryIds: ['5'], // Agricultural Technology
    isSubscribed: true,
    verified: true,
    channelUrl: 'https://youtube.com/@agritech',
  },
  {
    id: '6',
    name: 'Pest Control Solutions',
    description: 'Integrated pest management, organic pest control, and crop protection strategies.',
    subscriberCount: '680K',
    videoCount: 195,
    thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=400&fit=crop',
    categoryIds: ['6'], // Pest Control
    isSubscribed: false,
    verified: false,
    channelUrl: 'https://youtube.com/@pestcontrol',
  },
  {
    id: '7',
    name: 'Water Management Experts',
    description: 'Irrigation systems, water conservation, and efficient water use in agriculture.',
    subscriberCount: '1.5M',
    videoCount: 340,
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=400&fit=crop',
    categoryIds: ['7'], // Irrigation Systems
    isSubscribed: false,
    verified: true,
    channelUrl: 'https://youtube.com/@watermanagement',
  },
  {
    id: '8',
    name: 'Farm Economics',
    description: 'Agricultural business, farm economics, market analysis, and financial planning.',
    subscriberCount: '890K',
    videoCount: 260,
    thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop',
    categoryIds: ['8'], // Agricultural Economics
    isSubscribed: false,
    verified: true,
    channelUrl: 'https://youtube.com/@farmeconomics',
  },
  {
    id: '9',
    name: 'Sustainable Agriculture Now',
    description: 'Eco-friendly farming practices, climate-smart agriculture, and sustainability.',
    subscriberCount: '2.2M',
    videoCount: 410,
    thumbnail: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop',
    categoryIds: ['9'], // Sustainable Agriculture
    isSubscribed: true,
    verified: true,
    channelUrl: 'https://youtube.com/@sustainableagri',
  },
  {
    id: '10',
    name: 'Horticulture Mastery',
    description: 'Fruit and vegetable cultivation, greenhouse management, and horticultural techniques.',
    subscriberCount: '1.1M',
    videoCount: 290,
    thumbnail: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=400&fit=crop',
    categoryIds: ['10'], // Horticulture
    isSubscribed: false,
    verified: true,
    channelUrl: 'https://youtube.com/@horticulturemaster',
  },
];

export const getChannelsByCategory = (categoryId) => {
  return youtubeChannels.filter((channel) =>
    channel.categoryIds.includes(categoryId)
  );
};

// Audio Books / Podcasts (Free only, uploaded by authors)
export const audioBooks = [
  {
    id: 'audio1',
    title: 'Organic Farming Podcast Series',
    author: authors[1],
    authorId: '2',
    cover: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=400&fit=crop',
    audioUrl: 'https://example.com/audio1.mp3',
    duration: '45:30',
    language: 'English',
    category: categories[0],
    categoryId: '1',
    publishedDate: '2024-03-01',
    isFree: true,
    description: 'A comprehensive podcast series covering organic farming techniques, soil health, and sustainable practices.',
  },
  {
    id: 'audio2',
    title: 'Crop Management Tips',
    author: authors[2],
    authorId: '3',
    cover: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=400&fit=crop',
    audioUrl: 'https://example.com/audio2.mp3',
    duration: '32:15',
    language: 'Hindi',
    category: categories[1],
    categoryId: '2',
    publishedDate: '2024-03-05',
    isFree: true,
    description: 'Learn effective crop management strategies from agricultural experts.',
  },
  {
    id: 'audio3',
    title: 'Sustainable Agriculture Talks',
    author: authors[0],
    authorId: '1',
    cover: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop',
    audioUrl: 'https://example.com/audio3.mp3',
    duration: '55:20',
    language: 'English',
    category: categories[8],
    categoryId: '9',
    publishedDate: '2024-03-10',
    isFree: true,
    description: 'Expert discussions on sustainable farming practices and environmental conservation.',
  },
];

// Government Curriculum Data
export const indianStates = [
  { id: 'up', name: 'Uttar Pradesh', code: 'UP' },
  { id: 'mh', name: 'Maharashtra', code: 'MH' },
  { id: 'br', name: 'Bihar', code: 'BR' },
  { id: 'wb', name: 'West Bengal', code: 'WB' },
  { id: 'mp', name: 'Madhya Pradesh', code: 'MP' },
  { id: 'tn', name: 'Tamil Nadu', code: 'TN' },
  { id: 'rj', name: 'Rajasthan', code: 'RJ' },
  { id: 'ka', name: 'Karnataka', code: 'KA' },
  { id: 'gj', name: 'Gujarat', code: 'GJ' },
  { id: 'or', name: 'Odisha', code: 'OR' },
  { id: 'kl', name: 'Kerala', code: 'KL' },
  { id: 'jh', name: 'Jharkhand', code: 'JH' },
  { id: 'as', name: 'Assam', code: 'AS' },
  { id: 'pb', name: 'Punjab', code: 'PB' },
  { id: 'ct', name: 'Chhattisgarh', code: 'CT' },
];

export const governmentCurriculums = [
  {
    id: 'cur1',
    title: 'PM Kisan Yojana Guidelines',
    state: 'up',
    stateName: 'Uttar Pradesh',
    pdfUrl: 'https://example.com/pm-kisan-up.pdf',
    banner: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=200&fit=crop',
    language: 'Hindi',
    publishedDate: '2024-01-15',
    description: 'Complete guidelines for PM Kisan Yojana in Uttar Pradesh',
  },
  {
    id: 'cur2',
    title: 'Agricultural Subsidy Scheme',
    state: 'mh',
    stateName: 'Maharashtra',
    pdfUrl: 'https://example.com/subsidy-mh.pdf',
    banner: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=200&fit=crop',
    language: 'English',
    publishedDate: '2024-02-01',
    description: 'Agricultural subsidy schemes and application process for Maharashtra',
  },
  {
    id: 'cur3',
    title: 'Crop Insurance Scheme',
    state: 'br',
    stateName: 'Bihar',
    pdfUrl: 'https://example.com/insurance-br.pdf',
    banner: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=200&fit=crop',
    language: 'Hindi',
    publishedDate: '2024-01-20',
    description: 'Crop insurance scheme details and enrollment process for Bihar',
  },
  {
    id: 'cur4',
    title: 'Organic Farming Support Program',
    state: 'tn',
    stateName: 'Tamil Nadu',
    pdfUrl: 'https://example.com/organic-tn.pdf',
    banner: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=200&fit=crop',
    language: 'English',
    publishedDate: '2024-02-15',
    description: 'Government support programs for organic farming in Tamil Nadu',
  },
  {
    id: 'cur5',
    title: 'Irrigation Development Scheme',
    state: 'rj',
    stateName: 'Rajasthan',
    pdfUrl: 'https://example.com/irrigation-rj.pdf',
    banner: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=200&fit=crop',
    language: 'Hindi',
    publishedDate: '2024-01-10',
    description: 'Irrigation development schemes and funding opportunities in Rajasthan',
  },
];

export const getCurriculumsByState = (stateId) => {
  return governmentCurriculums.filter((cur) => cur.state === stateId);
};

export const getAudioBooks = () => {
  return audioBooks.filter((audio) => audio.isFree);
};

export const notifications = [
  {
    id: '1',
    type: 'order',
    title: 'Order Confirmed',
    message: 'Your order #ORD12345 has been confirmed and will be delivered soon.',
    timestamp: '2 hours ago',
    isRead: false,
    icon: '📦',
    action: { type: 'navigate', screen: 'OrderHistory' },
  },
  {
    id: '2',
    type: 'book',
    title: 'New Book Available',
    message: 'Check out "Sustainable Farming Practices" by Dr. John Smith',
    timestamp: '5 hours ago',
    isRead: false,
    icon: '📚',
    action: { type: 'navigate', screen: 'BookDetail', params: { bookId: '5' } },
  },
  {
    id: '3',
    type: 'review',
    title: 'New Review',
    message: 'You received a 5-star review on "Modern Agriculture Guide"',
    timestamp: '1 day ago',
    isRead: true,
    icon: '⭐',
    action: { type: 'navigate', screen: 'Reviews' },
  },
  {
    id: '4',
    type: 'author',
    title: 'Book Published',
    message: 'Your book "Organic Farming Essentials" has been published successfully!',
    timestamp: '2 days ago',
    isRead: true,
    icon: '✅',
    action: { type: 'navigate', screen: 'BookDetail', params: { bookId: '2' } },
  },
  {
    id: '5',
    type: 'promotion',
    title: 'Special Offer',
    message: 'Get 20% off on all Crop Management books. Limited time offer!',
    timestamp: '3 days ago',
    isRead: false,
    icon: '🎉',
    action: { type: 'navigate', screen: 'BookStore' },
  },
  {
    id: '6',
    type: 'update',
    title: 'App Update Available',
    message: 'New features and improvements are available. Update now!',
    timestamp: '4 days ago',
    isRead: true,
    icon: '🔄',
    action: null,
  },
  {
    id: '7',
    type: 'wishlist',
    title: 'Price Drop Alert',
    message: 'A book in your wishlist "Soil Science Fundamentals" is now 30% off!',
    timestamp: '5 days ago',
    isRead: true,
    icon: '💰',
    action: { type: 'navigate', screen: 'Wishlist' },
  },
  {
    id: '8',
    type: 'author',
    title: 'New Follower',
    message: 'You have 5 new followers this week! Keep sharing great content.',
    timestamp: '1 week ago',
    isRead: true,
    icon: '👥',
    action: null,
  },
];

