'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { href: '/dashboard', icon: '📊', label: 'Dashboard' },
        { href: '/books', icon: '📚', label: 'Books' },
        { href: '/audio-books', icon: '🎙️', label: 'Audio Books' },
        { href: '/authors', icon: '✍️', label: 'Authors' },
        { href: '/users', icon: '👥', label: 'Users' },
        { href: '/curriculum', icon: '📄', label: 'Government Curriculum' },
        { href: '/settings', icon: '⚙️', label: 'Settings' },
        { href: '/profile', icon: '👤', label: 'Profile' },
    ];

    return (
        <aside className="w-64 bg-white shadow-sm min-h-screen">
            <nav className="p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${isActive
                                            ? 'bg-green-50 text-green-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}

