import { NextRequest, NextResponse } from 'next/server';
import { getGoogleDriveService } from '@/lib/googleDrive';
import { getExcelService } from '@/lib/excelService';
import db from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { member } = await request.json();

    if (!member || !member.member_number || !member.email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid member data provided' 
        },
        { status: 400 }
      );
    }

    const googleDrive = getGoogleDriveService();
    const excelService = getExcelService();

    // Check if member already exists in database
    const existingMember = db.prepare(
      'SELECT * FROM members WHERE member_number = ? OR email = ?'
    ).get(member.member_number, member.email);

    if (existingMember) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Member already exists in 2026 list' 
        },
        { status: 409 }
      );
    }

    // Prepare member data for 2026
    const member2026 = {
      ...member,
      year: 2026,
      is_active: true,
      source: '2025_list' as const,
      amount_paid: member.amount_paid || 35
    };

    // Insert into database
    const insertStmt = db.prepare(`
      INSERT INTO members (
        member_number, first_name, last_name, email, phone, 
        amount_paid, year, is_active, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      member2026.member_number,
      member2026.first_name,
      member2026.last_name,
      member2026.email,
      member2026.phone || '',
      member2026.amount_paid,
      member2026.year,
      member2026.is_active ? 1 : 0,
      member2026.source
    );

    const newMemberId = result.lastInsertRowid;

    // Update the 2026 Excel file in Google Drive
    await update2026ExcelFile(googleDrive, excelService);

    return NextResponse.json({
      success: true,
      data: {
        memberId: newMemberId,
        member: member2026,
        message: 'Member successfully transferred to 2026'
      }
    });
  } catch (error) {
    console.error('Error transferring member:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to transfer member' 
      },
      { status: 500 }
    );
  }
}

// Helper function to update 2026 Excel file
async function update2026ExcelFile(googleDrive: any, excelService: any) {
  try {
    // Get all 2026 members from database
    const members2026 = db.prepare('SELECT * FROM members WHERE year = 2026').all();

    // Convert to Excel buffer
    const excelBuffer = excelService.membersToExcelBuffer(members2026);

    // Find the 2026 Excel file
    const excelFiles = await googleDrive.findExcelFiles();
    
    if (excelFiles.list2026) {
      // Update existing file
      await googleDrive.updateFileContent(excelFiles.list2026.id, excelBuffer);
    } else {
      // Create new file
      const fileName = 'Lista Socios Club Amistades Belgas 2026.xlsx';
      await googleDrive.createFile(fileName, excelBuffer);
    }
  } catch (error) {
    console.error('Error updating 2026 Excel file:', error);
    throw error;
  }
}
