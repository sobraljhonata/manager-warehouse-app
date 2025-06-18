import { EdiValidatorService } from '../../services/EdiValidatorService';
import { EdiDocument } from '../../model/EdiDocument';

describe('EdiValidatorService', () => {
  let validator: EdiValidatorService;
  let validDocument: EdiDocument;

  beforeEach(() => {
    validator = new EdiValidatorService();
    validDocument = new EdiDocument();
    
    // Set up a valid document
    validDocument.documentType = 'NOTFIS';
    validDocument.version = '3.1';
    validDocument.senderId = 'SENDER123';
    validDocument.receiverId = 'RECEIVER456';
    validDocument.documentDate = new Date();
    validDocument.documentNumber = 'DOC789';
    validDocument.header = {
      recordType: '000',
      senderIdentification: 'SENDER123',
      receiverIdentification: 'RECEIVER456',
      date: '010123',
      time: '0800',
      interchangeId: 'DOC789'
    };
    validDocument.invoices = [{
      recordType: '313',
      invoiceNumber: 'INV001',
      invoiceDate: '010123',
      invoiceValue: 123.45,
      invoiceWeight: 123.45,
      invoiceVolume: 1234,
      products: [{
        recordType: '314',
        productCode: 'PROD001',
        productDescription: 'Test Product',
        quantity: 10,
        unitValue: 12.34,
        totalValue: 123.40
      }]
    }];
    validDocument.totals = {
      recordType: '318',
      totalInvoices: 1,
      totalValue: 123.45,
      totalWeight: 123.45,
      totalVolume: 1234
    };
  });

  describe('validateDocument', () => {
    it('should validate a correct document', () => {
      const result = validator.validateDocument(validDocument);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const document = new EdiDocument();
      const result = validator.validateDocument(document);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Document type is required');
      expect(result.errors).toContain('Version is required');
      expect(result.errors).toContain('Sender ID is required');
      expect(result.errors).toContain('Receiver ID is required');
      expect(result.errors).toContain('Document date is required');
      expect(result.errors).toContain('Document number is required');
      expect(result.errors).toContain('Header is required');
      expect(result.errors).toContain('At least one invoice is required');
      expect(result.errors).toContain('Totals are required');
    });

    it('should validate header fields', () => {
      validDocument.header = {
        recordType: '999', // Invalid record type
        senderIdentification: '',
        receiverIdentification: '',
        date: '',
        time: '',
        interchangeId: ''
      };

      const result = validator.validateDocument(validDocument);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid header record type');
      expect(result.errors).toContain('Sender identification is required in header');
      expect(result.errors).toContain('Receiver identification is required in header');
      expect(result.errors).toContain('Date is required in header');
      expect(result.errors).toContain('Time is required in header');
      expect(result.errors).toContain('Interchange ID is required in header');
    });

    it('should validate invoice fields', () => {
      validDocument.invoices = [{
        recordType: '999', // Invalid record type
        invoiceNumber: '',
        invoiceDate: '',
        invoiceValue: -1,
        invoiceWeight: -1,
        invoiceVolume: -1,
        products: []
      }];

      const result = validator.validateDocument(validDocument);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid invoice record type at index 0');
      expect(result.errors).toContain('Invoice number is required at index 0');
      expect(result.errors).toContain('Invoice date is required at index 0');
      expect(result.errors).toContain('Invalid invoice value at index 0');
      expect(result.errors).toContain('Invalid invoice weight at index 0');
      expect(result.errors).toContain('Invalid invoice volume at index 0');
      expect(result.errors).toContain('At least one product is required in invoice at index 0');
    });

    it('should validate product fields', () => {
      validDocument.invoices[0].products = [{
        recordType: '999', // Invalid record type
        productCode: '',
        productDescription: '',
        quantity: 0,
        unitValue: -1,
        totalValue: -1
      }];

      const result = validator.validateDocument(validDocument);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid product record type at invoice 0, product 0');
      expect(result.errors).toContain('Product code is required at invoice 0, product 0');
      expect(result.errors).toContain('Product description is required at invoice 0, product 0');
      expect(result.errors).toContain('Invalid product quantity at invoice 0, product 0');
      expect(result.errors).toContain('Invalid product unit value at invoice 0, product 0');
      expect(result.errors).toContain('Invalid product total value at invoice 0, product 0');
    });

    it('should validate totals fields', () => {
      validDocument.totals = {
        recordType: '999', // Invalid record type
        totalInvoices: -1,
        totalValue: -1,
        totalWeight: -1,
        totalVolume: -1
      };

      const result = validator.validateDocument(validDocument);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid totals record type');
      expect(result.errors).toContain('Invalid total invoices count');
      expect(result.errors).toContain('Invalid total value');
      expect(result.errors).toContain('Invalid total weight');
      expect(result.errors).toContain('Invalid total volume');
    });
  });
}); 