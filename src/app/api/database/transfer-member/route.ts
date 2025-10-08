import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseService } from '@/lib/supabase';

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

    const database = getDatabaseService();
    const transferredMember = await database.transferMemberTo2026(member);

    return NextResponse.json({
      success: true,
      data: {
        member: transferredMember,
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
