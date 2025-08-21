"use client"

import { useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, MessageSquare, Phone } from 'lucide-react'
import { saveNotification } from "@/lib/mysql"

interface SettingProps {
  adminUser: any
  totalUsers: number
  totalRevenue: number
}

export default function Setting({ adminUser, totalUsers, totalRevenue }: SettingProps) {
  const testTelegramNotification = useCallback(async () => {
    try {
      const testMessage = `🔔 <b>TEST THÔNG BÁO TELEGRAM</b>

✅ Kết nối Telegram Bot thành công!
⏰ Thời gian test: ${new Date().toLocaleString('vi-VN')}
👨‍💻 Test bởi: ${adminUser.email}

<i>Hệ thống thông báo đang hoạt động bình thường.</i>`

      const response = await fetch(`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
          text: testMessage,
          parse_mode: 'HTML'
        })
      })

      if (response.ok) {
        await saveNotification({
          type: "test_notification",
          title: "Test Telegram Notification",
          message: testMessage,
          admin: { email: adminUser.email, name: adminUser.name, loginTime: adminUser.loginTime },
          timestamp: new Date().toISOString(),
          device: "Admin Panel",
          ip: "Unknown",
          read: false
        })
        alert("✅ Gửi thông báo Telegram thành công!")
      } else {
        alert("❌ Lỗi khi gửi thông báo Telegram!")
      }
    } catch (error) {
      console.error("Telegram test error:", error)
      alert("❌ Lỗi kết nối Telegram!")
    }
  }, [adminUser])

  const testWhatsAppNotification = useCallback(() => {
    try {
      const testMessage = `🔔 TEST THÔNG BÁO WHATSAPP

✅ Kết nối WhatsApp thành công!
⏰ Thời gian test: ${new Date().toLocaleString('vi-VN')}
👨‍💻 Test bởi: ${adminUser.email}

Hệ thống thông báo đang hoạt động bình thường.`

      const encodedMessage = encodeURIComponent(testMessage)
      const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER}?text=${encodedMessage}`
      
      window.open(whatsappUrl, '_blank')
      alert("✅ Đã mở WhatsApp! Vui lòng gửi tin nhắn để test.")
    } catch (error) {
      console.error("WhatsApp test error:", error)
      alert("❌ Lỗi khi mở WhatsApp!")
    }
  }, [adminUser])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Thông báo Telegram
            </CardTitle>
            <CardDescription>
              Kiểm tra kết nối với Telegram Bot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Bot Token:</strong> {process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN?.slice(0, 10)}...IA3E<br />
                <strong>Chat ID:</strong> {process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID}
              </p>
            </div>
            <Button onClick={testTelegramNotification} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Test Telegram
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Thông báo WhatsApp
            </CardTitle>
            <CardDescription>
              Kiểm tra kết nối với WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Số điện thoại:</strong> {process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER}<br />
                <strong>Trạng thái:</strong> Sẵn sàng
              </p>
            </div>
            <Button onClick={testWhatsAppNotification} className="w-full">
              <Phone className="w-4 h-4 mr-2" />
              Test WhatsApp
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin hệ thống</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Phiên bản</p>
              <p className="font-medium">v1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đăng nhập lần cuối</p>
              <p className="font-medium">{new Date(adminUser.loginTime).toLocaleString('vi-VN')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng người dùng</p>
              <p className="font-medium">{totalUsers}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
              <p className="font-medium text-green-600">
                {totalRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}