'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/dummyData';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function DashboardPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const stats = getDashboardStats(startDate || undefined, endDate || undefined);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm mt-6"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => (
                <Link key={stat.title} href={stat.link}>
                  <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      </div>
                      <div className={`${stat.color} w-16 h-16 rounded-lg flex items-center justify-center text-3xl`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Author Revenue */}
            {stats.authorRevenue && stats.authorRevenue.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Author-wise Revenue</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Author
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.authorRevenue.map((author) => (
                        <tr key={author.authorId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{author.authorName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{author.sales}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600">₹{author.revenue.toLocaleString()}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    📚
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New book submitted</p>
                    <p className="text-sm text-gray-600">Organic Farming Essentials by Jane Doe</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Pending
                  </span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    ✅
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Book approved</p>
                    <p className="text-sm text-gray-600">Modern Agriculture Guide by Dr. John Smith</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Published
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

