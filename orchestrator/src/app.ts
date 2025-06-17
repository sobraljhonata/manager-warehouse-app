import express from 'express';
import { bodyParser } from './middlewares/bodyParser';
import { contentType } from './middlewares/contentType';
import { cors } from './middlewares/cors';
import ediRoutes from './routes/edi';

const app = express();

// Middlewares
app.use(cors);
app.use(bodyParser);
app.use(contentType);

// Routes
app.use('/edi', ediRoutes);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

export default app; 