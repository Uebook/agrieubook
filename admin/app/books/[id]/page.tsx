'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import apiClient from '@/lib/api/client';

interface Book {
  id: string;
  title: string;
  summary?: string;
  cover_image_url?: string;
  cover_images?: string[] | null;
  pdf_url?: string;
  author?: {
    id: string;
    name: string;
  };
  author_id?: string;
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
  category_id?: string;
  price?: number;
  original_price?: number;
  is_free?: boolean;
  pages?: number;
  language?: string;
  isbn?: string;
  status?: string;
  published_date?: string;
  created_at?: string;
  updated_at?: string;
  views_count?: number;
  rating?: number;
  reviews_count?: number;
}

export default function BookViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getBook(id);
      setBook(response.book);
    } catch (err: any) {
      console.error('Error fetching book:', err);
      setError(err.message || 'Failed to fetch book');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <p className="text-gray-700">Loading book details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {error || 'Book Not Found'}
              </h2>
              <button
                onClick={() => router.push('/books')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Back to Books
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Book Details</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/books/${id}/edit`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-96 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=No+Cover';
                      }}
                    />
                  ) : (
                    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">No Cover Image</span>
                    </div>
                  )}
                  {book.cover_images && Array.isArray(book.cover_images) && book.cover_images.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Cover Images</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {book.cover_images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Cover ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                    <p className="text-gray-700 font-medium mt-1">
                      By {book.author?.name || 'Unknown Author'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(book.status || 'pending')}
                    {book.rating && (
                      <span className="text-sm font-medium text-gray-900">
                        ⭐ {book.rating.toFixed(1)} ({book.reviews_count || 0} reviews)
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-gray-900">
                        {book.is_free ? 'Free' : `₹${book.price || 0}`}
                        {book.original_price && book.price && book.original_price > book.price && (
                          <span className="ml-2 text-sm text-gray-500 line-through">₹{book.original_price}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900">{book.category?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium text-gray-900">{book.language || 'N/A'}</span>
                    </div>
                    {book.pages && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pages:</span>
                        <span className="font-medium text-gray-900">{book.pages}</span>
                      </div>
                    )}
                    {book.isbn && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ISBN:</span>
                        <span className="font-medium text-gray-900">{book.isbn}</span>
                      </div>
                    )}
                    {book.views_count !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-medium text-gray-900">{book.views_count.toLocaleString()}</span>
                      </div>
                    )}
                    {book.published_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published:</span>
                        <span className="font-medium text-gray-900">{new Date(book.published_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-900">
                        {book.created_at ? new Date(book.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {book.pdf_url && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">PDF:</span>
                        <a
                          href={book.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-600 hover:text-green-700"
                        >
                          View PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {book.summary && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700 leading-relaxed">{book.summary}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}








