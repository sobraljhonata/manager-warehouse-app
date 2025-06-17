import { EdiFile } from '../model/EdiFile';
import { IKafkaAdapter } from '../infra/kafka/kafka-adapter';
import { DatabaseError } from '../presentation/errors';

export interface EdiFileData {
  content: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
}

export class EdiFileService {
  constructor(private readonly kafkaAdapter: IKafkaAdapter) {}

  async saveEdiFile(data: EdiFileData): Promise<any> {
    try {
      const ediFile = new EdiFile({
        content: data.content,
        fileName: data.fileName,
        fileSize: data.fileSize || 0,
        mimeType: data.mimeType || 'text/plain',
        status: 'PENDING'
      });

      const savedFile = await ediFile.save();

      // Send message to Kafka
      await this.kafkaAdapter.sendMessage('edi-files', {
        id: savedFile._id,
        fileName: savedFile.fileName,
        status: savedFile.status
      });

      return savedFile;
    } catch (error) {
      throw new DatabaseError('Failed to save EDI file');
    }
  }

  async updateStatus(id: string, status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'ERROR', errorMessage?: string): Promise<any> {
    try {
      const ediFile = await EdiFile.findById(id);
      if (!ediFile) {
        throw new Error('EDI file not found');
      }

      ediFile.status = status;
      if (errorMessage) {
        ediFile.errorMessage = errorMessage;
      }

      const updatedFile = await ediFile.save();

      // Send status update to Kafka
      await this.kafkaAdapter.sendMessage('edi-status-updates', {
        id: updatedFile._id,
        status: updatedFile.status,
        errorMessage: updatedFile.errorMessage
      });

      return updatedFile;
    } catch (error) {
      throw new DatabaseError('Failed to update EDI file status');
    }
  }

  async getFileById(id: string): Promise<any> {
    try {
      const ediFile = await EdiFile.findById(id);
      if (!ediFile) {
        throw new Error('EDI file not found');
      }
      return ediFile;
    } catch (error) {
      throw new DatabaseError('Failed to get EDI file');
    }
  }

  async listFiles(page: number = 1, limit: number = 10): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const files = await EdiFile.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await EdiFile.countDocuments();

      return {
        files,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new DatabaseError('Failed to list EDI files');
    }
  }
} 