import express from 'express';
import { Pool } from 'pg';
import { KafkaConsumer } from './kafka';
import stockRouter from './routes/stock';

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'stock_db',
  password: 'postgres',
  port: 5432,
});

// Kafka Consumer
KafkaConsumer(pool);

// Routes
app.use('/stock', stockRouter(pool));

// Start Server
app.listen(PORT, () => {
  console.log(`Stock service running on port ${PORT}`);
});