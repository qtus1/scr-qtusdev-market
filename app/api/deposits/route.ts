import { NextRequest, NextResponse } from "next/server"
import { saveDeposit, onDepositsChange } from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    return new Promise((resolve) => {
      onDepositsChange((deposits) => {
        resolve(NextResponse.json({ data: deposits, error: null }))
      })
    })
  } catch (error: any) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const deposit = await request.json()
    const result = await saveDeposit(deposit)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}