import { Router } from 'express';
import { Producer } from 'kafkajs';
import Order from '../model/order';

const router = Router();

export default (producer: Producer) => {
  router.post('/', async (req, res) => {
    const { productId, quantity } = req.body;

    // Save order to MongoDB
    const order = new Order({ productId, quantity });
    await order.save();

    // Send message to Kafka
    await producer.send({
      topic: 'order-created',
      messages: [{ value: JSON.stringify({ orderId: order._id, productId, quantity }) }],
    });

    res.status(201).json(order);
  });

  return router;
};