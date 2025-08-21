"use client"

import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, Smartphone, Copy, CheckCircle, Clock, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { sendDepositNotification } from "@/lib/notifications"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const PAYMENT_METHODS = [
  {
    id: "mbbank",
    name: "MB Bank",
    icon: CreditCard,
    accountNumber: "0328551707",
    accountName: "NGUYEN QUANG TU",
    qrCode: "https://files.catbox.moe/wox1o7.jpg",
    logo: "https://files.catbox.moe/fq9mki.png",
  },
  {
    id: "momo",
    name: "Momo",
    icon: Smartphone,
    accountNumber: "0328551707",
    accountName: "NGUYEN QUANG TU",
    qrCode: "https://files.catbox.moe/s565tf.jpg",
    logo: "https://files.catbox.moe/4204yj.png",
  },
  {
    id: "techcombank",
    name: "Techcombank",
    icon: CreditCard,
    accountNumber: "2002200710",
    accountName: "NGUYEN QUANG TU",
    qrCode: "https://files.catbox.moe/pb65ti.jpg",
    logo: "https://files.catbox.moe/y54uf2.jpg",
  },
  {
    id: "tpbank",
    name: "TPBank",
    icon: CreditCard,
    accountNumber: "00005372546",
    accountName: "NGUYEN QUANG TU",
    qrCode: "https://files.catbox.moe/9q3jn5.jpg",
    logo: "https://files.catbox.moe/hxmo0s.png",
  }
]

