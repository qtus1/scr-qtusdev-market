"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Download, Eye, ShoppingCart, Search } from 'lucide-react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState("all")
  const [products, setProducts] = useState<any[]>([])

  const [categories, setCategories] = useState([
    { id: "all", name: "Tất cả", count: 0 },
    { id: "website", name: "Website", count: 0 },
    { id: "mobile", name: "Mobile App", count: 0 },
    { id: "game", name: "Game", count: 0 },
    { id: "tool", name: "Tools", count: 0 },
    { id: "template", name: "Template", count: 0 },
  ])

  useEffect(() => {
    // Load products from localStorage
    const uploadedProducts = JSON.parse(localStorage.getItem("uploadedProducts") || "[]")

    // Ensure all products have proper structure
    const validatedProducts = uploadedProducts.map((product: any) => ({
      ...product,
      tags: Array.isArray(product.tags) ? product.tags : [],
      rating: product.rating || 0,
      downloads: product.downloads || 0,
      price: product.price || 0,
      originalPrice: product.originalPrice || product.price || 0,
    }))

    setProducts(validatedProducts)

    // Update category counts
    const updatedCategories = categories.map((category) => {
      if (category.id === "all") {
        return { ...category, count: validatedProducts.length }
      } else {
        return {
          ...category,
          count: validatedProducts.filter((p: any) => p.category === category.id).length
        }
      }
    })
    setCategories(updatedCategories)
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(product.tags) && product.tags.some((tag: any) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "under-100k" && product.price < 100000) ||
      (priceRange === "100k-200k" && product.price >= 100000 && product.price < 200000) ||
      (priceRange === "200k-300k" && product.price >= 200000 && product.price < 300000) ||
      (priceRange === "over-300k" && product.price >= 300000)

    return matchesSearch && matchesCategory && matchesPrice
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "popular":
        return (b.downloads || 0) - (a.downloads || 0)
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      default:
        return 0
    }
  })

  const handleAddToCart = (product: any) => {
    if (typeof window !== "undefined" && (window as any).addToCart) {
      ;(window as any).addToCart(product)
    } else {
      // Fallback if addToCart is not available
      const cartItems = JSON.parse(localStorage.getItem("cartItems") || "[]")
      const existingItem = cartItems.find((item: any) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cartItems.push({ ...product, quantity: 1 })
      }

      localStorage.setItem("cartItems", JSON.stringify(cartItems))
      window.dispatchEvent(new Event("cartUpdated"))
      alert(`Đã thêm "${product.title}" vào giỏ hàng!`)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-24">
        <div className="mb-8 animate-fadeInDown">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Mã nguồn{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              chất lượng cao
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Khám phá hàng trăm mã nguồn được tuyển chọn kỹ lưỡng từ các developer hàng đầu
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-gray-900 dark:text-gray-100 text-sm font-medium mb-2">Tìm kiếm</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm mã nguồn..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-900 dark:text-gray-100 text-sm font-medium mb-2">Thể loại</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-gray-900 dark:text-gray-100 text-sm font-medium mb-2">Khoảng giá</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="under-100k">Dưới 100k</SelectItem>
                      <SelectItem value="100k-200k">100k - 200k</SelectItem>
                      <SelectItem value="200k-300k">200k - 300k</SelectItem>
                      <SelectItem value="over-300k">Trên 300k</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-gray-900 dark:text-gray-100 text-sm font-medium mb-2">Sắp xếp</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Mới nhất</SelectItem>
                      <SelectItem value="oldest">Cũ nhất</SelectItem>
                      <SelectItem value="price-low">Giá thấp đến cao</SelectItem>
                      <SelectItem value="price-high">Giá cao đến thấp</SelectItem>
                      <SelectItem value="popular">Phổ biến nhất</SelectItem>
                      <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Hiển thị {sortedProducts.length} kết quả
            {searchQuery && ` cho "${searchQuery}"`}
            {selectedCategory !== "all" &&
              ` trong thể loại "${categories.find((c) => c.id === selectedCategory)?.name}"`}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProducts.map((product) => (
            <Card
              key={product.id}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-500/50 transition-all duration-300 group overflow-hidden"
            >
              <div className="relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.featured && (
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    Nổi bật
                  </Badge>
                )}
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className="bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-gray-900 dark:text-gray-100 text-sm">{product.rating}</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-2">
                    {product.demoLink && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 bg-transparent"
                        onClick={() => window.open(product.demoLink, "_blank")}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Demo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-purple-400 transition-colors">
                  {product.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{product.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(product.tags) &&
                    product.tags.length > 0 &&
                    product.tags.slice(0, 3).map((tag: any, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  {Array.isArray(product.tags) && product.tags.length > 3 && (
                    <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-xs">
                      +{product.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{product.price.toLocaleString("vi-VN")}đ</span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-600 dark:text-gray-400 line-through">
                        {product.originalPrice.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                    <Download className="w-4 h-4 mr-1" />
                    {product.downloads}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Mua ngay
                  </Button>
                  {product.demoLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 bg-transparent"
                      onClick={() => window.open(product.demoLink, "_blank")}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {products.length === 0
                ? "Chưa có sản phẩm nào được upload. Admin vui lòng upload sản phẩm mới."
                : "Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy mã nguồn phù hợp"}
            </p>
            {products.length > 0 && (
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("all")
                  setPriceRange("all")
                  setSortBy("newest")
                }}
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 bg-transparent"
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        )}

        {/* Load More */}
        {sortedProducts.length > 0 && (
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 px-8 bg-transparent"
            >
              Xem thêm mã nguồn
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
