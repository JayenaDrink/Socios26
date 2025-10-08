import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseService } from '@/lib/supabase';

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

    const database = getDatabaseService();
    const matchingMembers = await database.searchMembers2025({ member_number, email });

    return NextResponse.json({
      success: true,
      data: {
        searchCriteria: { member_number, email },
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
