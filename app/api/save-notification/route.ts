// /app/api/save-notification/route.ts
import { NextResponse } from "next/server";
import { saveNotification } from "@/lib/mysql";

export async function POST(request: Request) {
  try {
    const notification = await request.json();
    const result = await saveNotification(notification);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}