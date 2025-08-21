import { NextRequest, NextResponse } from "next/server"
import { getUserData, saveUserData, onUsersChange } from "@/lib/mysql"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (userId) {
      const result = await getUserData(userId)
      return NextResponse.json(result)
    } else {
      // Return all users
      return new Promise((resolve) => {
        onUsersChange((users) => {
          resolve(NextResponse.json({ data: users, error: null }))
        })
      })
    }
  } catch (error: any) {
    return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userData } = body
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }
    
    const result = await saveUserData(userId, userData)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}