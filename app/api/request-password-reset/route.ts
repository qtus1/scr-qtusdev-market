import { NextRequest, NextResponse } from 'next/server';
import { saveNotification, requestPasswordReset } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const { email, deviceInfo, ipAddress } = await request.json();
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find((u: any) => u.email === email);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Email không tồn tại!' }, { status: 400 });
    }

    const { success, error, token } = await requestPasswordReset(email);
    if (!success) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    const message = `🔄 Yêu cầu đổi mật khẩu cho <b>${email}</b><br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}<br>🔗 Token: ${token}`;
    await saveNotification({
      type: 'password_reset',
      title: 'Yêu cầu đổi mật khẩu',
      message,
      user: { email, name: user.name || 'User' },
      timestamp: new Date().toISOString(),
      device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
      ip: ipAddress,
    });
    return NextResponse.json({ success: true, error: null, token });
  } catch (error: any) {
    console.error('API request password reset error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to request password reset' }, { status: 500 });
  }
}