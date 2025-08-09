// Simple text extraction utilities

// Extract text directly from PDF using PDF.js
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('🔵 Starting PDF text extraction...');
    
    // Add timeout to prevent hanging
    const extractionPromise = (async () => {
      // Dynamic import to avoid SSR issues - using same approach as pdf2img
      // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
      const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      console.log('🔵 Loading PDF document...');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      console.log('🔵 PDF loaded, pages:', pdf.numPages);
      let fullText = "";
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log('🔵 Processing page', pageNum, 'of', pdf.numPages);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        
        fullText += pageText + "\n";
      }
      
      console.log('🟢 Text extraction complete, length:', fullText.length);
      return fullText.trim();
    })();

    // Add 20-second timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('PDF text extraction timeout after 20 seconds')), 20000);
    });

    return await Promise.race([extractionPromise, timeoutPromise]);
  } catch (error) {
    console.error("🔴 Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF: " + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Fallback function for image-based text extraction
// This is a placeholder - in a real app you'd use an OCR service like Tesseract.js or cloud OCR
export async function extractTextFromImage(file: File): Promise<string> {
  // For now, return a placeholder message
  // In a real implementation, you would:
  // 1. Use Tesseract.js for client-side OCR
  // 2. Use a cloud OCR service (Google Vision, Azure Computer Vision, etc.)
  // 3. Send to a server-side OCR service
  
  console.warn("Image text extraction not implemented - using placeholder");
  return "Text extraction from images is not yet implemented. Please use PDF files for better text extraction.";
}

// Main text extraction function that handles both PDFs and images
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
