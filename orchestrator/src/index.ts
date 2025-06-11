import express from 'express';
import mongoose from 'mongoose';
import { KafkaProducer, KafkaConsumer } from './kafka';
import ordersRouter from './routes/orders';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

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

// Start Server
app.listen(PORT, () => {
  console.log(`Orchestrator running on port ${PORT}`);
});