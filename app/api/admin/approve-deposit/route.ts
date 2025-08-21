import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, requestId, action } = await request.json()

    // In a real application, you would:
    // 1. Verify admin authentication
    // 2. Update database records
    // 3. Send notifications to user

    // For demo purposes, we'll return success
    const responseData = {
      success: true,
      message: action === 'approve' ? 'Deposit approved successfully' : 'Deposit rejected',
      userId,
      amount,
      requestId,
      timestamp: new Date().toISOString()
    }

    // Send notification back to Telegram
    if (action === 'approve') {
      const message = `✅ <b>NẠP TIỀN ĐÃ ĐƯỢC DUYỆT</b>

💰 Số tiền: ${amount.toLocaleString('vi-VN')}đ
👤 User ID: ${userId}
📝 Request ID: ${requestId}
⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}

<i>Tiền đã được cộng vào tài khoản người dùng.</i>`

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      })
    }
    // Return the response
    if (action === 'reject') {
      const message = `❌ <b>NẠP TIỀN ĐÃ BỊ TỪ CHỐI</b>

💰 Số tiền: ${amount.toLocaleString('vi-VN')}đ
👤 User ID: ${userId}
📝 Request ID: ${requestId}
⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}

<i>Vui lòng kiểm tra lại thông tin nạp tiền.</i>`

      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      })
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error processing deposit approval:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
