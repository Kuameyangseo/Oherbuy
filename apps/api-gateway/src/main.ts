import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; 
import cookieParser from 'cookie-parser'; 
import rateLimit from 'express-rate-limit';
import { ipKeyGenerator } from 'express-rate-limit';
import proxy from 'express-http-proxy';

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://192.168.43.79:3000,http://192.168.43.79:3001,http://192.168.43.79:3002,http://192.168.43.167:3000,http://192.168.43.167:3001,http://192.168.43.167:3002,http://192.168.56.1:3000,http://192.168.56.1:3001,http://192.168.56.1:3002,http://192.168.100.79:3000,http://192.168.100.79:3001,http://192.168.100.79:3002')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'X-Requested-With', 'Accept'],
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.set("trust proxy", 1);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req: any, res: any) => (req.user ? 1000 : 100), // Limit each IP to 100 requests per `window` (here, per 15 minutes) for unauthenticated users, 1000 for authenticated users
  message: 'Too many requests from this IP, please try again later.',

  skip: (req: any, res: any) => {
    try {
      const path = String(req.originalUrl || req.url || '');
      const isDev = (process.env.NODE_ENV || 'development') !== 'production';
      if (isDev) {
        const authPaths = [
          '/api/login-seller',
          '/api/login-user',
          '/api/logged-in-seller',
          '/api/logged-in-user',
          '/api/has-seller',
          '/api/refresh-token'
        ];
        for (const p of authPaths) {
          if (path.startsWith(p)) return true;
        }
      }
    } catch (e) {}
    return false;
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  keyGenerator: (req, res) => {
    // Use API key (or some other identifier) for authenticated users
    if (req.query.apiKey) return String(req.query.apiKey);
    return String(ipKeyGenerator(req.ip ?? '')); // better
  }
});

app.use(limiter);

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

const authService = proxy('http://localhost:6001', {
  proxyReqPathResolver: (req) => req.originalUrl,
});
const orderService = proxy('http://localhost:6003', {
  proxyReqPathResolver: (req) => req.originalUrl,
});
const productService = proxy('http://localhost:6002', {
  proxyReqPathResolver: (req) => req.url,
});
const adminService = proxy('http://localhost:6004', {
  proxyReqPathResolver: (req) => req.url,
});
const ordersAlias = proxy('http://localhost:6003', {
  proxyReqPathResolver: (req) => `/api/orders${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`,
});

// Public product/auth endpoints are owned by auth-service; order endpoints are separate.
app.use('/product', productService);
app.use('/admin', adminService);
app.use('/orders', ordersAlias);
app.use('/api/orders', orderService);
app.use('/api', authService);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`API gateway is running at http://localhost:${port}`);
});
server.on('error', (err) => {
  console.error('API gateway server error:', err);
});



