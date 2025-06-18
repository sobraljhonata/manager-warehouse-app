import { EdiFile } from '../../model/EdiFile';

describe('EdiFile Model', () => {
  beforeEach(async () => {
    await EdiFile.deleteMany({});
  });

  it('should create a new EDI file', async () => {
    const ediFile = new EdiFile({
      fileName: 'test.edi',
      content: 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *230101*1200*^*00501*000000001*0*P*:~\n',
      fileSize: 1024,
      mimeType: 'text/plain',
      status: 'PENDING'
    });

    const savedFile = await ediFile.save();
    expect(savedFile._id).toBeDefined();
    expect(savedFile.fileName).toBe('test.edi');
    expect(savedFile.status).toBe('PENDING');
    expect(savedFile.fileSize).toBe(1024);
    expect(savedFile.mimeType).toBe('text/plain');
  });

  it('should validate required fields', async () => {
    const ediFile = new EdiFile({});
    
    let error;
    try {
      await ediFile.save();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.fileName).toBeDefined();
    expect(error.errors.content).toBeDefined();
    expect(error.errors.fileSize).toBeDefined();
    expect(error.errors.mimeType).toBeDefined();
  });

  it('should validate status enum values', async () => {
    const ediFile = new EdiFile({
      fileName: 'test.edi',
      content: 'ISA*00*          *00*          *ZZ*SENDER         *ZZ*RECEIVER       *230101*1200*^*00501*000000001*0*P*:~\n',
      fileSize: 1024,
      mimeType: 'text/plain',
      status: 'INVALID_STATUS'
    });

    let error;
    try {
      await ediFile.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });
}); 