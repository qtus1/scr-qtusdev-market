import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export { sql }

// User operations
export async function createUser(username: string, email: string, passwordHash: string) {
  const result = await sql`
    INSERT INTO users (username, email, password_hash)
    VALUES (${username}, ${email}, ${passwordHash})
    RETURNING id, username, email, balance, created_at
  `
  return result[0]
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `
  return result[0]
}

export async function getUserById(id: number) {
  const result = await sql`
    SELECT id, username, email, balance, created_at FROM users WHERE id = ${id}
  `
  return result[0]
}

// Product operations
export async function getProducts(limit = 20, offset = 0) {
  const result = await sql`
    SELECT * FROM products 
    WHERE is_active = true 
    ORDER BY created_at DESC 
    LIMIT ${limit} OFFSET ${offset}
  `
  return result
}

export async function getProductById(id: number) {
  const result = await sql`
    SELECT * FROM products WHERE id = ${id} AND is_active = true
  `
  return result[0]
}

export async function createProduct(
  title: string,
  description: string,
  price: number,
  category: string,
  demoUrl?: string,
  downloadUrl?: string,
  tags?: string[],
  imageUrl?: string,
) {
  const result = await sql`
    INSERT INTO products (title, description, price, demo_url, download_url, category, tags, image_url)
    VALUES (${title}, ${description}, ${price}, ${demoUrl}, ${downloadUrl}, ${category}, ${tags}, ${imageUrl})
    RETURNING *
  `
  return result[0]
}

// Transaction operations
export async function createTransaction(
  userId: number,
  type: string,
  amount: number,
  paymentMethod?: string,
  details?: any,
) {
  const result = await sql`
    INSERT INTO transactions (user_id, type, amount, payment_method, transaction_details)
    VALUES (${userId}, ${type}, ${amount}, ${paymentMethod}, ${JSON.stringify(details)})
    RETURNING *
  `
  return result[0]
}

export async function updateUserBalance(userId: number, amount: number) {
  const result = await sql`
    UPDATE users 
    SET balance = balance + ${amount}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${userId}
    RETURNING balance
  `
  return result[0]
}
