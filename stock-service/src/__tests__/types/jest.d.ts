/// <reference types="jest" />

declare module 'supertest' {
  import { Application } from 'express';
  
  export default function(app: Application): {
    post: (url: string) => {
      send: (data: any) => Promise<{
        status: number;
        body: any;
      }>;
    };
  };
}

declare module 'kafkajs' {
  export class Kafka {
    constructor(config: { clientId: string; brokers: string[] });
    consumer(config: { groupId: string }): {
      connect: () => Promise<void>;
      subscribe: (options: { topic: string; fromBeginning: boolean }) => Promise<void>;
      run: (options: { eachMessage: (params: { topic: string; partition: number; message: { value: Buffer } }) => Promise<void> }) => Promise<void>;
    };
    producer(): {
      connect: () => Promise<void>;
      send: (options: { topic: string; messages: { value: string }[] }) => Promise<void>;
      disconnect: () => Promise<void>;
    };
  }
} 