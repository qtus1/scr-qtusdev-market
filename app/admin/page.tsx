"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Logo } from "@/components/logo"
import { LogOut, Shield } from 'lucide-react'
import { getAdminUser, adminLogout } from "@/lib/firebase"
import Overview from "./Overview"
import Product from "./Product"
import User from "./User"
import Deposit from "./Deposit"
import Withdrawmoney from "./Withdrawmoney"
import Setting from "./Setting"

export default function AdminPage() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([])
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [purchases, setPurchases] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)  // Add loading state

      // Load products
      let loadedProducts = [];
      try {
        loadedProducts = JSON.parse(localStorage.getItem("uploadedProducts") || "[]");
      } catch (e) { loadedProducts = []; }
      setProducts(Array.isArray(loadedProducts) ? loadedProducts : []);

      // Load users
      let loadedUsers = [];
      try {
        loadedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      } catch (e) { loadedUsers = []; }
      setUsers(Array.isArray(loadedUsers) ? loadedUsers : []);

      // Load deposits
      let loadedDeposits = [];
      try {
        loadedDeposits = JSON.parse(localStorage.getItem("deposits") || "[]");
      } catch (e) { loadedDeposits = []; }
      setPendingDeposits(Array.isArray(loadedDeposits) ? loadedDeposits.map(deposit => ({
        ...deposit,
        requestTimeFormatted: deposit.timestamp ? new Date(deposit.timestamp).toLocaleString('vi-VN') : '',
        userName: loadedUsers.find((u: any) => u.uid === deposit.user_id)?.name || "Unknown",
        userEmail: loadedUsers.find((u: any) => u.uid === deposit.user_id)?.email || "Unknown"
      })) : []);

      // Load withdrawals
      let loadedWithdrawals = [];
      try {
        loadedWithdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]");
      } catch (e) { loadedWithdrawals = []; }
      setPendingWithdrawals(Array.isArray(loadedWithdrawals) ? loadedWithdrawals.map(withdrawal => ({
        ...withdrawal,
        requestTimeFormatted: withdrawal.timestamp ? new Date(withdrawal.timestamp).toLocaleString('vi-VN') : '',
        userName: loadedUsers.find((u: any) => u.uid === withdrawal.user_id)?.name || "Unknown",
        userEmail: loadedUsers.find((u: any) => u.uid === withdrawal.user_id)?.email || "Unknown",
        receiveAmount: withdrawal.amount ? withdrawal.amount * 0.95 : 0
      })) : []);

      // Load purchases
      let loadedPurchases = [];
      try {
        loadedPurchases = JSON.parse(localStorage.getItem("purchases") || "[]");
      } catch (e) { loadedPurchases = []; }
      setPurchases(Array.isArray(loadedPurchases) ? loadedPurchases.map(purchase => ({
        ...purchase,
        title: loadedProducts.find((p: any) => p.id === purchase.product_id)?.title || "Unknown Product",
        purchaseDate: purchase.timestamp
      })) : []);

      // Load notifications
      let loadedNotifications = [];
      try {
        loadedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      } catch (e) { loadedNotifications = []; }
      setNotifications(Array.isArray(loadedNotifications) ? loadedNotifications : []);
    } catch (error) {
      console.error("Error loading data:", error)
      alert("Có lỗi khi tải dữ liệu. Vui lòng thử lại!")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Add refresh interval
  useEffect(() => {
    if (!isLoading && adminUser) {
      loadData()
      const interval = setInterval(loadData, 30000) // Refresh every 30s
      return () => clearInterval(interval)
    }
  }, [isLoading, adminUser, loadData])

  useEffect(() => {
    const admin = getAdminUser()
    if (!admin) {
      router.push("/admin/login")
      return
    }
    setAdminUser(admin)
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    if (!isLoading && adminUser) {
      loadData()
    }
  }, [isLoading, adminUser, loadData])

  const handleLogout = useCallback(() => {
    adminLogout()
    router.push("/admin/login")
  }, [router])

  const getStats = useCallback(() => {
    const totalUsers = users.length
    const totalRevenue = purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0)
    const pendingDepositsCount = pendingDeposits.filter(d => d.status !== "rejected").length
    const pendingWithdrawalsCount = pendingWithdrawals.filter(w => w.status !== "rejected").length
    const newUsersCount = users.filter(user => {
      const registrationDate = new Date(user.createdAt)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - registrationDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    }).length
    
    return { totalUsers, totalRevenue, pendingDepositsCount, pendingWithdrawalsCount, newUsersCount }
  }, [users, purchases, pendingDeposits, pendingWithdrawals])

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="text-center">
          <Logo />
          <p className="mt-4 text-muted-foreground">Đang tải Admin Panel...</p>
        </div>
      </motion.div>
    )
  }

  if (!adminUser) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="text-center">
          <Logo />
          <p className="mt-4 text-muted-foreground">Vui lòng đăng nhập Admin</p>
          <Button 
            onClick={() => router.push("/admin/login")}
            className="mt-4"
          >
            Đăng nhập Admin
          </Button>
        </div>
      </motion.div>
    )
  }

  const stats = getStats()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-background to-gray-100 dark:to-gray-900"
    >
      <div className="border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-4"
            >
              <Logo />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">
                  Chào mừng, {adminUser.name}
                </p>
              </div>
            </motion.div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-800">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {["overview", "products", "users", "deposits", "withdrawals", "settings"].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2"
                >
                  <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  {tab === "users" && stats.newUsersCount > 0 && (
                    <Badge className="ml-2 bg-blue-500 text-white text-xs">
                      {stats.newUsersCount} mới
                    </Badge>
                  )}
                  {tab === "deposits" && stats.pendingDepositsCount > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {stats.pendingDepositsCount}
                    </Badge>
                  )}
                  {tab === "withdrawals" && stats.pendingWithdrawalsCount > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {stats.pendingWithdrawalsCount}
                    </Badge>
                  )}
                </motion.div>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="overview">
                <Overview 
                  users={users}
                  products={products}
                  purchases={purchases}
                  pendingDeposits={pendingDeposits}
                  pendingWithdrawals={pendingWithdrawals}
                  notifications={notifications}
                  loadData={loadData}
                />
              </TabsContent>
              <TabsContent value="products">
                <Product 
                  products={products}
                  setProducts={setProducts}
                  adminUser={adminUser}
                />
              </TabsContent>
              <TabsContent value="users">
                <User 
                  users={users}
                  setUsers={setUsers}
                  adminUser={adminUser}
                  purchases={purchases}
                />
              </TabsContent>
              <TabsContent value="deposits">
                <Deposit 
                  pendingDeposits={pendingDeposits}
                  setPendingDeposits={setPendingDeposits}
                  adminUser={adminUser}
                  users={users}
                  loadData={loadData}
                />
              </TabsContent>
              <TabsContent value="withdrawals">
                <Withdrawmoney 
                  pendingWithdrawals={pendingWithdrawals}
                  setPendingWithdrawals={setPendingWithdrawals}
                  adminUser={adminUser}
                  loadData={loadData}
                />
              </TabsContent>
              <TabsContent value="settings">
                <Setting 
                  adminUser={adminUser}
                  totalUsers={stats.totalUsers}
                  totalRevenue={stats.totalRevenue}
                />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </motion.div>
  )
}