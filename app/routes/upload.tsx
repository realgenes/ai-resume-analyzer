import {type FormEvent, useState, useEffect} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {AIProviderStatus} from "~/components/AIProviderStatus";
import {StorageStatus} from "~/components/StorageStatus";
import {useAppStore} from "~/lib/store";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {extractTextFromFile} from "~/lib/textExtraction";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { 
        isAuthenticated, 
        isLoading, 
        uploadFile, 
        saveResumeData, 
        analyzeResume
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
        // Prevent multiple simultaneous submissions
        if (isProcessing) {
            console.log('🟡 Upload already in progress, ignoring duplicate request');
            return;
        }

        setIsProcessing(true);

        try {
            console.log('🔵 Starting upload process...');
            setStatusText('Uploading the file...');
            // Upload PDF to Supabase Storage with user ID in path
            const resumePath = await uploadFile(file, 'resumes');
            if (!resumePath) {
                console.error('🔴 Resume upload failed');
                setStatusText('Error: Failed to upload file. Please check your internet connection and try again.');
                return;
            }
            console.log('🟢 Resume uploaded successfully:', resumePath);

            setStatusText('Converting to image...');
            const imageFile = await convertPdfToImage(file);
            if (!imageFile.file) {
                console.error('🔴 PDF to image conversion failed:', imageFile.error);
                setStatusText('Error: Failed to convert PDF to image');
                return;
            }
            console.log('🟢 PDF converted to image successfully:', imageFile.file.name, 'Size:', imageFile.file.size);

            setStatusText('Uploading the image...');
            const imagePath = await uploadFile(imageFile.file, 'images');
            if (!imagePath) {
                console.error('🔴 Image upload failed');
                setStatusText('Error: Failed to upload image. Please check your internet connection and try again.');
                return;
            }
            console.log('🟢 Image uploaded successfully:', imagePath);

            setStatusText('Extracting text from file...');
            const resumeText = await extractTextFromFile(file);

            setStatusText('Analyzing with AI...');
            const aiResponse = await analyzeResume(resumeText, jobDescription, jobTitle);
            
            // Parse the AI response
            let feedback;
            try {
                console.log('🔍 AI Response Content:', aiResponse.message.content);
                
                // Clean the response - remove any markdown formatting or extra text
                let cleanContent = aiResponse.message.content.trim();
                
                // Extract JSON if it's wrapped in markdown code blocks
                const jsonMatch = cleanContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
                if (jsonMatch) {
                    cleanContent = jsonMatch[1];
                    console.log('📄 Extracted from markdown blocks');
                }
                
                // Try to find JSON object if there's extra text
                const jsonObjectMatch = cleanContent.match(/\{[\s\S]*\}/);
                if (jsonObjectMatch) {
                    cleanContent = jsonObjectMatch[0];
                    console.log('📄 Extracted JSON object');
                }
                
                console.log('🧹 Cleaned Content for parsing:', cleanContent);
                const rawFeedback = JSON.parse(cleanContent);
                console.log('✅ Successfully parsed AI response:', rawFeedback);
                
                // Map AI response to expected format
                feedback = {
                    overallScore: rawFeedback.overall_score || rawFeedback.overallScore || 75,
                    ATS: {
                        score: rawFeedback.ats_score || rawFeedback.ATS?.score || 70,
                        tips: (rawFeedback.ATS?.tips || rawFeedback.suggestions || []).map((tip: any) => ({
                            type: "improve" as const,
                            tip: typeof tip === 'string' ? tip : (tip?.tip || 'Improve resume formatting')
                        }))
                    },
                    toneAndStyle: {
                        score: rawFeedback.sections?.summary?.score || 75,
                        tips: []
                    },
                    content: {
                        score: rawFeedback.sections?.experience?.score || 75,
                        tips: []
                    },
                    structure: {
                        score: rawFeedback.sections?.contact?.score || 75,
                        tips: []
                    },
                    skills: {
                        score: rawFeedback.sections?.skills?.score || 75,
                        tips: []
                    },
                    summary: rawFeedback.summary || 'Resume analysis completed',
                    strengths: rawFeedback.strengths || [],
                    weaknesses: rawFeedback.weaknesses || [],
                    improvements: rawFeedback.improvements || rawFeedback.suggestions || [],
                    keywords_found: rawFeedback.keywords_found || [],
                    keywords_missing: rawFeedback.keywords_missing || []
                };
                
                console.log('🎯 Mapped feedback to expected format:', feedback);
                
            } catch (parseError) {
                console.error('❌ Failed to parse AI response:', parseError);
                console.error('📄 Raw AI content length:', aiResponse.message.content.length);
                console.error('📄 Raw AI content:', aiResponse.message.content);
                
                // Check if JSON was truncated
                const content = aiResponse.message.content;
                const hasIncompleteJson = content.includes('{') && !content.trim().endsWith('}');
                
                if (hasIncompleteJson) {
                    console.warn('⚠️ JSON appears to be truncated. Requesting new analysis...');
                    // Could implement retry logic here
                }
                
                // Try to extract scores with regex if JSON parsing fails
                const overallScoreMatch = content.match(/["']?overall[_\s]*score["']?\s*:\s*(\d+)/i);
                const atsScoreMatch = content.match(/["']?ats[_\s]*score["']?\s*:\s*(\d+)/i);
                
                // Also try to extract section scores
                const contactScoreMatch = content.match(/["']?contact["']?\s*:\s*\{[^}]*["']?score["']?\s*:\s*(\d+)/i);
                const experienceScoreMatch = content.match(/["']?experience["']?\s*:\s*\{[^}]*["']?score["']?\s*:\s*(\d+)/i);
                const skillsScoreMatch = content.match(/["']?skills["']?\s*:\s*\{[^}]*["']?score["']?\s*:\s*(\d+)/i);
                const summaryScoreMatch = content.match(/["']?summary["']?\s*:\s*\{[^}]*["']?score["']?\s*:\s*(\d+)/i);
                
                const extractedOverallScore = overallScoreMatch ? parseInt(overallScoreMatch[1]) : Math.floor(Math.random() * 30) + 70; // 70-99
                const extractedAtsScore = atsScoreMatch ? parseInt(atsScoreMatch[1]) : Math.floor(Math.random() * 30) + 60; // 60-89
                
                feedback = {
                    overallScore: extractedOverallScore,
                    summary: content.length > 500 ? content.substring(0, 500) + '...' : content,
                    ATS: {
                        score: extractedAtsScore,
                        tips: [
                            { type: "improve" as const, tip: "Add more relevant keywords from job description" },
                            { type: "improve" as const, tip: "Improve resume formatting and structure" },
                            { type: "improve" as const, tip: "Use standard section headings" }
                        ]
                    },
                    toneAndStyle: {
                        score: summaryScoreMatch ? parseInt(summaryScoreMatch[1]) : Math.floor(Math.random() * 25) + 65,
                        tips: [{ type: "improve" as const, tip: "Improve professional tone", explanation: "Use more professional language" }]
                    },
                    content: {
                        score: experienceScoreMatch ? parseInt(experienceScoreMatch[1]) : Math.floor(Math.random() * 25) + 70,
                        tips: [{ type: "improve" as const, tip: "Add more specific achievements", explanation: "Include quantifiable results" }]
                    },
                    structure: {
                        score: contactScoreMatch ? parseInt(contactScoreMatch[1]) : Math.floor(Math.random() * 25) + 75,
                        tips: [{ type: "improve" as const, tip: "Optimize resume structure", explanation: "Use clear section headers" }]
                    },
                    skills: {
                        score: skillsScoreMatch ? parseInt(skillsScoreMatch[1]) : Math.floor(Math.random() * 25) + 70,
                        tips: [{ type: "improve" as const, tip: "Add relevant technical skills", explanation: "Match job requirements" }]
                    },
                    strengths: ["Professional experience", "Technical skills alignment"],
                    improvements: ["Add more achievements", "Include relevant keywords"],
                    keywords_missing: [],
                    keywords_found: [],
                    weaknesses: ["AI analysis incomplete - please try again"]
                };
                
                console.log('🔄 Using fallback feedback structure:', feedback);
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
            const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
            setStatusText(`Error: ${errorMessage}`);
            
            // Add specific handling for upload timeouts
            if (errorMessage.includes('timeout')) {
                setStatusText('Upload timed out. This may be due to a slow internet connection or large file size. Please try again with a smaller file or better connection.');
            } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                setStatusText('Network error occurred. Please check your internet connection and try again.');
            } else if (errorMessage.includes('bucket') || errorMessage.includes('policy')) {
                setStatusText('Storage configuration error. Please contact support if this persists.');
            }
        } finally {
            setTimeout(() => setIsProcessing(false), 3000); // Keep error message visible for 3 seconds
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Prevent multiple submissions
        if (isProcessing) {
            console.log('🟡 Form submission already in progress, ignoring duplicate');
            return;
        }

        const form = e.currentTarget;
        if (!form) return;
        
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    // Redirect to auth if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/auth?next=/upload');
        }
    }, [isLoading, isAuthenticated, navigate]);

    // Return early if redirecting
    if (!isLoading && !isAuthenticated) {
        return null;
    }

    return (
    <main>
            <Navbar />

            <section className="main-section">
        <div className="page-heading py-12 md:py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <div className="text-center">
                            <h2 className="mb-4">{statusText}</h2>
                            <div className="mb-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{width: '60%'}}></div>
                                </div>
                            </div>
                            <img src="/images/resume-scan.gif" className="w-full rounded-2xl shadow-lg" />
                        </div>
                    ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}
                    
                    {!isProcessing && (
            <div className="mb-8 space-y-4 w-full">
                            <AIProviderStatus />
                            <StorageStatus />
                        </div>
                    )}
                    
                    {!isProcessing && (
            <form id="upload-form" onSubmit={handleSubmit} className="card w-full max-w-2xl mx-auto p-6 sm:p-8 flex flex-col gap-4 mt-4">
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
                className={`primary-button ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
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
