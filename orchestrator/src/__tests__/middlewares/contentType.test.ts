import { Request, Response } from 'express';
import { contentType } from '../../middlewares/contentType';

describe('ContentType Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      type: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should set content type to json', () => {
    contentType(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.type).toHaveBeenCalledWith('json');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should call next function', () => {
    contentType(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledTimes(1);
  });
}); 