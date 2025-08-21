"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from 'lucide-react'
// Remove direct MySQL imports - using API routes instead

interface DepositProps {
  pendingDeposits: any[]
  setPendingDeposits: (deposits: any[]) => void
  adminUser: any
  users: any[]
  loadData: () => void
}

export default function Deposit({ pendingDeposits, setPendingDeposits, adminUser, users, loadData }: DepositProps) {
  const [processingDeposit, setProcessingDeposit] = useState<string | null>(null)

  const approveDeposit = useCallback(async (depositId: string) => {
    if (processingDeposit) return
    setProcessingDeposit(depositId)

    try {
      const deposit = pendingDeposits.find(d => d.id.toString() === depositId)
      if (!deposit) {
        alert("Không tìm thấy yêu cầu nạp tiền!")
        setProcessingDeposit(null)
        return
      }

      // Validate user from local storage first
      const localUsers = JSON.parse(localStorage.getItem("users") || "[]")
      const localUser = localUsers.find((u: any) => u.uid === deposit.user_id)
      
      if (!localUser) {
        console.error("User not found in local storage:", deposit.user_id)
        alert(`Không tìm thấy người dùng trong hệ thống! (ID: ${deposit.user_id})`)
        setProcessingDeposit(null)
        return
      }

      // Double check with API
      const userResponse = await fetch(`/api/users?userId=${deposit.user_id}`)
      const userResult = await userResponse.json()
      
      if (!userResult.data) {
        console.error("User not found in API:", deposit.user_id, userResult)
        alert("Không thể tải thông tin người dùng từ máy chủ!")
        setProcessingDeposit(null)
        return
      }

      // Log user data for debugging
      console.log("Local user data:", localUser)
      console.log("API user data:", userResult.data)

      // Verify user email matches
      if (userResult.data.email !== deposit.userEmail) {
        console.error("User email mismatch:", {
          deposit: deposit.userEmail,
          user: userResult.data.email
        })
        alert("Thông tin người dùng không khớp với yêu cầu nạp tiền!")
        setProcessingDeposit(null)
        return
      }

      const updatedUser = {
        ...userResult.data,
        balance: (userResult.data.balance || 0) + deposit.amount,
        lastActivity: new Date().toISOString()
      }
      const updateResponse = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deposit.user_id, userData: updatedUser })
      })
      
      const updateResult = await updateResponse.json()
      if (updateResult.error) {
        setProcessingDeposit(null)
        throw new Error(updateResult.error)
      }

      // Lấy thông tin phương thức thanh toán từ PAYMENT_METHODS
      const paymentMethod = await fetch('/api/payment-methods').then(res => res.json())
      const methodInfo = paymentMethod.find((m: any) => m.name === deposit.method)

      const updatedDeposit = {
        ...deposit,
        status: "approved",
        approvedTime: new Date().toISOString(),
        approvedBy: adminUser.email,
        accountName: methodInfo?.accountName || 'NGUYEN QUANG TU',
        accountNumber: methodInfo?.accountNumber
      }
      await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDeposit)
      })

      const updatedPendingDeposits = pendingDeposits.filter(d => d.id.toString() !== depositId)
      setPendingDeposits(updatedPendingDeposits)

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "deposit_approved",
          title: "Nạp tiền đã được duyệt",
          message: `Nạp tiền ${deposit.amount.toLocaleString('vi-VN')}đ đã được duyệt`,
          user: { email: deposit.userEmail, name: deposit.userName },
          admin: { email: adminUser.email, name: adminUser.name, loginTime: adminUser.loginTime },
          timestamp: new Date().toISOString(),
          device: "Admin Panel",
          ip: "Unknown",
          read: false
        })
      })

      loadData()
      alert("Duyệt nạp tiền thành công!")
    } catch (error) {
      console.error("Error approving deposit:", error)
      alert("Có lỗi xảy ra khi duyệt nạp tiền!")
    } finally {
      setProcessingDeposit(null)
    }
  }, [pendingDeposits, adminUser, processingDeposit, loadData, setPendingDeposits])

  const rejectDeposit = useCallback(async (depositId: string) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) return

    try {
      const deposit = pendingDeposits.find(d => d.id.toString() === depositId)
      if (!deposit) {
        alert("Không tìm thấy yêu cầu nạp tiền!")
        setProcessingDeposit && setProcessingDeposit(null)
        return
      }
      if (deposit.status !== "pending") {
        alert("Yêu cầu này đã được xử lý!")
        setProcessingDeposit && setProcessingDeposit(null)
        return
      }

      const response = await fetch('/api/admin/approve-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: deposit.user_id,
          amount: deposit.amount,
          requestId: depositId,
          action: 'reject'
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const responseData = await response.json()
      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to reject deposit')
      }

      const updatedDeposit = { ...deposit, status: "rejected" }
      await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDeposit)
      })
      
      const updatedPendingDeposits = pendingDeposits.map(d => 
        d.id.toString() === depositId ? updatedDeposit : d
      )
      setPendingDeposits(updatedPendingDeposits)

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "deposit_rejected",
          title: "Nạp tiền bị từ chối",
          message: `Nạp tiền ${deposit.amount.toLocaleString('vi-VN')}đ bị từ chối`,
          user: { email: deposit.userEmail, name: deposit.userName },
          admin: { email: adminUser.email, name: adminUser.name, loginTime: adminUser.loginTime },
          timestamp: new Date().toISOString(),
          device: "Admin Panel",
          ip: "Unknown",
          read: false
        })
      })
      
      alert("Đã từ chối yêu cầu nạp tiền!")
    } catch (error) {
      console.error("Error rejecting deposit:", error)
      alert("Có lỗi xảy ra!")
    }
  }, [pendingDeposits, adminUser, setPendingDeposits])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Yêu cầu nạp tiền ({pendingDeposits.filter(d => d.status === "pending").length})
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
            {/* Hiển thị các yêu cầu nạp tiền đang chờ duyệt */}
            {pendingDeposits.filter(d => d.status === "pending").map((deposit) => (
              <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{deposit.userName}</h3>
                  <p className="text-sm text-muted-foreground">{deposit.userEmail}</p>
                  <p className="text-xs text-muted-foreground">
                    User ID: {deposit.user_id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    TK Nhận: {deposit.method} - {deposit.accountNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chủ TK: {deposit.accountName}
                  </p>
                  {/* Hiển thị IP nếu có */}
                  {deposit.userIp && (
                    <p className="text-xs text-muted-foreground">
                      IP: {deposit.userIp}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="bg-blue-100 text-blue-800">{deposit.method}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Mã GD: {deposit.transactionId}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {deposit.requestTimeFormatted}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {deposit.amount.toLocaleString('vi-VN')}đ
                    </p>
                    <Badge className={
                      deposit.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      deposit.status === "approved" ? "bg-green-100 text-green-800" :
                      "bg-red-100 text-red-800"
                    }>
                      {deposit.status === "pending" ? "Chờ duyệt" :
                       deposit.status === "approved" ? "Đã duyệt" : "Từ chối"}
                    </Badge>
                  </div>
                  {deposit.status === "pending" && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => approveDeposit(deposit.id.toString())}
                        disabled={processingDeposit === deposit.id.toString()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {processingDeposit === deposit.id.toString() ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectDeposit(deposit.id.toString())}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {pendingDeposits.filter(d => d.status === "pending").length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Không có yêu cầu nạp tiền nào
              </p>
            )}
            {/* Hiển thị lịch sử nạp tiền đã duyệt hoặc từ chối */}
            <div className="mt-8">
              <h4 className="font-semibold mb-2">Lịch sử nạp tiền đã xử lý</h4>
              {pendingDeposits.filter(d => d.status === "approved" || d.status === "rejected").length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Không có lịch sử nạp tiền
                </p>
              )}
              {pendingDeposits
                .filter(d => d.status === "approved" || d.status === "rejected")
                .sort((a, b) => new Date(b.approvedTime || b.requestTime).getTime() - new Date(a.approvedTime || a.requestTime).getTime())
                .slice(0, 10)
                .map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between p-2 border rounded mb-2">
                    <div>
                      <span className="font-medium">{deposit.userName || deposit.userEmail}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{deposit.method}</span>
                    </div>
                    <div className={deposit.status === "approved" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                      {deposit.status === "approved"
                        ? `+${deposit.amount.toLocaleString('vi-VN')}đ`
                        : `-${deposit.amount.toLocaleString('vi-VN')}đ`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(deposit.approvedTime || deposit.requestTime).toLocaleString('vi-VN')}
                    </div>
                    <Badge className={
                      deposit.status === "approved" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }>
                      {deposit.status === "approved" ? "Đã duyệt" : "Từ chối"}
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