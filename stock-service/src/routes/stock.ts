import { Router, RequestHandler } from 'express';
import { Pool } from 'pg';

interface StockRequestBody {
  productId: string;
  quantity: number;
}

const router = Router();

export default (pool: Pool) => {
  // Endpoint to add stock
  const addStock: RequestHandler<{}, any, StockRequestBody> = async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;

      // Validate required fields
      if (!productId || quantity === undefined) {
        res.status(400).json({ error: 'productId and quantity are required' });
        return;
      }

      // Validate quantity is a positive number
      if (typeof quantity !== 'number' || quantity < 0) {
        res.status(400).json({ error: 'quantity must be a positive number' });
        return;
      }

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
    } catch (err) {
      next(err);
    }
  };

  router.post('/', addStock);
  return router;
};