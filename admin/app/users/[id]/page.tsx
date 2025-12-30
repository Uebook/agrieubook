'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { dummyUsers } from '@/lib/dummyData';

export default function UserViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = dummyUsers.find(u => u.id === id);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
              <button
                onClick={() => router.push('/users')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Back to Users
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

  const getRoleBadge = (role: string) => {
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        role === 'author' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
      }`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
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
              <h2 className="text-3xl font-bold text-gray-900">User Details</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/users/${id}/edit`)}
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
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <div className="flex items-center space-x-2 mt-2">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Contact Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Mobile:</span>
                      <span className="ml-2 font-medium">{user.mobile}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Join Date:</span>
                      <span className="ml-2 font-medium">{new Date(user.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Purchase Statistics</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Books Purchased:</span>
                      <span className="ml-2 font-medium">{user.booksPurchased}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="ml-2 font-semibold text-green-600">₹{user.totalSpent.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}






