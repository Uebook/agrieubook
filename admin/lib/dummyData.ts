/**
 * Dummy Data for Admin Panel
 * This will be replaced with API calls in phase 2
 */

export interface Book {
    id: string;
    title: string;
    author: {
        id: string;
        name: string;
    };
    authorId: string;
    cover: string;
    coverImages: string[];
    summary: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    views: number;
    pages: number;
    language: 'English' | 'Hindi';
    category: {
        id: string;
        name: string;
    };
    categoryId: string;
    publishedDate: string;
    isbn: string;
    isFree: boolean;
    status: 'published' | 'pending' | 'rejected';
    createdAt: string;
    updatedAt: string;
}

export interface AudioBook {
    id: string;
    title: string;
    author: {
        id: string;
        name: string;
    };
    authorId: string;
    cover: string;
    audioUrl: string;
    duration: string;
    language: 'English' | 'Hindi';
    category: {
        id: string;
        name: string;
    };
    categoryId: string;
    publishedDate: string;
    description: string;
    status: 'published' | 'pending' | 'rejected';
    createdAt: string;
}

export interface Author {
    id: string;
    name: string;
    email: string;
    mobile: string;
    bio: string;
    booksCount: number;
    audioBooksCount: number;
    rating: number;
    status: 'active' | 'inactive' | 'suspended';
    joinDate: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: 'reader' | 'author';
    booksPurchased: number;
    totalSpent: number;
    status: 'active' | 'inactive' | 'suspended';
    joinDate: string;
}

export interface Curriculum {
    id: string;
    title: string;
    state: string;
    stateName: string;
    pdfUrl: string;
    banner: string;
    language: 'English' | 'Hindi';
    publishedDate: string;
    description: string;
    status: 'published' | 'pending';
    createdAt: string;
}

// Dummy Data
export const dummyBooks: Book[] = [
    {
        id: '1',
        title: 'Modern Agriculture Guide',
        author: { id: '1', name: 'Dr. John Smith' },
        authorId: '1',
        cover: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=600&fit=crop',
        coverImages: [
            'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=600&fit=crop',
        ],
        summary: 'A comprehensive guide to modern agricultural practices',
        price: 299,
        originalPrice: 399,
        rating: 4.5,
        reviews: 128,
        views: 12500,
        pages: 350,
        language: 'English',
        category: { id: '2', name: 'Crop Management' },
        categoryId: '2',
        publishedDate: '2024-01-15',
        isbn: '978-1234567890',
        isFree: false,
        status: 'published',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-15',
    },
    {
        id: '2',
        title: 'Organic Farming Essentials',
        author: { id: '2', name: 'Jane Doe' },
        authorId: '2',
        cover: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=600&fit=crop',
        coverImages: [
            'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=600&fit=crop',
        ],
        summary: 'Learn the fundamentals of organic farming',
        price: 399,
        originalPrice: 499,
        rating: 4.8,
        reviews: 95,
        views: 9800,
        pages: 280,
        language: 'English',
        category: { id: '1', name: 'Organic Farming' },
        categoryId: '1',
        publishedDate: '2024-02-20',
        isbn: '978-1234567891',
        isFree: false,
        status: 'pending',
        createdAt: '2024-02-15',
        updatedAt: '2024-02-20',
    },
];

export const dummyAudioBooks: AudioBook[] = [
    {
        id: 'audio1',
        title: 'Organic Farming Podcast Series',
        author: { id: '2', name: 'Jane Doe' },
        authorId: '2',
        cover: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&h=400&fit=crop',
        audioUrl: 'https://example.com/audio1.mp3',
        duration: '45:30',
        language: 'English',
        category: { id: '1', name: 'Organic Farming' },
        categoryId: '1',
        publishedDate: '2024-03-01',
        description: 'A comprehensive podcast series covering organic farming techniques',
        status: 'published',
        createdAt: '2024-02-25',
    },
];

