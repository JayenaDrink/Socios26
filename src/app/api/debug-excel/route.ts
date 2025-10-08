import { NextRequest, NextResponse } from 'next/server';
import { getExcelService } from '@/lib/excelService';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No file provided' 
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse Excel to see raw data
    const excelService = getExcelService();
    
    // Let's see the raw Excel data first
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Get headers from first row
    const headers = jsonData[0] as string[];
    
    // Show first few rows
    const sampleRows = jsonData.slice(0, 5);
    
    // Try to parse as members
    const members = excelService.parseExcelToMembers(buffer);

    return NextResponse.json({
      success: true,
      debug: {
        fileName: file.name,
        fileSize: file.size,
        sheetName: sheetName,
        headers: headers,
        sampleRows: sampleRows,
        totalRows: jsonData.length,
        parsedMembers: members.length,
        firstMember: members[0] || null
      }
    });
  } catch (error) {
    console.error('Error debugging Excel file:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to debug Excel file' 
      },
      { status: 500 }
    );
  }
}
