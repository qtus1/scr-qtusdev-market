import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API send telegram error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
    }
    }
    