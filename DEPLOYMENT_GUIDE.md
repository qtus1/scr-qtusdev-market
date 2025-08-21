# 🚀 Hướng dẫn Deploy qtusdev Market lên Firebase Hosting

## 📋 Yêu cầu trước khi deploy

- Node.js 18+ đã được cài đặt
- Firebase CLI đã được cài đặt
- Tài khoản Firebase và project đã được tạo
- Các environment variables đã được cấu hình

## 🔧 Cài đặt Firebase CLI

\`\`\`bash
npm install -g firebase-tools
\`\`\`

## 🔑 Đăng nhập Firebase

\`\`\`bash
firebase login
\`\`\`

## 🏗️ Khởi tạo Firebase Hosting

\`\`\`bash
firebase init hosting
\`\`\`

Chọn các tùy chọn sau:
- ✅ Use an existing project
- 📁 Public directory: `out`
- ✅ Configure as a single-page app: Yes
- ❌ Set up automatic builds: No
- ❌ Overwrite index.html: No

## 📦 Build và Deploy

### 1. Build project
\`\`\`bash
npm run build
\`\`\`

### 2. Deploy lên Firebase
\`\`\`bash
firebase deploy --only hosting
\`\`\`

Hoặc sử dụng script có sẵn:
\`\`\`bash
npm run deploy:hosting
\`\`\`

## 🧪 Test WhatsApp Integration

Sau khi deploy, test WhatsApp bằng cách:

\`\`\`bash
# Test local
curl -X POST http://localhost:3000/api/test-whatsapp

# Test production
curl -X POST https://qtusdev.firebaseapp.com/api/test-whatsapp
\`\`\`

## 🔔 Cấu hình Notifications

### Telegram Bot Setup
1. Tạo bot mới với @BotFather
2. Lấy bot token: `8321367297:AAGsBmML0vZ9rgLnZT5GSnP2u_NohwcIA3E`
3. Lấy chat ID: `6688889075`

### Twilio WhatsApp Setup
1. Account SID: `AC478746912f93493ecf7bd5ca022508c0`
2. Auth Token: `86cbef1516b2ee7d18d7915e82791b62`
3. WhatsApp Number: `whatsapp:+14155238886`

## 📱 Test Notifications

### Test Telegram
\`\`\`bash
curl -X POST https://api.telegram.org/bot8321367297:AAGsBmML0vZ9rgLnZT5GSnP2u_NohwcIA3E/sendMessage \
-H "Content-Type: application/json" \
-d '{
  "chat_id": "6688889075",
  "text": "🧪 Test message from qtusdev market!",
  "parse_mode": "HTML"
}'
\`\`\`

### Test WhatsApp
\`\`\`bash
curl -X POST https://api.twilio.com/2010-04-01/Accounts/AC478746912f93493ecf7bd5ca022508c0/Messages.json \
-u AC478746912f93493ecf7bd5ca022508c0:86cbef1516b2ee7d18d7915e82791b62 \
-d "From=whatsapp:+14155238886" \
-d "To=whatsapp:+84328551707" \
-d "Body=🧪 Test WhatsApp message from qtusdev market!"
\`\`\`

## 🌐 URLs sau khi deploy

- **Website**: https://qtusdev.firebaseapp.com
- **Admin Panel**: https://qtusdev.firebaseapp.com/admin
- **API Test**: https://qtusdev.firebaseapp.com/api/test-whatsapp

## 📊 Monitoring & Analytics

### Firebase Analytics
- Tự động track page views
- Custom events cho purchases, deposits, withdrawals

### Real-time Notifications
- ✅ Telegram notifications cho admin
- ✅ WhatsApp notifications cho admin
- ✅ Device & IP tracking
- ✅ Timestamp theo múi giờ Việt Nam

## 🔧 Troubleshooting

### Lỗi build
\`\`\`bash
# Clear cache và rebuild
rm -rf .next out
npm run build
\`\`\`

### Lỗi Firebase deploy
\`\`\`bash
# Re-login và thử lại
firebase logout
firebase login
firebase deploy --only hosting
\`\`\`

### Lỗi WhatsApp
- Kiểm tra Twilio credentials
- Verify WhatsApp sandbox number
- Check account balance

### Lỗi Telegram
- Verify bot token
- Check chat ID
- Ensure bot is added to group/channel

## 📈 Performance Optimization

- ✅ Static export cho tốc độ tải nhanh
- ✅ Image optimization
- ✅ CSS/JS minification
- ✅ CDN caching via Firebase

## 🔒 Security

- ✅ Environment variables được bảo mật
- ✅ API keys không expose ra client
- ✅ HTTPS enforced
- ✅ Input validation

## 📞 Support

Nếu gặp vấn đề trong quá trình deploy:
1. Check Firebase console logs
2. Verify environment variables
3. Test API endpoints
4. Contact support team

---

**Chúc mừng! 🎉 Website qtusdev Market đã được deploy thành công!**
