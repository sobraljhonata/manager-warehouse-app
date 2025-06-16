// EdiDocument POJO para uso com pg
export class EdiDocument {
  id?: string;
  documentType: string; // NOTFIS
  version: string;
  senderId: string;
  receiverId: string;
  documentDate?: Date;
  documentNumber?: string;
  header: {
    recordType: string;
    senderIdentification: string;
    receiverIdentification: string;
    date: string;
    time: string;
    interchangeId: string;
  };
  invoices: Array<{
    recordType: string;
    invoiceNumber: string;
    invoiceDate: string;
    invoiceValue: number;
    invoiceWeight: number;
    invoiceVolume: number;
    products: Array<{
      recordType: string;
      productCode: string;
      productDescription: string;
      quantity: number;
      unitValue: number;
      totalValue: number;
    }>;
  }>;
  products?: Array<{
    recordType: string;
    productCode: string;
    productDescription: string;
    quantity: number;
    unitValue: number;
    totalValue: number;
  }>;
  totals: {
    recordType: string;
    totalInvoices: number;
    totalValue: number;
    totalWeight: number;
    totalVolume: number;
  };
  status: 'PENDING' | 'PROCESSED' | 'ERROR' = 'PENDING';
  errorMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 