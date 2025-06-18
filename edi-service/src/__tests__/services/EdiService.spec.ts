import { EdiService } from '../../services/EdiService';
import { query } from '../../config/database';
import { Kafka } from 'kafkajs';

jest.mock('kafkajs');
jest.mock('../../config/database');

describe('EdiService', () => {
  let service: EdiService;
  let mockProducer: any;

  beforeEach(() => {
    mockProducer = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
    };

    (Kafka as jest.Mock).mockImplementation(() => ({
      producer: () => mockProducer,
    }));

    (query as jest.Mock).mockImplementation(() => ({
      rows: [{ 
        id: 'test-id', 
        documentType: 'NOTFIS', 
        version: '3.1', 
        status: 'PENDING',
        invoices: [{
          invoiceNumber: '000000000012345',
          products: [{
            productCode: '000000000012345',
            quantity: 123
          }]
        }]
      }],
    }));

    service = new EdiService();
  });

  describe('processEdiFile', () => {
    it('should process a valid EDI file and notify stock service', async () => {
      const notfisContent = `000EMPRESA A                 EMPRESA B                 010120230800NOT010120001
313000000000123450101202300000000012345000000000123450000000001234
31400000000012345PRODUTO TESTE                   000000000012300000000001230000000000123
318000000000012300000000001230000000000123000000000123`;

      const result = await service.processEdiFile(notfisContent);

      expect(result.documentType).toBe('NOTFIS');
      expect(result.version).toBe('3.1');
      expect(result.status).toBe('PENDING');
      expect(result.id).toBe('test-id');

      // Verify Kafka producer was called
      expect(mockProducer.connect).toHaveBeenCalled();
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: 'stock-check',
        messages: [
          {
            value: expect.stringContaining('STOCK_CHECK_REQUEST'),
          },
        ],
      });
      expect(mockProducer.disconnect).toHaveBeenCalled();
    });

    it('should handle errors during processing', async () => {
      const invalidContent = 'invalid content';

      await expect(service.processEdiFile(invalidContent)).rejects.toThrow();

      expect(mockProducer.connect).not.toHaveBeenCalled();
      expect(mockProducer.send).not.toHaveBeenCalled();
      expect(mockProducer.disconnect).not.toHaveBeenCalled();
    });
  });
}); 