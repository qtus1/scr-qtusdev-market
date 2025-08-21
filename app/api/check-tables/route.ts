// /app/api/check-tables/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  try {
    const pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
    });
    const connection = await pool.getConnection();

    // Kiểm tra bảng users
    const [usersTable] = await connection.query(`
      SHOW TABLES LIKE 'users';
    `);
    const usersExists = (usersTable as any[]).length > 0;

    // Kiểm tra bảng notifications
    const [notificationsTable] = await connection.query(`
      SHOW TABLES LIKE 'notifications';
    `);
    const notificationsExists = (notificationsTable as any[]).length > 0;

    let result = {
      users: { exists: usersExists, structure: null as any },
      notifications: { exists: notificationsExists, structure: null as any },
    };

    if (usersExists) {
      const [usersColumns] = await connection.query(`DESCRIBE users;`);
      result.users.structure = usersColumns;
    } else {
      await connection.query(`
        CREATE TABLE users (
          uid VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          displayName VARCHAR(255),
          balance DECIMAL(10, 2) DEFAULT 0,
          avatar VARCHAR(255),
          provider VARCHAR(50),
          createdAt DATETIME,
          lastActivity DATETIME,
          loginCount INT DEFAULT 0,
          ipAddress VARCHAR(45)
        )
      `);
      result.users.exists = true;
      const [usersColumns] = await connection.query(`DESCRIBE users;`);
      result.users.structure = usersColumns;
    }

    if (notificationsExists) {
      const [notificationsColumns] = await connection.query(`DESCRIBE notifications;`);
      result.notifications.structure = notificationsColumns;
    } else {
      await connection.query(`
        CREATE TABLE notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(50),
          title VARCHAR(255),
          message TEXT,
          user_email VARCHAR(255),
          user_name VARCHAR(255),
          timestamp DATETIME,
          device VARCHAR(255),
          ip VARCHAR(45)
        )
      `);
      result.notifications.exists = true;
      const [notificationsColumns] = await connection.query(`DESCRIBE notifications;`);
      result.notifications.structure = notificationsColumns;
    }

    connection.release();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}