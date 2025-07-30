import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {useAppStore} from "~/lib/store";
import type { ResumeData } from "~/lib/supabase";

const ResumeCard = ({ resume }: { resume: ResumeData }) => {
    const { downloadFile } = useAppStore();
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        const loadResumeImage = async () => {
            if (!resume.image_path) return;
            
            try {
                const blob = await downloadFile('images', resume.image_path);
                if (blob) {
                    const url = URL.createObjectURL(blob);
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
        <Link to={`/resume/${resume.id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {resume.company_name && <h2 className="!text-black font-bold break-words">{resume.company_name}</h2>}
                    {resume.job_title && <h3 className="text-lg break-words text-gray-500">{resume.job_title}</h3>}
                    {!resume.company_name && !resume.job_title && <h2 className="!text-black font-bold">Resume</h2>}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={resume.feedback?.overallScore || 0} />
                </div>
            </div>
            {resumeUrl && (
                <div className="gradient-border animate-in fade-in duration-1000">
                    <div className="w-full h-full">
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                        />
                    </div>
                </div>
                )}
        </Link>
    )
}

export default ResumeCard
