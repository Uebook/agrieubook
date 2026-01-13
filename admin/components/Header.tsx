'use client';

import { useRouter } from 'next/navigation';

export default function Header() {
    const router = useRouter();

    const handleLogout = () => {
        try {
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
        } catch (error) {
            console.warn('Failed to clear localStorage on logout:', error);
        }

        try {
            document.cookie = 'adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } catch (error) {
            console.warn('Failed to clear auth cookies:', error);
        }

        router.push('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Agribook Admin Panel</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Admin User</span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

