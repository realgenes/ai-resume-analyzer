import { useAppStore } from '~/lib/store';
import { useNavigate } from 'react-router';

interface LogoutButtonProps {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    className?: string;
}

export const LogoutButton = ({ 
    variant = 'secondary', 
    size = 'md', 
    showIcon = true,
    className = '' 
}: LogoutButtonProps) => {
    const { signOut, isLoading } = useAppStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/auth');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
        secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
    };

    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
        md: "px-4 py-2 text-sm rounded-lg gap-2",
        lg: "px-6 py-3 text-base rounded-lg gap-2"
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoading}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {showIcon && (
                <svg className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            )}
            {isLoading ? 'Signing out...' : 'Logout'}
        </button>
    );
};
