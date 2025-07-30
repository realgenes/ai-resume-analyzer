import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "~/lib/store";

const WipeApp = () => {
    const { 
        isAuthenticated, 
        user,
        isLoading, 
        error, 
        clearError, 
        listFiles, 
        deleteFile,
        getUserResumes,
        deleteResumeData 
    } = useAppStore();
    
    const navigate = useNavigate();
    const [files, setFiles] = useState<any[]>([]);
    const [resumes, setResumes] = useState<any[]>([]);

    const loadFiles = async () => {
        const resumeFiles = await listFiles('resumes');
        const imageFiles = await listFiles('images');
        setFiles([...resumeFiles, ...imageFiles]);
        
        const userResumes = await getUserResumes();
        setResumes(userResumes);
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadFiles();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/auth?next=/wipe");
        }
    }, [isLoading, isAuthenticated, navigate]);

    const handleDelete = async () => {
        // Delete all files from storage
        for (const file of files) {
            const bucket = file.name.includes('resume') ? 'resumes' : 'images';
            await deleteFile(bucket, file.name);
        }
        
        // Delete all resume records from database
        for (const resume of resumes) {
            await deleteResumeData(resume.id);
        }
        
        loadFiles();
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error {error}</div>;
    }

    return (
        <div>
            Authenticated as: {user?.email}
            <div>Existing files: {files.length}</div>
            <div>Resume records: {resumes.length}</div>
            <div className="flex flex-col gap-4">
                {files.map((file, index) => (
                    <div key={file.id || index} className="flex flex-row gap-4">
                        <p>{file.name}</p>
                    </div>
                ))}
                {resumes.map((resume) => (
                    <div key={resume.id} className="flex flex-row gap-4">
                        <p>{resume.job_title} - {resume.company_name}</p>
                    </div>
                ))}
            </div>
            <div>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer"
                    onClick={() => handleDelete()}
                >
                    Delete All Data
                </button>
            </div>
        </div>
    );
};

export default WipeApp;
