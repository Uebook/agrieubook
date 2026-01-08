'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import apiClient from '@/lib/api/client';

interface YouTubeChannel {
  id: string;
  name: string;
  description?: string;
  channel_url: string;
  thumbnail_url?: string;
  subscriber_count?: number;
  video_count?: number;
  verified?: boolean;
  category_ids?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function YouTubeChannelViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChannel();
    fetchCategories();
  }, [id]);

  const fetchChannel = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getYouTubeChannel(id);
      setChannel(response.channel);
    } catch (err: any) {
      console.error('Error fetching channel:', err);
      setError(err.message || 'Failed to fetch channel');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this YouTube channel?')) {
      return;
    }
    try {
      await apiClient.deleteYouTubeChannel(id);
      alert('Channel deleted successfully!');
      router.push('/youtube-channels');
    } catch (err: any) {
      console.error('Error deleting channel:', err);
      alert(`Failed to delete channel: ${err.message || 'Unknown error'}`);
    }
  };

  const getCategoryNames = () => {
    if (!channel?.category_ids || channel.category_ids.length === 0) {
      return 'No categories';
    }
    return channel.category_ids
      .map(catId => {
        const category = categories.find(cat => cat.id === catId);
        return category ? `${category.icon} ${category.name}` : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-500">Loading channel...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !channel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error || 'Channel not found'}</p>
                <button
                  onClick={() => router.push('/youtube-channels')}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Back to Channels
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">YouTube Channel Details</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/youtube-channels/${id}/edit`)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() => router.push('/youtube-channels')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div className="flex items-start space-x-6">
                {channel.thumbnail_url && (
                  <img
                    src={channel.thumbnail_url}
                    alt={channel.name}
                    className="h-32 w-32 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{channel.name}</h3>
                    {channel.verified && (
                      <span className="text-green-600 font-bold">✓</span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      channel.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {channel.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <a
                    href={channel.channel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900 text-sm break-all"
                  >
                    {channel.channel_url}
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                <p className="text-gray-900">
                  {channel.description || 'No description available'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Subscribers</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {(channel.subscriber_count || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Videos</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {(channel.video_count || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
                <p className="text-gray-900">{getCategoryNames()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Created At</h4>
                  <p className="text-gray-600">
                    {channel.created_at 
                      ? new Date(channel.created_at).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-1">Updated At</h4>
                  <p className="text-gray-600">
                    {channel.updated_at 
                      ? new Date(channel.updated_at).toLocaleString() 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
