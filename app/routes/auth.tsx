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
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center p-4">
            <div className="gradient-border shadow-xl w-full max-w-2xl">
                <section className="flex flex-col gap-6 bg-white rounded-2xl p-6 sm:p-8 lg:p-10 w-full">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Welcome</h1>
                        <h2 className="text-base sm:text-lg lg:text-xl text-gray-600 font-medium">Choose Your Sign In Method</h2>
                    </div>
                    
                    <MultiAuth />
                </section>
            </div>
        </main>
    )
}

export default Auth
