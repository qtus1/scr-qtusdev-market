import { NextRequest, NextResponse } from "next/server"
import { saveNotification } from "@/lib/mysql"

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()
    const result = await saveNotification(notification)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}