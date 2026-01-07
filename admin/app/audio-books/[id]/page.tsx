'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import apiClient from '@/lib/api/client';

export default function AudioBookViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [audioBook, setAudioBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchAudioBook();
  }, [id]);

  useEffect(() => {
    if (audioBook?.cover_url) {
      fetchSignedImageUrl();
    }
    if (audioBook?.audio_url) {
      fetchSignedAudioUrl();
    }
  }, [audioBook?.cover_url, audioBook?.audio_url]);

  const fetchAudioBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAudioBook(id);
      setAudioBook(response.audioBook);
      setCoverImageUrl(response.audioBook?.cover_url || null);
      setAudioUrl(response.audioBook?.audio_url || null);
    } catch (err: any) {
      console.error('Error fetching audio book:', err);
      setError(err.message || 'Failed to load audio book');
    } finally {
      setLoading(false);
    }
  };

  const fetchSignedImageUrl = async () => {
    try {
      // Try to get signed URL for the cover image
      const response = await fetch(`/api/audio-books/${id}/image`);
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setCoverImageUrl(data.imageUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching signed image URL:', err);
    }
  };

  const fetchSignedAudioUrl = async () => {
    try {
      // Try to get signed URL for the audio file
      const response = await fetch(`/api/audio-books/${id}/audio`);
      if (response.ok) {
        const data = await response.json();
        if (data.audioUrl) {
          setAudioUrl(data.audioUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching signed audio URL:', err);
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
              <p className="text-gray-500">Loading audio book details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !audioBook) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {error || 'Audio Book Not Found'}
              </h2>
              <button
                onClick={() => router.push('/audio-books')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Back to Audio Books
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
              <h2 className="text-3xl font-bold text-gray-900">Audio Book Details</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/audio-books/${id}/edit`)}
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
                  {(coverImageUrl || audioBook.cover_url) ? (
                    <img
                      src={coverImageUrl || audioBook.cover_url}
                      alt={audioBook.title}
                      className="w-full h-96 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x600?text=No+Cover';
                      }}
                    />
                  ) : (
                    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">🎙️</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{audioBook.title || 'Untitled'}</h1>
                    <p className="text-gray-600 mt-1">By {audioBook.author?.name || 'Unknown Author'}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusBadge(audioBook.status || 'pending')}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold text-gray-900">🎙️ {audioBook.duration || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900">{audioBook.category?.name || 'No category'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium text-gray-900">{audioBook.language || 'English'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium text-gray-900">
                        {audioBook.created_at ? new Date(audioBook.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {(audioUrl || audioBook.audio_url) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Audio File:</span>
                        <a
                          href={audioUrl || audioBook.audio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          🎵 Play Audio
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {audioBook.description && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{audioBook.description}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}








