import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'

const getAdminCredentials = () => ({
  email: process.env.ADMIN_EMAIL?.trim().toLowerCase(),
  passwordHash: process.env.ADMIN_PASSWORD_HASH,
  password: process.env.ADMIN_PASSWORD,
})

export const loginAdmin = async (req: Request, res: Response) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const configured = getAdminCredentials()

  if (!configured.email || (!configured.passwordHash && !configured.password)) {
    return res.status(503).json({ message: 'Admin credentials are not configured' })
  }

  const passwordMatches = configured.passwordHash
    ? await bcrypt.compare(password, configured.passwordHash)
    : password === configured.password

  if (email !== configured.email || !passwordMatches) {
    return res.status(401).json({ message: 'Invalid admin credentials' })
  }

  const token = jwt.sign(
    { role: 'admin', email: configured.email },
    process.env.ADMIN_ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET || '',
    { expiresIn: '8h' },
  )

  return res.status(200).json({
    token,
    admin: { email: configured.email, role: 'admin' },
  })
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined
    const secret = process.env.ADMIN_ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET

    if (!token || !secret) {
      return res.status(401).json({ message: 'Admin authentication required' })
    }

    const payload = jwt.verify(token, secret) as { role?: string; email?: string }
    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    req.admin = { email: payload.email }
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired admin token' })
  }
}

export const getAdminProfile = (req: Request, res: Response) => {
  return res.json({ admin: { ...req.admin, role: 'admin' } })
}

declare global {
  namespace Express {
    interface Request {
      admin?: { email?: string }
    }
  }
}
