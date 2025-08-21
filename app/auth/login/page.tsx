"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, ArrowLeft, EyeOff, Mail, Lock, Github } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle";

// Social login icons (placeholder - replace with actual icons)
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError("")
  }
  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn(provider, { redirect: false })
      if (result?.error) {
        throw new Error(result.error)
      }
      // Redirect to dashboard or intended page
      const returnUrl = new URLSearchParams(window.location.search).get("returnUrl") || "/dashboard"
      router.push(returnUrl)
    } catch (error: any) {
      setError(error.message || "Đăng nhập thất bại. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate input
      if (!formData.email || !formData.password) {
        throw new Error("Vui lòng điền đầy đủ thông tin")
      }

      // Get IP address and device info
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
      const deviceInfo = {
        deviceType: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        browser: navigator.userAgent.split(')')[0].split(' ').pop() || 'Unknown',
        os: navigator.platform || 'Unknown'
      }

      // Try Firebase Auth first, then fallback to localStorage
      const { signInWithEmail } = await import('@/lib/auth')
      const result = await signInWithEmail(formData.email, formData.password, {
        deviceInfo,
        ipAddress,
        rememberMe: false
      })

      if (result.user) {
        // Save user info for next login
        localStorage.setItem("currentUser", JSON.stringify(result.user))
        localStorage.setItem("isLoggedIn", "true")
        // Redirect to dashboard or intended page
        const returnUrl = new URLSearchParams(window.location.search).get("returnUrl") || "/dashboard"
        router.push(returnUrl)
      } else if (result.error) {
        throw new Error(result.error)
      }

    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Đăng nhập để truy cập tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Social Login Buttons */}
          

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Nhập tài khoản của bạn</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
                </div>
              </div>
              <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                       type="checkbox"
                       className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                     />
                     <span className="text-sm text-gray-700 dark:text-gray-300">Ghi nhớ đăng nhập</span>
                   </label>
                   <Link href="/auth/forgot-password" className="text-sm text-gray-500 hover:text-gray-700">
                     Quên mật khẩu?
                   </Link>
                 </div>
                 <div className="flex items-start gap-2 text-sm text-gray-500">
                   <input type="checkbox" className="mt-1 h-4 w-4 rounded border-gray-300" />
                   <p>
                     Bằng cách đăng nhập, bạn đồng ý với{" "}
                     <Link href="/terms" className="text-purple-600 hover:text-purple-500">
                       Điều khoản dịch vụ
                     </Link>{" "}
                     và{" "}
                     <Link href="/privacy" className="text-purple-600 hover:text-purple-500">
                       Chính sách bảo mật
                     </Link>.
                   </p>
                 </div>
               </div>
              
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                "Đăng nhập"
                )}
            </Button>
          </form>

          <div className="text-center">
            <Link href="/auth/register" className="text-sm text-purple-600 hover:text-purple-500">
              Chưa có tài khoản? Đăng ký ngay.
            </Link>
          </div>
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
          <div className="text-center">
            <Link href="/admin/login" className="text-sm text-purple-600 hover:text-purple-500">
              Bạn là admin?. Đăng nhập admin ngay.
            </Link>
          </div>
          <div>
            <p className="text-xs text-gray-500 mt-4">
              <Link href="/" className="text-purple-600 hover:text-purple-500">
                Quay lại trang chủ
              </Link>{" "}
              hoặc nếu bạn gặp vấn đề trong quá trình đăng nhập, hãy{" "}
              <Link href="/contact" className="text-purple-600 hover:text-purple-500">
                liên hệ với chúng tôi.
              </Link>{" "}
              
            </p>
          </div>
          <div className="text-center mt-6">
                    <Link
                      href="/"
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Quay lại trang chủ
                    </Link>
                  </div>
          
                  <div className="flex justify-center mt-4">
                    <ThemeToggle />
                  </div>
          
        </CardContent>
        
      </Card>
    </div>
  )
}