-- Create database
CREATE DATABASE IF NOT EXISTS qtusdevmarket;
USE qtusdevmarket;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100),
    balance DECIMAL(15,2) DEFAULT 0,
    avatar VARCHAR(255),
    provider VARCHAR(50),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP,
    login_count INT DEFAULT 0,
    ip_address VARCHAR(45),
    password VARCHAR(255) -- Thêm dòng này để lưu mật khẩu
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(15,2) NOT NULL,
    category VARCHAR(100),
    image VARCHAR(255),
    download_link VARCHAR(255),
    demo_link VARCHAR(255),
    tags JSON,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    updated_by VARCHAR(50),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_time TIMESTAMP,
    approved_by VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    account_name VARCHAR(100),
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_time TIMESTAMP,
    approved_by VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    user_email VARCHAR(100),
    user_name VARCHAR(100),
    admin_email VARCHAR(100),
    admin_name VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device VARCHAR(100),
    ip VARCHAR(45),
    read_status BOOLEAN DEFAULT FALSE
);

-- Insert default admin user
INSERT INTO users (id, email, name, status, created_at)
VALUES ('admin', 'admin@gmail.com', 'Admin', 'active', NOW())
ON DUPLICATE KEY UPDATE email = email;
