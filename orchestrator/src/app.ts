import express from 'express';
import cors from 'cors';
import { errorHandler } from './main/middlewares/error-handler';
import ediRoutes from './main/routes/edi.routes';
import { makeKafkaAdapter } from './main/factories/kafka-adapter-factory';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Kafka
const kafkaAdapter = makeKafkaAdapter();
kafkaAdapter.connect().catch(console.error);

// Routes
app.use('/api', ediRoutes);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app; 