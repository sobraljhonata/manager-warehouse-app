import { Request, Response } from 'express';
import { EdiFileService } from '../services/EdiFileService';
import { EdiValidationService } from '../services/EdiValidationService';
import { IKafkaAdapter } from '../infra/kafka/kafka-adapter';
import { ValidationError } from '../presentation/errors';

export class EdiFileController {
  private ediFileService: EdiFileService;
  private ediValidationService: EdiValidationService;

  constructor(kafkaAdapter: IKafkaAdapter) {
    this.ediFileService = new EdiFileService(kafkaAdapter);
    this.ediValidationService = new EdiValidationService();
  }

  async handle(req: Request): Promise<any> {
    const { content, fileName, fileSize, mimeType } = req.body;

    if (!content || !fileName) {
      throw new ValidationError('Content and fileName are required');
    }

    const validationResult = this.ediValidationService.validate(content);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors.join(', '));
    }

    const ediFile = await this.ediFileService.saveEdiFile({
      content,
      fileName,
      fileSize,
      mimeType
    });

    return {
      id: ediFile._id,
      fileName: ediFile.fileName,
      status: ediFile.status,
      createdAt: ediFile.createdAt
    };
  }

  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Validar o arquivo
      const validation = EdiValidationService.validateFile(req.file);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const file = await this.ediFileService.saveEdiFile({
        content: req.file.buffer.toString(),
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });
      return res.status(201).json(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getFile(req: Request, res: Response) {
    try {
      const file = await this.ediFileService.getFileById(req.params.id);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      return res.json(file);
    } catch (error) {
      console.error('Error getting file:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async listFiles(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const files = await this.ediFileService.listFiles(page, limit);
      return res.json(files);
    } catch (error) {
      console.error('Error listing files:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 