import 'jest';
import { Pool } from 'pg';

// Mock do pool do PostgreSQL para testes
jest.mock('pg', () => {
  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    release: jest.fn(),
  };
  return {
    Pool: jest.fn(() => mockPool),
  };
});

// Mock do Kafka para testes
jest.mock('kafkajs', () => {
  return {
    Kafka: jest.fn(() => ({
      consumer: jest.fn(() => ({
        connect: jest.fn(),
        subscribe: jest.fn(),
        run: jest.fn(),
      })),
      producer: jest.fn(() => ({
        connect: jest.fn(),
        send: jest.fn(),
        disconnect: jest.fn(),
      })),
    })),
  };
});

// Limpar todos os mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Limpar todos os mocks após todos os testes
afterAll(() => {
  jest.resetAllMocks();
}); 