"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2, Github, Facebook, Lock, Eye, EyeOff, Info } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getDeviceInfo,
  getIPAddress,
  isFirebaseConfigured,
  requestPasswordReset,
  userManager,
} from "@/lib/auth";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateForm = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email!");
      return false;
    }
    try {
      const response = await fetch("/api/get-users");
      const users = await response.json();
      const userExists = users.some((user: any) => user.email === email);
      if (!userExists) {
        setError("Email không tồn tại!");
        return false;
      }
      return true;
    } catch {
      setError("Không thể kiểm tra email. Vui lòng thử lại!");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we have a new password, update it directly
    if (newPassword) {
      try {
        // Get registered users
        const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
        const userIndex = registeredUsers.findIndex((u: any) => u.email === email);
        
        if (userIndex === -1) {
          setError("Email không tồn tại!");
          return;
        }
        
        // Update password
        registeredUsers[userIndex].password = newPassword;
        localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
        
        // Update current user with full info after password change
        const updatedUser = registeredUsers[userIndex];
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        localStorage.setItem("isLoggedIn", "true");

        setSuccess("Mật khẩu đã được cập nhật thành công! Đang chuyển hướng đến Dashboard...");
        setTimeout(() => router.push("/dashboard"), 1000);
        return;
      } catch (error: any) {
        console.error("Lỗi khi cập nhật mật khẩu:", error);
        setError(error.message || "Có lỗi xảy ra khi cập nhật mật khẩu. Vui lòng thử lại!");
        return;
      }
    }
    
    // Otherwise, send reset password request
    if (!(await validateForm())) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const deviceInfoData = getDeviceInfo();
      const ipAddressData = await getIPAddress();
      const result = await requestPasswordReset(email, { deviceInfo: deviceInfoData, ipAddress: ipAddressData });
      if (!result.success) {
        throw new Error(result.error || "Có lỗi xảy ra. Vui lòng thử lại!");
      }
      const deviceInfo = getDeviceInfo();
      const ipAddress = await getIPAddress();
      const message = `🔄 Yêu cầu đổi mật khẩu cho *${email}*\n🌐 IP: ${ipAddress}\n📱 Thiết bị: ${deviceInfo.deviceType} - ${deviceInfo.browser}\n💻 OS: ${deviceInfo.os}\n⏰ Thời gian: ${new Date().toLocaleString("vi-VN")}\n🔗 Token: ${result.token}`;
      await Promise.all([
        fetch("/api/send-telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        }),
        fetch("/api/send-whatsapp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: process.env.NEXT_PUBLIC_TWILIO_WHATSAPP_NUMBER, body: message }),
        }),
      ]);
      setSuccess("Yêu cầu đặt lại mật khẩu đã được gửi! Đang chuyển hướng đến trang đặt lại mật khẩu...");
      setTimeout(() => router.push("/auth/reset-password"), 1000);
    } catch (error: any) {
      console.error("Lỗi khi xử lý yêu cầu đặt lại mật khẩu:", error);
      setError(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Logo />
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-950 dark:via-pink-950 dark:to-indigo-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
          <div className="flex items-center justify-center mt-4 mb-2">
            <Mail className="w-8 h-8 text-purple-600 mr-2" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Quên mật khẩu
            </h1>
          </div>
          <p className="text-muted-foreground">Nhập email hoặc đăng nhập bằng tài khoản khác</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Xác nhận email</CardTitle>
            <CardDescription>Nhập email để nhận liên kết đặt lại mật khẩu hoặc đăng nhập</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isFirebaseConfigured() && (
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-600 dark:text-blue-400">
                  <strong>Demo Mode:</strong> OAuth sẽ tạo tài khoản demo. Để sử dụng OAuth thật, cần cấu hình Firebase.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-600 dark:text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => signIn("google")}
                disabled={oauthLoading !== null || isLoading}
                className="w-full border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {oauthLoading === 'google' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4 text-red-500" />
                    Đăng nhập với Google
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => signIn("github")}
                disabled={oauthLoading !== null || isLoading}
                className="w-full border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {oauthLoading === 'github' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Đăng nhập với GitHub
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => signIn("facebook")}
                disabled={oauthLoading !== null || isLoading}
                className="w-full border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {oauthLoading === 'facebook' ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  <>
                    <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                    Đăng nhập với Facebook
                  </>
                )}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Hoặc đặt lại mật khẩu</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    className="pl-10"
                    disabled={isLoading || oauthLoading !== null}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    className="pl-10 pr-10"
                    disabled={isLoading || oauthLoading !== null}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Nhập mật khẩu mới để lưu trữ cho lần đăng nhập sau
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isLoading || oauthLoading !== null || (!email && !newPassword)}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="flex items-center">
                    {newPassword ? "Cập nhật mật khẩu" : "Gửi yêu cầu"}
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Đã nhớ mật khẩu? </span>
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Đăng nhập ngay
              </Link>
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}