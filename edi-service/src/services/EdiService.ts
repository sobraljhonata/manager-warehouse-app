import { EdiDocument } from '../model/EdiDocument';
import { EdiParserService } from './EdiParserService';
import { query } from '../config/database';
import { Kafka } from 'kafkajs';

export class EdiService {
  private parser: EdiParserService;
  private kafka: Kafka;

  constructor() {
    this.parser = new EdiParserService();
    this.kafka = new Kafka({
      clientId: 'edi-service',
      brokers: ['localhost:9092'],
    });
  }

  public async processEdiFile(content: string): Promise<EdiDocument> {
    try {
      // Parse the EDI content
      const document = this.parser.parseNotfis(content);
      
      // Validate the document
      if (!document.header || !document.invoices || document.invoices.length === 0) {
        throw new Error('Invalid EDI document: missing required sections');
      }

      // Save to database
      const result = await query(
        `INSERT INTO edi_documents (
          document_type, version, status, sender_id, receiver_id,
          document_date, document_number, header, invoices, products, totals
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          document.documentType,
          document.version,
          document.status,
          document.senderId,
          document.receiverId,
          document.documentDate,
          document.documentNumber,
          JSON.stringify(document.header),
          JSON.stringify(document.invoices),
          JSON.stringify(document.products),
          JSON.stringify(document.totals)
        ]
      );

      const savedDocument = result.rows[0];

      // Notify stock service
      if (savedDocument.invoices && Array.isArray(savedDocument.invoices)) {
        await this.notifyStockService(savedDocument);
      }

      return savedDocument;
    } catch (error) {
      throw new Error(`Failed to process EDI file: ${error.message}`);
    }
  }

  private async notifyStockService(document: EdiDocument): Promise<void> {
    const producer = this.kafka.producer();

    try {
      await producer.connect();

      // Send stock check request for each product
      for (const invoice of document.invoices || []) {
        for (const product of invoice.products || []) {
          await producer.send({
            topic: 'stock-check',
            messages: [
              {
                value: JSON.stringify({
                  type: 'STOCK_CHECK_REQUEST',
                  productCode: product.productCode,
                  quantity: product.quantity,
                  invoiceNumber: invoice.invoiceNumber,
                }),
              },
            ],
          });
        }
      }
    } finally {
      await producer.disconnect();
    }
  }
} 