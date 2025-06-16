import express from 'express';
import mongoose from 'mongoose';
import { KafkaProducer, KafkaConsumer } from './kafka';
import ordersRouter from './routes/orders';
import { config } from 'dotenv';
import ediRoutes from './routes/edi';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.text());

// MongoDB Connection
mongoose.connect('mongodb://mongo:27017/ecommerce', {
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Kafka Producer and Consumer
const producer = KafkaProducer();
producer.connect();
KafkaConsumer();

// Routes
app.use('/orders', ordersRouter(producer));
app.use('/edi', ediRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Orchestrator running on port ${PORT}`);
});