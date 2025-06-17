import { Kafka } from 'kafkajs';
import type { KafkaConfig } from '../../config/kafka';

export interface IKafkaAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendMessage(topic: string, message: any): Promise<void>;
  subscribe(topic: string, callback: (message: any) => Promise<void>): Promise<void>;
}

export class KafkaAdapter implements IKafkaAdapter {
  private kafka: Kafka;
  private producer: ReturnType<Kafka['producer']>;
  private consumer: ReturnType<Kafka['consumer']>;
  private isConnected: boolean = false;

  constructor(config: KafkaConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: config.groupId });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.producer.connect();
      await this.consumer.connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.producer.disconnect();
      await (this.consumer as any).disconnect();
      this.isConnected = false;
    }
  }

  async sendMessage(topic: string, message: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka is not connected');
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          { value: JSON.stringify(message) }
        ]
      });
    } catch (error) {
      console.error('Error sending message to Kafka:', error);
      throw error;
    }
  }

  async subscribe(topic: string, callback: (message: any) => Promise<void>): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka is not connected');
    }

    try {
      await this.consumer.subscribe({ topic, fromBeginning: true });
      
      await this.consumer.run({
        eachMessage: async ({ message }: { message: { value: Buffer } }) => {
          if (message.value) {
            const value = JSON.parse(message.value.toString());
            await callback(value);
          }
        }
      });
    } catch (error) {
      console.error('Error subscribing to Kafka topic:', error);
      throw error;
    }
  }
} 