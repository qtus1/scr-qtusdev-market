"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Download,
  ExternalLink,
  ShoppingCart,
  Star,
  Users,
  Calendar,
  FileText,
  ImageIcon,
  Video,
  Code,
  Database,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react"
import { Logo } from "@/components/logo"
import Link from "next/link"

const products = [
  {
    id: 1,
    title: "Modern E-commerce Website",
    description: "Website thương mại điện tử hiện đại với đầy đủ tính năng",
    price: 299000,
    originalPrice: 499000,
    image: "/modern-ecommerce-website.png",
    category: "Website",
    rating: 4.8,
    downloads: 1250,
    demoUrl: "https://ecommerce-demo.qtusdev.com",
    features: [
      "Responsive design cho mọi thiết bị",
      "Hệ thống thanh toán tích hợp",
      "Quản lý sản phẩm và đơn hàng",
      "SEO optimization",
      "Admin dashboard hoàn chỉnh",
    ],
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Stripe"],
    files: [
      { name: "source-code.zip", size: "45.2 MB", type: "code", icon: Code },
      { name: "documentation.pdf", size: "2.1 MB", type: "document", icon: FileText },
      { name: "database-schema.sql", size: "156 KB", type: "database", icon: Database },
      { name: "assets.zip", size: "12.8 MB", type: "image", icon: ImageIcon },
      { name: "setup-guide.pdf", size: "1.5 MB", type: "document", icon: FileText },
    ],
    longDescription: `
      Website thương mại điện tử hiện đại được xây dựng với công nghệ mới nhất. 
      Giao diện đẹp mắt, tối ưu cho SEO và có đầy đủ tính năng cần thiết cho một 
      cửa hàng online chuyên nghiệp.
      
      Sản phẩm bao gồm source code hoàn chỉnh, tài liệu hướng dẫn chi tiết, 
      và hỗ trợ kỹ thuật trong 30 ngày.
    `,
    changelog: [
      {
        version: "2.1.0",
        date: "2024-01-15",
        changes: ["Thêm tính năng wishlist", "Cải thiện performance", "Fix bugs"],
      },
      { version: "2.0.0", date: "2024-01-01", changes: ["Redesign giao diện", "Thêm dark mode", "Tối ưu mobile"] },
    ],
  },
  {
    id: 2,
    title: "Mobile Chat Application",
    description: "Ứng dụng chat real-time cho di động với nhiều tính năng",
    price: 199000,
    originalPrice: 349000,
    image: "/mobile-chat-app.png",
    category: "Mobile App",
    rating: 4.9,
    downloads: 890,
    demoUrl: "https://chat-demo.qtusdev.com",
    features: [
      "Chat real-time với Socket.io",
      "Gửi file và hình ảnh",
      "Group chat và private chat",
      "Push notifications",
      "End-to-end encryption",
    ],
    technologies: ["React Native", "Node.js", "Socket.io", "MongoDB", "Firebase"],
    files: [
      { name: "mobile-app-source.zip", size: "38.7 MB", type: "code", icon: Code },
      { name: "backend-api.zip", size: "15.2 MB", type: "code", icon: Code },
      { name: "app-demo.mp4", size: "25.4 MB", type: "video", icon: Video },
      { name: "api-documentation.pdf", size: "3.2 MB", type: "document", icon: FileText },
      { name: "deployment-guide.pdf", size: "1.8 MB", type: "document", icon: FileText },
    ],
    longDescription: `
      Ứng dụng chat di động với giao diện hiện đại và tính năng real-time. 
      Hỗ trợ cả iOS và Android, tích hợp đầy đủ tính năng chat chuyên nghiệp.
      
      Bao gồm cả frontend mobile app và backend API hoàn chỉnh.
    `,
    changelog: [
      {
        version: "1.5.0",
        date: "2024-01-10",
        changes: ["Thêm voice messages", "Cải thiện UI/UX", "Fix connection issues"],
      },
      { version: "1.4.0", date: "2023-12-20", changes: ["Group chat features", "File sharing", "Push notifications"] },
    ],
  },
  {
    id: 3,
    title: "2D Platformer Game",
    description: "Game platformer 2D với đồ họa pixel art đẹp mắt",
    price: 149000,
    originalPrice: 249000,
    image: "/2d-platformer-screenshot.png",
    category: "Game",
    rating: 4.7,
    downloads: 650,
    demoUrl: "https://game-demo.qtusdev.com",
    features: [
      "10 levels với độ khó tăng dần",
      "Pixel art graphics chất lượng cao",
      "Sound effects và background music",
      "Power-ups và collectibles",
      "Leaderboard system",
    ],
    technologies: ["Unity", "C#", "Photoshop", "Audacity"],
    files: [
      { name: "unity-project.zip", size: "125.6 MB", type: "code", icon: Code },
      { name: "game-assets.zip", size: "45.8 MB", type: "image", icon: ImageIcon },
      { name: "audio-files.zip", size: "28.3 MB", type: "video", icon: Video },
      { name: "game-design-doc.pdf", size: "4.1 MB", type: "document", icon: FileText },
      { name: "build-instructions.pdf", size: "1.2 MB", type: "document", icon: FileText },
    ],
    longDescription: `
      Game platformer 2D được phát triển với Unity, có đồ họa pixel art 
      đẹp mắt và gameplay hấp dẫn. Phù hợp cho cả người mới học game development 
      và những ai muốn có một game hoàn chỉnh để customize.
    `,
    changelog: [
      { version: "1.3.0", date: "2024-01-05", changes: ["Thêm 2 levels mới", "Cải thiện physics", "New power-ups"] },
      { version: "1.2.0", date: "2023-12-15", changes: ["Boss battles", "Achievement system", "Better animations"] },
    ],
  },
  {
    id: 4,
    title: "Social Media Automation Tool",
    description: "Công cụ tự động hóa quản lý mạng xã hội đa nền tảng",
    price: 399000,
    originalPrice: 599000,
    image: "/social-media-automation.png",
    category: "Tool",
    rating: 4.6,
    downloads: 420,
    demoUrl: "https://social-tool-demo.qtusdev.com",
    features: [
      "Đăng bài tự động trên nhiều platform",
      "Lên lịch nội dung",
      "Analytics và báo cáo",
      "Quản lý nhiều tài khoản",
      "AI content suggestions",
    ],
    technologies: ["Python", "Django", "React", "PostgreSQL", "Celery", "Redis"],
    files: [
      { name: "backend-source.zip", size: "52.3 MB", type: "code", icon: Code },
      { name: "frontend-dashboard.zip", size: "28.9 MB", type: "code", icon: Code },
      { name: "database-migrations.zip", size: "2.1 MB", type: "database", icon: Database },
      { name: "api-documentation.pdf", size: "5.4 MB", type: "document", icon: FileText },
      { name: "user-manual.pdf", size: "3.7 MB", type: "document", icon: FileText },
    ],
    longDescription: `
      Công cụ tự động hóa mạng xã hội mạnh mẽ, hỗ trợ quản lý và đăng bài 
      tự động trên Facebook, Instagram, Twitter, LinkedIn. Tích hợp AI để 
      gợi ý nội dung và phân tích hiệu quả.
    `,
    changelog: [
      { version: "2.2.0", date: "2024-01-12", changes: ["Instagram Reels support", "Better analytics", "Bug fixes"] },
      {
        version: "2.1.0",
        date: "2023-12-28",
        changes: ["LinkedIn integration", "AI content suggestions", "Bulk upload"],
      },
    ],
  },
  {
    id: 5,
    title: "Personal Finance Management App",
    description: "Ứng dụng quản lý tài chính cá nhân với AI insights",
    price: 249000,
    originalPrice: 399000,
    image: "/finance-management-app.png",
    category: "Mobile App",
    rating: 4.8,
    downloads: 780,
    demoUrl: "https://finance-demo.qtusdev.com",
    features: [
      "Theo dõi thu chi tự động",
      "Phân loại giao dịch thông minh",
      "Báo cáo và biểu đồ chi tiết",
      "Đặt mục tiêu tiết kiệm",
      "AI financial advisor",
    ],
    technologies: ["Flutter", "Dart", "Firebase", "Python", "TensorFlow"],
    files: [
      { name: "flutter-app-source.zip", size: "42.1 MB", type: "code", icon: Code },
      { name: "ai-backend.zip", size: "18.7 MB", type: "code", icon: Code },
      { name: "app-screenshots.zip", size: "8.3 MB", type: "image", icon: ImageIcon },
      { name: "technical-docs.pdf", size: "4.8 MB", type: "document", icon: FileText },
      { name: "deployment-guide.pdf", size: "2.2 MB", type: "document", icon: FileText },
    ],
    longDescription: `
      Ứng dụng quản lý tài chính cá nhân được xây dựng với Flutter, 
      tích hợp AI để phân tích thói quen chi tiêu và đưa ra lời khuyên 
      tài chính thông minh.
    `,
    changelog: [
      { version: "1.4.0", date: "2024-01-08", changes: ["AI insights improved", "New chart types", "Export features"] },
      { version: "1.3.0", date: "2023-12-25", changes: ["Goal tracking", "Budget alerts", "Dark theme"] },
    ],
  },
]

