import { Request, Response } from 'express';
import { EdiFileController } from '../../controllers/EdiFileController';
import { EdiFileService } from '../../services/EdiFileService';
import { EdiValidationService } from '../../services/EdiValidationService';
import { IKafkaAdapter } from '../../infra/kafka/kafka-adapter';

jest.mock('../../services/EdiFileService');
jest.mock('../../services/EdiValidationService');

describe('EdiFileController', () => {
  let controller: EdiFileController;
  let mockKafkaAdapter: jest.Mocked<IKafkaAdapter>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockKafkaAdapter = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendMessage: jest.fn(),
      subscribe: jest.fn()
    };

    controller = new EdiFileController(mockKafkaAdapter);

    // Mock validateFile to return valid by default
    jest.spyOn(EdiValidationService, 'validateFile').mockReturnValue({
      isValid: true,
      error: undefined
    });

    mockRequest = {
      file: {
        buffer: Buffer.from('EDI content'),
        originalname: 'test.edi',
        size: 100,
        mimetype: 'text/plain',
        fieldname: 'file',
        encoding: '7bit',
        stream: {} as any,
        destination: '',
        filename: 'test.edi',
        path: ''
      }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('uploadFile', () => {
    it('should convert File to EdiFileData format correctly', async () => {
      const mockSaveEdiFile = jest.spyOn(EdiFileService.prototype, 'saveEdiFile')
        .mockResolvedValueOnce({
          _id: '123',
          fileName: 'test.edi',
          status: 'PENDING',
          createdAt: new Date()
        });

      await controller.uploadFile(mockRequest as Request, mockResponse as Response);

      expect(mockSaveEdiFile).toHaveBeenCalledWith({
        content: 'EDI content',
        fileName: 'test.edi',
        fileSize: 100,
        mimeType: 'text/plain'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 when no file is uploaded', async () => {
      mockRequest.file = undefined;

      await controller.uploadFile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'No file uploaded' });
    });

    it('should return 400 when file validation fails', async () => {
      jest.spyOn(EdiValidationService, 'validateFile').mockReturnValueOnce({
        isValid: false,
        error: 'Invalid file format'
      });

      await controller.uploadFile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid file format' });
    });
  });

  describe('constructor', () => {
    it('should initialize with kafkaAdapter', () => {
      expect(controller).toBeInstanceOf(EdiFileController);
      expect(EdiFileService).toHaveBeenCalledWith(mockKafkaAdapter);
    });
  });
}); 