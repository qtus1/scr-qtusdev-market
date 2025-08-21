// Telegram and WhatsApp notification service
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"

// Device and IP detection utilities
export const getDeviceInfo = () => {
  if (typeof window === "undefined") return { deviceType: "Server", browser: "Unknown", os: "Unknown" }

  const userAgent = navigator.userAgent
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

interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  joinDate: string;
  balance: number;
  totalSpent: number;
  status: "active" | "banned";
  deviceInfo: DeviceInfo;
  ipAddress: string;
  registrationTime: string;
  lastLogin: string;
  lastLoginTime: string;
  currentDeviceInfo: DeviceInfo;
  currentIP: string;
  loginCount: number;
  provider: "email" | "google" | "github" | "facebook";
}

interface DeviceInfo {
  deviceType: string;
  browser: string;
  os: string;
}
// Get all IP addresses (local and public)
export const getIPAddress = async (): Promise<string> => {
  // Try to get public IP
  let publicIP = "Unknown"
  try {
    const response = await fetch("https://api.ipify.org?format=json")
    const data = await response.json()
    publicIP = data.ip
  } catch (error) {
    console.error("Error getting public IP:", error)
  }

  // Try to get local IPs (browser only)
  let localIPs: string[] = []
  if (typeof window !== "undefined" && window.RTCPeerConnection) {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] })
      pc.createDataChannel("")
      pc.createOffer().then(offer => pc.setLocalDescription(offer))
      pc.onicecandidate = event => {
        if (event && event.candidate && event.candidate.candidate) {
          const ipMatch = event.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/)
          if (ipMatch && ipMatch[1] && !localIPs.includes(ipMatch[1])) {
            localIPs.push(ipMatch[1])
          }
        }
      }
      // Wait for ICE gathering to finish
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      console.error("Error getting local IPs:", err)
    }
  }

  const allIPs = [...localIPs, publicIP].filter(ip => ip !== "Unknown")
  return allIPs.length > 0 ? allIPs.join(", ") : "Unknown"
}

// Send Telegram notification
export const sendTelegramNotification = async (message: string) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram credentials not configured")
    return
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Telegram API error:", response.status, errorData);
    }
  } catch (error) {
    console.error("Error sending Telegram notification:", error);
  }
}

// Send WhatsApp notification via Twilio
export const sendWhatsAppNotification = async (message: string, to = "+14155238886") => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn("Twilio credentials not configured")
    return
  }

  try {
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
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Twilio API error:", response.status, errorData);
    }
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
  }
}

// Purchase notification
export const sendPurchaseNotification = async (purchaseData: any) => {
  const deviceInfo = getDeviceInfo()
  const ipAddress = await getIPAddress()

  const telegramMessage = `🛒 <b>ĐƠN HÀNG MỚI</b>

👤 <b>Khách hàng:</b> ${purchaseData.userName}
📧 <b>Email:</b> ${purchaseData.userEmail}
🛍️ <b>Sản phẩm:</b> ${purchaseData.productTitle}
💰 <b>Giá:</b> ${purchaseData.amount.toLocaleString("vi-VN")}đ

📱 <b>Thiết bị:</b> ${deviceInfo.deviceType} - ${deviceInfo.browser}
💻 <b>OS:</b> ${deviceInfo.os}
🌐 <b>IP:</b> ${ipAddress}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}

<a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">🔗 Xem trong Admin</a>`

  const whatsappMessage = `🛒 ĐƠN HÀNG MỚI

👤 Khách hàng: ${purchaseData.userName}
📧 Email: ${purchaseData.userEmail}
🛍️ Sản phẩm: ${purchaseData.productTitle}
💰 Giá: ${purchaseData.amount.toLocaleString("vi-VN")}đ
📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}
🌐 IP: ${ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Có đơn hàng mới cần xử lý!`

  try {
    await sendTelegramNotification(telegramMessage)
  } catch (error) {
    console.error("Error sending Telegram notification for purchase:", error)
  }

  try {
    await sendWhatsAppNotification(whatsappMessage)
  } catch (error) {
    console.error("Error sending WhatsApp notification for purchase:", error)
  }
}

// Deposit notification
export const sendDepositNotification = async (depositData: any) => {
  const deviceInfo = getDeviceInfo()
  const ipAddress = "Unknown" // Non-blocking version doesn't return a value

  const telegramMessage = `💳 <b>YÊU CẦU NẠP TIỀN</b>

👤 <b>Khách hàng:</b> ${depositData.userName}
📧 <b>Email:</b> ${depositData.userEmail}
💰 <b>Số tiền:</b> ${depositData.amount.toLocaleString("vi-VN")}đ
🏦 <b>Phương thức:</b> ${depositData.method}
📝 <b>Mã GD:</b> ${depositData.transactionId}

📱 <b>Thiết bị:</b> ${deviceInfo.deviceType} - ${deviceInfo.browser}
💻 <b>OS:</b> ${deviceInfo.os}
🌐 <b>IP:</b> ${ipAddress}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}

<a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">🔗 Duyệt trong Admin</a>`

  const whatsappMessage = `💳 YÊU CẦU NẠP TIỀN

👤 Khách hàng: ${depositData.userName}
📧 Email: ${depositData.userEmail}
💰 Số tiền: ${depositData.amount.toLocaleString("vi-VN")}đ
🏦 Phương thức: ${depositData.method}
📝 Mã GD: ${depositData.transactionId}
📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}
🌐 IP: ${ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Vui lòng kiểm tra và duyệt yêu cầu!`

  try {
    await sendTelegramNotification(telegramMessage)
  } catch (error) {
    console.error("Error sending Telegram notification for deposit:", error)
  }

  try {
    await sendWhatsAppNotification(whatsappMessage)
  } catch (error) {
    console.error("Error sending WhatsApp notification for deposit:", error)
  }
}

