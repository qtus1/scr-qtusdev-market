import { NextRequest, NextResponse } from 'next/server';
import { saveUser, saveNotification } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  const { providerType, deviceInfo, ipAddress } = await request.json();
  try {
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const email = `mock-${providerType}-${Date.now()}@${providerType}.com`;
    const existingUser = registeredUsers.find((u: any) => u.email === email);

    if (existingUser) {
      const userData = {
        ...existingUser,
        lastActivity: new Date().toISOString(),
        loginCount: (existingUser.loginCount || 0) + 1,
        ipAddress,
      };
      await saveUser(userData);
      const message = `👤 <b>${userData.name}</b> đã đăng nhập bằng ${providerType}<br>📧 Email: ${userData.email}<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
      await saveNotification({
        type: `user_login_${providerType}`,
        title: `Đăng nhập thành công qua ${providerType}`,
        message,
        user: { email: userData.email, name: userData.name },
        timestamp: new Date().toISOString(),
        device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
        ip: ipAddress,
      });
      return NextResponse.json({
        user: {
          uid: existingUser.uid,
          email: existingUser.email,
          displayName: existingUser.name,
        },
        error: null,
      });
    } else {
      const newUser = {
        uid: Date.now().toString(),
        email,
        displayName: `User-${providerType}-${Date.now()}`,
        name: `User-${providerType}-${Date.now()}`,
        balance: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(`User-${providerType}`)}&background=random`,
        provider: providerType,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        loginCount: 1,
        ipAddress,
        status: 'active',
      };
      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      await saveUser(newUser);
      const message = `🎉 <b>${newUser.name}</b> đã đăng ký tài khoản mới bằng ${providerType}<br>📧 Email: ${newUser.email}<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
      await saveNotification({
        type: `user_registration_${providerType}`,
        title: `Đăng ký thành công qua ${providerType}`,
        message,
        user: { email: newUser.email, name: newUser.name },
        timestamp: new Date().toISOString(),
        device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
        ip: ipAddress,
        read: false,
      });
      return NextResponse.json({
        user: {
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.name,
        },
        error: null,
      });
    }
  } catch (error: any) {
    console.error(`API ${providerType} auth fallback error:`, error);
    return NextResponse.json({ user: null, error: `Không thể đăng nhập bằng ${providerType}!` }, { status: 500 });
  }
}