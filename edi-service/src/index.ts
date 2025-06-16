import express from 'express';
import { config } from 'dotenv';
import { EdiService } from './services/EdiService';
import { Kafka } from 'kafkajs';

config();

const app = express();
app.use(express.json());

const ediService = new EdiService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Kafka consumer setup
const kafka = new Kafka({
  clientId: 'edi-service',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'edi-service-group' });

const run = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'edi-processing', fromBeginning: true });

    console.log('EDI Service is listening to Kafka topic: edi-processing');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const { type, content } = JSON.parse(message.value?.toString() || '{}');
          
          if (type === 'EDI_PROCESSING_REQUEST') {
            const result = await ediService.processEdiFile(content);
            console.log('EDI file processed successfully:', result.id);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });
  } catch (error) {
    console.error('Error in Kafka consumer:', error);
  }
};

run().catch(console.error);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`EDI Service running on port ${PORT}`);
}); 