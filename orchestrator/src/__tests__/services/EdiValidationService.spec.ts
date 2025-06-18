import { EdiValidationService } from '../../services/EdiValidationService';

describe('EdiValidationService', () => {
  describe('validateFile', () => {
    it('should return error when no file is provided', () => {
      const result = EdiValidationService.validateFile(undefined as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('No file provided');
    });

    it('should return error when file is empty', () => {
      const file = {
        buffer: Buffer.from(''),
        size: 0,
        mimetype: 'text/plain'
      } as Express.Multer.File;

      const result = EdiValidationService.validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File is empty');
    });

    it('should return error when file size exceeds limit', () => {
      const file = {
        buffer: Buffer.from('test'),
        size: 11 * 1024 * 1024, // 11MB
        mimetype: 'text/plain'
      } as Express.Multer.File;

      const result = EdiValidationService.validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('File size exceeds maximum limit');
    });

    it('should return error when file type is not allowed', () => {
      const file = {
        buffer: Buffer.from('test'),
        size: 1024,
        mimetype: 'application/pdf'
      } as Express.Multer.File;

      const result = EdiValidationService.validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should return error when EDI content is invalid', () => {
      const file = {
        buffer: Buffer.from('Invalid content'),
        size: 1024,
        mimetype: 'text/plain'
      } as Express.Multer.File;

      const result = EdiValidationService.validateFile(file);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid EDI file format');
    });

    it('should validate valid EDI file', () => {
      const validEdiContent = `ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *230101*1200*^*00501*000000001*0*P*>~GS*PO*SENDER*RECEIVER*20230101*1200*1*X*005010~ST*850*0001~BEG*00*SA*123456**20230101~REF*DP*123456~N1*BY*COMPANY NAME~N3*123 MAIN ST~N4*CITY*ST*12345~PO1*1*10*EA*10.00**BP*123456~CTT*1~SE*8*0001~GE*1*1~IEA*1*000000001`;
      
      const file = {
        buffer: Buffer.from(validEdiContent),
        size: validEdiContent.length,
        mimetype: 'text/plain'
      } as Express.Multer.File;

      const result = EdiValidationService.validateFile(file);
      expect(result.isValid).toBe(true);
    });
  });
}); 