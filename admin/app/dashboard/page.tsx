'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalAudioBooks: 0,
    totalAuthors: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalPayments: 0,
    totalPlatformCommission: 0,
    totalGST: 0,
    totalAuthorEarnings: 0,
    platformProfit: 0,
    pendingBooks: 0,
    pendingAudioBooks: 0,
    activeUsers: 0,
    authorRevenue: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDashboardStats(
        startDate || undefined,
        endDate || undefined
      );
      setStats(data as typeof stats);
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      // Show user-friendly error message
      const errorMessage = err?.message?.includes('Supabase') 
        ? 'Please configure Supabase. See SETUP_INSTRUCTIONS.md'
        : 'Failed to load dashboard data. Check console for details.';
      setError(errorMessage);
      // Set default stats to prevent blank page
      setStats({
        totalBooks: 0,
        totalAudioBooks: 0,
        totalAuthors: 0,
        totalUsers: 0,
        totalRevenue: 0,
        totalPayments: 0,
        totalPlatformCommission: 0,
        totalGST: 0,
        totalAuthorEarnings: 0,
        platformProfit: 0,
        pendingBooks: 0,
        pendingAudioBooks: 0,
        activeUsers: 0,
        authorRevenue: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: '📚',
      color: 'bg-blue-500',
      link: '/books',
    },
    {
      title: 'Audio Books',
      value: stats.totalAudioBooks,
      icon: '🎙️',
      color: 'bg-purple-500',
      link: '/audio-books',
    },
    {
      title: 'Total Authors',
      value: stats.totalAuthors,
      icon: '✍️',
      color: 'bg-green-500',
      link: '/authors',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-orange-500',
      link: '/users',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: '💰',
      color: 'bg-emerald-500',
      link: '#',
    },
    {
      title: 'Total Payments',
      value: stats.totalPayments,
      icon: '💳',
      color: 'bg-indigo-500',
      link: '#',
    },
    {
      title: 'Platform Commission',
      value: `₹${stats.totalPlatformCommission.toLocaleString()}`,
      icon: '💼',
      color: 'bg-cyan-500',
      link: '#',
    },
    {
      title: 'Total GST',
      value: `₹${stats.totalGST.toLocaleString()}`,
      icon: '📋',
      color: 'bg-pink-500',
      link: '#',
    },
    {
      title: 'Author Earnings',
      value: `₹${stats.totalAuthorEarnings.toLocaleString()}`,
      icon: '👨‍💼',
      color: 'bg-amber-500',
      link: '#',
    },
    {
      title: 'Platform Profit',
      value: `₹${stats.platformProfit.toLocaleString()}`,
      icon: '📈',
      color: 'bg-lime-500',
      link: '#',
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingBooks + stats.pendingAudioBooks,
      icon: '⏳',
      color: 'bg-yellow-500',
      link: '/books?status=pending',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: '✅',
      color: 'bg-teal-500',
      link: '/users?status=active',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading dashboard...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-red-500">{error}</div>
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
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
              
              {/* Date Filter */}
              <div className="flex gap-4">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="End Date"
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {statCards.map((card, index) => (
                <Link
                  key={index}
                  href={card.link}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">{card.title}</p>
                      <p className={`text-2xl font-bold ${card.color.replace('bg-', 'text-')}`}>
                        {card.value}
                      </p>
                    </div>
                    <div className={`${card.color} p-3 rounded-lg text-2xl`}>
                      {card.icon}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Author Revenue Chart Placeholder */}
            {stats.authorRevenue.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Author Revenue</h3>
                <div className="space-y-2">
                  {stats.authorRevenue.map((author: any) => (
                    <div key={author.authorId} className="flex items-center justify-between">
                      <span className="text-gray-700">{author.authorName}</span>
                      <span className="font-semibold">₹{author.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
