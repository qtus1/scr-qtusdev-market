import { NextRequest, NextResponse } from 'next/server';
import { getUserData } from '@/lib/mysql';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-ID');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const result = await getUserData(userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API get user error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch user' }, { status: 500 });
  }
}