import { Kafka } from 'kafkajs';
import { Pool } from 'pg';

export const KafkaConsumer = (pool: Pool) => {
  const kafka = new Kafka({
    clientId: 'stock-service',
    brokers: ['kafka:9092'],
  });

  const consumer = kafka.consumer({ groupId: 'stock-group' });
  const producer = kafka.producer();

  const run = async () => {
    await consumer.connect();
    await producer.connect();
    await consumer.subscribe({ topic: 'order-created', fromBeginning: true });

    console.log('Stock service is listening to Kafka topic: order-created');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const order = JSON.parse(message.value?.toString() || '{}');
        const { orderId, productId, quantity } = order;

        console.log(`Processing order: ${orderId}`);

        const client = await pool.connect();
        try {
          const result = await client.query(
            'SELECT quantity FROM stock WHERE product_id = $1',
            [productId]
          );

          if (result.rows.length === 0) {
            console.error(`Product ${productId} not found in stock`);
            await producer.send({
              topic: 'order-status',
              messages: [
                {
                  value: JSON.stringify({
                    orderId,
                    status: 'REJECTED',
                    reason: 'Product not found',
                  }),
                },
              ],
            });
            return;
          }

          const availableQuantity = result.rows[0].quantity;

          if (availableQuantity >= quantity) {
            // Update stock
            await client.query(
              'UPDATE stock SET quantity = quantity - $1 WHERE product_id = $2',
              [quantity, productId]
            );

            console.log(`Order ${orderId} processed successfully. Stock updated.`);

            await producer.send({
              topic: 'order-status',
              messages: [
                {
                  value: JSON.stringify({
                    orderId,
                    status: 'APPROVED',
                  }),
                },
              ],
            });
          } else {
            console.error(`Insufficient stock for product ${productId}`);
            await producer.send({
              topic: 'order-status',
              messages: [
                {
                  value: JSON.stringify({
                    orderId,
                    status: 'REJECTED',
                    reason: 'Insufficient stock',
                  }),
                },
              ],
            });
          }
        } catch (err) {
          console.error('Error processing order:', err);
        } finally {
          client.release();
        }
      },
    });
  };

  run().catch(console.error);
};