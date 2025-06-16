import { EdiDocument } from '../model/EdiDocument';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class EdiValidatorService {
  validateDocument(document: EdiDocument): ValidationResult {
    const errors: string[] = [];

    // Validate document level fields
    if (!document.documentType) errors.push('Document type is required');
    if (!document.version) errors.push('Version is required');
    if (!document.senderId) errors.push('Sender ID is required');
    if (!document.receiverId) errors.push('Receiver ID is required');
    if (!document.documentDate) errors.push('Document date is required');
    if (!document.documentNumber) errors.push('Document number is required');

    // Validate header
    if (!document.header) {
      errors.push('Header is required');
    } else {
      this.validateHeader(document.header, errors);
    }

    // Validate invoices
    if (!document.invoices || document.invoices.length === 0) {
      errors.push('At least one invoice is required');
    } else {
      document.invoices.forEach((invoice, index) => {
        this.validateInvoice(invoice, errors, index);
      });
    }

    // Validate totals
    if (!document.totals) {
      errors.push('Totals are required');
    } else {
      this.validateTotals(document.totals, errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateHeader(header: any, errors: string[]): void {
    if (header.recordType !== '000') {
      errors.push('Invalid header record type');
    }
    if (!header.senderIdentification) {
      errors.push('Sender identification is required in header');
    }
    if (!header.receiverIdentification) {
      errors.push('Receiver identification is required in header');
    }
    if (!header.date) {
      errors.push('Date is required in header');
    }
    if (!header.time) {
      errors.push('Time is required in header');
    }
    if (!header.interchangeId) {
      errors.push('Interchange ID is required in header');
    }
  }

  private validateInvoice(invoice: any, errors: string[], index: number): void {
    if (invoice.recordType !== '313') {
      errors.push(`Invalid invoice record type at index ${index}`);
    }
    if (!invoice.invoiceNumber) {
      errors.push(`Invoice number is required at index ${index}`);
    }
    if (!invoice.invoiceDate) {
      errors.push(`Invoice date is required at index ${index}`);
    }
    if (typeof invoice.invoiceValue !== 'number' || invoice.invoiceValue <= 0) {
      errors.push(`Invalid invoice value at index ${index}`);
    }
    if (typeof invoice.invoiceWeight !== 'number' || invoice.invoiceWeight <= 0) {
      errors.push(`Invalid invoice weight at index ${index}`);
    }
    if (typeof invoice.invoiceVolume !== 'number' || invoice.invoiceVolume <= 0) {
      errors.push(`Invalid invoice volume at index ${index}`);
    }

    // Validate products
    if (!invoice.products || invoice.products.length === 0) {
      errors.push(`At least one product is required in invoice at index ${index}`);
    } else {
      invoice.products.forEach((product: any, productIndex: number) => {
        this.validateProduct(product, errors, index, productIndex);
      });
    }
  }

  private validateProduct(product: any, errors: string[], invoiceIndex: number, productIndex: number): void {
    if (product.recordType !== '314') {
      errors.push(`Invalid product record type at invoice ${invoiceIndex}, product ${productIndex}`);
    }
    if (!product.productCode) {
      errors.push(`Product code is required at invoice ${invoiceIndex}, product ${productIndex}`);
    }
    if (!product.productDescription) {
      errors.push(`Product description is required at invoice ${invoiceIndex}, product ${productIndex}`);
    }
    if (typeof product.quantity !== 'number' || product.quantity <= 0) {
      errors.push(`Invalid product quantity at invoice ${invoiceIndex}, product ${productIndex}`);
    }
    if (typeof product.unitValue !== 'number' || product.unitValue <= 0) {
      errors.push(`Invalid product unit value at invoice ${invoiceIndex}, product ${productIndex}`);
    }
    if (typeof product.totalValue !== 'number' || product.totalValue <= 0) {
      errors.push(`Invalid product total value at invoice ${invoiceIndex}, product ${productIndex}`);
    }
  }

  private validateTotals(totals: any, errors: string[]): void {
    if (totals.recordType !== '318') {
      errors.push('Invalid totals record type');
    }
    if (typeof totals.totalInvoices !== 'number' || totals.totalInvoices <= 0) {
      errors.push('Invalid total invoices count');
    }
    if (typeof totals.totalValue !== 'number' || totals.totalValue <= 0) {
      errors.push('Invalid total value');
    }
    if (typeof totals.totalWeight !== 'number' || totals.totalWeight <= 0) {
      errors.push('Invalid total weight');
    }
    if (typeof totals.totalVolume !== 'number' || totals.totalVolume <= 0) {
      errors.push('Invalid total volume');
    }
  }
} 