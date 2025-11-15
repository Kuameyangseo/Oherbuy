import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from '../../../packages/error-handler/error-middleware';
import swaggerUi from 'swagger-ui-express';
import router from './routes/product.route';
// @ts-ignore
import swaggerDocument from './swagger-output.json';


const app = express();

app.use(cors({
  origin: ["http://localhost:3000"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


app.use(cookieParser());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.get('/', (req, res) => {
    res.send({ 'message': 'Hello API'});
});


//swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/docs-json", (req, res) => {
    res.json(swaggerDocument);
});





//routes
app.use("/api", router);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && (err.type === 'entity.too.large' || err.name === 'PayloadTooLargeError')) {
    console.warn('PayloadTooLargeError:', { expected: err.expected, length: err.length, limit: err.limit });
    return res.status(413).json({
      error: 'PayloadTooLarge',
      message: 'Request body is too large. Increase server limit or upload smaller files (use multipart uploads or direct client upload).',
      details: {
        expected: err.expected,
        length: err.length,
        limit: err.limit,
        type: err.type,
      },
    });
  }
  return next(err);
});

app.use(errorMiddleware);



const port = process.env.PORT || 6002;
const server = app.listen(port, () => {
  console.log(`Product service is runing at http://localhost:${port}/api-docs`);
  console.log(`Swagger docs runing at http://localhost:${port}/docs`);
});
server.on('error', (err) => {
  console.log("server Error:", err)
})
  