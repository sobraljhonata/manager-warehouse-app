import { Request, Response } from 'express';
import { bodyParser } from '../../middlewares/bodyParser';

describe('BodyParser Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: undefined
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should parse valid JSON body', () => {
    const validJson = JSON.stringify({ test: 'data' });
    mockRequest.body = validJson;

    bodyParser(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.body).toEqual({ test: 'data' });
  });

  it('should reject invalid JSON body', () => {
    const invalidJson = '{invalid json}';
    mockRequest.body = invalidJson;

    bodyParser(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(new Error('Invalid JSON format'));
  });

  it('should handle empty body', () => {
    mockRequest.body = '';

    bodyParser(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.body).toBe('');
  });

  it('should handle undefined body', () => {
    mockRequest.body = undefined;

    bodyParser(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.body).toBeUndefined();
  });
}); 