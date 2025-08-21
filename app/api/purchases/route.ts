import { NextRequest, NextResponse } from "next/server"
import { savePurchase, onPurchasesChange } from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    return new Promise((resolve) => {
      onPurchasesChange((purchases) => {
        resolve(NextResponse.json({ data: purchases, error: null }))
      })
    })
  } catch (error: any) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const purchase = await request.json()
    const result = await savePurchase(purchase)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}