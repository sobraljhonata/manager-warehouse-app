import { Request, Response } from 'express';
import { cors } from '../../middlewares/cors';

describe('CORS Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      set: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should set CORS headers', () => {
    cors(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.set).toHaveBeenCalledWith('access-control-allow-origin', '*');
    expect(mockResponse.set).toHaveBeenCalledWith('access-control-allow-headers', '*');
    expect(mockResponse.set).toHaveBeenCalledWith('access-control-allow-methods', '*');
  });

  it('should call next function', () => {
    cors(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
  });

  it('should set all required CORS headers', () => {
    cors(mockRequest as Request, mockResponse as Response, nextFunction);

    const setCalls = (mockResponse.set as jest.Mock).mock.calls;
    expect(setCalls).toHaveLength(3);
    expect(setCalls[0]).toEqual(['access-control-allow-origin', '*']);
    expect(setCalls[1]).toEqual(['access-control-allow-headers', '*']);
    expect(setCalls[2]).toEqual(['access-control-allow-methods', '*']);
  });
}); 