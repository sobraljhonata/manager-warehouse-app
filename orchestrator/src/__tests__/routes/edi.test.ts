import request from 'supertest';
import express from 'express';
import ediRoutes from '../../routes/edi';

const mockSend = jest.fn();
const mockKafkaProducer = jest.fn().mockResolvedValue({ send: mockSend });

jest.mock('../../kafka', () => ({
  KafkaProducer: () => mockKafkaProducer(),
}));

describe('EDI Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/edi', ediRoutes);
    mockSend.mockReset();
    mockSend.mockResolvedValue({});
  });

  it('should process EDI file successfully', async () => {
    const response = await request(app)
      .post('/edi/process')
      .send({ content: 'some content' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'EDI file sent for processing',
      status: 'PENDING',
    });
  });

  it('should handle Kafka errors', async () => {
    mockSend.mockRejectedValueOnce(new Error('Kafka error'));

    const response = await request(app)
      .post('/edi/process')
      .send({ content: 'some content' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Failed to process EDI file',
    });
  });

  it('should handle empty EDI content', async () => {
    const response = await request(app)
      .post('/edi/process')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'No EDI content provided',
    });
  });
}); 