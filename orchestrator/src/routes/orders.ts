import { Router, Request, Response } from 'express';
import { Kafka } from 'kafkajs';
import Order from '../model/order';

const router = Router();

export default (producer: ReturnType<Kafka['producer']>) => {
  const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, quantity } = req.body;

      // Validate required fields
      if (!productId || !quantity) {
        res.status(400).json({
          error: 'Missing required fields: productId and quantity are required'
        });
        return;
      }

      // Validate quantity
      if (typeof quantity !== 'number' || quantity <= 0) {
        res.status(400).json({
          error: 'Invalid quantity: must be a positive number'
        });
        return;
      }

      // Save order to MongoDB
      const order = new Order({ productId, quantity });
      await order.save();

      // Send message to Kafka
      await producer.send({
        topic: 'order-created',
        messages: [{ value: JSON.stringify({ orderId: order._id, productId, quantity }) }],
      });

      res.status(201).json(order);
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: error.message });
    }
  };

  router.post('/', createOrder);
  return router;
};