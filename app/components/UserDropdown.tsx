import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppStore } from '~/lib/store';
import { cn } from '~/lib/utils';

export const UserDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, signOut, isLoading } = useAppStore();
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            setIsOpen(false);
            navigate('/auth');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const getUserInitials = (email: string) => {
        return email
            .split('@')[0]
            .split('.')
            .map(name => name.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* User Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt="User avatar"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <span>{getUserInitials(user.email || 'U')}</span>
                    )}
                </div>
                <svg
                    className={cn(
                        "w-4 h-4 text-gray-500 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                            {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                            {user.email}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/');
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm8 6l-4-4m0 0l4-4m-4 4h8" />
                            </svg>
                            My Resumes
                        </button>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/upload');
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload Resume
                        </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-200 pt-1">
                        <button
                            onClick={handleLogout}
                            disabled={isLoading}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {isLoading ? 'Signing out...' : 'Sign Out'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
