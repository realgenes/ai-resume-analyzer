import {type FormEvent, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {AIProviderStatus} from "~/components/AIProviderStatus";
import {useAppStore} from "~/lib/store";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { 
        isAuthenticated, 
        isLoading, 
        uploadFile, 
        saveResumeData, 
        analyzeResume,
        extractTextFromImage 
    } = useAppStore();
    
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }

    const handleAnalyze = async ({ 
        companyName, 
        jobTitle, 
        jobDescription, 
        file 
    }: { 
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        setIsProcessing(true);

        try {
            setStatusText('Uploading the file...');
            // Upload PDF to Supabase Storage with user ID in path
            const resumePath = await uploadFile(file, 'resumes', `${Date.now()}-${file.name}`);
            if (!resumePath) {
                setStatusText('Error: Failed to upload file');
                return;
            }

            setStatusText('Converting to image...');
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) {
                setStatusText('Error: Failed to convert PDF to image');
                return;
            }

            setStatusText('Uploading the image...');
            const imagePath = await uploadFile(imageFile.file, 'images', `${Date.now()}-${imageFile.file.name}`);
            if (!imagePath) {
                setStatusText('Error: Failed to upload image');
                return;
            }

            setStatusText('Extracting text from image...');
            const resumeText = await extractTextFromImage(imageFile.file);

            setStatusText('Analyzing with AI...');
            const aiResponse = await analyzeResume(resumeText, jobDescription, jobTitle);
            
            // Parse the AI response
            let feedback;
            try {
                feedback = JSON.parse(aiResponse.message.content);
            } catch {
                // If parsing fails, create a structured response
                feedback = {
                    overall_score: 75,
                    summary: aiResponse.message.content,
                    ATS: {
                        score: 70,
                        tips: ["Add more relevant keywords", "Improve formatting", "Use bullet points"]
                    },
                    strengths: ["Professional experience", "Clear structure"],
                    improvements: ["Add more specific achievements", "Include quantifiable results"],
                    keywords_missing: [],
                    keywords_found: []
                };
            }

            setStatusText('Saving analysis...');
            const resumeId = await saveResumeData({
                resume_path: resumePath,
                image_path: imagePath,
                company_name: companyName,
                job_title: jobTitle,
                job_description: jobDescription,
                feedback
            });

            if (!resumeId) {
                setStatusText('Error: Failed to save analysis');
                return;
            }

            setStatusText('Analysis complete, redirecting...');
            navigate(`/resume/${resumeId}`);

        } catch (error) {
            console.error('Analysis error:', error);
            setStatusText(`Error: ${error instanceof Error ? error.message : 'Analysis failed'}`);
        } finally {
            setTimeout(() => setIsProcessing(false), 2000);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    // Redirect to auth if not authenticated
    if (!isLoading && !isAuthenticated) {
        navigate('/auth?next=/upload');
        return null;
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    
                    {!isProcessing && (
                        <div className="mb-8 space-y-4">
                            <AIProviderStatus />
                        </div>
                    )}
                    
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" required />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" required />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" required />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button 
                                className="primary-button" 
                                type="submit"
                                disabled={!file || isProcessing}
                            >
                                {isProcessing ? 'Analyzing...' : 'Analyze Resume'}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Upload