export default function DepositPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [deposits, setDeposits] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedField, setCopiedField] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem("currentUser")
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    
    if (!currentUser || !isLoggedIn) {
      router.push("/auth/login?returnUrl=/deposit")
      return
    }

    const userData = JSON.parse(currentUser)
    setUser(userData)

    // Load user's deposits
    loadUserDeposits(userData.email)

    // Listen for real-time updates
    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem("currentUser")
      if (updatedUser) {
        const parsedUser = JSON.parse(updatedUser)
        setUser(parsedUser)
        loadUserDeposits(parsedUser.email)
      }
    }

    window.addEventListener("userUpdated", handleUserUpdate)
    
    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate)
    }
  }, [router])

  const loadUserDeposits = (email: string) => {
    try {
      const allDeposits = JSON.parse(localStorage.getItem("deposits") || "[]")
      const userDeposits = allDeposits.filter((d: any) => d.userEmail === email)
      setDeposits(userDeposits.sort((a: any, b: any) => new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime()))
    } catch (error) {
      console.error("Error loading deposits:", error)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || isLoading) return

    setIsLoading(true)
    
    try {
      if (!amount || !selectedMethod || !transactionId) {
        throw new Error("Vui lòng điền đầy đủ thông tin")
      }

      const depositAmount = parseInt(amount)
      if (depositAmount < 5000) {
        throw new Error("Số tiền nạp tối thiểu là 5,000đ")
      }

      const method = PAYMENT_METHODS.find(m => m.id === selectedMethod)
      if (!method) {
        throw new Error("Phương thức thanh toán không hợp lệ")
      }

      // Create deposit request
      const depositRequest = {
        id: Date.now(),
        user_id: user.id,
        userEmail: user.email,
        userName: user.name,
        amount: depositAmount,
        method: method.name,
        accountName: method.accountName,
        accountNumber: method.accountNumber,
        transactionId: transactionId,
        status: "pending",
        requestTime: new Date().toISOString(),
        requestTimeFormatted: new Date().toLocaleString("vi-VN")
      }

      // Save deposit request
      const allDeposits = JSON.parse(localStorage.getItem("deposits") || "[]")
      allDeposits.push(depositRequest)
      localStorage.setItem("deposits", JSON.stringify(allDeposits))

      // Add to pending deposits for admin
      const pendingDeposits = JSON.parse(localStorage.getItem("pendingDeposits") || "[]")
      pendingDeposits.push(depositRequest)
      localStorage.setItem("pendingDeposits", JSON.stringify(pendingDeposits))

      // Get IP address
      const getIPAddress = async () => {
        try {
          const response = await fetch('https://api.ipify.org?format=json')
          const data = await response.json()
          return data.ip
        } catch {
          return 'Unknown'
        }
      }

      const ipAddress = await getIPAddress()

      // Send Telegram notification
      const telegramMessage = `💳 YÊU CẦU NẠP TIỀN MỚI

👤 Khách hàng: ${user.name}
📧 Email: ${user.email}  
💰 Số tiền: ${depositAmount.toLocaleString("vi-VN")}đ
🏦 Phương thức: ${method.name}
📝 Mã giao dịch: ${transactionId}
🌐 IP: ${ipAddress}
⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}

Vui lòng kiểm tra và duyệt yêu cầu!`

      try {
        await fetch(`https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'HTML'
          })
        })
      } catch (error) {
        console.error('Telegram notification failed:', error)
      }

      // Send notification to admin
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
      notifications.push({
        id: Date.now(),
        type: "deposit_request",
        title: "Yêu cầu nạp tiền mới",
        message: `${user.name} yêu cầu nạp ${depositAmount.toLocaleString("vi-VN")}đ qua ${method.name}`,
        user: { email: user.email, name: user.name, ipAddress },
        timestamp: new Date().toISOString(),
        read: false,
        depositInfo: depositRequest
      })
      localStorage.setItem("notifications", JSON.stringify(notifications))

      // Dispatch events for real-time updates
      window.dispatchEvent(new Event("depositsUpdated"))
      window.dispatchEvent(new Event("notificationsUpdated"))

      // Reset form
      setAmount("")
      setTransactionId("")
      setSelectedMethod("")

      // Reload deposits
      loadUserDeposits(user.email)

      alert("Yêu cầu nạp tiền đã được gửi! Vui lòng chờ admin duyệt.")

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
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Đã duyệt</Badge>
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

  const selectedMethodInfo = PAYMENT_METHODS.find(m => m.id === selectedMethod)

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2" />
              Nạp tiền vào tài khoản
            </CardTitle>
            <CardDescription>
              Số dư hiện tại: <span className="font-bold text-green-600">{user.balance?.toLocaleString("vi-VN") || "0"}đ</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền nạp (VNĐ)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Nhập số tiền (tối thiểu 5,000đ)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="5000"
                  step="1000"
                  required
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[5000,10000,20000,50000, 100000, 200000, 500000, 1000000].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(preset.toString())}
                    >
                      {preset.toLocaleString("vi-VN")}đ
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phương thức thanh toán</Label>
                <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex items-center">
                          <method.icon className="w-4 h-4 mr-2" />
                          {method.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMethodInfo && (
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Thông tin chuyển khoản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Ngân hàng:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{selectedMethodInfo.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedMethodInfo.name, "bankName")}
                        >
                          {copiedField === "bankName" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Số tài khoản:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{selectedMethodInfo.accountNumber}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedMethodInfo.accountNumber, "accountNumber")}
                        >
                          {copiedField === "accountNumber" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Chủ tài khoản:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{selectedMethodInfo.accountName}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(selectedMethodInfo.accountName, "accountName")}
                        >
                          {copiedField === "accountName" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nội dung CK:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">NAP {user.email}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`NAP ${user.email}`, "content")}
                        >
                          {copiedField === "content" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    {selectedMethodInfo.qrCode && (
                      <div className="flex flex-col items-center mt-4">
                        <span className="text-sm text-gray-600 mb-2">Mã QR:</span>
                        <img src={selectedMethodInfo.qrCode} alt="QR Code" className="w-48 h-48 object-contain border rounded" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="transactionId">Mã giao dịch</Label>
                <Input
                  id="transactionId"
                  type="text"
                  placeholder="Nhập mã giao dịch từ ngân hàng/ví"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  Vui lòng nhập mã giao dịch chính xác để được duyệt nhanh chóng
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Gửi yêu cầu nạp tiền"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Deposit History */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử nạp tiền</CardTitle>
            <CardDescription>
              Theo dõi trạng thái các yêu cầu nạp tiền của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {deposits.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Chưa có lịch sử nạp tiền
                </p>
              ) : (
                deposits.map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{deposit.amount.toLocaleString("vi-VN")}đ</p>
                      <p className="text-sm text-gray-500">{deposit.method}</p>
                      <p className="text-xs text-gray-400">{deposit.requestTimeFormatted}</p>
                      <p className="text-xs text-gray-400">Mã GD: {deposit.transactionId}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(deposit.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
      <Footer />
    </>
  )
}