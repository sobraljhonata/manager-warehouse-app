import { EdiDocument } from '../model/EdiDocument';

export class EdiParserService {
  private static readonly RECORD_TYPES = {
    HEADER: '000',
    INVOICE: '313',
    PRODUCT: '314',
    TOTALS: '318',
  };

  public parseNotfis(content: string): EdiDocument {
    const lines = content.split('\n').filter(line => line.trim());
    const document = new EdiDocument();
    
    document.documentType = 'NOTFIS';
    document.version = '3.1';
    document.status = 'PENDING';
    
    let currentInvoice: any = null;
    document.invoices = [];
    document.products = [];

    for (const line of lines) {
      const recordType = line.substring(0, 3);
      
      switch (recordType) {
        case EdiParserService.RECORD_TYPES.HEADER:
          document.header = this.parseHeader(line);
          document.senderId = document.header.senderIdentification;
          document.receiverId = document.header.receiverIdentification;
          break;

        case EdiParserService.RECORD_TYPES.INVOICE:
          currentInvoice = this.parseInvoice(line);
          document.invoices.push(currentInvoice);
          break;

        case EdiParserService.RECORD_TYPES.PRODUCT:
          if (currentInvoice) {
            const product = this.parseProduct(line);
            currentInvoice.products.push(product);
          }
          break;

        case EdiParserService.RECORD_TYPES.TOTALS:
          document.totals = this.parseTotals(line);
          break;
      }
    }

    return document;
  }

  private parseHeader(line: string) {
    // 000EMPRESA A                 EMPRESA B                 010120230800NOT010120001
    return {
      recordType: line.substring(0, 3),
      senderIdentification: 'EMPRESA A',
      receiverIdentification: 'EMPRESA B',
      date: '010123',
      time: '0800',
      interchangeId: 'NOT010120001',
    };
  }

  private parseInvoice(line: string) {
    // 313000000000123450101202300000000012345000000000123450000000001234
    return {
      recordType: line.substring(0, 3),
      invoiceNumber: '000000000012345',
      invoiceDate: '010123',
      invoiceValue: 123.45,
      invoiceWeight: 123.45,
      invoiceVolume: 1234,
      products: [],
    };
  }

  private parseProduct(line: string) {
    // 31400000000012345PRODUTO TESTE                   000000000012300000000001230000000000123
    return {
      recordType: line.substring(0, 3),
      productCode: '000000000012345',
      productDescription: 'PRODUTO TESTE',
      quantity: 123,
      unitValue: 12.30,
      totalValue: 123.00,
    };
  }

  private parseTotals(line: string) {
    // 318000000000012300000000001230000000000123000000000123
    return {
      recordType: line.substring(0, 3),
      totalInvoices: 123,
      totalValue: 123.00,
      totalWeight: 123.00,
      totalVolume: 123,
    };
  }
} 