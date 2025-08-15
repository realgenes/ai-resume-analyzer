// Optimized text extraction with better performance and memory management

// Cache for PDF.js library to avoid multiple loads
let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJsOptimized(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
        try {
            // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
            const lib = await import("pdfjs-dist/build/pdf.mjs");
            lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
            pdfjsLib = lib;
            return lib;
        } catch (error) {
            loadPromise = null; // Reset on error
            throw new Error('Failed to load PDF.js library');
        }
    })();

    return loadPromise;
}

// Optimized PDF text extraction with chunked processing
export async function extractTextFromPDF(file: File): Promise<string> {
    try {
        console.log('🔵 Starting optimized PDF text extraction...');
        
        // Load PDF.js library lazily
        const pdfjsLib = await loadPdfJsOptimized();

        console.log('🔵 Loading PDF document...');
        const arrayBuffer = await file.arrayBuffer();
        
        // Load PDF with timeout
        const pdf = await Promise.race([
            pdfjsLib.getDocument({ data: arrayBuffer }).promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('PDF loading timeout after 15 seconds')), 15000)
            )
        ]);
        
        console.log('🔵 PDF loaded, pages:', pdf.numPages);
        
        // Process pages in chunks to avoid memory issues
        const CHUNK_SIZE = 3; // Process 3 pages at a time
        let fullText = "";
        
        for (let startPage = 1; startPage <= pdf.numPages; startPage += CHUNK_SIZE) {
            const endPage = Math.min(startPage + CHUNK_SIZE - 1, pdf.numPages);
            console.log(`🔵 Processing pages ${startPage}-${endPage} of ${pdf.numPages}`);
            
            // Process chunk of pages in parallel
            const pagePromises = [];
            for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
                pagePromises.push(extractPageText(pdf, pageNum));
            }
            
            const chunkTexts = await Promise.all(pagePromises);
            fullText += chunkTexts.join("\n") + "\n";
            
            // Small delay to prevent blocking UI
            if (endPage < pdf.numPages) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        console.log('🟢 Text extraction complete, length:', fullText.length);
        return fullText.trim();
        
    } catch (error) {
        console.error("🔴 Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF: " + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

// Helper function to extract text from a single page
async function extractPageText(pdf: any, pageNum: number): Promise<string> {
    try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        return textContent.items
            .map((item: any) => item.str)
            .join(" ");
    } catch (error) {
        console.warn(`Failed to extract text from page ${pageNum}:`, error);
        return ""; // Continue with other pages
    }
}

// Optimized image text extraction placeholder
export async function extractTextFromImage(file: File): Promise<string> {
    console.warn("Image text extraction not implemented - using placeholder");
    return "Text extraction from images is not yet implemented. Please use PDF files for better text extraction.";
}

// Main text extraction function with file type detection
export async function extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type.toLowerCase();
    
    if (fileType === 'application/pdf') {
        return extractTextFromPDF(file);
    } else if (fileType.startsWith('image/')) {
        return extractTextFromImage(file);
    } else {
        throw new Error(`Unsupported file type: ${fileType}`);
    }
}
