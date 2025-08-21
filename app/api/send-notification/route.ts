import { type NextRequest, NextResponse } from "next/server"

// Telegram and WhatsApp notification service
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"

// Device and IP detection utilities
const getDeviceInfo = (userAgent: string) => {
  let deviceType = "Desktop"
  let browser = "Unknown"
  let os = "Unknown"

  // Device Type Detection
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPad/.test(userAgent)) {
      deviceType = "Tablet"
    } else {
      deviceType = "Mobile"
    }
  }

  // Browser Detection
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"

  // OS Detection
  if (userAgent.includes("Windows")) os = "Windows"
  else if (userAgent.includes("Mac")) os = "macOS"
  else if (userAgent.includes("Linux")) os = "Linux"
  else if (userAgent.includes("Android")) os = "Android"
  else if (userAgent.includes("iOS")) os = "iOS"

  return { deviceType, browser, os }
}

const getIPAddress = async (request: NextRequest) => {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIp) {
    return realIp
  }

  return "Unknown"
}

// Send Telegram notification
const sendTelegramNotification = async (message: string) => {
  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.warn("Telegram credentials not configured")
      return { success: false, error: "Telegram credentials missing" }
    }

    const response = await fetch(`https://api.telegram.org/bot8321367297:AAGsBmML0vZ9rgLnZT5GSnP2u_NohwcIA3E/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    })

    const result = await response.json()

    if (result.ok) {
      console.log("Telegram notification sent successfully")
      return { success: true, data: result }
    } else {
      console.error("Telegram API error:", result)
      return { success: false, error: result.description }
    }
  } catch (error: any) {
    console.error("Error sending Telegram notification:", error)
    return { success: false, error: error.message }
  }
}

// Send WhatsApp notification via Twilio
const sendWhatsAppNotification = async (message: string, to = "+84328551707") => {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.warn("Twilio credentials not configured")
      return { success: false, error: "Twilio credentials missing" }
    }

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: `whatsapp:${to}`,
        Body: message,
      }),
    })

    const result = await response.json()

    if (response.ok) {
      console.log("WhatsApp notification sent successfully")
      return { success: true, data: result }
    } else {
      console.error("Twilio API error:", result)
      return { success: false, error: result.message }
    }
  } catch (error: any) {
    console.error("Error sending WhatsApp notification:", error)
    return { success: false, error: error.message }
  }
}

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()
    const userAgent = request.headers.get("user-agent") || "Unknown"
    const ipAddress = await getIPAddress(request)
    const deviceInfo = getDeviceInfo(userAgent)

    let telegramMessage = ""
    let whatsappMessage = ""

    // Format messages based on notification type
    switch (notification.type) {
      case "user_registration":
        telegramMessage = `👤 <b>NGƯỜI DÙNG MỚI</b>

👤 <b>Tên:</b> ${notification.user?.name || "Unknown"}
📧 <b>Email:</b> ${notification.user?.email || "Unknown"}
📱 <b>Điện thoại:</b> ${notification.user?.phone || "Không có"}
📍 <b>Địa chỉ:</b> ${notification.user?.address || "Không có"}

📱 <b>Thiết bị:</b> ${deviceInfo.deviceType} - ${deviceInfo.browser}
💻 <b>OS:</b> ${deviceInfo.os}
🌐 <b>IP:</b> ${ipAddress}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}

<i>Có người dùng mới đăng ký tài khoản!</i>`

        whatsappMessage = `👤 NGƯỜI DÙNG MỚI

👤 Tên: ${notification.user?.name || "Unknown"}
📧 Email: ${notification.user?.email || "Unknown"}
📱 Điện thoại: ${notification.user?.phone || "Không có"}
📍 Địa chỉ: ${notification.user?.address || "Không có"}
📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}
🌐 IP: ${ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Có người dùng mới đăng ký tài khoản!`
        break

      case "user_login":
        telegramMessage = `🔐 <b>ĐĂNG NHẬP</b>

👤 <b>Người dùng:</b> ${notification.user?.name || "Unknown"}
📧 <b>Email:</b> ${notification.user?.email || "Unknown"}
📱 <b>Thiết bị:</b> ${deviceInfo.deviceType} - ${deviceInfo.browser}
💻 <b>OS:</b> ${deviceInfo.os}
🌐 <b>IP:</b> ${ipAddress}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}

