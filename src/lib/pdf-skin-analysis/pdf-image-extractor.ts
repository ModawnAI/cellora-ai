import { pdf } from 'pdf-to-img';
import * as fs from 'fs';
import * as path from 'path';

export interface ExtractedPage {
  pageNumber: number;
  imagePath: string;
  imageBase64: string;
  width: number;
  height: number;
}

export interface ExtractionResult {
  totalPages: number;
  outputDir: string;
  pages: ExtractedPage[];
}

/**
 * Extract all pages from a PDF as PNG images
 * @param pdfPath - Path to the PDF file
 * @param outputDir - Directory to save extracted images (optional)
 * @param scale - Scale factor for image quality (default 2.0 for high quality)
 */
export async function extractPDFImages(
  pdfPath: string,
  outputDir?: string,
  scale: number = 2.0
): Promise<ExtractionResult> {
  // Create output directory if not specified
  const pdfName = path.basename(pdfPath, '.pdf');
  const defaultOutputDir = path.join(path.dirname(pdfPath), `${pdfName}_images`);
  const targetDir = outputDir || defaultOutputDir;

  // Ensure output directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Extracting images from: ${pdfPath}`);
  console.log(`Output directory: ${targetDir}`);

  const pages: ExtractedPage[] = [];
  let pageNumber = 1;

  // Convert PDF to images
  const document = await pdf(pdfPath, { scale });

  for await (const image of document) {
    const imagePath = path.join(targetDir, `page_${pageNumber.toString().padStart(2, '0')}.png`);

    // Write image to file
    fs.writeFileSync(imagePath, image);

    // Convert to base64 for API usage
    const imageBase64 = image.toString('base64');

    // Get image dimensions (approximate from buffer size and scale)
    // For more accurate dimensions, we'd need to parse the PNG header
    const page: ExtractedPage = {
      pageNumber,
      imagePath,
      imageBase64,
      width: 0, // Will be populated if needed
      height: 0,
    };

    pages.push(page);
    console.log(`  Extracted page ${pageNumber}: ${imagePath}`);
    pageNumber++;
  }

  console.log(`\nExtraction complete! ${pages.length} pages extracted.`);

  return {
    totalPages: pages.length,
    outputDir: targetDir,
    pages,
  };
}

/**
 * Extract images from a PDF buffer (for API usage)
 * @param pdfBuffer - PDF file as a Buffer
 * @param scale - Scale factor for image quality
 */
export async function extractPDFImagesFromBuffer(
  pdfBuffer: Buffer,
  scale: number = 2.0
): Promise<{ pageNumber: number; imageBase64: string; mimeType: string }[]> {
  const pages: { pageNumber: number; imageBase64: string; mimeType: string }[] = [];
  let pageNumber = 1;

  const document = await pdf(pdfBuffer, { scale });

  for await (const image of document) {
    pages.push({
      pageNumber,
      imageBase64: image.toString('base64'),
      mimeType: 'image/png',
    });
    pageNumber++;
  }

  return pages;
}

/**
 * Extract a specific page range from a PDF
 * @param pdfPath - Path to the PDF file
 * @param startPage - Start page number (1-indexed)
 * @param endPage - End page number (inclusive)
 * @param outputDir - Directory to save extracted images
 */
export async function extractPDFPageRange(
  pdfPath: string,
  startPage: number,
  endPage: number,
  outputDir?: string,
  scale: number = 2.0
): Promise<ExtractionResult> {
  const pdfName = path.basename(pdfPath, '.pdf');
  const defaultOutputDir = path.join(path.dirname(pdfPath), `${pdfName}_images`);
  const targetDir = outputDir || defaultOutputDir;

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Extracting pages ${startPage}-${endPage} from: ${pdfPath}`);

  const pages: ExtractedPage[] = [];
  let pageNumber = 1;

  const document = await pdf(pdfPath, { scale });

  for await (const image of document) {
    if (pageNumber >= startPage && pageNumber <= endPage) {
      const imagePath = path.join(targetDir, `page_${pageNumber.toString().padStart(2, '0')}.png`);

      fs.writeFileSync(imagePath, image);

      pages.push({
        pageNumber,
        imagePath,
        imageBase64: image.toString('base64'),
        width: 0,
        height: 0,
      });

      console.log(`  Extracted page ${pageNumber}: ${imagePath}`);
    }
    pageNumber++;
  }

  return {
    totalPages: pages.length,
    outputDir: targetDir,
    pages,
  };
}
