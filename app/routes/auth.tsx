import {useAppStore} from "~/lib/store";
import {useEffect} from "react";
import {useLocation, useNavigate} from "react-router";
import { MultiAuth } from "~/components/MultiAuth";

export const meta = () => ([
    { title: 'Resumind | Auth' },
    { name: 'description', content: 'Log into your account' },
])

const Auth = () => {
    const { isAuthenticated } = useAppStore();
    const location = useLocation();
    const next = location.search.split('next=')[1] || '/';
    const navigate = useNavigate();

    useEffect(() => {
        if(isAuthenticated) navigate(next);
    }, [isAuthenticated, next])

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center p-2">
            <div className="gradient-border shadow-xl w-full max-w-2xl">
                <section className="flex flex-col gap-4 bg-white rounded-2xl p-4 sm:p-6 lg:p-8 w-full">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1 className="text-xl sm:text-xl lg:text-xl font-bold text-gray-900">Welcome</h1>
                    </div>
                    
                    <MultiAuth />
                </section>
            </div>
        </main>
    )
}

export default Auth
