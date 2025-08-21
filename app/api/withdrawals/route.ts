import { NextRequest, NextResponse } from "next/server"
import { saveWithdrawal, onWithdrawalsChange } from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    return new Promise((resolve) => {
      onWithdrawalsChange((withdrawals) => {
        resolve(NextResponse.json({ data: withdrawals, error: null }))
      })
    })
  } catch (error: any) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const withdrawal = await request.json()
    const result = await saveWithdrawal(withdrawal)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}