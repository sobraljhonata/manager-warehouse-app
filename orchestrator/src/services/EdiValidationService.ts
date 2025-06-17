export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class EdiValidationService {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_MIME_TYPES = ['text/plain', 'application/octet-stream'];

  static validateFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
    // Verificar se o arquivo existe
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    // Verificar o tamanho do arquivo
    if (file.size > this.MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        error: `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB` 
      };
    }

    // Verificar o tipo do arquivo
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return { 
        isValid: false, 
        error: `Invalid file type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}` 
      };
    }

    // Verificar se o arquivo está vazio
    if (file.size === 0) {
      return { isValid: false, error: 'File is empty' };
    }

    // Verificar o conteúdo do arquivo
    const content = file.buffer.toString();
    if (!this.isValidEdiContent(content)) {
      return { isValid: false, error: 'Invalid EDI file format' };
    }

    return { isValid: true };
  }

  private static isValidEdiContent(content: string): boolean {
    // Verificar se o conteúdo não está vazio
    if (!content.trim()) {
      return false;
    }

    // Verificar se o arquivo começa com um segmento ISA (X12)
    const firstLine = content.split('~')[0].trim();
    if (!firstLine.startsWith('ISA')) {
      return false;
    }

    // Verificar se o arquivo tem pelo menos um segmento IEA (X12)
    const segments = content.split('~').filter(s => s.trim());
    const lastSegment = segments[segments.length - 1].trim();
    if (!lastSegment.startsWith('IEA')) {
      return false;
    }

    // Verificar se o arquivo contém segmentos obrigatórios do X12
    const requiredSegments = ['GS', 'ST', 'SE', 'GE'];
    const contentUpper = content.toUpperCase();
    return requiredSegments.every(segment => contentUpper.includes(segment));
  }

  validate(content: string): ValidationResult {
    const errors: string[] = [];

    if (!content) {
      errors.push('Content is required');
      return { isValid: false, errors };
    }

    // Validate ISA segment
    if (!content.startsWith('ISA')) {
      errors.push('File must start with ISA segment');
    }

    // Validate IEA segment
    if (!content.includes('IEA')) {
      errors.push('File must end with IEA segment');
    }

    // Validate GS segment
    if (!content.includes('GS')) {
      errors.push('File must contain GS segment');
    }

    // Validate GE segment
    if (!content.includes('GE')) {
      errors.push('File must contain GE segment');
    }

    // Validate ST segment
    if (!content.includes('ST')) {
      errors.push('File must contain ST segment');
    }

    // Validate SE segment
    if (!content.includes('SE')) {
      errors.push('File must contain SE segment');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 