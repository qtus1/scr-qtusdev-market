import { NextRequest, NextResponse } from 'next/server';
import { saveUser, saveNotification, onUsersChange } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const { email, currentPassword, newPassword, deviceInfo, ipAddress } = await request.json();
    
    // Lấy danh sách người dùng từ MySQL
    let users: any[] = [];
    await onUsersChange((fetchedUsers) => {
      users = fetchedUsers;
    });
    
    const user = users.find((u: any) => u.email === email && (!currentPassword || u.password === currentPassword));
    if (!user) {
      return NextResponse.json({ success: false, error: 'Mật khẩu hiện tại không đúng!' }, { status: 400 });
    }

    await saveUser({ ...user, password: newPassword });
    const message = `🔑 <b>${email}</b> đã đổi mật khẩu<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
    await saveNotification({
      type: 'change_password',
      title: 'Đổi mật khẩu',
      message,
      user: { email, name: user.displayName || 'User' },
      timestamp: new Date().toISOString(),
      device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
      ip: ipAddress,
    });
    return NextResponse.json({ success: true, error: null });
  } catch (error: any) {
    console.error('API change password fallback error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to change password' }, { status: 500 });
  }
}