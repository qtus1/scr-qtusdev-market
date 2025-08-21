import { NextRequest, NextResponse } from 'next/server';
import { saveUser, saveNotification, onUsersChange } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const { email, password, deviceInfo, ipAddress } = await request.json();
    
    // Lấy danh sách người dùng từ MySQL
    let users: any[] = [];
    await onUsersChange((fetchedUsers) => {
      users = fetchedUsers;
    });
    
    // Tìm người dùng với email và mật khẩu khớp
    const registeredUser = users.find((u: any) => u.email === email && u.password === password);

    if (registeredUser) {
      const userData = {
        ...registeredUser,
        lastActivity: new Date().toISOString(),
        loginCount: (registeredUser.loginCount || 0) + 1,
        ipAddress,
      };
      await saveUser(userData);
      const message = `👤 <b>${userData.name}</b> đã đăng nhập<br>📧 Email: ${userData.email}<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
      await saveNotification({
        type: 'user_login',
        title: 'Đăng nhập thành công',
        message,
        user: { email: userData.email, name: userData.name },
        timestamp: new Date().toISOString(),
        device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
        ip: ipAddress,
      });
      return NextResponse.json({
        user: {
          uid: registeredUser.uid,
          email: registeredUser.email,
          displayName: registeredUser.name,
        },
        error: null,
      });
    }
    return NextResponse.json({ user: null, error: 'Email hoặc mật khẩu không chính xác!' });
  } catch (error: any) {
    console.error('API sign-in fallback error:', error);
    return NextResponse.json({ user: null, error: error.message || 'Failed to sign in' }, { status: 500 });
  }
}