"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Package, DollarSign, Bell } from 'lucide-react'


interface Stats {
  totalUsers: number
  totalProducts: number
  totalRevenue: number
  pendingDepositsCount: number
  pendingWithdrawalsCount: number
  totalPurchases: number
  newUsersCount: number
}

interface OverviewProps {
  users: any[]
  products: any[]
  purchases: any[]
  pendingDeposits: any[]
  pendingWithdrawals: any[]
  notifications: any[]
  loadData: () => void
}

export default function Overview({ users, products, purchases, pendingDeposits, pendingWithdrawals, notifications, loadData }: OverviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-refresh effect
  useEffect(() => {
    loadData() // Initial load
    const interval = setInterval(loadData, 10000) // Refresh every 10 seconds
    
    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [loadData])

  const getStats = useCallback(() => {
    // Chỉ tính toán, không setState để tránh re-render lặp
    try {
      const totalUsers = users.length;
      const totalProducts = products.length;
      const totalRevenue = purchases.reduce((sum, purchase) => sum + (parseFloat(purchase.amount) || 0), 0);
      const pendingDepositsCount = pendingDeposits.filter(d => d.status !== "rejected").length;
      const pendingWithdrawalsCount = pendingWithdrawals.filter(w => w.status !== "rejected").length;
      const totalPurchases = purchases.length;
      const newUsersCount = users.filter(user => {
        const registrationDate = new Date(user.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - registrationDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }).length;
      return {
        totalUsers,
        totalProducts,
        totalRevenue,
        pendingDepositsCount,
        pendingWithdrawalsCount,
        totalPurchases,
        newUsersCount
      };
    } catch (error) {
      console.error("Stats error:", error);
      return {
        totalUsers: 0,
        totalProducts: 0,
        totalRevenue: 0,
        pendingDepositsCount: 0,
        pendingWithdrawalsCount: 0,
        totalPurchases: 0,
        newUsersCount: 0
      };
    }
  }, [users, products, purchases, pendingDeposits, pendingWithdrawals])

  const stats = getStats()

  // Lấy các hoạt động mới nhất
  const recentActivities = useMemo(() => {
    const activities = [
      // Người dùng mới
      ...users.map(user => ({
        type: 'new_user',
        timestamp: new Date(user.createdAt).getTime(),
        data: user
      })),
      // Nạp tiền được duyệt
      ...pendingDeposits
        .filter(d => d.status === "approved")
        .map(deposit => ({
          type: 'deposit_approved',
          timestamp: new Date(deposit.approvedTime || deposit.requestTime).getTime(),
          data: deposit
        })),
      // Rút tiền được duyệt
      ...pendingWithdrawals
        .filter(w => w.status === "approved")
        .map(withdrawal => ({
          type: 'withdrawal_approved',
          timestamp: new Date(withdrawal.approvedTime || withdrawal.requestTime).getTime(),
          data: withdrawal
        })),
      // Mua sản phẩm
      ...purchases.map(purchase => ({
        type: 'purchase',
        timestamp: new Date(purchase.purchaseDate).getTime(),
        data: purchase
      }))
    ]
    
    // Sắp xếp theo thời gian mới nhất
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
  }, [users, pendingDeposits, pendingWithdrawals, purchases])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tổng người dùng */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newUsersCount} người dùng mới trong 7 ngày qua
            </p>
          </CardContent>
        </Card>
        {/* Tổng sản phẩm */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Đang bán
            </p>
          </CardContent>
        </Card>
        {/* Tổng doanh thu */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalRevenue.toLocaleString('vi-VN')}đ
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPurchases} giao dịch
            </p>
          </CardContent>
        </Card>
        {/* Chờ duyệt */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingDepositsCount + stats.pendingWithdrawalsCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Nạp/Rút tiền
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Thông tin người dùng và lịch sử nạp/rút */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Giao dịch gần đây */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Người dùng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users
                .slice(0, 5)
                .map((user) => (
                  <div key={user.uid} className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        IP: {user.ipAddress || "Không có dữ liệu"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Đăng ký: {user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : ""}
                      </p>
                    </div>
                  </div>
                ))}
              {users.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Không có người dùng
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Lịch sử nạp tiền */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử nạp tiền</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingDeposits
                .filter(d => d.status === "approved")
                .sort((a, b) => new Date(b.approvedTime || b.requestTime).getTime() - new Date(a.approvedTime || a.requestTime).getTime())
                .slice(0, 5)
                .map((deposit) => (
                  <div key={deposit.id} className="flex items-center space-x-4">
                    <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{deposit.userName || deposit.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        {deposit.amount.toLocaleString('vi-VN')}đ - {deposit.method}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deposit.approvedTime || deposit.requestTime).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              {pendingDeposits.filter(d => d.status === "approved").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Không có lịch sử nạp tiền
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Lịch sử rút tiền */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử rút tiền</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingWithdrawals
                .filter(w => w.status === "approved")
                .sort((a, b) => new Date(b.approvedTime || b.requestTime).getTime() - new Date(a.approvedTime || a.requestTime).getTime())
                .slice(0, 5)
                .map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center space-x-4">
                    <div className="bg-red-100 dark:bg-red-900/20 p-2 rounded-full">
                      <DollarSign className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{withdrawal.userName || withdrawal.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        -{withdrawal.amount.toLocaleString('vi-VN')}đ - {withdrawal.bankName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(withdrawal.approvedTime || withdrawal.requestTime).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              {pendingWithdrawals.filter(w => w.status === "approved").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Không có lịch sử rút tiền
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông báo gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications
              .filter(n => n.type.includes("user_") || n.type.includes("deposit_") || n.type.includes("withdrawal_"))
              .slice(0, 5)
              .map((notification) => (
                <div key={notification.id} className="flex items-start space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {!notification.read && (
                    <Badge className="bg-blue-500 text-white">Mới</Badge>
                  )}
                </div>
              ))}
              {notifications.filter(n => n.type.includes("user_") || n.type.includes("deposit_") || n.type.includes("withdrawal_")).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Không có thông báo nào
                </p>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Cập nhật tự động mỗi 10 giây</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-2 border rounded">
                <div className={`p-2 rounded-full ${
                  activity.type === 'new_user' ? 'bg-blue-100' :
                  activity.type === 'deposit_approved' ? 'bg-green-100' :
                  activity.type === 'withdrawal_approved' ? 'bg-red-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'new_user' ? <Users className="w-4 h-4 text-blue-600" /> :
                   activity.type === 'deposit_approved' ? <DollarSign className="w-4 h-4 text-green-600" /> :
                   activity.type === 'withdrawal_approved' ? <DollarSign className="w-4 h-4 text-red-600" /> :
                   <Package className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {activity.type === 'new_user' ? `Người dùng mới: ${activity.data.name || activity.data.email}` :
                     activity.type === 'deposit_approved' ? `Nạp tiền: +${activity.data.amount.toLocaleString('vi-VN')}đ` :
                     activity.type === 'withdrawal_approved' ? `Rút tiền: -${activity.data.amount.toLocaleString('vi-VN')}đ` :
                     `Mua sản phẩm: ${activity.data.title}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString('vi-VN')}
                  </p>
                </div>
                <Badge className={
                  activity.type === 'new_user' ? 'bg-blue-100 text-blue-800' :
                  activity.type === 'deposit_approved' ? 'bg-green-100 text-green-800' :
                  activity.type === 'withdrawal_approved' ? 'bg-red-100 text-red-800' :
                  'bg-purple-100 text-purple-800'
                }>
                  {activity.type === 'new_user' ? 'Người dùng' :
                   activity.type === 'deposit_approved' ? 'Nạp tiền' :
                   activity.type === 'withdrawal_approved' ? 'Rút tiền' :
                   'Mua hàng'}
                </Badge>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Chưa có hoạt động nào
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}