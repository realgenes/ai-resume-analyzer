import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { LoadingSpinner, ResumeCardSkeleton } from "~/components/LoadingSpinner";
import { NoResumesEmptyState } from "~/components/EmptyState";
import {useAppStore} from "~/lib/store";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import type { ResumeData } from "~/lib/supabase";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { isAuthenticated, getUserResumes } = useAppStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  const loadResumes = async () => {
    if (!isAuthenticated) return;
    
    setLoadingResumes(true);
    try {
      const userResumes = await getUserResumes();
      setResumes(userResumes);
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setLoadingResumes(false);
    }
  };

  useEffect(() => {
    if(!isAuthenticated) navigate('/auth?next=/');
  }, [isAuthenticated])

  useEffect(() => {    
    loadResumes()
  }, [isAuthenticated, getUserResumes]);

  return <main className="min-h-screen">
    <Navbar />

    <section className="main-section">
      {/* Enhanced page heading with better typography and animations */}
      <div className="page-heading  py-10 md:py-14 animate-fadeIn">
        <h1 className="animate-slideInUp">Track Your Applications & Resume Ratings</h1>
        {!loadingResumes && resumes?.length === 0 ? (
            <h2 className="animate-slideInUp animation-delay-200">Welcome to your resume dashboard!</h2>
        ): (
          <h2 className="animate-slideInUp animation-delay-200 ">Review your submissions and check AI-powered feedback.</h2>
        )}
      </div>

      {/* Enhanced loading state with skeleton cards */}
      {loadingResumes && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col items-center justify-center mb-8">
              <LoadingSpinner size="lg" text="Loading your resumes..." />
            </div>
            <div className="resumes-section">
              {[...Array(3)].map((_, i) => (
                <ResumeCardSkeleton key={i} />
              ))}
            </div>
          </div>
      )}

      {/* Enhanced resumes grid with stagger animations */}
      {!loadingResumes && resumes.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          {/* Stats bar */}
          <div className="bg-white/20 dark:bg-gray-500/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 dark:border-white/10 animate-slideInUp shadow-gray-600 w-[60%] mx-auto mb-16">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-md text-gray-700 dark:text-gray-900">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-black">{resumes.length}</p>
              </div>
              <div>
                <p className="text-md text-gray-600 dark:text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {Math.round(resumes.reduce((acc, resume) => acc + (resume.feedback?.overallScore || 0), 0) / resumes.length)}
                </p>
              </div>
            </div>
          </div>

          {/* Resumes grid with stagger animation */}
          <div className="resumes-section">
            {resumes.map((resume, index) => (
                <div 
                  key={resume.id} 
                  className="animate-slideInUp ml-6"
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <ResumeCard resume={resume} onDelete={loadResumes} />
                </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced empty state */}
      {!loadingResumes && resumes?.length === 0 && (
          <div className="animate-fadeIn">
            <NoResumesEmptyState />
          </div>
      )}
    </section>
  </main>
}
