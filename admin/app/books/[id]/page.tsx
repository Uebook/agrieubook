'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { dummyBooks, type Book } from '@/lib/dummyData';

export default function BookViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const book = dummyBooks.find(b => b.id === id);

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Book Not Found</h2>
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
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  {book.coverImages && book.coverImages.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Cover Images</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {book.coverImages.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Cover ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{book.title}</h1>
                    <p className="text-gray-600 mt-1">By {book.author.name}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(book.status)}
                    <span className="text-sm text-gray-600">⭐ {book.rating} ({book.reviews} reviews)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold">
                        {book.isFree ? 'Free' : `₹${book.price}`}
                        {book.originalPrice > book.price && (
                          <span className="ml-2 text-sm text-gray-500 line-through">₹{book.originalPrice}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{book.category.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">{book.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pages:</span>
                      <span className="font-medium">{book.pages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ISBN:</span>
                      <span className="font-medium">{book.isbn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{book.views.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Published:</span>
                      <span className="font-medium">{new Date(book.publishedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{book.summary}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}








