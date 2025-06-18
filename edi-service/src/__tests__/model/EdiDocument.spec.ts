import { EdiDocument } from '../../model/EdiDocument';

describe('EdiDocument', () => {
  it('should create a new EDI document with default values', () => {
    const document = new EdiDocument();

    expect(document.documentType).toBeUndefined();
    expect(document.version).toBeUndefined();
    expect(document.senderId).toBeUndefined();
    expect(document.receiverId).toBeUndefined();
    expect(document.documentDate).toBeUndefined();
    expect(document.documentNumber).toBeUndefined();
    expect(document.header).toBeUndefined();
    expect(document.invoices).toBeUndefined();
    expect(document.products).toBeUndefined();
    expect(document.totals).toBeUndefined();
    expect(document.status).toBe('PENDING');
    expect(document.errorMessage).toBeUndefined();
  });

  it('should create a new EDI document with provided values', () => {
    const document = new EdiDocument();
    const now = new Date();

    document.documentType = 'NOTFIS';
    document.version = '3.1';
    document.senderId = 'SENDER123';
    document.receiverId = 'RECEIVER456';
    document.documentDate = now;
    document.documentNumber = 'DOC789';
    document.header = {
      recordType: '000',
      senderIdentification: 'SENDER123',
      receiverIdentification: 'RECEIVER456',
      date: '010123',
      time: '0800',
      interchangeId: 'DOC789'
    };
    document.invoices = [{
      recordType: '313',
      invoiceNumber: 'INV001',
      invoiceDate: '010123',
      invoiceValue: 123.45,
      invoiceWeight: 123.45,
      invoiceVolume: 1234,
      products: []
    }];
    document.products = [{
      recordType: '314',
      productCode: 'PROD001',
      productDescription: 'Test Product',
      quantity: 10,
      unitValue: 12.34,
      totalValue: 123.40
    }];
    document.totals = {
      recordType: '318',
      totalInvoices: 1,
      totalValue: 123.45,
      totalWeight: 123.45,
      totalVolume: 1234
    };
    document.status = 'PROCESSED';
    document.errorMessage = 'No errors';

    expect(document.documentType).toBe('NOTFIS');
    expect(document.version).toBe('3.1');
    expect(document.senderId).toBe('SENDER123');
    expect(document.receiverId).toBe('RECEIVER456');
    expect(document.documentDate).toBe(now);
    expect(document.documentNumber).toBe('DOC789');
    expect(document.header).toEqual({
      recordType: '000',
      senderIdentification: 'SENDER123',
      receiverIdentification: 'RECEIVER456',
      date: '010123',
      time: '0800',
      interchangeId: 'DOC789'
    });
    expect(document.invoices).toHaveLength(1);
    expect(document.invoices[0]).toEqual({
      recordType: '313',
      invoiceNumber: 'INV001',
      invoiceDate: '010123',
      invoiceValue: 123.45,
      invoiceWeight: 123.45,
      invoiceVolume: 1234,
      products: []
    });
    expect(document.products).toHaveLength(1);
    expect(document.products[0]).toEqual({
      recordType: '314',
      productCode: 'PROD001',
      productDescription: 'Test Product',
      quantity: 10,
      unitValue: 12.34,
      totalValue: 123.40
    });
    expect(document.totals).toEqual({
      recordType: '318',
      totalInvoices: 1,
      totalValue: 123.45,
      totalWeight: 123.45,
      totalVolume: 1234
    });
    expect(document.status).toBe('PROCESSED');
    expect(document.errorMessage).toBe('No errors');
  });
}); 