export default function ProductInfoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)
  const [isDownloading, setIsDownloading] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isPurchased, setIsPurchased] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Load current user
    const userStr = localStorage.getItem("currentUser")
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (userStr && isLoggedIn) {
      setCurrentUser(JSON.parse(userStr))
    }

    // Load product
    if (productId) {
      const foundProduct = products.find((p) => p.id === Number.parseInt(productId))
      if (foundProduct) {
        setProduct(foundProduct)

        // Check if user has purchased this product
        if (userStr && isLoggedIn) {
          const user = JSON.parse(userStr)
          const orders = JSON.parse(localStorage.getItem("orders") || "[]")
          const userOrders = orders.filter((order: any) => order.userId === user.id)
          const hasPurchased = userOrders.some((order: any) =>
            order.items.some((item: any) => item.id === foundProduct.id),
          )
          setIsPurchased(hasPurchased)
        }
      } else {
        router.push("/products")
      }
    } else {
      router.push("/products")
    }

    // Check for success message from checkout
    const success = searchParams.get("success")
    if (success === "true") {
      setShowSuccess(true)
      setIsPurchased(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [productId, router, searchParams])

  const handleDownload = async (file: any) => {
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    if (!isPurchased) {
      alert("Bạn cần mua sản phẩm này trước khi tải xuống!")
      return
    }

    setIsDownloading(file.name)
    setDownloadProgress(0)

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsDownloading(null)

          // Update download count in user purchases
          const userPurchases = JSON.parse(localStorage.getItem("userPurchases") || "[]")
          const updatedPurchases = userPurchases.map((purchase: any) => {
            if (purchase.id === product.id) {
              return {
                ...purchase,
                downloads: (purchase.downloads || 0) + 1
              }
            }
            return purchase
          })
          localStorage.setItem("userPurchases", JSON.stringify(updatedPurchases))

          // Create download link
          const link = document.createElement("a")
          link.href = `/downloads/${file.name}`
          link.download = file.name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }

  const handleAddToCart = () => {
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        description: product.description,
        quantity: 1,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    router.push("/cart")
  }

  const handleBuyNow = () => {
    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    // Add to cart and go to checkout
    const cart = [
      {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        description: product.description,
        quantity: 1,
      },
    ]

    localStorage.setItem("cart", JSON.stringify(cart))
    router.push("/checkout")
  }

  if (!product) {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/products">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại
                </Link>
              </Button>
              <Logo />
            </div>
            {currentUser && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Chào {currentUser.name || currentUser.email}</span>
                <Badge className="bg-green-100 text-green-800">
                  {(currentUser.balance || 0).toLocaleString("vi-VN")}đ
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              🎉 Thanh toán thành công! Bạn có thể tải xuống sản phẩm ngay bây giờ.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Info */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  {isPurchased && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Đã mua
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
                <p className="text-muted-foreground text-lg mb-4">{product.description}</p>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Download className="w-4 h-4 mr-1" />
                    <span>{product.downloads.toLocaleString()} lượt tải</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{Math.floor(product.downloads * 0.8)} người dùng</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-blue-600">{product.price.toLocaleString("vi-VN")}đ</span>
                    {product.originalPrice > product.price && (
                      <span className="text-lg text-muted-foreground line-through">
                        {product.originalPrice.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </div>
                  {product.originalPrice > product.price && (
                    <Badge className="bg-red-100 text-red-800">
                      Giảm {Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* Product Image */}
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Demo Button */}
              <div className="flex space-x-4">
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Xem Demo
                  </a>
                </Button>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="description">Mô tả</TabsTrigger>
                  <TabsTrigger value="features">Tính năng</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="changelog">Changelog</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mô tả chi tiết</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-line">{product.longDescription}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Công nghệ sử dụng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {product.technologies.map((tech: string) => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tính năng chính</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {product.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="files" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Files bao gồm</CardTitle>
                      <CardDescription>
                        {isPurchased ? "Nhấn để tải xuống" : "Cần mua sản phẩm để tải xuống"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {product.files.map((file: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <file.icon className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-muted-foreground">{file.size}</p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleDownload(file)}
                              disabled={!isPurchased || isDownloading === file.name}
                              size="sm"
                            >
                              {isDownloading === file.name ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  {Math.round(downloadProgress)}%
                                </div>
                              ) : (
                                <>
                                  <Download className="w-4 h-4 mr-2" />
                                  Tải
                                </>
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>

                      {isDownloading && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Đang tải {isDownloading}...</span>
                            <span>{Math.round(downloadProgress)}%</span>
                          </div>
                          <Progress value={downloadProgress} className="w-full" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="changelog" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lịch sử cập nhật</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {product.changelog.map((change: any, index: number) => (
                          <div key={index} className="border-l-2 border-blue-200 pl-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">v{change.version}</Badge>
                              <span className="text-sm text-muted-foreground flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {change.date}
                              </span>
                            </div>
                            <ul className="space-y-1">
                              {change.changes.map((item: string, i: number) => (
                                <li key={i} className="text-sm flex items-start">
                                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Purchase Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle>Mua sản phẩm</CardTitle>
                  <CardDescription>
                    {isPurchased ? "Bạn đã sở hữu sản phẩm này" : "Sở hữu ngay sản phẩm này"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {product.price.toLocaleString("vi-VN")}đ
                    </div>
                    {product.originalPrice > product.price && (
                      <div className="text-sm text-muted-foreground line-through">
                        {product.originalPrice.toLocaleString("vi-VN")}đ
                      </div>
                    )}
                  </div>

                  {!currentUser ? (
                    <div className="space-y-2">
                      <Button asChild className="w-full">
                        <Link href="/auth/login">Đăng nhập để mua</Link>
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">Cần đăng nhập để thực hiện mua hàng</p>
                    </div>
                  ) : isPurchased ? (
                    <div className="space-y-2">
                      <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-600 dark:text-green-400">
                          Bạn đã sở hữu sản phẩm này. Có thể tải xuống ngay!
                        </AlertDescription>
                      </Alert>
                      <Button asChild className="w-full bg-transparent" variant="outline">
                        <Link href="/dashboard">Xem trong Dashboard</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button onClick={handleBuyNow} className="w-full">
                        Mua ngay
                      </Button>
                      <Button onClick={handleAddToCart} variant="outline" className="w-full bg-transparent">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Thêm vào giỏ
                      </Button>

                      {currentUser.balance < product.price && (
                        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-600 dark:text-orange-400">
                            Số dư không đủ. Cần nạp thêm {(product.price - currentUser.balance).toLocaleString("vi-VN")}
                            đ
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bao gồm:</span>
                      </div>
                      <ul className="space-y-1 text-muted-foreground">
                        <li className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          Source code hoàn chỉnh
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          Tài liệu hướng dẫn
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          Hỗ trợ kỹ thuật 30 ngày
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          Cập nhật miễn phí
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
