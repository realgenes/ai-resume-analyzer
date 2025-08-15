export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

// Cache for PDF.js library to avoid multiple loads
let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;
let isLoading = false;

// Optimized PDF.js loader with better error handling and caching
async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    
    loadPromise = (async () => {
        try {
            // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
            const lib = await import("pdfjs-dist/build/pdf.mjs");
            // Set the worker source to use local file
            lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
            pdfjsLib = lib;
            isLoading = false;
            return lib;
        } catch (error) {
            isLoading = false;
            loadPromise = null; // Reset on error to allow retry
            throw new Error('Failed to load PDF.js library');
        }
    })();

    return loadPromise;
}

// Optimized PDF to image conversion with memory management
export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
    try {
        console.log('🔵 Starting optimized PDF conversion...');
        
        // Load PDF.js library lazily
        const pdfjsLib = await loadPdfJs();
        
        // Convert file to ArrayBuffer more efficiently
        const arrayBuffer = await file.arrayBuffer();
        
        // Load PDF document with timeout
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await Promise.race([
            loadingTask.promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('PDF loading timeout')), 10000)
            )
        ]);

        console.log('🔵 PDF loaded, converting first page...');
        
        // Get only the first page for performance
        const page = await pdf.getPage(1);
        
        // Use lower scale for better performance (1.0 instead of 2.0)
        const scale = 1.0;
        const viewport = page.getViewport({ scale });

        // Create canvas with optimized settings
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
            throw new Error('Could not get canvas context');
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Optimize canvas rendering
        context.imageSmoothingEnabled = false; // Faster rendering
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        // Render with timeout
        await Promise.race([
            page.render(renderContext).promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('PDF rendering timeout')), 15000)
            )
        ]);

        console.log('🔵 PDF rendered, converting to blob...');

        // Convert to blob with optimized quality settings
        const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(new Error('Failed to convert canvas to blob'));
                }
            }, 'image/jpeg', 0.8); // Use JPEG with 80% quality for smaller size
        });

        // Create object URL
        const imageUrl = URL.createObjectURL(blob);
        
        // Create file from blob
        const imageFile = new File([blob], `${file.name}_preview.jpg`, { 
            type: 'image/jpeg' 
        });

        // Clean up canvas immediately
        canvas.width = 0;
        canvas.height = 0;

        console.log('🟢 PDF conversion completed successfully');
        
        return {
            imageUrl,
            file: imageFile
        };

    } catch (error) {
        console.error('🔴 PDF conversion error:', error);
        return {
            imageUrl: '',
            file: null,
            error: error instanceof Error ? error.message : 'PDF conversion failed'
        };
    }
}

// Cleanup function to revoke object URLs and free memory
export function cleanupPdfResources(imageUrl: string) {
    if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
    }
}
