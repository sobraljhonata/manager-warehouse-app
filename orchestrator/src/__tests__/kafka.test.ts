import { Kafka } from 'kafkajs';
import mongoose from 'mongoose';
import Order from '../model/order';
import { KafkaConsumer } from '../kafka';

describe('Kafka Consumer', () => {
  let mockConsumer: {
    connect: jest.Mock;
    subscribe: jest.Mock;
    run: jest.Mock;
  };

  beforeEach(() => {
    mockConsumer = {
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
    };
    (Kafka as jest.Mock).mockImplementation(() => ({
      consumer: jest.fn(() => mockConsumer),
    }));
  });

  it('should process order status update successfully', async () => {
    // Criar um pedido no banco
    const order = new Order({
      productId: '456',
      quantity: 10,
    });
    await order.save();

    const statusUpdate = {
      orderId: order._id,
      status: 'APPROVED',
    };
    const message = {
      topic: 'order-status',
      partition: 0,
      message: {
        value: Buffer.from(JSON.stringify(statusUpdate)),
      },
    };

    mockConsumer.run.mockImplementation(({ eachMessage }) => {
      return eachMessage(message);
    });

    KafkaConsumer();
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockConsumer.connect).toHaveBeenCalled();
    expect(mockConsumer.subscribe).toHaveBeenCalledWith({
      topic: 'order-status',
      fromBeginning: true,
    });

    // Verificar se o status foi atualizado no banco
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder?.status).toBe('APPROVED');
  });

  it('should handle rejected orders', async () => {
    // Criar um pedido no banco
    const order = new Order({
      productId: '456',
      quantity: 10,
    });
    await order.save();

    const statusUpdate = {
      orderId: order._id,
      status: 'REJECTED',
      reason: 'Insufficient stock',
    };
    const message = {
      topic: 'order-status',
      partition: 0,
      message: {
        value: Buffer.from(JSON.stringify(statusUpdate)),
      },
    };

    mockConsumer.run.mockImplementation(({ eachMessage }) => {
      return eachMessage(message);
    });

    KafkaConsumer();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verificar se o status foi atualizado no banco
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder?.status).toBe('REJECTED');
  });

  it('should handle non-existent orders', async () => {
    // Criar um ObjectId válido que não existe no banco
    const nonExistentId = new mongoose.Types.ObjectId();
    
    const statusUpdate = {
      orderId: nonExistentId.toString(),
      status: 'APPROVED',
    };
    const message = {
      topic: 'order-status',
      partition: 0,
      message: {
        value: Buffer.from(JSON.stringify(statusUpdate)),
      },
    };

    mockConsumer.run.mockImplementation(({ eachMessage }) => {
      return eachMessage(message);
    });

    KafkaConsumer();
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verificar que o pedido não existe no banco
    const order = await Order.findById(nonExistentId);
    expect(order).toBeNull();
  });
}); 