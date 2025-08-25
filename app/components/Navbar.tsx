import {Link} from "react-router";
import {useAppStore} from "~/lib/store";
import {useEffect} from "react";
import {UserDropdown} from "~/components/UserDropdown";

const Navbar = () => {
    const { isAuthenticated, checkAuthStatus } = useAppStore();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return (
        <nav className="navbar group bg-gray-300 shadow-2xl">
            <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
                <div className="size-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-400 shadow-md group-hover:shadow-lg transition-shadow duration-200" />
                <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-gradient">RESUMIND</p>
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
                {isAuthenticated ? (
                    <>
                        <Link 
                            to="/upload" 
                            className="primary-button w-fit text-sm sm:text-base group relative overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Upload Resume
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </Link>
                        <UserDropdown />
                    </>
                ) : (
                    <Link 
                        to="/auth" 
                        className="primary-button w-fit text-sm sm:text-base hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    )
}
export default Navbar
