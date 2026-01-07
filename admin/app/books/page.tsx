'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import apiClient from '@/lib/api/client';

interface Book {
    id: string;
    title: string;
    cover?: string;
    cover_image_url?: string;
    cover_images?: string[];
    author?: {
        id: string;
        name: string;
    };
    author_id?: string;
    category?: {
        id: string;
        name: string;
    };
    category_id?: string;
    price?: number;
    is_free?: boolean;
    views_count?: number;
    views?: number;
    status?: string;
}

export default function BooksPage() {
    const router = useRouter();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'published' | 'pending' | 'rejected'>('all');

    useEffect(() => {
        fetchBooks();
    }, [filter]);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            setError(null);
            const params: any = {
                page: 1,
                limit: 100, // Get more books for admin panel
            };
            
            // Always pass status parameter - 'all' to see all books, or specific status
            // API now defaults to 'published', so we need to explicitly pass 'all' for admin
            params.status = filter === 'all' ? 'all' : filter;
            
            const response = await apiClient.getBooks(params);
            setBooks(response.books || []);
        } catch (err: any) {
            console.error('Error fetching books:', err);
            setError(err.message || 'Failed to fetch books');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (bookId: string) => {
        try {
            await apiClient.updateBook(bookId, { status: 'published' });
            // Refresh the list
            fetchBooks();
        } catch (err: any) {
            console.error('Error approving book:', err);
            alert(`Failed to approve book: ${err.message || 'Unknown error'}`);
        }
    };

    const handleReject = async (bookId: string) => {
        if (!confirm('Are you sure you want to reject this book?')) {
            return;
        }
        try {
            await apiClient.updateBook(bookId, { status: 'rejected' });
            // Refresh the list
            fetchBooks();
        } catch (err: any) {
            console.error('Error rejecting book:', err);
            alert(`Failed to reject book: ${err.message || 'Unknown error'}`);
        }
    };

    const filteredBooks = books; // Already filtered by API

    const getStatusBadge = (status: string) => {
        const styles = {
            published: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">Books Management</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={fetchBooks}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Refresh
                                </button>
                                <button
                                    onClick={() => router.push('/books/add')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    + Add New Book
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                            <div className="flex space-x-2">
                                {(['all', 'published', 'pending', 'rejected'] as const).map((status) => {
                                    const count = status === 'all' 
                                        ? books.length 
                                        : books.filter(b => b.status === status).length;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setFilter(status)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {loading ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <p className="text-gray-500">Loading books...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800">{error}</p>
                                <button
                                    onClick={fetchBooks}
                                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredBooks.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <p className="text-gray-500">No books found.</p>
                                <button
                                    onClick={() => router.push('/books/add')}
                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Add First Book
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Book
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Author
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Views
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBooks.map((book) => (
                                        <tr key={book.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {(book.cover_image_url || book.cover || (book.cover_images && book.cover_images[0])) && (
                                                        <img
                                                            className="h-12 w-8 object-cover rounded"
                                                            src={book.cover_image_url || book.cover || (book.cover_images && book.cover_images[0])}
                                                            alt={book.title}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <div className={book.cover_image_url || book.cover ? "ml-4" : ""}>
                                                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                                        <div className="text-sm text-gray-500">
                                                            {book.category?.name || 'No category'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {book.author?.name || 'Unknown Author'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {book.is_free ? 'Free' : `₹${book.price || 0}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {(book.views_count || book.views || 0).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(book.status || 'pending')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => router.push(`/books/${book.id}`)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/books/${book.id}/edit`)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    {book.status === 'pending' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleApprove(book.id)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleReject(book.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

