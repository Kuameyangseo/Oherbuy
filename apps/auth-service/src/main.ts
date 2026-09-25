import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import passport from 'passport';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import swaggerUi from 'swagger-ui-express';
import router from './routes/auth.router';
import { connectWithRetry } from '../../../packages/libs/prisma';
import { configureGoogleAuth } from './utils/google-auth';
// @ts-ignore
import swaggerDocument from './swagger-output.json';
// If you don't have this already, add the following to your tsconfig.json:
// "resolveJsonModule": true,
// "esModuleInterop": true

const app = express();
configureGoogleAuth();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://192.168.43.79:3000,http://192.168.43.79:3001,http://192.168.43.167:3000,http://192.168.43.167:3001,http://192.168.56.1:3000,http://192.168.56.1:3001,http://192.168.100.79:3000,http://192.168.100.79:3001')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like curl or server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Defensive CORS header middleware: echo allowed origin explicitly and always
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  if (origin && allowedOrigins.indexOf(origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  // handle preflight
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});


app.use(cookieParser());
app.use(express.json());
app.use(passport.initialize());

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});

app.use(cookieParser());
app.use(express.json());

//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument);
});


//routes
app.use("/api", router);
app.use(errorMiddleware);



async function start() {
  try {
    // attempt to connect to database with retries before starting the server
    await connectWithRetry(5, 1000);
  } catch (err) {
    console.error('Failed to connect to database before starting auth-service:', (err as any)?.message || err);
    // still start server so healthchecks / metadata endpoints are available;
    // alternatively you may choose to exit process here in production setups
  }

  const port = process.env.PORT || 6001;
  const server = app.listen(port, () => {
    console.log(`Auth service is runing at http://localhost:${port}/api-docs`);
    console.log(`Auth Swagger docs runing at http://localhost:${port}/docs`);
  });
  server.on('error', (err) => {
    console.log("server Error:", err)
  })
}

start();
  