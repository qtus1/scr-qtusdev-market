"use client"

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { signIn } from "next-auth/react";

// Reset password function
async function resetPassword(email: string, newPassword: string, token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const resetTokens = JSON.parse(localStorage.getItem("resetTokens") || "[]");
    const resetData = resetTokens.find((t: any) => t.email === email && t.token === token);

    if (!resetData) {
      return { success: false, error: "Liên kết đặt lại mật khẩu không hợp lệ!" };
    }

    if (resetData.expires < Date.now()) {
      return { success: false, error: "Liên kết đặt lại mật khẩu đã hết hạn!" };
    }

    let registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const userIndex = registeredUsers.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      return { success: false, error: "Tài khoản không tồn tại!" };
    }

    registeredUsers[userIndex].password = newPassword;
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    // Remove used token
    const updatedTokens = resetTokens.filter((t: any) => t.token !== token);
    localStorage.setItem("resetTokens", JSON.stringify(updatedTokens));

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Lỗi khi đặt lại mật khẩu!" };
  }
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp!");
        return;
      }

      if (formData.password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự!");
        return;
      }

      const token = searchParams.get("token");
      if (!token) {
        setError("Liên kết đặt lại mật khẩu không hợp lệ!");
        return;
      }

      const email = searchParams.get("email") || "";
      const result = await resetPassword(email, formData.password, token);
      
      if (!result.success) {
        setError(result.error || "Có lỗi xảy ra!");
        return;
      }

      setSuccess("Mật khẩu đã được đặt lại thành công! Đang chuyển hướng đến trang đăng nhập...");
      setTimeout(() => router.push("/auth/login"), 2000);
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError(error.message || "Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại!");
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
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mt-4 mb-2">Đặt lại mật khẩu</h1>
          <p className="text-gray-500 dark:text-gray-400">Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-gray-200 dark:border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-900 dark:text-gray-50 flex items-center justify-center">
              <Lock className="w-6 h-6 mr-2" />
              Đặt lại mật khẩu
            </CardTitle>
            <CardDescription className="text-center text-gray-500 dark:text-gray-400">
              Nhập mật khẩu mới và xác nhận
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => signIn("google")}
              >
                <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 6.2 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.3 16.1 19.3 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 6.2 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/><path fill="#FBBC05" d="M24 44c5.6 0 10.5-1.9 14.3-5.1l-6.6-5.4C29.7 35.2 27 36 24 36c-6.1 0-10.7-2.9-13.7-7.1l-7 5.4C9.7 39.6 16.3 44 24 44z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.2 3.1-4.1 5.5-7.7 5.5-4.7 0-8.7-3.9-8.7-8.7 0-4.8 4-8.7 8.7-8.7 2.4 0 4.6.9 6.2 2.4l6.4-6.4C38.1 8.1 31.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z"/></g></svg>
                Đăng nhập bằng Google
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => signIn("facebook")}
              >
                <svg width="20" height="20" viewBox="0 0 32 32" className="mr-2"><path fill="#1877F3" d="M32 16c0-8.837-7.163-16-16-16S0 7.163 0 16c0 7.732 5.477 14.13 12.688 15.682V20.844h-3.82v-4.844h3.82v-3.692c0-3.77 2.292-5.844 5.803-5.844 1.684 0 3.448.302 3.448.302v3.797h-1.943c-1.917 0-2.513 1.191-2.513 2.413v2.924h4.281l-.685 4.844h-3.596v10.838C26.523 30.13 32 23.732 32 16z"/><path fill="#fff" d="M22.675 25.688l.685-4.844h-4.281v-2.924c0-1.222.596-2.413 2.513-2.413h1.943v-3.797s-1.764-.302-3.448-.302c-3.511 0-5.803 2.074-5.803 5.844v3.692h-3.82v4.844h3.82v10.838A16.06 16.06 0 0 0 16 32c2.21 0 4.324-.404 6.275-1.144V25.688z"/></svg>
                Đăng nhập bằng Facebook
              </Button>
              <Button
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => signIn("github")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className="mr-2"><path fill="#181717" d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.76-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.624-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.218.694.825.576C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z"/></svg>
                Đăng nhập bằng Github
              </Button>
            </div>
            {/* End OAuth Buttons */}

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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 dark:text-gray-50">Mật khẩu mới</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-50 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                    disabled={isLoading}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-900 dark:text-gray-50">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10 pr-10 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-50 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Đang xử lý...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Đặt lại mật khẩu
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Đã có tài khoản?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium">
                  Đăng nhập ngay
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
  );
}