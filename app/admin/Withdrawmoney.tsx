"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from 'lucide-react'
import { getUserData, saveUserData, saveWithdrawal, saveNotification } from "@/lib/mysql"

interface WithdrawmoneyProps {
  pendingWithdrawals: any[]
  setPendingWithdrawals: (withdrawals: any[]) => void
  adminUser: any
  loadData: () => void
}

export default function Withdrawmoney({ pendingWithdrawals, setPendingWithdrawals, adminUser, loadData }: WithdrawmoneyProps) {
  const [processingWithdrawal, setProcessingWithdrawal] = useState<string | null>(null)

  const approveWithdrawal = useCallback(async (withdrawalId: string) => {
    if (!confirm("Xác nhận duyệt yêu cầu rút tiền này?")) return
    if (processingWithdrawal) return
    
    setProcessingWithdrawal(withdrawalId)
    try {
      const withdrawal = pendingWithdrawals.find(w => w.id.toString() === withdrawalId)
      if (!withdrawal) {
        alert("Không tìm thấy yêu cầu rút tiền!")
        setProcessingWithdrawal(null)
        return
      }
      if (withdrawal.status !== "pending") {
        alert("Yêu cầu này đã được xử lý!")
        setProcessingWithdrawal(null)
        return
      }

      const userResult = await getUserData(withdrawal.user_id)
      if (!userResult.data) {
        alert("Không tìm thấy người dùng!")
        return
      }

      // Validate user balance again before approval
      if ((userResult.data.balance || 0) < withdrawal.amount) {
        alert("Số dư không đủ để duyệt rút tiền!")
        return
      }

      // Add transaction ID and time validation
      if (!withdrawal.transactionId || !withdrawal.requestTime) {
        alert("Thông tin giao dịch không hợp lệ!")
        return
      }

      const updatedUser = {
        ...userResult.data,
        balance: (userResult.data.balance || 0) - withdrawal.amount,
        lastActivity: new Date().toISOString()
      }
      await saveUserData(withdrawal.user_id, updatedUser)

      const approvedWithdrawal = {
        ...withdrawal,
        status: "approved",
        approvedTime: new Date().toISOString(),
        approvedBy: adminUser.email
      }
      await saveWithdrawal(approvedWithdrawal)

      const updatedPendingWithdrawals = pendingWithdrawals.filter(w => w.id.toString() !== withdrawalId)
      setPendingWithdrawals(updatedPendingWithdrawals)

      const telegramMessage = `✅ <b>RÚT TIỀN ĐÃ ĐƯỢC DUYỆT</b>

👤 <b>Khách hàng:</b> ${withdrawal.userName}
📧 <b>Email:</b> ${withdrawal.userEmail}
💰 <b>Số tiền:</b> ${withdrawal.amount.toLocaleString('vi-VN')}đ
🏦 <b>Ngân hàng:</b> ${withdrawal.bankName}
📝 <b>STK:</b> ${withdrawal.accountNumber}
👤 <b>CTK:</b> ${withdrawal.accountName}
✅ <b>Duyệt bởi:</b> ${adminUser.email}
⏰ <b>Thời gian duyệt:</b> ${new Date().toLocaleString('vi-VN')}

<i>Vui lòng chuyển tiền cho khách hàng!</i>`

      await fetch(`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
          text: telegramMessage,
          parse_mode: 'HTML'
        })
      })

      await saveNotification({
        type: "withdrawal_approved",
        title: "Rút tiền đã được duyệt",
        message: telegramMessage,
        user: { email: withdrawal.userEmail, name: withdrawal.userName },
        admin: { email: adminUser.email, name: adminUser.name, loginTime: adminUser.loginTime },
        timestamp: new Date().toISOString(),
        device: "Admin Panel",
        ip: "Unknown",
        read: false
      })

      loadData()
      alert("Duyệt rút tiền thành công!")
    } catch (error) {
      console.error("Error approving withdrawal:", error)
      alert("Có lỗi xảy ra khi duyệt rút tiền!")
    } finally {
      setProcessingWithdrawal(null)
    }
  }, [pendingWithdrawals, adminUser, processingWithdrawal, loadData, setPendingWithdrawals])

  const rejectWithdrawal = useCallback(async (withdrawalId: string) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) return

    try {
      const withdrawal = pendingWithdrawals.find(w => w.id.toString() === withdrawalId)
      if (!withdrawal) {
        alert("Không tìm thấy yêu cầu rút tiền!")
        setProcessingWithdrawal(null)
        return
      }
      if (withdrawal.status !== "pending") {
        alert("Yêu cầu này đã được xử lý!")
        setProcessingWithdrawal(null)
        return
      }

      const updatedWithdrawal = { ...withdrawal, status: "rejected" }
      await saveWithdrawal(updatedWithdrawal)
      
      const updatedPendingWithdrawals = pendingWithdrawals.map(w => 
        w.id.toString() === withdrawalId ? updatedWithdrawal : w
      )
      setPendingWithdrawals(updatedPendingWithdrawals)

      const telegramMessage = `❌ <b>RÚT TIỀN BỊ TỪ CHỐI</b>

👤 <b>Khách hàng:</b> ${withdrawal.userName}
📧 <b>Email:</b> ${withdrawal.userEmail}
💰 <b>Số tiền:</b> ${withdrawal.amount.toLocaleString('vi-VN')}đ
🏦 <b>Ngân hàng:</b> ${withdrawal.bankName}
📝 <b>STK:</b> ${withdrawal.accountNumber}
👤 <b>CTK:</b> ${withdrawal.accountName}
❌ <b>Từ chối bởi:</b> ${adminUser.email}
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

      await saveNotification({
        type: "withdrawal_rejected",
        title: "Rút tiền bị từ chối",
        message: telegramMessage,
        user: { email: withdrawal.userEmail, name: withdrawal.userName },
        admin: { email: adminUser.email, name: adminUser.name, loginTime: adminUser.loginTime },
        timestamp: new Date().toISOString(),
        device: "Admin Panel",
        ip: "Unknown",
        read: false
      })

      alert("Đã từ chối yêu cầu rút tiền!")
    } catch (error) {
      console.error("Error rejecting withdrawal:", error)
      alert("Có lỗi xảy ra!")
    }
  }, [pendingWithdrawals, adminUser, setPendingWithdrawals])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Yêu cầu rút tiền ({pendingWithdrawals.filter(w => w.status === "pending").length})
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadData}
              className="ml-4"
            >
              Làm mới
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingWithdrawals.filter(w => w.status === "pending").map((withdrawal) => (
              <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{withdrawal.userName}</h3>
                  <p className="text-sm text-muted-foreground">{withdrawal.userEmail}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm">
                      <strong>Ngân hàng:</strong> ${withdrawal.bankName}
                    </p>
                    <p className="text-sm">
                      <strong>STK:</strong> ${withdrawal.accountNumber}
                    </p>
                    <p className="text-sm">
                      <strong>Tên TK:</strong> ${withdrawal.accountName}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {withdrawal.requestTimeFormatted}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">
                      -{withdrawal.amount.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nhận: {withdrawal.receiveAmount.toLocaleString('vi-VN')}đ
                    </p>
                    <Badge className={
                      withdrawal.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      withdrawal.status === "approved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {withdrawal.status === "pending" ? "Chờ duyệt" :
                       withdrawal.status === "approved" ? "Đã duyệt" : "Từ chối"}
                    </Badge>
                  </div>
                  {withdrawal.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => approveWithdrawal(withdrawal.id.toString())}
                        disabled={processingWithdrawal === withdrawal.id.toString()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingWithdrawal === withdrawal.id.toString() ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectWithdrawal(withdrawal.id.toString())}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {pendingWithdrawals.filter(w => w.status === "pending").length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Không có yêu cầu rút tiền nào
              </p>
            )}
            {/* Hiển thị lịch sử rút tiền đã duyệt hoặc từ chối */}
            <div className="mt-8">
              <h4 className="font-semibold mb-2">Lịch sử rút tiền đã xử lý</h4>
              {pendingWithdrawals.filter(w => w.status === "approved" || w.status === "rejected").length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Không có lịch sử rút tiền
                </p>
              )}
              {pendingWithdrawals
                .filter(w => w.status === "approved" || w.status === "rejected")
                .sort((a, b) => new Date(b.approvedTime || b.requestTime).getTime() - new Date(a.approvedTime || a.requestTime).getTime())
                .slice(0, 10)
                .map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-2 border rounded mb-2">
                    <div>
                      <span className="font-medium">{withdrawal.userName || withdrawal.userEmail}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{withdrawal.bankName}</span>
                    </div>
                    <div className={withdrawal.status === "approved" ? "text-red-600 font-bold" : "text-gray-500 font-bold"}>
                      -{withdrawal.amount.toLocaleString('vi-VN')}đ
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(withdrawal.approvedTime || withdrawal.requestTime).toLocaleString('vi-VN')}
                    </div>
                    <Badge className={
                      withdrawal.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }>
                      {withdrawal.status === "approved" ? "Đã duyệt" : "Từ chối"}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}