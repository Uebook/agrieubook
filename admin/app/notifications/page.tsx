'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

interface User {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    role: string;
    avatar_url?: string;
}

export default function NotificationsPage() {
    const [form, setForm] = useState({
        target: 'all', // all, role, users
        role: 'reader',
        selectedUserIds: [] as string[],
        title: '',
        body: '',
        description: '',
        imageUrl: '',
        notificationType: 'info', // info, offer, announcement, etc.
    });
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch users for selection
    useEffect(() => {
        const fetchUsers = async () => {
            if (form.target === 'users') {
                setLoadingUsers(true);
                try {
                    // Use relative URL for local development, or env variable for production
                    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://admin-orcin-omega.vercel.app');
                    const url = `${API_BASE_URL}/api/users/all?limit=1000${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`;
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setUsers(data.users || []);
                } catch (error) {
                    console.error('Error fetching users:', error);
                    setUsers([]);
                } finally {
                    setLoadingUsers(false);
                }
            }
        };

        fetchUsers();
    }, [form.target, searchTerm]);

    const handleUserToggle = (userId: string) => {
        setForm((prev) => {
            const isSelected = prev.selectedUserIds.includes(userId);
            return {
                ...prev,
                selectedUserIds: isSelected
                    ? prev.selectedUserIds.filter((id) => id !== userId)
                    : [...prev.selectedUserIds, userId],
            };
        });
    };

    const handleSelectAll = () => {
        if (form.selectedUserIds.length === users.length) {
            setForm((prev) => ({ ...prev, selectedUserIds: [] }));
        } else {
            setForm((prev) => ({ ...prev, selectedUserIds: users.map((u) => u.id) }));
        }
    };

    const handleSend = async () => {
        if (!form.title || !form.body) {
            alert('Please fill in title and message');
            return;
        }

        if (form.target === 'users' && form.selectedUserIds.length === 0) {
            alert('Please select at least one user');
            return;
        }

        setSending(true);
        setResult(null);

        try {
            // Use relative URL for local development, or env variable for production
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://admin-orcin-omega.vercel.app');

            console.log('📡 Sending notification to:', `${API_BASE_URL}/api/notifications/push`);

            const payload: any = {
                title: form.title,
                body: form.body,
                data: {
                    type: form.notificationType,
                    description: form.description || '',
                    imageUrl: form.imageUrl || '',
                    icon: form.notificationType === 'offer' ? '🎁' : form.notificationType === 'announcement' ? '📢' : '🔔',
                },
            };

            if (form.target === 'role') {
                payload.role = form.role;
            } else if (form.target === 'users') {
                payload.user_ids = form.selectedUserIds;
            }

            console.log('📡 Payload:', payload);

            const response = await fetch(`${API_BASE_URL}/api/notifications/push`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ API Response:', data);
            setResult(data);

            if (data.success) {
                setForm({
                    target: 'all',
                    role: 'reader',
                    selectedUserIds: [],
                    title: '',
                    body: '',
                    description: '',
                    imageUrl: '',
                    notificationType: 'info',
                });
                setSearchTerm('');
            }
        } catch (error: any) {
            console.error('❌ Error sending notification:', error);
            setResult({
                error: error.message || 'Failed to send notification',
                details: error.stack,
            });
        } finally {
            setSending(false);
        }
    };

    const filteredUsers = users.filter((user) =>
        searchTerm
            ? user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.mobile?.includes(searchTerm)
            : true
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                                Send Notification / Offer
                            </h1>

                            <div className="space-y-4">
                                {/* Notification Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notification Type
                                    </label>
                                    <select
                                        value={form.notificationType}
                                        onChange={(e) => setForm({ ...form, notificationType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="info">📢 General Info</option>
                                        <option value="offer">🎁 Offer / Promotion</option>
                                        <option value="announcement">📢 Announcement</option>
                                        <option value="update">🔄 Update</option>
                                        <option value="alert">⚠️ Alert</option>
                                    </select>
                                </div>

                                {/* Target Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Send To
                                    </label>
                                    <select
                                        value={form.target}
                                        onChange={(e) => {
                                            setForm({ ...form, target: e.target.value, selectedUserIds: [] });
                                            setSearchTerm('');
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="all">All Users</option>
                                        <option value="role">By Role</option>
                                        <option value="users">Select Users</option>
                                    </select>
                                </div>

                                {/* Role Selection */}
                                {form.target === 'role' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Role
                                        </label>
                                        <select
                                            value={form.role}
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="reader">Readers</option>
                                            <option value="author">Authors</option>
                                            <option value="admin">Admins</option>
                                        </select>
                                    </div>
                                )}

                                {/* User Selection */}
                                {form.target === 'users' && (
                                    <div className="border border-gray-300 rounded-md p-4 max-h-96 overflow-y-auto">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Select Users ({form.selectedUserIds.length} selected)
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleSelectAll}
                                                className="text-sm text-green-600 hover:text-green-700"
                                            >
                                                {form.selectedUserIds.length === users.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>

                                        {/* Search */}
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search users by name, email, or mobile..."
                                            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />

                                        {loadingUsers ? (
                                            <div className="text-center py-4 text-gray-500">Loading users...</div>
                                        ) : filteredUsers.length === 0 ? (
                                            <div className="text-center py-4 text-gray-500">No users found</div>
                                        ) : (
                                            <div className="space-y-2">
                                                {filteredUsers.map((user) => (
                                                    <label
                                                        key={user.id}
                                                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={form.selectedUserIds.includes(user.id)}
                                                            onChange={() => handleUserToggle(user.id)}
                                                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {user.email} {user.mobile && `• ${user.mobile}`}
                                                            </div>
                                                            <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g., Special Offer! 50% Off on All Books"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                {/* Message/Body */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={form.body}
                                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                                        placeholder="Short notification message (appears in push notification)"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Keep it short - this appears in the push notification
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Detailed description (appears in-app notification)"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Detailed description shown in the in-app notification
                                    </p>
                                </div>

                                {/* Image URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Image URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={form.imageUrl}
                                        onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        URL to an image for the notification (e.g., offer banner, product image)
                                    </p>
                                    {form.imageUrl && (
                                        <div className="mt-2">
                                            <img
                                                src={form.imageUrl}
                                                alt="Preview"
                                                className="max-w-xs max-h-32 object-cover rounded border border-gray-300"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Send Button */}
                                <div>
                                    <button
                                        onClick={handleSend}
                                        disabled={sending}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {sending ? 'Sending...' : 'Send Notification'}
                                    </button>
                                </div>

                                {/* Result */}
                                {result && (
                                    <div
                                        className={`p-4 rounded-md ${result.error
                                            ? 'bg-red-50 text-red-800'
                                            : 'bg-green-50 text-green-800'
                                            }`}
                                    >
                                        {result.error ? (
                                            <p className="font-medium">Error: {result.error}</p>
                                        ) : (
                                            <div>
                                                <p className="font-medium">✅ Notification sent successfully!</p>
                                                <p className="text-sm mt-2">
                                                    Target users: {result.target_users || 0}
                                                </p>
                                                <p className="text-sm">
                                                    Tokens found: {result.tokens_found || 0}
                                                </p>
                                                <p className="text-sm">
                                                    Sent: {result.notifications_sent || 0} | Failed:{' '}
                                                    {result.notifications_failed || 0}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
