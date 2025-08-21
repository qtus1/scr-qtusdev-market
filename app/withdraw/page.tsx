"use client"

import { useState, useEffect } from "react"
import { sendTelegramNotification } from "@/lib/telegram"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, Smartphone, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

const WITHDRAW_METHODS = [
  {
    id: "mbbank",
    name: "MB Bank",
    accountNumber: "0328551707",
    accountName: "NGUYEN QUANG TU",
    qrCode: "https://files.catbox.moe/wox1o7.jpg",
    logo: "https://files.catbox.moe/fq9mki.png",
    minAmount: 5000
  },
  {
    id: "momo",
    name: "Momo",
    accountNumber: "0328551707",
    accountName: "NGUYEN QUANG TU",
    qrCode: "https://files.catbox.moe/s565tf.jpg",
    logo: "https://files.catbox.moe/4204yj.png",
    minAmount: 5000
  },
  {
    id: "techcombank",
    name: "Techcombank",
    accountNumber: "2002200710",
    accountName: "NGUYEN QUANG TU",
    qrCode: "https://files.catbox.moe/pb65ti.jpg",
    logo: "https://files.catbox.moe/y54uf2.jpg",
    minAmount: 5000
  },
  {
    id: "tpbank",
    name: "TPBank",
    accountNumber: "00005372546",
    accountName: "NGUYEN QUANG TU",
    qrCode: "https://files.catbox.moe/9q3jn5.jpg",
    logo: "https://files.catbox.moe/hxmo0s.png",
    minAmount: 5000
  },
]

