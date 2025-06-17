export interface KafkaConfig {
  clientId: string;
  brokers: string[];
  groupId: string;
}

export const kafkaConfig: KafkaConfig = {
  clientId: 'orchestrator-service',
  brokers: ['localhost:9092'],
  groupId: 'orchestrator-group'
}; 