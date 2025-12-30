'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dummyBooks, type Book } from '@/lib/dummyData';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function BooksPage() {
    const router = useRouter();
    const [books] = useState<Book[]>(dummyBooks);
    const [filter, setFilter] = useState<'all' | 'published' | 'pending' | 'rejected'>('all');

    const filteredBooks = filter === 'all'
        ? books
        : books.filter(book => book.status === filter);

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
                            <button
                                onClick={() => router.push('/books/add')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                + Add New Book
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                            <div className="flex space-x-2">
                                {(['all', 'published', 'pending', 'rejected'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)} ({status === 'all' ? books.length : books.filter(b => b.status === status).length})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Books Table */}
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
                                                    <img
                                                        className="h-12 w-8 object-cover rounded"
                                                        src={book.cover}
                                                        alt={book.title}
                                                    />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                                        <div className="text-sm text-gray-500">{book.category.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{book.author.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {book.isFree ? 'Free' : `₹${book.price}`}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{book.views.toLocaleString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(book.status)}
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
                                                            <button className="text-green-600 hover:text-green-900">Approve</button>
                                                            <button className="text-red-600 hover:text-red-900">Reject</button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