export default function WithdrawPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    accountNumber: "",
    accountName: ""
  })
  const [momoPhone, setMomoPhone] = useState("")
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser")
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    
    if (!currentUser || !isLoggedIn) {
      router.push("/auth/login?returnUrl=/withdraw")
      return
    }

    const userData = JSON.parse(currentUser)
    setUser(userData)

    // Load user's withdrawals
    loadUserWithdrawals(userData.email)

    // Listen for real-time updates
    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem("currentUser")
      if (updatedUser) {
        const parsedUser = JSON.parse(updatedUser)
        setUser(parsedUser)
        loadUserWithdrawals(parsedUser.email)
      }
    }

    window.addEventListener("userUpdated", handleUserUpdate)
    
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate)
    }
  }, [router])

  const loadUserWithdrawals = (email: string) => {
    try {
      const allWithdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]")
      const userWithdrawals = allWithdrawals.filter((w: any) => w.userEmail === email)
      setWithdrawals(userWithdrawals.sort((a: any, b: any) => new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime()))
    } catch (error) {
      console.error("Error loading withdrawals:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isLoading) return

    setIsLoading(true)
    
    try {
      if (!amount || !selectedMethod) {
        throw new Error("Vui lòng điền đầy đủ thông tin")
      }

      const method = WITHDRAW_METHODS.find(m => m.id === selectedMethod)
      if (!method) {
        throw new Error("Phương thức rút tiền không hợp lệ")
      }

      const withdrawAmount = parseInt(amount)
      if (withdrawAmount < method.minAmount) {
        throw new Error(`Số tiền rút tối thiểu cho ${method.name} là ${method.minAmount.toLocaleString("vi-VN")}đ`)
      }


      // Không còn tính phí, chỉ kiểm tra số dư
      const totalDeduct = withdrawAmount
      if (totalDeduct > (user.balance || 0)) {
        throw new Error(`Số dư không đủ. Cần: ${totalDeduct.toLocaleString("vi-VN")}đ`)
      }

      // Validate payment details
      if (selectedMethod === 'bank_transfer') {
        if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
          throw new Error("Vui lòng điền đầy đủ thông tin tài khoản ngân hàng")
        }
      }

      if (selectedMethod === 'momo') {
        if (!momoPhone || !/^[0-9]{10,11}$/.test(momoPhone)) {
          throw new Error("Vui lòng nhập số điện thoại MoMo hợp lệ")
        }
      }

      // Create withdrawal request
      const withdrawRequest = {
        id: Date.now(),
        user_id: user.id,
        userEmail: user.email,
        userName: user.name,
        amount: withdrawAmount,
        totalDeduct: totalDeduct,
        method: method.name,
        methodId: method.id,
        bankInfo: method,
        status: "pending",
        requestTime: new Date().toISOString(),
        requestTimeFormatted: new Date().toLocaleString("vi-VN")
      }

      // Save withdrawal request
      const allWithdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]")
      allWithdrawals.push(withdrawRequest)
      localStorage.setItem("withdrawals", JSON.stringify(allWithdrawals))

      // Add to pending withdrawals for admin
      const pendingWithdrawals = JSON.parse(localStorage.getItem("pendingWithdrawals") || "[]")
      pendingWithdrawals.push(withdrawRequest)
      localStorage.setItem("pendingWithdrawals", JSON.stringify(pendingWithdrawals))


      // Send notification to admin (local)
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      notifications.push({
        id: Date.now(),
        type: "withdrawal_request",
        title: "Yêu cầu rút tiền mới",
        message: `${user.name} yêu cầu rút ${withdrawAmount.toLocaleString("vi-VN")}đ qua ${method.name}`,
        user: { email: user.email, name: user.name },
        timestamp: new Date().toISOString(),
        read: false,
        withdrawalInfo: withdrawRequest
      })
      localStorage.setItem("notifications", JSON.stringify(notifications))

      // Gửi thông báo Telegram
      try {
        await sendTelegramNotification(
          `💸 <b>Yêu cầu rút tiền mới</b>\n👤 <b>${user.name}</b> (${user.email})\n💳 <b>Phương thức:</b> ${method.name}\n💰 <b>Số tiền:</b> ${withdrawAmount.toLocaleString("vi-VN")}đ\n🏦 <b>Thông tin:</b> ${method.accountName} - ${method.accountNumber}`
        )
      } catch (err) {
        console.error("Telegram notification error", err)
      }

      // Dispatch events for real-time updates
      window.dispatchEvent(new Event("withdrawalsUpdated"))
      window.dispatchEvent(new Event("notificationsUpdated"))

      // Reset form
      setAmount("")
      setBankInfo({ bankName: "", accountNumber: "", accountName: "" })
      setMomoPhone("")
      setSelectedMethod("")

      // Reload withdrawals
      loadUserWithdrawals(user.email)

      alert("Yêu cầu rút tiền đã được gửi! Vui lòng chờ admin xử lý.")

    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Chờ duyệt</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Đã chuyển</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Từ chối</Badge>
      default:
        return <Badge>Không xác định</Badge>
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const selectedMethodInfo = WITHDRAW_METHODS.find(m => m.id === selectedMethod)
  const withdrawAmount = parseInt(amount) || 0
  // Không còn tính phí, chỉ kiểm tra số dư
  const totalDeduct = withdrawAmount

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Withdraw Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Rút tiền từ tài khoản
            </CardTitle>
            <CardDescription>
              Số dư hiện tại: <span className="font-bold text-green-600">{user.balance?.toLocaleString("vi-VN") || "0"}đ</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Phương thức rút tiền</Label>
                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức rút tiền" />
                  </SelectTrigger>
                  <SelectContent>
                    {WITHDRAW_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center w-full">
                          <img src={method.logo} alt={method.name} className="w-5 h-5 mr-2 rounded" />
                          <span>{method.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMethodInfo && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <img src={selectedMethodInfo.logo} alt={selectedMethodInfo.name} className="w-8 h-8 rounded mr-2" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p><strong>Thông tin tài khoản/ví:</strong></p>
                      <p>• <b>{selectedMethodInfo.accountName}</b></p>
                      <p>• Số TK/SĐT: <b>{selectedMethodInfo.accountNumber}</b></p>
                      <p>• Số tiền tối thiểu: {selectedMethodInfo.minAmount.toLocaleString("vi-VN")}đ</p>
                      <p>• <a href={selectedMethodInfo.qrCode} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Xem mã QR chuyển khoản</a></p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền rút (VNĐ)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder={`Nhập số tiền (tối thiểu ${selectedMethodInfo?.minAmount.toLocaleString("vi-VN") || "0"}đ)`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={selectedMethodInfo?.minAmount || 0}
                  step="1000"
                  required
                />
                {selectedMethodInfo && withdrawAmount > 0 && (
                  <div className="text-sm space-y-1">
                    <p>Số tiền rút: {withdrawAmount.toLocaleString("vi-VN")}đ</p>
                    <p className="font-semibold">Tổng trừ từ tài khoản: {totalDeduct.toLocaleString("vi-VN")}đ</p>
                  </div>
                )}
              </div>

              {/* Bank Transfer Details */}
              {selectedMethod === 'bank_transfer' && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium">Thông tin tài khoản ngân hàng</h4>
                  <div className="space-y-2">
                    <Label htmlFor="bankName">Tên ngân hàng</Label>
                    <Input
                      id="bankName"
                      placeholder="VD: Vietcombank"
                      value={bankInfo.bankName}
                      onChange={(e) => setBankInfo(prev => ({ ...prev, bankName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Số tài khoản</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Nhập số tài khoản"
                      value={bankInfo.accountNumber}
                      onChange={(e) => setBankInfo(prev => ({ ...prev, accountNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Tên chủ tài khoản</Label>
                    <Input
                      id="accountName"
                      placeholder="Tên chính xác trên tài khoản"
                      value={bankInfo.accountName}
                      onChange={(e) => setBankInfo(prev => ({ ...prev, accountName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              )}

              {/* MoMo Details */}
              {selectedMethod === 'momo' && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="font-medium">Thông tin ví MoMo</h4>
                  <div className="space-y-2">
                    <Label htmlFor="momoPhone">Số điện thoại MoMo</Label>
                    <Input
                      id="momoPhone"
                      placeholder="Nhập số điện thoại đã đăng ký MoMo"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      pattern="[0-9]{10,11}"
                      required
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !selectedMethod || totalDeduct > (user.balance || 0)}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Gửi yêu cầu rút tiền"
                )}
              </Button>

              {totalDeduct > (user.balance || 0) && withdrawAmount > 0 && (
                <p className="text-red-600 text-sm text-center">
                  Số dư không đủ để thực hiện giao dịch này
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Withdraw History */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử rút tiền</CardTitle>
            <CardDescription>
              Theo dõi trạng thái các yêu cầu rút tiền của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {withdrawals.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Chưa có lịch sử rút tiền
                </p>
              ) : (
                withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{withdrawal.amount.toLocaleString("vi-VN")}đ</p>
                      <p className="text-sm text-gray-500">{withdrawal.method}</p>
                      <p className="text-xs text-gray-400">Số TK/SĐT: {withdrawal.bankInfo?.accountNumber}</p>
                      <p className="text-xs text-gray-400">{withdrawal.requestTimeFormatted}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}