<i>Người dùng đã đăng nhập vào hệ thống!</i>`

        whatsappMessage = `🔐 ĐĂNG NHẬP

👤 Người dùng: ${notification.user?.name || "Unknown"}
📧 Email: ${notification.user?.email || "Unknown"}
📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}
🌐 IP: ${ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Người dùng đã đăng nhập vào hệ thống!`
        break

      case "admin_login":
        telegramMessage = `🔐 <b>ADMIN ĐĂNG NHẬP</b>

👨‍💻 <b>Administrator:</b> ${notification.admin?.name || "Admin"}
📧 <b>Email:</b> ${notification.admin?.email || "Unknown"}
📱 <b>Thiết bị:</b> ${deviceInfo.deviceType} - ${deviceInfo.browser}
💻 <b>OS:</b> ${deviceInfo.os}
🌐 <b>IP:</b> ${ipAddress}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}

<i>Admin đã truy cập vào hệ thống quản lý!</i>`

        whatsappMessage = `🔐 ADMIN ĐĂNG NHẬP

👨‍💻 Administrator: ${notification.admin?.name || "Admin"}
📧 Email: ${notification.admin?.email || "Unknown"}
📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}
🌐 IP: ${ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Admin đã truy cập vào hệ thống quản lý!`
        break

      case "password_reset":
        telegramMessage = `🔑 <b>ĐỔI MẬT KHẨU</b>

👤 <b>Người dùng:</b> ${notification.user?.name || "Unknown"}
📧 <b>Email:</b> ${notification.user?.email || "Unknown"}
📱 <b>Thiết bị:</b> ${deviceInfo.deviceType} - ${deviceInfo.browser}
💻 <b>OS:</b> ${deviceInfo.os}
🌐 <b>IP:</b> ${notification.ip || ipAddress}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}

<i>Người dùng đã yêu cầu đổi mật khẩu!</i>`

        whatsappMessage = `🔑 ĐỔI MẬT KHẨU

👤 Người dùng: ${notification.user?.name || "Unknown"}
📧 Email: ${notification.user?.email || "Unknown"}
📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}
🌐 IP: ${notification.ip || ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Người dùng đã yêu cầu đổi mật khẩu!`
        break

      case "change_password":
        telegramMessage = `🔑 <b>ĐỔI MẬT KHẨU</b>

👤 <b>Người dùng:</b> ${notification.user?.name || "Unknown"}
📧 <b>Email:</b> ${notification.user?.email || "Unknown"}
📱 <b>Thiết bị:</b> ${deviceInfo.deviceType} - ${deviceInfo.browser}
💻 <b>OS:</b> ${deviceInfo.os}
🌐 <b>IP:</b> ${notification.ip || ipAddress}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}

<i>Người dùng đã đổi mật khẩu thành công!</i>`

        whatsappMessage = `🔑 ĐỔI MẬT KHẨU

👤 Người dùng: ${notification.user?.name || "Unknown"}
📧 Email: ${notification.user?.email || "Unknown"}
📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}
🌐 IP: ${notification.ip || ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Người dùng đã đổi mật khẩu thành công!`
        break

      default:
        telegramMessage = `📢 <b>THÔNG BÁO</b>

📝 <b>Tiêu đề:</b> ${notification.title || "Không có tiêu đề"}
💬 <b>Nội dung:</b> ${notification.message || "Không có nội dung"}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}`

        whatsappMessage = `📢 THÔNG BÁO

📝 Tiêu đề: ${notification.title || "Không có tiêu đề"}
💬 Nội dung: ${notification.message || "Không có nội dung"}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}`
        break
    }

    // Send notifications (non-blocking)
    sendTelegramNotification(telegramMessage).catch(error => {
      console.error("Failed to send Telegram notification:", error)
    })
    sendWhatsAppNotification(whatsappMessage).catch(error => {
      console.error("Failed to send WhatsApp notification:", error)
    })

    return NextResponse.json({
      success: true,
      deviceInfo,
      ipAddress,
    })
  } catch (error: any) {
    console.error("Notification API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
