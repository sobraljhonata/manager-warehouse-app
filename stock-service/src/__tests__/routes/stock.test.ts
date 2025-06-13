import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';
import stockRouter from '../../routes/stock';

describe('Stock Routes', () => {
  let app: express.Application;
  let pool: Pool;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    pool = new Pool();
    app.use('/stock', stockRouter(pool));
  });

  describe('POST /stock', () => {
    it('should add stock successfully', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      (pool.connect as jest.Mock).mockResolvedValue(mockClient);

      const response = await request(app)
        .post('/stock')
        .send({ productId: '123', quantity: 10 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Stock updated successfully' });
      expect(mockClient.query).toHaveBeenCalledWith(
        'INSERT INTO stock (product_id, quantity) VALUES ($1, $2) ON CONFLICT (product_id) DO UPDATE SET quantity = stock.quantity + $2',
        ['123', 10]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const mockClient = {
        query: jest.fn().mockRejectedValue(new Error('Database error')),
        release: jest.fn(),
      };
      (pool.connect as jest.Mock).mockResolvedValue(mockClient);

      const response = await request(app)
        .post('/stock')
        .send({ productId: '123', quantity: 10 });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/stock')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 