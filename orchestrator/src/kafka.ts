import { Kafka } from 'kafkajs';
import Order from './model/order';

export const KafkaConsumer = () => {
  const kafka = new Kafka({
    clientId: 'orchestrator',
    brokers: ['kafka:9092'],
  });

  const consumer = kafka.consumer({ groupId: 'orchestrator-group' });

  const run = async () => {
    try {
      await consumer.connect();
      await consumer.subscribe({ topic: 'order-status', fromBeginning: true });

      console.log('Orchestrator is listening to Kafka topic: order-status');

      await consumer.run({
        eachMessage: async ({ message }) => {
          try {
            const statusUpdate = JSON.parse(message.value?.toString() || '{}');
            const { orderId, status, reason } = statusUpdate;

            console.log(`Received status update for order ${orderId}: ${status}`);

            // Update order status in MongoDB
            const updatedOrder = await Order.findByIdAndUpdate(
              orderId,
              { status },
              { new: true }
            );

            if (!updatedOrder) {
              console.error(`Order ${orderId} not found`);
              return;
            }

            if (reason) {
              console.log(`Reason for rejection: ${reason}`);
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
};

export const KafkaProducer = async () => {
  const kafka = new Kafka({
    clientId: 'orchestrator',
    brokers: ['kafka:9092'],
  });

  const producer = kafka.producer();

  try {
    await producer.connect();
    console.log('KafkaProducer is ready to send messages');
    return producer;
  } catch (error) {
    console.error('Error connecting to Kafka:', error);
    throw error;
  }
};