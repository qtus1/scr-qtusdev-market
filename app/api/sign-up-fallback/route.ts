import { NextRequest, NextResponse } from 'next/server';
import { saveUser, saveNotification, onUsersChange } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const { email, password, userData, deviceInfo, ipAddress } = await request.json();
    
    // Lấy danh sách người dùng từ MySQL
    let users: any[] = [];
    await onUsersChange((fetchedUsers) => {
      users = fetchedUsers;
    });
    
    // Kiểm tra xem email đã được đăng ký chưa
    if (users.find((u: any) => u.email === email)) {
      return NextResponse.json({ user: null, error: 'Email này đã được đăng ký!' });
    }

    const newUser = {
      uid: Date.now().toString(),
      email,
      displayName: userData.name,
      name: userData.name,
      balance: 0,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
      provider: 'email',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      loginCount: 1,
      ipAddress,
      status: 'active',
      password,
    };
    
    const { password: _, ...userWithoutPassword } = newUser;
    await saveUser(userWithoutPassword);
    const message = `🎉 <b>${userData.name}</b> đã đăng ký tài khoản mới<br>📧 Email: ${email}<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
    await saveNotification({
      type: 'user_registration',
      title: 'Đăng ký thành công',
      message,
      user: { email, name: userData.name },
      timestamp: new Date().toISOString(),
      device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
      ip: ipAddress,
      read: false,
    });
    return NextResponse.json({ user: userWithoutPassword, error: null });
  } catch (error: any) {
    console.error('API sign-up fallback error:', error);
    return NextResponse.json({ user: null, error: error.message || 'Failed to sign up' }, { status: 500 });
  }
}