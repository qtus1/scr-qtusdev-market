"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Shield, Mail, Lock, AlertCircle, LogIn } from 'lucide-react'
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { adminLogin, adminLoginWithSocialProvider, signInWithSocialProvider } from "@/lib/auth"
import { getDeviceInfo, getIPAddress } from "@/lib/notifications"

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "admin@gmail.com",
    password: "qtusdev",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const isAdminLoggedIn = localStorage.getItem("adminAuth") === "true"
      const adminUser = localStorage.getItem("adminUser")
      
      if (isAdminLoggedIn && adminUser) {
        router.push("/admin")
      }

      // Check lockout status
      const lockout = localStorage.getItem("adminLockout")
      if (lockout) {
        const lockoutData = JSON.parse(lockout)
        if (Date.now() < lockoutData.expires) {
          setLockoutTime(lockoutData.expires - Date.now())
        } else {
          localStorage.removeItem("adminLockout")
          setLoginAttempts(0)
        }
      }
    }
  }, [router, mounted])

  useEffect(() => {
    if (lockoutTime) {
      const timer = setInterval(() => {
        setLockoutTime(prev => {
          if (prev && prev <= 1000) {
            localStorage.removeItem("adminLockout")
            setLoginAttempts(0)
            return null
          }
          return prev ? prev - 1000 : null
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [lockoutTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (lockoutTime) {
      setError(`Tài khoản bị khóa! Vui lòng thử lại sau ${Math.ceil(lockoutTime / 1000)} giây.`)
      return
    }
    if (loginAttempts >= 5) {
      const lockoutExpires = Date.now() + 15 * 60 * 1000 // 15 minutes lockout
      localStorage.setItem("adminLockout", JSON.stringify({ expires: lockoutExpires }))
      setLockoutTime(lockoutExpires - Date.now())
      setError("Quá nhiều lần thử đăng nhập! Vui lòng chờ 15 phút.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const deviceInfo = getDeviceInfo()
      const ipAddress = await getIPAddress()
      console.log('Login attempt:', { email: formData.email, deviceInfo, ipAddress })
      
      const response = await adminLogin(formData.email, formData.password, { deviceInfo, ipAddress })
      console.log('Login response:', response)
      
      if (!response.success) {
        setLoginAttempts(prev => prev + 1)
        setError(response.error || "Email hoặc mật khẩu không chính xác!")
        setIsLoading(false)
        return
      }

      setLoginAttempts(0)
      window.location.href = "/admin"
    } catch (error) {
      console.error("Admin login error:", error)
      setLoginAttempts(prev => prev + 1)
      setError("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại!")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'github') => {
    if (lockoutTime) {
      setError(`Tài khoản bị khóa! Vui lòng thử lại sau ${Math.ceil(lockoutTime / 1000)} giây.`)
      return
    }
    if (loginAttempts >= 5) {
      const lockoutExpires = Date.now() + 15 * 60 * 1000 // 15 minutes lockout
      localStorage.setItem("adminLockout", JSON.stringify({ expires: lockoutExpires }))
      setLockoutTime(lockoutExpires - Date.now())
      setError("Quá nhiều lần thử đăng nhập! Vui lòng chờ 15 phút.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const deviceInfo = getDeviceInfo()
      const ipAddress = await getIPAddress()
      const { success, error } = await adminLoginWithSocialProvider(provider, { deviceInfo, ipAddress })
      if (!success) {
        setLoginAttempts(prev => prev + 1)
        setError(error || `Không thể đăng nhập bằng ${provider}!`)
        setIsLoading(false)
        return
      }

      setLoginAttempts(0)
      window.location.href = "/admin"
    } catch (error) {
      console.error(`Social login error (${provider}):`, error)
      setLoginAttempts(prev => prev + 1)
      setError(`Có lỗi xảy ra khi đăng nhập bằng ${provider}. Vui lòng thử lại!`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Logo />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-4 mb-2">Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400">Đăng nhập để quản lý hệ thống</p>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-gray-200 dark:border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-gray-50 flex items-center justify-center">
              <Shield className="w-6 h-6 mr-2 text-purple-600" />
              Đăng nhập Admin
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Chỉ dành cho quản trị viên hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-gray-50">
                  Email Admin
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập gmail của admin."
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-50 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 dark:text-gray-50">
                  Mật khẩu Admin
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của admin"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-50 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !!lockoutTime}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Đăng nhập Admin
                  </div>
                )}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                disabled={isLoading || !!lockoutTime}
                onClick={() => handleSocialLogin('google')}
                className="flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.854L12.545,10.239z"
                  />
                </svg>
                Google
              </Button>
              <Button
                variant="outline"
                disabled={isLoading || !!lockoutTime}
                onClick={() => handleSocialLogin('facebook')}
                className="flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103v3.333h-2.344c-.776 0-1.133.407-1.133 1.135v1.987h3.477l-.525 3.667h-2.952v7.98h-2.824z"
                  />
                </svg>
                Facebook
              </Button>
              <Button
                variant="outline"
                disabled={isLoading || !!lockoutTime}
                onClick={() => handleSocialLogin('github')}
                className="flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.13-1.47-1.13-1.47-.92-.63.07-.62.07-.62 1.02.07 1.56 1.05 1.56 1.05.91 1.56 2.39 1.11 2.98.85.09-.66.36-1.11.66-1.37-2.31-.26-4.74-1.16-4.74-5.16 0-1.14.41-2.07 1.08-2.8-.11-.26-.47-1.32.1-2.75 0 0 .88-.28 2.88 1.07a10.02 10.02 0 0 1 5.28 0c2-1.35 2.88-1.07 2.88-1.07.57 1.43.21 2.49.1 2.75.67.73 1.08 1.66 1.08 2.8 0 4.01-2.44 4.9-4.76 5.16.37.32.7.95.7 1.92v2.85c0 .27.16.58.67.5A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z"
                  />
                </svg>
                GitHub
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Bạn là khách hàng?{" "}
                <Link href="/auth/login" className="text-purple-600 hover:text-purple-500 dark:text-purple-400 font-medium">
                  Đăng nhập khách hàng
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link 
                href="/" 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm"
              >
                ← Quay về trang chủ
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}