import { EdiFileService } from '../../services/EdiFileService';
import { EdiFile } from '../../model/EdiFile';
import { makeKafkaAdapter } from '../../main/factories/kafka-adapter-factory';

jest.mock('../../main/factories/kafka-adapter-factory', () => ({
  makeKafkaAdapter: jest.fn().mockReturnValue({
    sendMessage: jest.fn().mockResolvedValue(undefined)
  })
}));

describe('EdiFileService', () => {
  let service: EdiFileService;

  beforeEach(async () => {
    await EdiFile.deleteMany({});
    service = new EdiFileService(makeKafkaAdapter());
  });

  describe('saveEdiFile', () => {
    it('should save EDI file successfully', async () => {
      const mockFile = {
        content: 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *230101*1200*^*00501*000000001*0*P*:~\n',
        fileName: 'test.edi',
        fileSize: 1024,
        mimeType: 'text/plain'
      };

      const result = await service.saveEdiFile(mockFile);

      expect(result._id).toBeDefined();
      expect(result.fileName).toBe(mockFile.fileName);
      expect(result.status).toBe('PENDING');
    });

    it('should throw error when save fails', async () => {
      const mockFile = {
        content: 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *230101*1200*^*00501*000000001*0*P*:~\n',
        fileName: 'test.edi',
        fileSize: 1024,
        mimeType: 'text/plain'
      };

      jest.spyOn(EdiFile.prototype, 'save').mockRejectedValueOnce(new Error('Save failed'));

      await expect(service.saveEdiFile(mockFile)).rejects.toThrow('Failed to save EDI file');
    });
  });

  describe('updateStatus', () => {
    it('should update file status successfully', async () => {
      const mockFile = {
        content: 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *230101*1200*^*00501*000000001*0*P*:~\n',
        fileName: 'test.edi',
        fileSize: 1024,
        mimeType: 'text/plain'
      };

      const savedFile = await service.saveEdiFile(mockFile);
      const updatedFile = await service.updateStatus(savedFile._id, 'PROCESSED');

      expect(updatedFile.status).toBe('PROCESSED');
    });

    it('should throw error when file not found', async () => {
      await expect(service.updateStatus('nonexistentid', 'PROCESSED')).rejects.toThrow('Failed to update EDI file status');
    });
  });

  describe('getFileById', () => {
    it('should get file by id successfully', async () => {
      const mockFile = {
        content: 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *230101*1200*^*00501*000000001*0*P*:~\n',
        fileName: 'test.edi',
        fileSize: 1024,
        mimeType: 'text/plain'
      };

      const savedFile = await service.saveEdiFile(mockFile);
      const foundFile = await service.getFileById(savedFile._id);

      expect(foundFile._id.toString()).toBe(savedFile._id.toString());
    });

    it('should throw error when file not found', async () => {
      await expect(service.getFileById('nonexistentid')).rejects.toThrow('Failed to get EDI file');
    });
  });

  describe('listFiles', () => {
    it('should list files with pagination', async () => {
      const mockFiles = [
        {
          content: 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *230101*1200*^*00501*000000001*0*P*:~\n',
          fileName: 'test1.edi',
          fileSize: 1024,
          mimeType: 'text/plain'
        },
        {
          content: 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *230101*1200*^*00501*000000002*0*P*:~\n',
          fileName: 'test2.edi',
          fileSize: 1024,
          mimeType: 'text/plain'
        }
      ];

      await Promise.all(mockFiles.map(file => service.saveEdiFile(file)));

      const result = await service.listFiles(1, 1);

      expect(result.files).toHaveLength(1);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
      expect(result.pages).toBe(2);
    });
  });
}); 