import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();

export default (pool: Pool) => {
  // Endpoint to add stock
  router.post('/', async (req, res) => {
    const { productId, quantity } = req.body;

    const client = await pool.connect();
    try {
      await client.query(
        'INSERT INTO stock (product_id, quantity) VALUES ($1, $2) ON CONFLICT (product_id) DO UPDATE SET quantity = stock.quantity + $2',
        [productId, quantity]
      );
      res.status(201).json({ message: 'Stock updated successfully' });
    } catch (err) {
      console.error('Error updating stock:', err);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  });

  return router;
};