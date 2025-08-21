"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Wallet, ShoppingBag, Download, CreditCard, TrendingUp, Calendar, Mail, Phone, MapPin, Eye, ExternalLink, LogOut, Settings, Bell, Star, Clock, DollarSign, Package, Star as StarIcon, Lock } from 'lucide-react'
import { Logo } from "@/components/logo"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

const sendNotification = async (message: string) => {
  try {
    await fetch("/api/send-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  } catch (e) {
    // Có thể log lỗi nếu cần
    console.error("Failed to send notification", e);
  }
};

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userPurchases, setUserPurchases] = useState<any[]>([])
  const [depositHistory, setDepositHistory] = useState<any[]>([])
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const userStr = localStorage.getItem("currentUser")
    
    if (!isLoggedIn || !userStr) {
      router.push("/auth/login")
      return
    }

    const user = JSON.parse(userStr)
    setCurrentUser(user)

    // Load user's purchases
    const allPurchases = JSON.parse(localStorage.getItem("userPurchases") || "[]")
    const userPurchasesList = allPurchases.filter((purchase: any) => purchase.userId === user.id)
    setUserPurchases(userPurchasesList)

    // Load deposit history
    const allDeposits = JSON.parse(localStorage.getItem("approvedDeposits") || "[]")
    const userDeposits = allDeposits.filter((deposit: any) => deposit.userId === user.id)
    setDepositHistory(userDeposits)

    // Load withdrawal history
    const allWithdrawals = JSON.parse(localStorage.getItem("approvedWithdrawals") || "[]")
    const userWithdrawals = allWithdrawals.filter((withdrawal: any) => withdrawal.userId === user.id)
    setWithdrawHistory(userWithdrawals)

    // Send notification when dashboard is accessed
    const now = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
    const message = `📱 Người dùng ${user.email} đã truy cập dashboard vào lúc ${now} từ IP: ${user.currentIP || "Unknown"}`;
    sendNotification(message);

    setIsLoading(false)

    // Set up real-time updates
    const interval = setInterval(() => {
      // Refresh user data
      const updatedUserStr = localStorage.getItem("currentUser")
      if (updatedUserStr) {
        const updatedUser = JSON.parse(updatedUserStr)
        setCurrentUser(updatedUser)
      }

      // Refresh purchases
      const updatedPurchases = JSON.parse(localStorage.getItem("userPurchases") || "[]")
      const userPurchasesList = updatedPurchases.filter((purchase: any) => purchase.userId === user.id)
      setUserPurchases(userPurchasesList)

      // Refresh deposits
      const updatedDeposits = JSON.parse(localStorage.getItem("approvedDeposits") || "[]")
      const userDeposits = updatedDeposits.filter((deposit: any) => deposit.userId === user.id)
      setDepositHistory(userDeposits)

      // Refresh withdrawals
      const updatedWithdrawals = JSON.parse(localStorage.getItem("approvedWithdrawals") || "[]")
      const userWithdrawals = updatedWithdrawals.filter((withdrawal: any) => withdrawal.userId === user.id)
      setWithdrawHistory(userWithdrawals)
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const getStats = () => {
    const totalSpent = userPurchases.reduce((sum, purchase) => sum + (purchase.price || 0), 0)
    const totalDeposited = depositHistory.reduce((sum, deposit) => sum + (deposit.amount || 0), 0)
    const totalWithdrawn = withdrawHistory.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0)
    
    // Calculate balance as deposited minus withdrawn
    const currentBalance = totalDeposited - totalWithdrawn
    
    return {
      totalPurchases: userPurchases.length,
      totalSpent,
      totalDeposited,
      totalWithdrawn,
      currentBalance
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Logo />
          <p className="mt-4 text-muted-foreground">Đang tải dashboard...</p>
        </div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Logo />
          <p className="mt-4 text-muted-foreground">Vui lòng đăng nhập để truy cập dashboard</p>
          <Button 
            onClick={() => router.push("/auth/login")}
            className="mt-4"
          >
            Đăng nhập
          </Button>
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-slideInDown">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Chào mừng trở lại, {currentUser.name || currentUser.email}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push("/products")} className="transition-transform hover:scale-105">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Mua sắm
              </Button>
              <Button variant="outline" onClick={handleLogout} className="transition-transform hover:scale-105">
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-fadeInUp">
            <Card className="transition-transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Số dư hiện tại</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.currentBalance.toLocaleString('vi-VN')}đ
                </div>
                <p className="text-xs text-muted-foreground">
                  Có thể sử dụng ngay
                </p>
              </CardContent>
            </Card>

            <Card className="transition-transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalSpent.toLocaleString('vi-VN')}đ
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPurchases} giao dịch
                </p>
              </CardContent>
            </Card>

            <Card className="transition-transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã nạp</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalDeposited.toLocaleString('vi-VN')}đ
                </div>
                <p className="text-xs text-muted-foreground">
                  {depositHistory.length} lần nạp
                </p>
              </CardContent>
            </Card>

            <Card className="transition-transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã rút</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.totalWithdrawn.toLocaleString('vi-VN')}đ
                </div>
                <p className="text-xs text-muted-foreground">
                  {withdrawHistory.length} lần rút
                </p>
              </CardContent>
            </Card>

            <Card className="transition-transform hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {userPurchases.reduce((sum, purchase) => sum + (purchase.downloads || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tổng số lượt tải xuống
                </p>
              </CardContent>
            </Card>

            {/* Account Statistics Summary */}
            <Card className="transition-transform hover:scale-105 md:col-span-5">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Thống kê tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{userPurchases.length}</p>
                    <p className="text-xs text-muted-foreground">Sản phẩm đã mua</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{depositHistory.length}</p>
                    <p className="text-xs text-muted-foreground">Lịch sử nạp tiền</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{withdrawHistory.length}</p>
                    <p className="text-xs text-muted-foreground">Lịch sử rút tiền</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {userPurchases.reduce((sum, purchase) => sum + (purchase.downloads || 0), 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Tổng số lượt tải xuống</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.totalSpent.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeInUp delay-100">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" onClick={() => router.push("/deposit")}>
              <CardContent className="flex items-center p-6">
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mr-4">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Nạp tiền</h3>
                  <p className="text-sm text-muted-foreground">Nạp tiền vào tài khoản</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" onClick={() => router.push("/withdraw")}>
              <CardContent className="flex items-center p-6">
                <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full mr-4">
                  <CreditCard className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Rút tiền</h3>
                  <p className="text-sm text-muted-foreground">Rút tiền về ngân hàng</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1" onClick={() => router.push("/products")}>
              <CardContent className="flex items-center p-6">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full mr-4">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Mua sắm</h3>
                  <p className="text-sm text-muted-foreground">Khám phá sản phẩm mới</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="purchases" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="purchases">Sản phẩm đã mua</TabsTrigger>
              <TabsTrigger value="deposits">Lịch sử nạp tiền</TabsTrigger>
              <TabsTrigger value="withdrawals">Lịch sử rút tiền</TabsTrigger>
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            </TabsList>

            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Sản phẩm đã mua ({userPurchases.length})
                  </CardTitle>
                  <CardDescription>
                    Danh sách tất cả sản phẩm bạn đã mua
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userPurchases.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Bạn chưa mua sản phẩm nào</p>
                      <Button
                        onClick={() => router.push("/products")}
                        className="mt-4"
                      >
                        Khám phá sản phẩm
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userPurchases.map((purchase) => (
                        <div key={purchase.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img
                            src={purchase.image || "/placeholder.svg"}
                            alt={purchase.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{purchase.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {purchase.description?.slice(0, 100)}...
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge>{purchase.category}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {new Date(purchase.purchaseDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            {/* Review Section */}
                            <div className="mt-3">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => {
                                      // Update rating in localStorage for this purchase
                                      const allPurchases = JSON.parse(localStorage.getItem("userPurchases") || "[]");
                                      const updatedPurchases = allPurchases.map((p: any) =>
                                        p.id === purchase.id ? { ...p, rating: i + 1 } : p
                                      );
                                      localStorage.setItem("userPurchases", JSON.stringify(updatedPurchases));
                                      // Optionally, update global rating for homepage, etc.
                                      // You may want to trigger a global state update here if needed
                                      setUserPurchases(updatedPurchases.filter((p: any) => p.userId === currentUser.id));
                                    }}
                                  >
                                    <StarIcon
                                      className={`w-4 h-4 ${i < (purchase.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                    />
                                  </button>
                                ))}
                                <span className="text-sm text-muted-foreground ml-2">
                                  {purchase.rating || 0}/5 ({purchase.reviewCount || 0} đánh giá)
                                </span>
                              </div>
                              <div className="mt-1">
                                <span className="text-xs text-muted-foreground">
                                  Tổng số lượt tải xuống: {purchase.downloads || 0}
                                </span>
                              </div>
                              {purchase.review && (
                                <p className="text-sm text-muted-foreground italic mt-1">
                                  "{purchase.review}"
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              {purchase.price.toLocaleString('vi-VN')}đ
                            </p>
                            <div className="flex space-x-2 mt-2">
                              {purchase.downloadLink && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={purchase.downloadLink} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-4 h-4 mr-1" />
                                    Tải xuống
                                  </a>
                                </Button>
                              )}
                              {purchase.demoLink && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={purchase.demoLink} target="_blank" rel="noopener noreferrer">
                                    <Eye className="w-4 h-4 mr-1" />
                                    Demo
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deposits" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Lịch sử nạp tiền ({depositHistory.length})
                  </CardTitle>
                  <CardDescription>
                    Tất cả giao dịch nạp tiền đã được duyệt
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {depositHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Chưa có giao dịch nạp tiền nào</p>
                      <Button 
                        onClick={() => router.push("/deposit")}
                        className="mt-4"
                      >
                        Nạp tiền ngay
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {depositHistory.map((deposit) => (
                        <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold text-green-600">
                              +{deposit.amount.toLocaleString('vi-VN')}đ
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {deposit.method} • {deposit.transactionId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(deposit.approvedTime).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Đã duyệt
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="withdrawals" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Lịch sử rút tiền ({withdrawHistory.length})
                  </CardTitle>
                  <CardDescription>
                    Tất cả giao dịch rút tiền đã được xử lý
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {withdrawHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Chưa có giao dịch rút tiền nào</p>
                      <Button 
                        onClick={() => router.push("/withdraw")}
                        className="mt-4"
                      >
                        Rút tiền ngay
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {withdrawHistory.map((withdrawal) => (
                        <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-semibold text-red-600">
                              -{withdrawal.amount.toLocaleString('vi-VN')}đ
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {withdrawal.bankName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {withdrawal.accountNumber} • {withdrawal.accountName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(withdrawal.approvedTime).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            Đã chuyển
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Thông tin cá nhân
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{currentUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tên hiển thị</p>
                        <p className="font-medium">{currentUser.name || "Chưa cập nhật"}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ngày tham gia</p>
                        <p className="font-medium">
                          {new Date(currentUser.joinDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Lần đăng nhập cuối</p>
                        <p className="font-medium">
                          {currentUser.lastLoginTime || "Chưa có thông tin"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">IP hiện tại</p>
                        <p className="font-medium">
                          {currentUser.currentIP || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Settings className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Thiết bị</p>
                        <p className="font-medium">
                          {currentUser.currentDeviceInfo?.deviceType || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      <div className="w-full">
                        <Button
                          onClick={() => router.push("/dashboard/change-password")}
                          variant="outline"
                          className="w-full"
                        >
                          Đổi mật khẩu
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Thống kê tài khoản
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Trạng thái tài khoản</span>
                      <Badge className="bg-green-100 text-green-800">
                        {currentUser.status === "active" ? "Hoạt động" : "Tạm khóa"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Số lần đăng nhập</span>
                      <span className="font-medium">{currentUser.loginCount || 1}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tổng sản phẩm đã mua</span>
                      <span className="font-medium">{userPurchases.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tổng số lượt tải xuống</span>
                      <span className="font-medium text-purple-600">
                        {userPurchases.reduce((sum, purchase) => sum + (purchase.downloads || 0), 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tổng chi tiêu</span>
                      <span className="font-medium text-green-600">
                        {stats.totalSpent.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">IP hiện tại</span>
                      <span className="font-medium text-xs">
                        {currentUser.currentIP || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Thiết bị</span>
                      <span className="font-medium text-xs">
                        {currentUser.currentDeviceInfo?.deviceType || "Unknown"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
