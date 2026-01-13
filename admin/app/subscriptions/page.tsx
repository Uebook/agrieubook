'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
import apiClient from '@/lib/api/client';

interface SubscriptionType {
  id: string;
  name: string;
  type: 'monthly' | 'per_book';
  description?: string;
  price: number;
  duration_days?: number;
  features?: any;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'monthly' as 'monthly' | 'per_book',
    description: '',
    price: '',
    duration_days: '',
    is_active: true,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchSubscriptions();
  }, [pagination.page, pagination.limit]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getSubscriptions({
        page: pagination.page,
        limit: pagination.limit,
        type: 'monthly',
      });
      setSubscriptions(response.subscriptionTypes || []);
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total || 0,
          totalPages: response.pagination.totalPages || 0,
        }));
      }
    } catch (err: any) {
      console.error('Error fetching subscriptions:', err);
      setError(err.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        description: formData.description || null,
        price: parseFloat(formData.price),
        duration_days: formData.type === 'monthly' ? parseInt(formData.duration_days || '30') : null,
        is_active: formData.is_active,
      };

      if (editingSubscription) {
        await apiClient.updateSubscription(editingSubscription.id, payload);
      } else {
        await apiClient.createSubscription(payload);
      }

      setShowAddModal(false);
      setEditingSubscription(null);
      setFormData({
        name: '',
        type: 'monthly',
        description: '',
        price: '',
        duration_days: '',
        is_active: true,
      });
      fetchSubscriptions();
    } catch (err: any) {
      console.error('Error saving subscription:', err);
      alert(err.message || 'Failed to save subscription');
    }
  };

  const handleEdit = (subscription: SubscriptionType) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      type: subscription.type,
      description: subscription.description || '',
      price: subscription.price.toString(),
      duration_days: subscription.duration_days?.toString() || '30',
      is_active: subscription.is_active,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription type?')) {
      return;
    }

    try {
      await apiClient.deleteSubscription(id);
      fetchSubscriptions();
    } catch (err: any) {
      console.error('Error deleting subscription:', err);
      alert(err.message || 'Failed to delete subscription');
    }
  };

  const toggleActive = async (subscription: SubscriptionType) => {
    try {
      await apiClient.updateSubscription(subscription.id, {
        ...subscription,
        is_active: !subscription.is_active,
      });
      fetchSubscriptions();
    } catch (err: any) {
      console.error('Error updating subscription:', err);
      alert(err.message || 'Failed to update subscription');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Subscription Types</h1>
              <button
                onClick={() => {
                  setEditingSubscription(null);
                  setFormData({
                    name: '',
                    type: 'monthly',
                    description: '',
                    price: '',
                    duration_days: '30',
                    is_active: true,
                  });
                  setShowAddModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                + Add Subscription Type
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-600">Loading subscriptions...</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600">No subscription types found. Add one to get started.</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
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
                      {subscriptions.map((subscription) => (
                        <tr key={subscription.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{subscription.name}</div>
                            {subscription.description && (
                              <div className="text-sm text-gray-500">{subscription.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              subscription.type === 'monthly' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {subscription.type === 'monthly' ? 'Monthly' : 'Per Book'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{subscription.price.toFixed(2)}
                            {subscription.type === 'monthly' ? '/month' : '/book'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {subscription.duration_days ? `${subscription.duration_days} days` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleActive(subscription)}
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                subscription.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {subscription.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(subscription)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(subscription.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      totalItems={pagination.total}
                      itemsPerPage={pagination.limit}
                      onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                      onItemsPerPageChange={(itemsPerPage) => setPagination(prev => ({ ...prev, limit: itemsPerPage, page: 1 }))}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingSubscription ? 'Edit Subscription Type' : 'Add Subscription Type'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={editingSubscription !== null}
                >
                  <option value="monthly">Monthly Subscription</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: Per Book Pay is the default option (no subscription needed)
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {formData.type === 'monthly' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                  <input
                    type="number"
                    name="duration_days"
                    value={formData.duration_days}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSubscription(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingSubscription ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