// Withdrawal notification
export const sendWithdrawalNotification = async (withdrawalData: any) => {
  const deviceInfo = getDeviceInfo()
  const ipAddress = "Unknown" // Non-blocking version doesn't return a value

  const telegramMessage = `💸 <b>YÊU CẦU RÚT TIỀN</b>

👤 <b>Khách hàng:</b> ${withdrawalData.userName}
📧 <b>Email:</b> ${withdrawalData.userEmail}
💰 <b>Số tiền:</b> ${withdrawalData.amount.toLocaleString("vi-VN")}đ
💰 <b>Phí:</b> ${withdrawalData.fee.toLocaleString("vi-VN")}đ
💰 <b>Nhận được:</b> ${withdrawalData.receiveAmount.toLocaleString("vi-VN")}đ
🏦 <b>Ngân hàng:</b> ${withdrawalData.bankName}
📝 <b>STK:</b> ${withdrawalData.accountNumber}
👤 <b>CTK:</b> ${withdrawalData.accountName}

📱 <b>Thiết bị:</b> ${deviceInfo.deviceType} - ${deviceInfo.browser}
💻 <b>OS:</b> ${deviceInfo.os}
🌐 <b>IP:</b> ${ipAddress}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}

<a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin">🔗 Xử lý trong Admin</a>`

  const whatsappMessage = `💸 YÊU CẦU RÚT TIỀN

👤 Khách hàng: ${withdrawalData.userName}
📧 Email: ${withdrawalData.userEmail}
💰 Số tiền: ${withdrawalData.amount.toLocaleString("vi-VN")}đ
💰 Phí: ${withdrawalData.fee.toLocaleString("vi-VN")}đ
💰 Nhận được: ${withdrawalData.receiveAmount.toLocaleString("vi-VN")}đ
🏦 Ngân hàng: ${withdrawalData.bankName}
📝 STK: ${withdrawalData.accountNumber}
👤 CTK: ${withdrawalData.accountName}
📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}
🌐 IP: ${ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Vui lòng kiểm tra và xử lý yêu cầu!`

  try {
    await sendTelegramNotification(telegramMessage)
  } catch (error) {
    console.error("Error sending Telegram notification for withdrawal:", error)
  }

  try {
    await sendWhatsAppNotification(whatsappMessage)
  } catch (error) {
    console.error("Error sending WhatsApp notification for withdrawal:", error)
  }
}

// Admin login notification
export const sendAdminLoginNotification = async (adminData: any) => {
  const deviceInfo = getDeviceInfo()
  const ipAddress = "Unknown" // Non-blocking version doesn't return a value

  const telegramMessage = `🔐 <b>ADMIN ĐĂNG NHẬP</b>

👨‍💻 <b>Administrator:</b> ${adminData.name}
📧 <b>Email:</b> ${adminData.email}
📱 <b>Thiết bị:</b> ${deviceInfo.deviceType} - ${deviceInfo.browser}
💻 <b>OS:</b> ${deviceInfo.os}
🌐 <b>IP:</b> ${ipAddress}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}

<i>Admin đã truy cập vào hệ thống quản lý!</i>`

  const whatsappMessage = `🔐 ADMIN ĐĂNG NHẬP

👨‍💻 Administrator: ${adminData.name}
📧 Email: ${adminData.email}
📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}
🌐 IP: ${ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Admin đã truy cập vào hệ thống quản lý!`

  try {
    await sendTelegramNotification(telegramMessage)
  } catch (error) {
    console.error("Error sending Telegram notification for admin login:", error)
  }

  try {
    await sendWhatsAppNotification(whatsappMessage)
  } catch (error) {
    console.error("Error sending WhatsApp notification for admin login:", error)
  }
}

// User registration notification
export const sendUserRegistrationNotification = async (userData: any) => {
  const deviceInfo = getDeviceInfo()
  const ipAddress = "Unknown" // Non-blocking version doesn't return a value

  const telegramMessage = `👤 <b>NGƯỜI DÙNG MỚI</b>

👤 <b>Tên:</b> ${userData.name}
📧 <b>Email:</b> ${userData.email}
📱 <b>Thiết bị:</b> ${deviceInfo.deviceType} - ${deviceInfo.browser}
💻 <b>OS:</b> ${deviceInfo.os}
🌐 <b>IP:</b> ${ipAddress}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}

<i>Có người dùng mới đăng ký tài khoản!</i>`

  const whatsappMessage = `👤 NGƯỜI DÙNG MỚI

👤 Tên: ${userData.name}
📧 Email: ${userData.email}
📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}
🌐 IP: ${ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Có người dùng mới đăng ký tài khoản!`

  try {
    await sendTelegramNotification(telegramMessage)
  } catch (error) {
    console.error("Error sending Telegram notification for user registration:", error)
  }

  try {
    await sendWhatsAppNotification(whatsappMessage)
  } catch (error) {
    console.error("Error sending WhatsApp notification for user registration:", error)
  }
}

// Test notifications
export const testNotifications = async () => {
  const testMessage = `🧪 <b>TEST NOTIFICATION</b>

⏰ <b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}
🔧 <b>Trạng thái:</b> Hệ thống hoạt động bình thường

<i>Đây là tin nhắn test từ QtusDev Market!</i>`

  try {
    await sendTelegramNotification(testMessage)
  } catch (error) {
    console.error("Error sending Telegram test notification:", error)
  }

  try {
    await sendWhatsAppNotification(
      "🧪 TEST NOTIFICATION\n\nHệ thống hoạt động bình thường!\nThời gian: " + new Date().toLocaleString("vi-VN"),
    )
  } catch (error) {
    console.error("Error sending WhatsApp test notification:", error)
  }
}
