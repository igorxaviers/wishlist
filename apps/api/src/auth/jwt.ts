import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'listamagica-secret'

export function generateToken(userId: string) {
  return jwt.sign({ userId }, SECRET, { expiresIn: '1h' })
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}
