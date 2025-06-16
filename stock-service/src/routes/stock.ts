import { Router, RequestHandler } from 'express';
import { Pool, PoolClient, QueryResult } from 'pg';

interface StockRequestBody {
  productId: string;
  quantity: number;
}

const router = Router();

export default (pool: Pool) => {
  // Endpoint to add stock
  const addStock: RequestHandler<{}, any, StockRequestBody> = async (req, res) => {
    let client: PoolClient | undefined;
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

      client = await pool.connect();
      
      try {
        await client.query(
          'INSERT INTO stock (product_id, quantity) VALUES ($1, $2) ON CONFLICT (product_id) DO UPDATE SET quantity = stock.quantity + $2',
          [productId, quantity]
        );
        res.status(201).json({ message: 'Stock updated successfully' });
      } catch (queryError) {
        console.error('Error updating stock:', queryError);
        res.status(500).json({ error: 'Internal server error' });
      }
    } catch (err) {
      console.error('Error in addStock:', err);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      if (client) {
        client.release();
      }
    }
  };

  router.post('/', addStock);
  return router;
};