import Link from "next/link"
import { Logo } from "@/components/logo"
import { Facebook, Mail, MessageCircle, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-14 md:py-16">
        <div className="footer-responsive grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4 sm:space-y-6 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <Logo />
            </div>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base px-4 sm:px-0">
              Qtusdev - Marketplace mã nguồn hàng đầu Việt Nam. Chúng tôi cung cấp những mã nguồn chất lượng cao với giá
              cả phải chăng.
            </p>
            <div className="social-links flex justify-center sm:justify-start space-x-4">
              <a
                href="https://www.facebook.com/tu.quangg.195068/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="mailto:trachduong93@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://files.catbox.moe/kb9350.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors"
              >
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section text-center sm:text-left">
            <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-base sm:text-lg mb-4 sm:mb-6">Liên kết nhanh</h3>
            <ul className="footer-links flex flex-col space-y-2 sm:space-y-3">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base"
                >
                  Mã nguồn
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base"
                >
                  Thể loại
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section text-center sm:text-left">
            <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-base sm:text-lg mb-4 sm:mb-6">Hỗ trợ</h3>
            <ul className="footer-links flex flex-col space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/support"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base"
                >
                  Trung tâm hỗ trợ
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base"
                >
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-gray-600 dark:text-gray-400 hover:text-purple-400 transition-colors text-sm sm:text-base"
                >
                  Chính sách hoàn tiền
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section text-center sm:text-left">
            <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-base sm:text-lg mb-4 sm:mb-6">Liên hệ</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start justify-center sm:justify-start space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Email</p>
                  <a
                    href="mailto:trachduong93@gmail.com"
                    className="text-gray-900 dark:text-gray-100 hover:text-purple-400 transition-colors text-sm sm:text-base break-all"
                  >
                    qtussnguyen0220@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start justify-center sm:justify-start space-x-3">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Zalo</p>
                  <a
                    href="https://files.catbox.moe/kb9350.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-gray-100 hover:text-blue-400 transition-colors text-sm sm:text-base"
                  >
                    Chat với chúng tôi
                  </a>
                </div>
              </div>
              <div className="flex items-start justify-center sm:justify-start space-x-3">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Facebook</p>
                  <a
                    href="https://www.facebook.com/tu.quangg.195068/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 dark:text-gray-100 hover:text-blue-500 transition-colors text-sm sm:text-base"
                  >
                    Qtusdev Official
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm text-center md:text-left">
              © 2025 Qtusdev. Tất cả quyền được bảo lưu.
            </p>
            <div className="footer-links flex flex-wrap justify-center md:justify-end space-x-4 sm:space-x-6">
              <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-purple-400 text-xs sm:text-sm transition-colors">
                Điều khoản sử dụng
              </Link>
              <Link
                href="/privacy"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-400 text-xs sm:text-sm transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                href="/cookies"
                className="text-gray-600 dark:text-gray-400 hover:text-purple-400 text-xs sm:text-sm transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
