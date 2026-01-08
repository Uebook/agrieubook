'use client';

import { useState, useEffect } from 'react';
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

export default function YouTubeChannelsPage() {
    const router = useRouter();
    const [channels, setChannels] = useState<YouTubeChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

    useEffect(() => {
        fetchChannels();
    }, [filter]);

    const fetchChannels = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.getYouTubeChannels({ 
                page: 1, 
                limit: 100,
                status: 'all' // Get all channels (active and inactive) for admin
            });
            // Filter by active status if needed
            let filtered = response.channels || [];
            if (filter === 'active') {
                filtered = filtered.filter(c => c.is_active);
            } else if (filter === 'inactive') {
                filtered = filtered.filter(c => !c.is_active);
            }
            setChannels(filtered);
        } catch (err: any) {
            console.error('Error fetching YouTube channels:', err);
            setError(err.message || 'Failed to fetch YouTube channels');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (channelId: string) => {
        if (!confirm('Are you sure you want to delete this YouTube channel?')) {
            return;
        }
        try {
            await apiClient.deleteYouTubeChannel(channelId);
            fetchChannels();
        } catch (err: any) {
            console.error('Error deleting channel:', err);
            alert(`Failed to delete channel: ${err.message || 'Unknown error'}`);
        }
    };

    const handleToggleActive = async (channel: YouTubeChannel) => {
        try {
            await apiClient.updateYouTubeChannel(channel.id, {
                is_active: !channel.is_active
            });
            fetchChannels();
        } catch (err: any) {
            console.error('Error updating channel:', err);
            alert(`Failed to update channel: ${err.message || 'Unknown error'}`);
        }
    };

    const filteredChannels = channels;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <Sidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-900">YouTube Channels</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={fetchChannels}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Refresh
                                </button>
                                <button
                                    onClick={() => router.push('/youtube-channels/add')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    + Add New Channel
                                </button>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                            <div className="flex space-x-2">
                                {(['all', 'active', 'inactive'] as const).map((status) => {
                                    const count = status === 'all' 
                                        ? channels.length 
                                        : channels.filter(c => 
                                            status === 'active' ? c.is_active : !c.is_active
                                        ).length;
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
                                <p className="text-gray-500">Loading channels...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800">{error}</p>
                                <button
                                    onClick={fetchChannels}
                                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredChannels.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                <p className="text-gray-500">No YouTube channels found.</p>
                                <button
                                    onClick={() => router.push('/youtube-channels/add')}
                                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Add First Channel
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Channel
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            URL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subscribers
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Videos
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
                                    {filteredChannels.map((channel) => (
                                        <tr key={channel.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {channel.thumbnail_url && (
                                                        <img
                                                            className="h-12 w-12 object-cover rounded-full"
                                                            src={channel.thumbnail_url}
                                                            alt={channel.name}
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                    <div className={channel.thumbnail_url ? "ml-4" : ""}>
                                                        <div className="flex items-center">
                                                            <div className="text-sm font-medium text-gray-900">{channel.name}</div>
                                                            {channel.verified && (
                                                                <span className="ml-2 text-green-600">✓</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={channel.channel_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:text-blue-900 truncate max-w-xs block"
                                                >
                                                    {channel.channel_url}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {(channel.subscriber_count || 0).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {(channel.video_count || 0).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    channel.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {channel.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => router.push(`/youtube-channels/${channel.id}`)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/youtube-channels/${channel.id}/edit`)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleActive(channel)}
                                                        className={`${
                                                            channel.is_active 
                                                                ? 'text-yellow-600 hover:text-yellow-900' 
                                                                : 'text-green-600 hover:text-green-900'
                                                        }`}
                                                    >
                                                        {channel.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(channel.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
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
