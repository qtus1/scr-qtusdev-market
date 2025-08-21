"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users } from 'lucide-react'

interface UserProps {
  users: any[]
  setUsers: (users: any[]) => void
  adminUser: any
  purchases: any[]
}

export default function User({ users, setUsers, adminUser, purchases }: UserProps) {
  const updateUserStatus = useCallback(async (userId: string, newStatus: string) => {
    try {
      const userResponse = await fetch(`/api/users?userId=${userId}`)
      const userResult = await userResponse.json()
      
      if (!userResult.data) {
        alert("Không tìm thấy người dùng!")
        return
      }

      const updatedUser = {
        ...userResult.data,
        status: newStatus,
        lastActivity: new Date().toISOString()
      }
      
      const updateResponse = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userData: updatedUser })
      })
      
      const updateResult = await updateResponse.json()
      if (updateResult.error) {
        throw new Error(updateResult.error)
      }

      setUsers(users.map(u => u.uid === userId ? updatedUser : u))

      const telegramMessage = `${newStatus === "active" ? "✅" : "🔒"} <b>TRẠNG THÁI TÀI KHOẢN</b>

👤 <b>Khách hàng:</b> ${userResult.data.name || userResult.data.email}
📧 <b>Email:</b> ${userResult.data.email}
📍 <b>IP:</b> ${userResult.data.ipAddress || "Unknown"}
🔄 <b>Trạng thái:</b> ${newStatus === "active" ? "Hoạt động" : "Tạm khóa"}
👨‍💻 <b>Cập nhật bởi:</b> ${adminUser.email}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`

      await fetch(`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'HTML'
        })
      })

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: `user_status_${newStatus}`,
          title: `Tài khoản ${newStatus === "active" ? "Đã kích hoạt" : "Đã khóa"}`,
          message: telegramMessage,
          user: { email: userResult.data.email, name: userResult.data.name || userResult.data.email },
          admin: { email: adminUser.email, name: adminUser.name, loginTime: adminUser.loginTime },
          timestamp: new Date().toISOString(),
          device: "Admin Panel",
          ip: "Unknown",
          read: false
        })
      })

      alert(`Đã ${newStatus === "active" ? "kích hoạt" : "khóa"} tài khoản!`)
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Có lỗi xảy ra khi cập nhật trạng thái!")
    }
  }, [users, adminUser, setUsers])

  const updateUserBalance = useCallback(async (userId: string, newBalance: number) => {
    if (!confirm(`Xác nhận cập nhật số dư: ${newBalance.toLocaleString('vi-VN')}đ?`)) return
    if (newBalance < 0) {
      alert("Số dư không thể âm!")
      return
    }

    try {
      // Add loading state
      const userCard = document.getElementById(`user-${userId}`)
      if (userCard) userCard.classList.add('opacity-50')

      const userResponse = await fetch(`/api/users?userId=${userId}`)
      const userResult = await userResponse.json()
      
      if (!userResult.data) {
        alert("Không tìm thấy người dùng!")
        return
      }

      const updatedUser = {
        ...userResult.data,
        balance: newBalance,
        lastActivity: new Date().toISOString()
      }
      
      const updateResponse = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userData: updatedUser })
      })
      
      const updateResult = await updateResponse.json()
      if (updateResult.error) {
        throw new Error(updateResult.error)
      }

      // Validate balance update result
      if (typeof updateResult.data?.balance !== 'number') {
        throw new Error('Invalid balance update response')
      }

      setUsers(users.map(u => u.uid === userId ? updatedUser : u))

      const telegramMessage = `💰 <b>CẬP NHẬT SỐ DƯ</b>

👤 <b>Khách hàng:</b> ${userResult.data.name || userResult.data.email}
📧 <b>Email:</b> ${userResult.data.email}
💰 <b>Số dư mới:</b> ${newBalance.toLocaleString('vi-VN')}đ
📍 <b>IP:</b> ${userResult.data.ipAddress || "Unknown"}
👨‍💻 <b>Cập nhật bởi:</b> ${adminUser.email}
⏰ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`

      await fetch(`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'HTML'
        })
      })

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "balance_updated",
          title: "Cập nhật số dư",
          message: telegramMessage,
          user: { email: userResult.data.email, name: userResult.data.name || userResult.data.email },
          admin: { email: adminUser.email, name: adminUser.name, loginTime: adminUser.loginTime },
          timestamp: new Date().toISOString(),
          device: "Admin Panel",
          ip: "Unknown",
          read: false
        })
      })

      alert("Cập nhật số dư thành công!")
    } catch (error) {
      console.error("Error updating user balance:", error)
      alert("Có lỗi xảy ra khi cập nhật số dư!")
    } finally {
      const userCard = document.getElementById(`user-${userId}`)
      if (userCard) userCard.classList.remove('opacity-50')
    }
  }, [users, adminUser, setUsers])

  const newUsers = users.filter(user => {
    const registrationDate = new Date(user.createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - registrationDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  })

  const otherUsers = users.filter(user => {
    const registrationDate = new Date(user.createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - registrationDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 7
  })

  return (
    <div className="space-y-6">
      {newUsers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Người dùng mới ({newUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newUsers.map((user) => (
                  <motion.div
                    key={user.uid}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800"
                  >
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{user.name || user.email}</h3>
                          <Badge className="bg-blue-500 text-white">Mới</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {user.status === "active" ? "Hoạt động" : "Tạm khóa"}
                          </Badge>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              className={user.status === "active" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                              onClick={() => updateUserStatus(user.uid, user.status === "active" ? "locked" : "active")}
                            >
                              {user.status === "active" ? "Khóa" : "Mở"}
                            </Button>
                          </motion.div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Tham gia: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "Không có dữ liệu"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Địa chỉ IP: {user.ipAddress || "Không có dữ liệu"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Hoạt động gần nhất: {user.lastActivity ? new Date(user.lastActivity).toLocaleString('vi-VN') : "Không có dữ liệu"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Nhà cung cấp: {user.provider || "Không có dữ liệu"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div>
                        <Label htmlFor={`balance-${user.uid}`} className="text-sm">Số dư</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id={`balance-${user.uid}`}
                            type="number"
                            defaultValue={user.balance || 0}
                            className="w-32"
                            onChange={(e) => {
                              const newBalance = parseInt(e.target.value) || 0
                              updateUserBalance(user.uid, newBalance)
                            }}
                          />
                          <span className="text-sm text-green-600">VNĐ</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Đã chi: {(user.totalSpent || 0).toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Đăng nhập: {user.loginCount || 1} lần
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Tất cả người dùng ({otherUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {otherUsers.map((user) => (
                <motion.div
                  key={user.uid}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800"
                >
                  <div className="flex items-center space-x-4 mb-4 md:mb-0">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{user.name || user.email}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {user.status === "active" ? "Hoạt động" : "Tạm khóa"}
                        </Badge>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            className={user.status === "active" ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                            onClick={() => updateUserStatus(user.uid, user.status === "active" ? "locked" : "active")}
                          >
                            {user.status === "active" ? "Khóa" : "Mở"}
                          </Button>
                        </motion.div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Tham gia: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "Không có dữ liệu"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Địa chỉ IP: {user.ipAddress || "Không có dữ liệu"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Hoạt động gần nhất: {user.lastActivity ? new Date(user.lastActivity).toLocaleString('vi-VN') : "Không có dữ liệu"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Nhà cung cấp: {user.provider || "Không có dữ liệu"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div>
                      <Label htmlFor={`balance-${user.uid}`} className="text-sm">Số dư</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id={`balance-${user.uid}`}
                          type="number"
                          defaultValue={user.balance || 0}
                          className="w-32"
                          onChange={(e) => {
                            const newBalance = parseInt(e.target.value) || 0
                            updateUserBalance(user.uid, newBalance)
                          }}
                        />
                        <span className="text-sm text-green-600">VNĐ</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Đã chi: {(user.totalSpent || 0).toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Đăng nhập: {user.loginCount || 1} lần
                    </p>
                  </div>
                </motion.div>
              ))}
              {otherUsers.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Không có người dùng khác
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}