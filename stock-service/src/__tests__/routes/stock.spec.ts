import request from 'supertest';
import express from 'express';
import { Pool } from 'pg';
import stockRouter from '../../routes/stock';

const mockQuery = jest.fn();
const mockClient = {
  query: mockQuery,
  release: jest.fn(),
};

const mockPool = {
  connect: jest.fn().mockResolvedValue(mockClient),
} as unknown as Pool;

describe('Stock Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/stock', stockRouter(mockPool));
    mockQuery.mockReset();
    mockQuery.mockResolvedValue({ rows: [] });
  });

  describe('POST /stock', () => {
    it('should create stock entry successfully', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const response = await request(app)
        .post('/stock')
        .send({ productId: '123', quantity: 10 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'Stock updated successfully' });
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

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