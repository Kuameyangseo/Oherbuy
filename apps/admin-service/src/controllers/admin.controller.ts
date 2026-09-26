import { NextFunction, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../../../../packages/libs/prisma'
import { imagekit } from '../../../../packages/libs/imagekit'

const productInclude = { images: true, shops: { select: { id: true, name: true, sellerId: true } } } as const

const parsePage = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), max) : fallback
}

export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileName } = req.body || {}
    if (!fileName) return res.status(400).json({ message: 'fileName is required' })
    const response = await (imagekit as any).files.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: '/product',
    })
    return res.status(201).json({ file_url: response.url, fileId: response.fileId })
  } catch (error) {
    return next(error)
  }
}

export const getDashboard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [products, activeProducts, pendingProducts, deletedProducts, sellers, shops, users, orders, recentProducts, recentOrders] = await Promise.all([
      prisma.products.count(),
      prisma.products.count({ where: { status: 'Active', isDeleted: false } }),
      prisma.products.count({ where: { status: 'Pending', isDeleted: false } }),
      prisma.products.count({ where: { isDeleted: true } }),
      prisma.sellers.count(),
      prisma.shops.count(),
      prisma.users.count(),
      prisma.orders.count(),
      prisma.products.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: productInclude }),
      prisma.orders.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    ])

    return res.json({
      metrics: { products, activeProducts, pendingProducts, deletedProducts, sellers, shops, users, orders },
      recentProducts,
      recentOrders,
    })
  } catch (error) {
    return next(error)
  }
}

export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parsePage(req.query.page, 1, 100000)
    const limit = parsePage(req.query.limit, 25, 100)
    const search = String(req.query.search || '').trim()
    const status = String(req.query.status || '').trim()
    const includeDeleted = req.query.includeDeleted === 'true'

    const where: any = {
      ...(includeDeleted ? {} : { isDeleted: false }),
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({ where, include: productInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.products.count({ where }),
    ])

    return res.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    return next(error)
  }
}

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.products.findUnique({ where: { id: req.params.id }, include: productInclude })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    return res.json({ product })
  } catch (error) {
    return next(error)
  }
}

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body || {}
    const required = ['title', 'short_description', 'slug', 'tags', 'brand', 'category', 'subCategory', 'stock', 'sale_price', 'regular_price']
    const missing = required.filter((field) => body[field] === undefined || body[field] === null || String(body[field]).trim() === '')
    const images = Array.isArray(body.images) ? body.images.filter((image: any) => image?.url) : []
    if (!images.length) missing.push('images')
    if (missing.length) return res.status(400).json({ message: `missing required field(s): ${missing.join(', ')}` })

    const existing = await prisma.products.findUnique({ where: { slug: String(body.slug).trim() } })
    if (existing) return res.status(409).json({ message: 'Slug already exists' })

    const product = await prisma.products.create({
      data: {
        title: String(body.title).trim(),
        short_description: String(body.short_description).trim(),
        detailed_description: body.detailed_description ? String(body.detailed_description) : '',
        warranty: body.warranty ? String(body.warranty) : undefined,
        cashOnDelivery: body.cash_on_delivery ? String(body.cash_on_delivery) : undefined,
        slug: String(body.slug).trim(),
        tags: Array.isArray(body.tags) ? body.tags.map(String) : String(body.tags).split(',').map((tag) => tag.trim()).filter(Boolean),
        brand: String(body.brand).trim(),
        video_url: body.video_url ? String(body.video_url) : undefined,
        category: String(body.category).trim(),
        subCategory: String(body.subCategory).trim(),
        colors: Array.isArray(body.colors) ? body.colors.map(String) : [],
        sizes: Array.isArray(body.sizes) ? body.sizes.map(String) : [],
        stock: Number(body.stock),
        sale_price: Number(body.sale_price),
        regular_price: Number(body.regular_price),
        custom_properties: body.customProperties || {},
        custom_specifications: body.custom_specifications || {},
        discount_codes: [],
        status: ['Active', 'Pending', 'Draft'].includes(String(body.status)) ? String(body.status) as any : 'Active',
        images: { create: images.map((image: any) => ({ file_id: String(image.fileId || image.url), url: String(image.url) })) },
      },
      include: productInclude,
    })
    return res.status(201).json({ product })
  } catch (error) {
    return next(error)
  }
}

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body || {}
    const allowedFields = [
      'title', 'short_description', 'detailed_description', 'warranty', 'slug', 'tags', 'brand',
      'video_url', 'category', 'subCategory', 'colors', 'sizes', 'stock', 'sale_price',
      'regular_price', 'custom_properties', 'custom_specifications', 'status', 'cashOnDelivery',
    ]
    const data: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (body[field] !== undefined) data[field] = body[field]
    }
    if (data.stock !== undefined) data.stock = Number(data.stock)
    if (data.sale_price !== undefined) data.sale_price = Number(data.sale_price)
    if (data.regular_price !== undefined) data.regular_price = Number(data.regular_price)
    if (data.status !== undefined && !['Active', 'Pending', 'Draft'].includes(String(data.status))) {
      return res.status(400).json({ message: 'Invalid product status' })
    }

    const product = await prisma.products.update({ where: { id: req.params.id }, data: data as any, include: productInclude })
    return res.json({ product })
  } catch (error: any) {
    if (error?.code === 'P2025') return res.status(404).json({ message: 'Product not found' })
    return next(error)
  }
}

