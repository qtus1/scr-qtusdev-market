import { NextRequest, NextResponse } from 'next/server';
import { saveNotification } from '@/lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const { email, password, deviceInfo, ipAddress } = await request.json();
    console.log('Admin login attempt:', { email, deviceInfo, ipAddress });
    
    // Hardcoded admin credentials for testing
    const adminCredentials = [
      { email: "admin@gmail.com", password: "qtusdev" },
      // Also check environment variables if set
      { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
    ].filter((cred) => cred.email && cred.password);
    
    console.log('Available admin credentials:', adminCredentials.length);
    
    console.log('Admin credentials found:', adminCredentials.length > 0);
    const admin = adminCredentials.find((a) => a.email === email && a.password === password);

    if (admin) {
      const message = `👑 <b>Admin ${admin.email}</b> đã đăng nhập<br>🌐 IP: ${ipAddress}<br>📱 Thiết bị: ${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})<br>⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`;
      await saveNotification({
        type: 'admin_login',
        title: 'Admin đăng nhập',
        message,
        user: { email: admin.email || '', name: 'Admin' },
        timestamp: new Date().toISOString(),
        device: `${deviceInfo.deviceType} (${deviceInfo.browser}, ${deviceInfo.os})`,
        ip: ipAddress,
      });
      return NextResponse.json({ success: true, error: null });
    }
    return NextResponse.json({ success: false, error: 'Thông tin đăng nhập không chính xác!' }, { status: 400 });
  } catch (error: any) {
    console.error('API admin login error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to login admin' }, { status: 500 });
  }
}