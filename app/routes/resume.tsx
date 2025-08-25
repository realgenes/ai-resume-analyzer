import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {useAppStore} from "~/lib/store";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { isAuthenticated, isLoading, downloadFile, getResumeData } = useAppStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading, isAuthenticated, navigate, id])

    useEffect(() => {
        const loadResume = async () => {
            if (!id) return;
            
            const resumeData = await getResumeData(id);
            if(!resumeData) return;

            // Download resume file
            const resumeBlob = await downloadFile('resumes', resumeData.resume_path);
            if(resumeBlob) {
                const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
                const resumeUrl = URL.createObjectURL(pdfBlob);
                setResumeUrl(resumeUrl);
            }

            // Download image file
            if(resumeData.image_path) {
                const imageUrl = await downloadFile('images', resumeData.image_path);
                if (imageUrl) {
                    setImageUrl(imageUrl);
                }
            }

            setFeedback(resumeData.feedback);
        }

        if (id) {
            loadResume();
        }
    }, [id, downloadFile, getResumeData]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="w-1/2 max-lg:w-full flex flex-col">
                    {/* Resume Preview */}
                    <div className="h-[100vh] sticky top-0 flex items-center justify-center bg-white">
                        {imageUrl && resumeUrl && (
                            <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={imageUrl}
                                        className="w-full h-full object-contain rounded-2xl"
                                        title="resume"
                                    />
                                </a>
                            </div>
                        )}
                    </div>
                    {/* ATS Component below resume preview */}
                    {feedback && (
                        <div className="px-4 py-6 bg-white">
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                        </div>
                    )}
                </section>
                <section className="w-1/2 max-lg:w-full flex flex-col">
                    <div className="px-8 py-6 bg-white">
                        <h2 className="text-4xl !text-black font-bold mb-8">Resume Review</h2>
                        {feedback ? (
                            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                                <Summary feedback={feedback} />
                                {/* Details Component below summary */}
                                <Details feedback={feedback} />
                            </div>
                        ) : (
                            <img src="/images/resume-scan-2.gif" className="w-full" />
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}
export default Resume
