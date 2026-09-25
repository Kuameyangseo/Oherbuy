import dotenv from 'dotenv'
dotenv.config({ path: process.env.ADMIN_ENV_FILE || 'apps/admin-service/.env' })

import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { errorMiddleware } from '../../../packages/error-handler/error-middleware'
import router from './routes/admin.route'

const app = express()
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://192.168.100.79:3000,http://192.168.100.79:3001,http://192.168.100.79:3002')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}))
app.use(morgan('dev'))
app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/', (_req, res) => res.json({ service: 'admin-service', status: 'ok' }))
app.get('/health', (_req, res) => res.json({ service: 'admin-service', status: 'ok' }))
app.use('/api', router)
app.use(errorMiddleware)

const port = Number(process.env.ADMIN_PORT || process.env.PORT || 6004)
const server = app.listen(port, () => {
  console.log(`Admin service is running at http://localhost:${port}`)
})
server.on('error', (error) => console.error('Admin service server error:', error))
