import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import swaggerUi from 'swagger-ui-express';
import router from './routes/auth.router';
// @ts-ignore
import swaggerDocument from './swagger-output.json';
// If you don't have this already, add the following to your tsconfig.json:
// "resolveJsonModule": true,
// "esModuleInterop": true


const app = express();

app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


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


const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Auth service is runing at http://localhost:${port}/api-docs`);
  console.log(`Swagger docs runing at http://localhost:${port}/docs`);
});
server.on('error', (err) => {
  console.log("server Error:", err)
})
  