import express from 'express';
import mongoose from 'mongoose';
import { KafkaProducer, KafkaConsumer } from './kafka';
import ordersRouter from './routes/orders';
import { config } from 'dotenv';
import ediRoutes from './routes/edi';
import { connectMongoDB } from './config/mongodb';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.text());

// Kafka Producer and Consumer
const producer = KafkaProducer();
producer.then(async (kafkaProducer) => {
  await kafkaProducer.connect();
  console.log('Connected to Kafka');
  
  // Routes
  app.use('/orders', ordersRouter(kafkaProducer));
  app.use('/edi', ediRoutes);
  
  // Health check endpoint
  app.get('/health', (_, res) => {
    res.json({ status: 'ok' });
  });
  
  // Start Server
  await connectMongoDB();
  app.listen(PORT, () => {
    console.log(`Orchestrator running on port ${PORT}`);
  });
}).catch((err: Error) => {
  console.error('Failed to initialize Kafka producer:', err);
  process.exit(1);
});

// Initialize Kafka Consumer
KafkaConsumer();