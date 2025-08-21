
import { NextRequest, NextResponse } from 'next/server';
import { saveUser } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const user = await request.json();
    await saveUser(user);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API save user error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save user' }, { status: 500 });
  }
}