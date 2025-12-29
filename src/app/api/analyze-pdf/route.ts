import { NextRequest, NextResponse } from 'next/server';
import { analyzePDFDirectly } from '@/lib/pdf-skin-analysis/gemini-skin-analyzer';
import { readPDFAsBase64 } from '@/lib/pdf-skin-analysis/pdf-converter';
import path from 'path';
import fs from 'fs';

export const maxDuration = 60; // Maximum duration for Vercel

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let pdfBase64: string;
    let fileName: string;

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }

      fileName = file.name;
      const buffer = await file.arrayBuffer();
      pdfBase64 = Buffer.from(buffer).toString('base64');
    } else if (contentType.includes('application/json')) {
      // Handle JSON with base64 or file path
      const body = await request.json();

      if (body.base64) {
        pdfBase64 = body.base64;
        fileName = body.fileName || 'uploaded.pdf';
      } else if (body.filePath) {
        // Read from local file path (for development/testing)
        const absolutePath = path.resolve(body.filePath);

        if (!fs.existsSync(absolutePath)) {
          return NextResponse.json(
            { error: `File not found: ${body.filePath}` },
            { status: 404 }
          );
        }

        pdfBase64 = await readPDFAsBase64(absolutePath);
        fileName = path.basename(body.filePath);
      } else {
        return NextResponse.json(
          { error: 'No file data provided. Send either base64 or filePath' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid content type. Use multipart/form-data or application/json' },
        { status: 400 }
      );
    }

    // Validate PDF
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    console.log(`Starting PDF analysis for: ${fileName}`);
    console.log(`PDF size: ${Math.round(pdfBase64.length * 0.75 / 1024)} KB`);

    // Perform the analysis
    const analysis = await analyzePDFDirectly(pdfBase64, fileName);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('PDF analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing with local file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file');

    if (!filePath) {
      return NextResponse.json({
        message: 'PDF Skin Analysis API',
        usage: {
          POST: {
            'multipart/form-data': 'Upload PDF file with key "file"',
            'application/json': {
              base64: 'Base64 encoded PDF content',
              fileName: 'Optional filename',
              filePath: 'Or local file path for testing',
            },
          },
          GET: {
            file: 'Local file path for testing (e.g., ?file=/path/to/analysis.pdf)',
          },
        },
        example: 'POST /api/analyze-pdf with PDF file',
      });
    }

    // Read and analyze the specified file
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json(
        { error: `File not found: ${filePath}` },
        { status: 404 }
      );
    }

    const pdfBase64 = await readPDFAsBase64(absolutePath);
    const fileName = path.basename(filePath);

    console.log(`Analyzing file: ${fileName}`);

    const analysis = await analyzePDFDirectly(pdfBase64, fileName);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('PDF analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
