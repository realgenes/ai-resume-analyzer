import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {useAppStore} from "~/lib/store";
import type { ResumeData } from "~/lib/supabase";

const ResumeCard = ({ resume, onDelete }: { resume: ResumeData, onDelete?: () => void }) => {
    const { downloadFile, deleteFile, deleteResumeData, getResumeData } = useAppStore();
    const [resumeUrl, setResumeUrl] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation when clicking delete
        e.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        
        try {
            // Delete the PDF file from storage
            if (resume.resume_path) {
                await deleteFile('resumes', resume.resume_path);
            }
            
            // Delete the image file from storage
            if (resume.image_path) {
                await deleteFile('images', resume.image_path);
            }
            
            // Delete the database record
            await deleteResumeData(resume.id);
            
            // Call parent callback to refresh the list
            if (onDelete) {
                onDelete();
            }
        } catch (error) {
            console.error('Failed to delete resume:', error);
            alert('Failed to delete resume. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        const loadResumeImage = async () => {
            if (!resume.image_path) return;
            
            try {
                const url = await downloadFile('images', resume.image_path);
                if (url) {
                    setResumeUrl(url);
                }
            } catch (error) {
                console.error('Failed to load resume image:', error);
            }
        }

        loadResumeImage();
        
        // Cleanup URL on unmount
        return () => {
            if (resumeUrl) {
                URL.revokeObjectURL(resumeUrl);
            }
        };
    }, [resume.image_path, downloadFile]);

    return (
    <div className="resume-card animate-in fade-in duration-700 relative">
            <button
                onClick={handleDelete}
                disabled={isDeleting}
        className="absolute top-2 right-2 z-10 bg-red-500/90 hover:bg-red-600 disabled:bg-red-300 text-white p-2 rounded-full shadow-md transition-colors duration-200"
                title="Delete resume"
            >
                {isDeleting ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                )}
            </button>
            <Link to={`/resume/${resume.id}`} className="block">
                <div className="resume-card-header">
                    <div className="flex flex-col gap-2">
                        {resume.company_name && <h2 className="!text-black font-bold break-words">{resume.company_name}</h2>}
                        {resume.job_title && <h3 className="text-lg break-words text-black-700 dark:text-gray-700">{resume.job_title}</h3>}
                        {!resume.company_name && !resume.job_title && <h2 className="!text-black font-bold">Resume</h2>}
                    </div>
                    <div className="flex-shrink-0">
                        <ScoreCircle score={resume.feedback?.overallScore || 0} />
                    </div>
                </div>
                {resumeUrl && (
                    <div className="gradient-border animate-in fade-in duration-700">
                        <div className="w-full h-full">
                            <img
                                src={resumeUrl}
                                alt="resume"
                                className="w-full h-[350px] max-sm:h-[220px] object-cover object-top rounded-2xl"
                            />
                        </div>
                    </div>
                )}
            </Link>
        </div>
    )
}

export default ResumeCard
