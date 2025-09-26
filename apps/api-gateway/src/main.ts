import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; 
import cookieParser from 'cookie-parser'; 
import rateLimit from 'express-rate-limit';
import proxy from 'express-http-proxy';

const app = express();

app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
  standardHeaders: true, 
  legacyHeaders: false, 
  keyGenerator: (req: any) => req.ip, // Use IP address as the key
});

app.use(limiter);

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use("/", proxy("http://localhost:6001"));

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
  