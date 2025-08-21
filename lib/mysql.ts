import { createPool, type Pool } from "mysql2/promise";
import { NextResponse } from "next/server";

// MySQL configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "",
  database: process.env.MYSQL_DATABASE || "qtusdevmarket",
};

// Initialize MySQL pool
const pool: Pool = createPool(mysqlConfig);

// Interfaces
interface UserData {
  uid: string;
  email: string;
  displayName: string;
  name: string;
  balance: number;
  avatar: string;
  provider: string;
  createdAt: string;
  lastActivity: string;
  loginCount: number;
  ipAddress: string;
  status?: string;
  password?: string;
}

interface Notification {
  id?: string;
  type: string;
  title: string;
  message: string;
  user?: { email: string; name: string };
  admin?: { email: string; name: string; loginTime: string };
  timestamp: string;
  device: string;
  ip: string;
  read?: boolean;
}

interface Purchase {
  id?: string;
  user_id: string;
  product_id: string;
  amount: number;
  timestamp: string;
}

interface Deposit {
  id?: string;
  user_id: string;
  amount: number;
  timestamp: string;
}

interface Withdrawal {
  id?: string;
  user_id: string;
  amount: number;
  timestamp: string;
}

// Generate secure token
const generateSecureToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Database functions
export const saveNotification = async (notification: Notification): Promise<{ error: string | null }> => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      `INSERT INTO notifications (type, title, message, user_email, user_name, timestamp, device, ip, read)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notification.type,
        notification.title,
        notification.message,
        notification.user?.email || "",
        notification.user?.name || "",
        notification.timestamp,
        notification.device,
        notification.ip,
        notification.read || false,
      ]
    );
    connection.release();
  } catch (error) {
    console.warn("MySQL notification save failed:", error);
  }

  return { error: null };
};

export const savePurchase = async (purchase: Purchase): Promise<{ error: string | null }> => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      `INSERT INTO purchases (user_id, product_id, amount, timestamp)
       VALUES (?, ?, ?, ?)`,
      [purchase.user_id, purchase.product_id, purchase.amount, purchase.timestamp]
    );
    connection.release();
  } catch (error) {
    console.warn("MySQL purchase save failed:", error);
  }

  return { error: null };
};

export const saveDeposit = async (deposit: Deposit): Promise<{ error: string | null }> => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      `INSERT INTO deposits (user_id, amount, timestamp)
       VALUES (?, ?, ?)`,
      [deposit.user_id, deposit.amount, deposit.timestamp]
    );
    connection.release();
  } catch (error) {
    console.warn("MySQL deposit save failed:", error);
  }

  return { error: null };
};

export const saveWithdrawal = async (withdrawal: Withdrawal): Promise<{ error: string | null }> => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      `INSERT INTO withdrawals (user_id, amount, timestamp)
       VALUES (?, ?, ?)`,
      [withdrawal.user_id, withdrawal.amount, withdrawal.timestamp]
    );
    connection.release();
  } catch (error) {
    console.warn("MySQL withdrawal save failed:", error);
  }

  return { error: null };
};

export const saveUser = async (user: UserData): Promise<{ error: string | null }> => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      `INSERT INTO users (uid, email, displayName, balance, avatar, provider, createdAt, lastActivity, loginCount, ipAddress, status, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       displayName = VALUES(displayName), balance = VALUES(balance), avatar = VALUES(avatar), provider = VALUES(provider),
       lastActivity = VALUES(lastActivity), loginCount = VALUES(loginCount), ipAddress = VALUES(ipAddress), status = VALUES(status), password = VALUES(password)`,
      [
        user.uid,
        user.email,
        user.displayName,
        user.balance || 0,
        user.avatar,
        user.provider,
        user.createdAt,
        user.lastActivity,
        user.loginCount,
        user.ipAddress,
        user.status || "active",
        user.password || null,
      ]
    );
    connection.release();
  } catch (error) {
    console.warn("MySQL user save failed:", error);
  }
  return { error: null };
};

export const getUserData = async (userId: string): Promise<{ data: UserData | null; error: string | null }> => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`SELECT * FROM users WHERE uid = ?`, [userId]);
    connection.release();
    return { data: (rows as any[])[0] || null, error: null };
  } catch (error) {
    console.warn("MySQL get user data failed:", error);
    return { data: null, error: "User not found" };
  }
};

export const saveUserData = async (userId: string, data: Partial<UserData>): Promise<{ error: string | null }> => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      `UPDATE users SET displayName = ?, balance = ?, avatar = ?, provider = ?, lastActivity = ?, loginCount = ?, ipAddress = ?, status = ?
       WHERE uid = ?`,
      [
        data.displayName || null,
        data.balance || 0,
        data.avatar || null,
        data.provider || null,
        data.lastActivity || new Date().toISOString(),
        data.loginCount || 1,
        data.ipAddress || null,
        data.status || "active",
        userId,
      ]
    );
    connection.release();
    return { error: null };
  } catch (error: any) {
    console.warn("MySQL save user data failed:", error);
    return { error: error.message || "Failed to save user data" };
  }
};

export const changePassword = async (email: string, newPassword: string): Promise<{ error: string | null }> => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      `UPDATE users SET password = ? WHERE email = ?`,
      [newPassword, email]
    );
    connection.release();
    return { error: null };
  } catch (error: any) {
    console.warn("MySQL change password failed:", error);
    return { error: error.message || "Failed to change password" };
  }
};

export const requestPasswordReset = async (email: string): Promise<{ success: boolean; error: string | null; token?: string }> => {
  try {
    const token = generateSecureToken();
    const expires = new Date(Date.now() + 3600000);
    const connection = await pool.getConnection();
    await connection.execute(
      `INSERT INTO password_resets (email, token, expires, createdAt)
       VALUES (?, ?, ?, ?)`,
      [email, token, expires.toISOString(), new Date().toISOString()]
    );
    connection.release();
    return { success: true, error: null, token };
  } catch (error: any) {
    console.error("Request password reset error:", error);
    return { success: false, error: error.message || "Đã xảy ra lỗi khi gửi yêu cầu đổi mật khẩu!" };
  }
};

export const onPurchasesChange = async (callback: (purchases: Purchase[]) => void): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`SELECT * FROM purchases`);
    connection.release();
    callback(rows as Purchase[]);
  } catch (error) {
    console.warn("MySQL purchases fetch failed:", error);
  }
};

export const onUsersChange = async (callback: (users: UserData[]) => void): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`SELECT * FROM users`);
    connection.release();
    callback(rows as UserData[]);
  } catch (error) {
    console.warn("MySQL users fetch failed:", error);
  }
};

