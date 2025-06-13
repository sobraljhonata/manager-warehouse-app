import request from 'supertest';
import express from 'express';
import { Kafka } from 'kafkajs';
import Order from '../../model/order';
import ordersRouter from '../../routes/orders';

describe('Orders Routes', () => {
  let app: express.Application;
  let producer: {
    send: jest.Mock;
    connect: jest.Mock;
    disconnect: jest.Mock;
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    producer = {
      send: jest.fn().mockResolvedValue(undefined),
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
    app.use('/orders', ordersRouter(producer as any));
  });

  describe('POST /orders', () => {
    it('should create a new order successfully', async () => {
      const orderData = {
        productId: '456',
        quantity: 10,
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        productId: orderData.productId,
        quantity: orderData.quantity,
        status: 'PENDING',
      });
      expect(response.body._id).toBeDefined();
      expect(producer.send).toHaveBeenCalledWith({
        topic: 'order-created',
        messages: [
          {
            value: JSON.stringify({
              orderId: response.body._id,
              productId: orderData.productId,
              quantity: orderData.quantity,
            }),
          },
        ],
      });

      // Verificar se o pedido foi realmente salvo no banco
      const savedOrder = await Order.findById(response.body._id);
      expect(savedOrder).toBeDefined();
      expect(savedOrder?.productId).toBe(orderData.productId);
      expect(savedOrder?.quantity).toBe(orderData.quantity);
      expect(savedOrder?.status).toBe('PENDING');
    });

    it('should handle validation errors - missing required fields', async () => {
      const response = await request(app)
        .post('/orders')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('productId');
      expect(response.body.error).toContain('quantity');
    });

    it('should handle validation errors - invalid quantity', async () => {
      const response = await request(app)
        .post('/orders')
        .send({ productId: '456', quantity: -1 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('quantity');
    });

    it('should handle database errors', async () => {
      // Simular um erro de banco de dados forçando uma violação de schema
      const invalidOrder = new Order({ productId: '456' }); // quantity é obrigatório
      await expect(invalidOrder.save()).rejects.toThrow();

      const response = await request(app)
        .post('/orders')
        .send({ productId: '456' }); // Enviando sem quantity

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('quantity');
    });
  });
}); 