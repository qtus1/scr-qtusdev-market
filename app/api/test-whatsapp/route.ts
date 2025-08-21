import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER
    const toNumber = 'whatsapp:+84328551707' // Admin WhatsApp number

    if (!accountSid || !authToken || !whatsappNumber) {
      return NextResponse.json(
        { error: 'WhatsApp/Twilio credentials not configured' },
        { status: 400 }
      )
    }

    const testMessage = `🧪 Test từ qtusdev market!

⏰ ${new Date().toLocaleString('vi-VN')}
🔧 WhatsApp API đang hoạt động bình thường!

Credentials:
- Account SID: ${accountSid}
- From: ${whatsappNumber}
- To: ${toNumber}`

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: whatsappNumber,
        To: toNumber,
        Body: testMessage
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('WhatsApp API error:', errorData)
      return NextResponse.json(
        { error: `WhatsApp API error: ${response.status} - ${errorData}` },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('WhatsApp test message sent successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'WhatsApp test message sent successfully!',
      messageId: result.sid,
      status: result.status
    })

  } catch (error) {
    console.error('Error sending WhatsApp test message:', error)
    return NextResponse.json(
      { error: 'Failed to send WhatsApp test message' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp Test API',
    usage: 'Send POST request to test WhatsApp integration',
    credentials: {
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 'Configured' : 'Missing',
      authToken: process.env.TWILIO_AUTH_TOKEN ? 'Configured' : 'Missing',
      whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'Missing'
    }
  })
}