export const dummyAuthors: Author[] = [
    {
        id: '1',
        name: 'Dr. John Smith',
        email: 'john.smith@example.com',
        mobile: '+91 9876543210',
        bio: 'Agricultural expert with 20+ years of experience',
        booksCount: 15,
        audioBooksCount: 3,
        rating: 4.8,
        status: 'active',
        joinDate: '2023-01-15',
    },
    {
        id: '2',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        mobile: '+91 9876543211',
        bio: 'Renowned author specializing in organic farming',
        booksCount: 12,
        audioBooksCount: 5,
        rating: 4.7,
        status: 'active',
        joinDate: '2023-02-20',
    },
];

export const dummyUsers: User[] = [
    {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        mobile: '+91 9876543220',
        role: 'reader',
        booksPurchased: 25,
        totalSpent: 7500,
        status: 'active',
        joinDate: '2024-01-15',
    },
    {
        id: '2',
        name: 'Priya Sharma',
        email: 'priya@example.com',
        mobile: '+91 9876543221',
        role: 'reader',
        booksPurchased: 18,
        totalSpent: 5400,
        status: 'active',
        joinDate: '2024-02-10',
    },
];

export const dummyCurriculums: Curriculum[] = [
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
        status: 'published',
        createdAt: '2024-01-10',
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
        description: 'Agricultural subsidy schemes for Maharashtra',
        status: 'pending',
        createdAt: '2024-01-28',
    },
];

// Payment/Transaction data
export interface Payment {
    id: string;
    userId: string;
    userName: string;
    bookId: string;
    bookTitle: string;
    authorId: string;
    authorName: string;
    amount: number;
    date: string;
    status: 'completed' | 'pending' | 'failed';
}

export const dummyPayments: Payment[] = [
    {
        id: 'pay1',
        userId: '1',
        userName: 'Rajesh Kumar',
        bookId: '1',
        bookTitle: 'Modern Agriculture Guide',
        authorId: '1',
        authorName: 'Dr. John Smith',
        amount: 299,
        date: '2024-12-01',
        status: 'completed',
    },
    {
        id: 'pay2',
        userId: '2',
        userName: 'Priya Sharma',
        bookId: '1',
        bookTitle: 'Modern Agriculture Guide',
        authorId: '1',
        authorName: 'Dr. John Smith',
        amount: 299,
        date: '2024-12-05',
        status: 'completed',
    },
    {
        id: 'pay3',
        userId: '1',
        userName: 'Rajesh Kumar',
        bookId: '2',
        bookTitle: 'Organic Farming Essentials',
        authorId: '2',
        authorName: 'Jane Doe',
        amount: 399,
        date: '2024-12-10',
        status: 'completed',
    },
];

// Statistics
export const getDashboardStats = (startDate?: string, endDate?: string) => {
    let filteredPayments = dummyPayments;

    if (startDate && endDate) {
        filteredPayments = dummyPayments.filter(
            payment => payment.date >= startDate && payment.date <= endDate
        );
    }

    const totalRevenue = filteredPayments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

    const authorRevenue = filteredPayments
        .filter(p => p.status === 'completed')
        .reduce((acc, p) => {
            if (!acc[p.authorId]) {
                acc[p.authorId] = {
                    authorId: p.authorId,
                    authorName: p.authorName,
                    revenue: 0,
                    sales: 0,
                };
            }
            acc[p.authorId].revenue += p.amount;
            acc[p.authorId].sales += 1;
            return acc;
        }, {} as Record<string, { authorId: string; authorName: string; revenue: number; sales: number }>);

    return {
        totalBooks: dummyBooks.length,
        totalAudioBooks: dummyAudioBooks.length,
        totalAuthors: dummyAuthors.length,
        totalUsers: dummyUsers.length,
        totalRevenue,
        totalPayments: filteredPayments.filter(p => p.status === 'completed').length,
        pendingBooks: dummyBooks.filter(b => b.status === 'pending').length,
        pendingAudioBooks: dummyAudioBooks.filter(a => a.status === 'pending').length,
        activeUsers: dummyUsers.filter(u => u.status === 'active').length,
        authorRevenue: Object.values(authorRevenue),
    };
};

