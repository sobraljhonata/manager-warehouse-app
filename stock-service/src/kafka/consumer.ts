import { Kafka } from 'kafkajs';
import mongoose from 'mongoose';

const kafka = new Kafka({
  clientId: 'stock-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'stock-service-group' });

export async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-created', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (topic === 'order-created') {
        const order = JSON.parse(message.value?.toString() || '{}');
        const Stock = mongoose.model('Stock');

        try {
          const stock = await Stock.findOne({ productId: order.productId });
          
          if (!stock) {
            // Produto não encontrado
            return;
          }

          const updatedStock = await Stock.findOneAndUpdate(
            { productId: order.productId, quantity: { $gte: order.quantity } },
            { $inc: { quantity: -order.quantity } },
            { new: true }
          );

          if (!updatedStock) {
            // Estoque insuficiente
            return;
          }
        } catch (error) {
          console.error('Error processing order:', error);
        }
      }
    },
  });
} 