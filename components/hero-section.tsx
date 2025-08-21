"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Download, Users } from 'lucide-react'
import Link from "next/link"

export function HeroSection() {
  const [currentText, setCurrentText] = useState(0)
  const texts = ["Mã nguồn chất lượng cao", "Giá cả phải chăng", "Hỗ trợ 24/7", "Cập nhật liên tục"]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % texts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 via-pink-100/20 to-blue-100/30 dark:from-purple-900/50 dark:via-pink-900/30 dark:to-blue-900/50"></div>
        <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-purple-200/20 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-pink-200/20 dark:bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] bg-blue-200/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto hero-responsive">
          {/* Badge */}
          <div className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-gray-100/80 dark:bg-white/10 backdrop-blur-sm border border-gray-200/50 dark:border-white/20 mb-6 sm:mb-8">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 mr-2" />
            <span className="text-gray-900 dark:text-white text-xs sm:text-sm">Marketplace mã nguồn #1 Việt Nam</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-purple-600 to-pink-600 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
              Qtusdev
            </span>
            <br />
            <span className="text-gray-900 dark:text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
              Source Marketplace
            </span>
          </h1>

          {/* Animated Subheading */}
          <div className="h-12 sm:h-14 md:h-16 mb-6 sm:mb-8">
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 transition-all duration-500">
              {texts[currentText]}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Khám phá hàng nghìn mã nguồn chất lượng cao từ các developer hàng đầu. Từ website, ứng dụng mobile đến game
            và tools - tất cả đều có tại Qtusdev.
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-14 md:mb-16 px-4 sm:px-0">
            <Link href="/products">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg group"
              >
                Khám phá ngay
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-gray-300 dark:border-white/30 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg bg-transparent"
              >
                Đăng ký miễn phí
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl mx-auto px-4 sm:px-0">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Download className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mr-2" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">1000+</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Mã nguồn</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 mr-2" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">5000+</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Khách hàng</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2" />
                <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">4.9</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Đánh giá</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
