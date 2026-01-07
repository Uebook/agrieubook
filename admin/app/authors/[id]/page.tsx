'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import apiClient from '@/lib/api/client';

export default function AuthorViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthor();
  }, [id]);

  const fetchAuthor = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAuthor(id);
      setAuthor(response.author);
    } catch (err: any) {
      console.error('Error fetching author:', err);
      setError(err.message || 'Failed to load author');
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
              <p className="text-gray-500">Loading author details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {error || 'Author Not Found'}
              </h2>
              <button
                onClick={() => router.push('/authors')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Back to Authors
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
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
              <h2 className="text-3xl font-bold text-gray-900">Author Details</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/authors/${id}/edit`)}
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
              <div className="flex items-center space-x-6">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {author.name?.charAt(0) || 'A'}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{author.name}</h1>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusBadge(author.status || 'active')}
                    <span className="text-gray-900 font-semibold">⭐ {author.rating || '0.0'}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Contact Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-semibold text-gray-900">{author.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mobile:</span>
                      <span className="ml-2 font-semibold text-gray-900">{author.mobile || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Join Date:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {author.created_at ? new Date(author.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Statistics</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Books Published:</span>
                      <span className="ml-2 font-semibold text-gray-900">{author.books_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Audio Books:</span>
                      <span className="ml-2 font-semibold text-gray-900">{author.audio_books_count || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Rating:</span>
                      <span className="ml-2 font-semibold text-gray-900">⭐ {author.rating || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {author.bio && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                  <p className="text-gray-700 leading-relaxed">{author.bio}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}








