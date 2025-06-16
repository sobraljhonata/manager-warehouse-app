import { Kafka } from 'kafkajs';
import mongoose from 'mongoose';
import { startConsumer } from '../../src/kafka/consumer';

jest.mock('mongoose', () => ({
  connect: jest.fn(),
  model: jest.fn().mockImplementation((name) => ({
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  })),
  Schema: jest.fn().mockImplementation(() => ({
    set: jest.fn().mockReturnThis(),
  })),
}));

jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    consumer: jest.fn().mockReturnValue({
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn().mockImplementation(({ eachMessage }) => {
        return Promise.resolve(eachMessage);
      }),
    }),
    producer: jest.fn().mockReturnValue({
      connect: jest.fn(),
      send: jest.fn(),
      disconnect: jest.fn(),
    }),
  })),
}));

describe('Kafka Consumer', () => {
  let mockConsumer: {
    connect: jest.Mock;
    subscribe: jest.Mock;
    run: jest.Mock;
  };
  let messageHandler: any;

  beforeEach(() => {
    jest.clearAllMocks();
    messageHandler = undefined;
    mockConsumer = {
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn().mockImplementation(({ eachMessage }) => {
        messageHandler = eachMessage;
        return Promise.resolve();
      }),
    };
    (Kafka as jest.Mock).mockImplementation(() => ({
      consumer: () => mockConsumer,
      producer: () => ({
        connect: jest.fn(),
        send: jest.fn(),
        disconnect: jest.fn(),
      }),
    }));
  });

  it('should process order successfully when stock is available', async () => {
    const mockOrder = {
      orderId: '123',
      productId: '456',
      quantity: 5,
    };

    const mockStock = {
      productId: '456',
      quantity: 10,
    };

    const mockModel = {
      findOne: jest.fn().mockResolvedValue(mockStock),
      findOneAndUpdate: jest.fn().mockResolvedValue({ ...mockStock, quantity: 5 }),
    };

    (mongoose.model as jest.Mock).mockReturnValue(mockModel);

    const handler = await startConsumer();
    expect(handler).toBeDefined();
    expect(typeof handler).toBe('function');

    await handler({
      topic: 'order-created',
      partition: 0,
      message: {
        value: Buffer.from(JSON.stringify(mockOrder)),
      },
    });

    // Aguarda um pequeno delay para garantir que as promessas sejam resolvidas
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mongoose.model).toHaveBeenCalledWith('Stock');
    expect(mockModel.findOne).toHaveBeenCalledWith({ productId: '456' });
    expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { productId: '456', quantity: { $gte: 5 } },
      { $inc: { quantity: -5 } },
      { new: true }
    );
  });

  it('should reject order when stock is insufficient', async () => {
    const mockOrder = {
      orderId: '123',
      productId: '456',
      quantity: 15,
    };

    const mockStock = {
      productId: '456',
      quantity: 10,
    };

    const mockModel = {
      findOne: jest.fn().mockResolvedValue(mockStock),
      findOneAndUpdate: jest.fn().mockResolvedValue(null),
    };

    (mongoose.model as jest.Mock).mockReturnValue(mockModel);

    const handler = await startConsumer();
    expect(handler).toBeDefined();
    expect(typeof handler).toBe('function');

    await handler({
      topic: 'order-created',
      partition: 0,
      message: {
        value: Buffer.from(JSON.stringify(mockOrder)),
      },
    });

    // Aguarda um pequeno delay para garantir que as promessas sejam resolvidas
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mongoose.model).toHaveBeenCalledWith('Stock');
    expect(mockModel.findOne).toHaveBeenCalledWith({ productId: '456' });
    expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
      { productId: '456', quantity: { $gte: 15 } },
      { $inc: { quantity: -15 } },
      { new: true }
    );
  });

  it('should reject order when product is not found', async () => {
    const mockOrder = {
      orderId: '123',
      productId: '456',
      quantity: 5,
    };

    const mockModel = {
      findOne: jest.fn().mockResolvedValue(null),
      findOneAndUpdate: jest.fn(),
    };

    (mongoose.model as jest.Mock).mockReturnValue(mockModel);

    const handler = await startConsumer();
    expect(handler).toBeDefined();
    expect(typeof handler).toBe('function');

    await handler({
      topic: 'order-created',
      partition: 0,
      message: {
        value: Buffer.from(JSON.stringify(mockOrder)),
      },
    });

    // Aguarda um pequeno delay para garantir que as promessas sejam resolvidas
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mongoose.model).toHaveBeenCalledWith('Stock');
    expect(mockModel.findOne).toHaveBeenCalledWith({ productId: '456' });
    expect(mockModel.findOneAndUpdate).not.toHaveBeenCalled();
  });
}); 