export const setProductStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = String(req.body?.status || '')
    if (!['Active', 'Pending', 'Draft'].includes(status)) {
      return res.status(400).json({ message: 'status must be Active, Pending, or Draft' })
    }
    const product = await prisma.products.update({ where: { id: req.params.id }, data: { status: status as any }, include: productInclude })
    return res.json({ product })
  } catch (error: any) {
    if (error?.code === 'P2025') return res.status(404).json({ message: 'Product not found' })
    return next(error)
  }
}

export const archiveProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.products.update({
      where: { id: req.params.id },
      data: { isDeleted: true, deletedAt: new Date() },
      include: productInclude,
    })
    return res.json({ product })
  } catch (error: any) {
    if (error?.code === 'P2025') return res.status(404).json({ message: 'Product not found' })
    return next(error)
  }
}

export const restoreProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.products.update({
      where: { id: req.params.id },
      data: { isDeleted: false, deletedAt: null },
      include: productInclude,
    })
    return res.json({ product })
  } catch (error: any) {
    if (error?.code === 'P2025') return res.status(404).json({ message: 'Product not found' })
    return next(error)
  }
}

export const listSellers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellers = await prisma.sellers.findMany({
      orderBy: { createdAt: 'desc' },
      include: { shop: { select: { id: true, name: true, category: true, ratings: true, createdAt: true } } },
    })
    return res.json({ sellers })
  } catch (error) {
    return next(error)
  }
}

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, country: true, createdAt: true, updatedAt: true },
    })
    return res.json({ users })
  } catch (error) {
    return next(error)
  }
}

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, country = 'Unknown' } = req.body || {}
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, and password are required' })
    const normalizedEmail = String(email).trim().toLowerCase()
    const existing = await prisma.users.findUnique({ where: { email: normalizedEmail } })
    if (existing) return res.status(409).json({ message: 'A user already exists with this email' })
    const user = await prisma.users.create({
      data: { name: String(name).trim(), email: normalizedEmail, password: await bcrypt.hash(String(password), 12), country: String(country) },
      select: { id: true, name: true, email: true, country: true, createdAt: true },
    })
    return res.status(201).json({ user })
  } catch (error) {
    return next(error)
  }
}

export const registerSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, country, phone_number, shop } = req.body || {}
    if (!name || !email || !password || !country || !phone_number) {
      return res.status(400).json({ message: 'name, email, password, country, and phone_number are required' })
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    const existing = await prisma.sellers.findUnique({ where: { email: normalizedEmail } })
    if (existing) return res.status(409).json({ message: 'A seller already exists with this email' })
    const seller = await prisma.sellers.create({
      data: {
        name: String(name).trim(), email: normalizedEmail, password: await bcrypt.hash(String(password), 12),
        country: String(country), phone_number: String(phone_number), stripeId: '',
        ...(shop?.name && shop?.address && shop?.category ? { shop: { create: {
          name: String(shop.name), bio: String(shop.bio || ''), address: String(shop.address), category: String(shop.category),
          opening_hours: String(shop.opening_hours || ''), website: shop.website ? String(shop.website) : undefined,
          socialLinks: [],
        } } } : {}),
      },
      select: { id: true, name: true, email: true, country: true, phone_number: true, createdAt: true, shop: true },
    })
    return res.status(201).json({ seller })
  } catch (error) {
    return next(error)
  }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const user = await prisma.users.findUnique({ where: { id }, select: { id: true } })
    if (!user) return res.status(404).json({ message: 'User not found' })
    await prisma.shopReviews.deleteMany({ where: { userId: id } })
    await prisma.accounts.deleteMany({ where: { userId: id } })
    await prisma.users.delete({ where: { id } })
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}

export const deleteSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const seller = await prisma.sellers.findUnique({ where: { id }, include: { shop: { include: { products: { select: { id: true } } } } } })
    if (!seller) return res.status(404).json({ message: 'Seller not found' })
    if (seller.shop?.products.length) return res.status(409).json({ message: 'Cannot delete a seller with products. Archive or reassign the products first.' })
    await prisma.discountCodes.deleteMany({ where: { sellerId: id } })
    if (seller.shop) {
      await prisma.shopReviews.deleteMany({ where: { shopsId: seller.shop.id } })
      await prisma.shops.delete({ where: { id: seller.shop.id } })
    }
    await prisma.accounts.deleteMany({ where: { sellerId: id } })
    await prisma.sellers.delete({ where: { id } })
    return res.status(204).send()
  } catch (error) {
    return next(error)
  }
}

export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parsePage(req.query.limit, 50, 200)
    const orders = await prisma.orders.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
    return res.json({ orders })
  } catch (error) {
    return next(error)
  }
}
