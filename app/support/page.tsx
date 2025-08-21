import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Mail, Facebook, Phone, Clock, HelpCircle, FileText, Users } from 'lucide-react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function SupportPage() {
  const faqs = [
    {
      question: "Làm thế nào để mua mã nguồn?",
      answer:
        "Bạn cần đăng ký tài khoản, nạp tiền vào ví, sau đó chọn mã nguồn và thanh toán. Mã nguồn sẽ được gửi ngay lập tức sau khi thanh toán thành công.",
    },
    {
      question: "Các phương thức thanh toán được hỗ trợ?",
      answer:
        "Chúng tôi hỗ trợ thanh toán qua Banking (MB Bank, Techcombank, TPBank), Momo và các ví điện tử phổ biến.",
    },
    {
      question: "Tôi có thể hoàn tiền không?",
      answer:
        "Chúng tôi có chính sách hoàn tiền trong vòng 7 ngày nếu mã nguồn không hoạt động như mô tả hoặc có lỗi nghiêm trọng.",
    },
    {
      question: "Mã nguồn có được cập nhật không?",
      answer:
        "Có, chúng tôi thường xuyên cập nhật mã nguồn để sửa lỗi và thêm tính năng mới. Khách hàng đã mua sẽ được cập nhật miễn phí.",
    },
    {
      question: "Tôi cần hỗ trợ cài đặt mã nguồn?",
      answer:
        "Mỗi mã nguồn đều có hướng dẫn cài đặt chi tiết. Nếu cần hỗ trợ thêm, bạn có thể liên hệ qua Zalo hoặc email.",
    },
    {
      question: "Có thể sử dụng mã nguồn cho mục đích thương mại không?",
      answer:
        "Có, tất cả mã nguồn đều có license thương mại. Bạn có thể sử dụng để phát triển dự án cá nhân hoặc thương mại.",
    },
  ]

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Zalo",
      description: "Chat trực tiếp với chúng tôi",
      value: "Quét mã QR",
      link: "https://files.catbox.moe/kb9350.jpg",
      color: "from-blue-500 to-cyan-500",
      available: "24/7",
    },
    {
      icon: Mail,
      title: "Email",
      description: "Gửi email hỗ trợ",
      value: "qtussnguyen0220@gmail.com",
      link: "mailto:qtussnguyen0220@gmail.com",
      color: "from-red-500 to-pink-500",
      available: "Phản hồi trong 2h",
    },
    {
      icon: Facebook,
      title: "Facebook",
      description: "Nhắn tin qua Facebook",
      value: "Tú Quangg",
      link: "https://www.facebook.com/tu.quangg.195068/",
      color: "from-blue-600 to-blue-500",
      available: "24/7",
    },
    {
      icon: Phone,
      title: "Hotline",
      description: "Gọi điện hỗ trợ",
      value: "0328.551.707",
      link: "tel:0328551707",
      color: "from-green-500 to-emerald-500",
      available: "8:00 - 22:00",
    },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Trung tâm{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">hỗ trợ</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7. Hãy liên hệ với chúng tôi qua các kênh dưới đây
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <Card
              key={index}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-500/50 transition-all duration-300 group"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${method.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{method.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{method.description}</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium mb-3">{method.value}</p>
                <Badge variant="secondary" className="bg-white/10 text-gray-300 mb-4">
                  {method.available}
                </Badge>
                <a href={method.link} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    Liên hệ ngay
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Support Tabs */}
        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="bg-white/10 backdrop-blur-sm border-white/20 grid w-full grid-cols-3">
            <TabsTrigger value="faq" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Liên hệ
            </TabsTrigger>
            <TabsTrigger value="guides" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Hướng dẫn
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Câu hỏi thường gặp</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Tìm câu trả lời cho những câu hỏi phổ biến nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border-b border-white/10 pb-6 last:border-b-0">
                      <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-3">{faq.question}</h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Gửi tin nhắn</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Điền form dưới đây và chúng tôi sẽ phản hồi trong vòng 2 giờ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-900 dark:text-gray-100 text-sm font-medium mb-2">Họ và tên</label>
                        <Input
                          placeholder="Nguyễn Văn A"
                          className="bg-white/5 border-white/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-900 dark:text-gray-100 text-sm font-medium mb-2">Email</label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          className="bg-white/5 border-white/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-900 dark:text-gray-100 text-sm font-medium mb-2">Chủ đề</label>
                      <Input
                        placeholder="Vấn đề cần hỗ trợ"
                        className="bg-white/5 border-white/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-900 dark:text-gray-100 text-sm font-medium mb-2">Nội dung</label>
                      <Textarea
                        placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                        rows={5}
                        className="bg-white/5 border-white/20 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                      Gửi tin nhắn
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Thông tin liên hệ</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Các cách khác để liên hệ với chúng tôi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 dark:text-gray-100 font-semibold">Zalo</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Chat trực tiếp 24/7</p>
                        <a
                          href="https://files.catbox.moe/kb9350.jpg"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          Quét mã QR để chat
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-lg">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 dark:text-gray-100 font-semibold">Email</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Phản hồi trong 2 giờ</p>
                        <a
                          href="mailto:trachduong93@gmail.com"
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          trachduong93@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-3 rounded-lg">
                        <Facebook className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 dark:text-gray-100 font-semibold">Facebook</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Nhắn tin qua Messenger</p>
                        <a
                          href="https://www.facebook.com/tu.quangg.195068/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm"
                        >
                          Qtusdev Official
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 dark:text-gray-100 font-semibold">Giờ làm việc</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Thứ 2 - Chủ nhật</p>
                        <p className="text-gray-900 dark:text-gray-100 text-sm">8:00 - 22:00 (GMT+7)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-gray-900 dark:text-gray-100 font-semibold mb-2">Cam kết hỗ trợ</h4>
                    <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-1">
                      <li>• Phản hồi trong vòng 2 giờ</li>
                      <li>• Hỗ trợ cài đặt miễn phí</li>
                      <li>• Bảo hành mã nguồn 30 ngày</li>
                      <li>• Cập nhật miễn phí</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Hướng dẫn đăng ký tài khoản",
                  description: "Cách tạo tài khoản và xác thực email",
                  icon: Users,
                },
                {
                  title: "Hướng dẫn nạp tiền",
                  description: "Các phương thức nạp tiền và xác nhận giao dịch",
                  icon: MessageCircle,
                },
                {
                  title: "Hướng dẫn mua mã nguồn",
                  description: "Quy trình mua và tải về mã nguồn",
                  icon: FileText,
                },
                {
                  title: "Hướng dẫn cài đặt",
                  description: "Cách cài đặt và chạy mã nguồn",
                  icon: HelpCircle,
                },
                {
                  title: "Chính sách hoàn tiền",
                  description: "Điều kiện và quy trình hoàn tiền",
                  icon: Mail,
                },
                {
                  title: "Bảo mật tài khoản",
                  description: "Cách bảo vệ tài khoản của bạn",
                  icon: Users,
                },
              ].map((guide, index) => (
                <Card
                  key={index}
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-500/50 transition-all duration-300 group cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <guide.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 dark:text-gray-100 font-semibold group-hover:text-purple-400 transition-colors">
                          {guide.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{guide.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      Xem hướng dẫn
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
