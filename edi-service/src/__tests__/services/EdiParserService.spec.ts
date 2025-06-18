import { EdiParserService } from '../../services/EdiParserService';

describe('EdiParserService', () => {
  let parser: EdiParserService;

  beforeEach(() => {
    parser = new EdiParserService();
  });

  describe('parseNotfis', () => {
    it('should parse a valid NOTFIS document', () => {
      const notfisContent = `000EMPRESA A                 EMPRESA B                 010120230800NOT010120001
313000000000123450101202300000000012345000000000123450000000001234
31400000000012345PRODUTO TESTE                   000000000012300000000001230000000000123
318000000000012300000000001230000000000123000000000123`;

      const result = parser.parseNotfis(notfisContent);

      expect(result.documentType).toBe('NOTFIS');
      expect(result.version).toBe('3.1');
      expect(result.status).toBe('PENDING');
      expect(result.header).toBeDefined();
      expect(result.invoices).toHaveLength(1);
      expect(result.invoices[0].products).toHaveLength(1);
      expect(result.totals).toBeDefined();
    });

    it('should handle empty content', () => {
      const result = parser.parseNotfis('');

      expect(result.documentType).toBe('NOTFIS');
      expect(result.version).toBe('3.1');
      expect(result.status).toBe('PENDING');
      expect(result.invoices).toHaveLength(0);
    });

    it('should parse header correctly', () => {
      const notfisContent = `000EMPRESA A                 EMPRESA B                 010120230800NOT010120001`;

      const result = parser.parseNotfis(notfisContent);

      expect(result.header).toEqual({
        recordType: '000',
        senderIdentification: 'EMPRESA A',
        receiverIdentification: 'EMPRESA B',
        date: '010123',
        time: '0800',
        interchangeId: 'NOT010120001',
      });
    });

    it('should parse invoice correctly', () => {
      const notfisContent = `000EMPRESA A                 EMPRESA B                 010120230800NOT010120001
313000000000123450101202300000000012345000000000123450000000001234`;

      const result = parser.parseNotfis(notfisContent);

      expect(result.invoices[0]).toEqual({
        recordType: '313',
        invoiceNumber: '000000000012345',
        invoiceDate: '010123',
        invoiceValue: 123.45,
        invoiceWeight: 123.45,
        invoiceVolume: 1234,
        products: [],
      });
    });

    it('should parse product correctly', () => {
      const notfisContent = `000EMPRESA A                 EMPRESA B                 010120230800NOT010120001
313000000000123450101202300000000012345000000000123450000000001234
31400000000012345PRODUTO TESTE                   000000000012300000000001230000000000123`;

      const result = parser.parseNotfis(notfisContent);

      expect(result.invoices[0].products[0]).toEqual({
        recordType: '314',
        productCode: '000000000012345',
        productDescription: 'PRODUTO TESTE',
        quantity: 123,
        unitValue: 12.30,
        totalValue: 123.00,
      });
    });

    it('should parse totals correctly', () => {
      const notfisContent = `000EMPRESA A                 EMPRESA B                 010120230800NOT010120001
313000000000123450101202300000000012345000000000123450000000001234
31400000000012345PRODUTO TESTE                   000000000012300000000001230000000000123
318000000000012300000000001230000000000123000000000123`;

      const result = parser.parseNotfis(notfisContent);

      expect(result.totals).toEqual({
        recordType: '318',
        totalInvoices: 123,
        totalValue: 123.00,
        totalWeight: 123.00,
        totalVolume: 123,
      });
    });
  });
}); 