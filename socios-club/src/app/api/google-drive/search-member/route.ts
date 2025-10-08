import { NextRequest, NextResponse } from 'next/server';
import { getGoogleDriveService } from '@/lib/googleDrive';
import { getExcelService } from '@/lib/excelService';

export async function POST(request: NextRequest) {
  try {
    const { member_number, email } = await request.json();

    if (!member_number && !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Either member_number or email is required' 
        },
        { status: 400 }
      );
    }

    const googleDrive = getGoogleDriveService();
    const excelService = getExcelService();

    // Find and read the 2025 Excel file
    const excelFiles = await googleDrive.findExcelFiles();
    
    if (!excelFiles.list2025) {
      return NextResponse.json(
        { 
          success: false, 
          error: '2025 Excel file not found in Google Drive' 
        },
        { status: 404 }
      );
    }

    // Get file content
    const fileBuffer = await googleDrive.getFileContent(excelFiles.list2025.id);
    
    // Parse Excel to members
    const allMembers = excelService.parseExcelToMembers(fileBuffer);
    
    // Search for matching members
    const searchCriteria = { member_number, email };
    const matchingMembers = excelService.searchMembers(allMembers, searchCriteria);

    return NextResponse.json({
      success: true,
      data: {
        searchCriteria,
        members: matchingMembers,
        count: matchingMembers.length
      }
    });
  } catch (error) {
    console.error('Error searching members:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to search members' 
      },
      { status: 500 }
    );
  }
}
