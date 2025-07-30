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
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>
            
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        <Link to="/upload" className="primary-button w-fit">
                            Upload Resume
                        </Link>
                        <UserDropdown />
                    </>
                ) : (
                    <Link to="/auth" className="primary-button w-fit">
                        Sign In
                    </Link>
                )}
            </div>
        </nav>
    )
}
export default Navbar
