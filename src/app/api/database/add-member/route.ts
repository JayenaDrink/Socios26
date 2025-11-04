import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { member_number, first_name, last_name, email, phone, amount_paid, year, database } = body;

    // Validate required fields
    if (!member_number || !first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate database selection
    if (!['2025', '2026'].includes(database)) {
      return NextResponse.json(
        { success: false, error: 'Invalid database selection' },
        { status: 400 }
      );
    }

    const dbService = new DatabaseService();

    // Prepare member data
    const memberData = {
      member_number,
      first_name,
      last_name,
      email,
      phone: phone || '',
      amount_paid: amount_paid || 35,
      year: year || (database === '2025' ? 2025 : 2026),
      is_active: true,
      source: 'form' as const
    };

    let result;

    if (database === '2025') {
      // Add to 2025 database only
      result = await dbService.addMemberTo2025(memberData);
    } else {
      // Add to 2026 database with MailChimp sync
      result = await dbService.addMemberTo2026(memberData);
    }

    return NextResponse.json({
      success: true,
      member: result,
      message: `Member successfully added to ${database} database and MailChimp`
    });

  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add member' 
      },
      { status: 500 }
    );
  }
}
