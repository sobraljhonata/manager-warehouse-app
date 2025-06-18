import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'stock-service',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'stock-service-group' });

// Simulação de repositório de estoque (substitua por acesso real ao Postgres se necessário)
const stockRepository = {
  async findOne({ productId }: { productId: string }) {
    // Simule a busca no banco de dados Postgres
    return { productId, quantity: 10 };
  },
  async updateStock(productId: string, quantity: number) {
    // Simule a atualização no banco de dados Postgres
    return { productId, quantity };
  },
};

export async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-created', fromBeginning: true });

  const messageHandler = async ({ topic, partition, message }: any) => {
    if (topic === 'order-created') {
      const order = JSON.parse(message.value?.toString() || '{}');
      try {
        const stock = await stockRepository.findOne({ productId: order.productId });
        if (!stock) {
          // Produto não encontrado
          return;
        }
        if (stock.quantity < order.quantity) {
          // Estoque insuficiente
          return;
        }
        const updatedStock = await stockRepository.updateStock(order.productId, stock.quantity - order.quantity);
        // Aqui você pode emitir eventos ou atualizar outros sistemas
      } catch (error) {
        console.error('Error processing order:', error);
      }
    }
  };

  await consumer.run({ eachMessage: messageHandler });
  return messageHandler;
} 