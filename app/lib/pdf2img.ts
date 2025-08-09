export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        // Set the worker source to use local file
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        isLoading = false;
        return lib;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        console.log('🔵 Starting PDF to image conversion...');
        
        const conversionPromise = (async () => {
            const lib = await loadPdfJs();
            console.log('🔵 PDF.js loaded, processing file...');

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
            console.log('🔵 PDF document loaded, pages:', pdf.numPages);
            
            const page = await pdf.getPage(1);
            console.log('🔵 First page loaded, creating canvas...');

            const viewport = page.getViewport({ scale: 4 });
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            if (context) {
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = "high";
            }

            console.log('🔵 Rendering page to canvas...');
            await page.render({ canvasContext: context!, viewport }).promise;
            console.log('🔵 Canvas render complete, creating blob...');

            return new Promise<PdfConversionResult>((resolve) => {
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // Create a File from the blob with the same name as the pdf
                            const originalName = file.name.replace(/\.pdf$/i, "");
                            const imageFile = new File([blob], `${originalName}.png`, {
                                type: "image/png",
                            });

                            console.log('🟢 PDF to image conversion successful:', imageFile.name, 'Size:', imageFile.size);
                            resolve({
                                imageUrl: URL.createObjectURL(blob),
                                file: imageFile,
                            });
                        } else {
                            console.error('🔴 Failed to create image blob');
                            resolve({
                                imageUrl: "",
                                file: null,
                                error: "Failed to create image blob",
                            });
                        }
                    },
                    "image/png",
                    1.0
                ); // Set quality to maximum (1.0)
            });
        })();

        // Add 30-second timeout
        const timeoutPromise = new Promise<PdfConversionResult>((_, reject) => {
            setTimeout(() => reject(new Error('PDF to image conversion timeout after 30 seconds')), 30000);
        });

        return await Promise.race([conversionPromise, timeoutPromise]);
    } catch (err) {
        console.error('🔴 PDF conversion error:', err);
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err instanceof Error ? err.message : err}`,
        };
    }
}
