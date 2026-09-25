import { Response, NextFunction } from 'express'
import prisma from '../../../../packages/libs/prisma'
import jwt from 'jsonwebtoken'
import { setCookie } from '../utils/cookies/setCookie'

export const switchRole = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { role } = req.body as { role?: string }
    if (!role || (role !== 'user' && role !== 'seller')) {
      return res.status(400).json({ success: false, message: 'Invalid role' })
    }

    // ensure requester is authenticated
    if (!req.role) return res.status(401).json({ success: false, message: 'Unauthorized' })

    const email = req.user?.email ?? req.seller?.email
    if (!email) return res.status(400).json({ success: false, message: 'Email not found in requester' })

    // defensive: ensure prisma client has accounts model (after schema change you must run `prisma generate`)
    if (!('accounts' in prisma)) {
      return res.status(501).json({ success: false, message: 'Server not configured: prisma.accounts model missing. Run `npx prisma generate` and restart the server.' })
    }

    const account = await prisma.accounts.findUnique({ where: { email } })
    if (!account) return res.status(404).json({ success: false, message: 'Account not linked' })

    if (role === 'seller') {
      if (!account.sellerId) return res.status(403).json({ success: false, message: 'Seller role not linked to account' })
      const seller = await prisma.sellers.findUnique({ where: { id: account.sellerId } })
      if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' })

      const accessToken = jwt.sign({ id: seller.id, role: 'seller' }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })
      setCookie(res, 'seller-access-token', accessToken)
      return res.status(200).json({ success: true, role: 'seller' })
    }

    // role === 'user'
    if (!account.userId) return res.status(403).json({ success: false, message: 'User role not linked to account' })
    const user = await prisma.users.findUnique({ where: { id: account.userId } })
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const accessToken = jwt.sign({ id: user.id, role: 'user' }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '15m' })
    setCookie(res, 'access-token', accessToken)
    return res.status(200).json({ success: true, role: 'user' })

  } catch (error) {
    return next(error)
  }
}

export const getAccountForCurrentUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const email = req.user?.email ?? req.seller?.email
    if (!email) return res.status(400).json({ success: false, message: 'Email not found' })

    if (!('accounts' in prisma)) {
      return res.status(501).json({ success: false, message: 'Server not configured: prisma.accounts model missing. Run `npx prisma generate` and restart the server.' })
    }

    const account = await prisma.accounts.findUnique({ where: { email } })
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' })

    return res.status(200).json({ success: true, account: {
      email: account.email,
      roles: account.roles,
      userId: account.userId,
      sellerId: account.sellerId,
    } })
  } catch (error) {
    return next(error)
  }
}
