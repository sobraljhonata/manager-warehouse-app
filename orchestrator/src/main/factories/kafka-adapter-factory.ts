import { KafkaAdapter } from '../../infra/kafka/kafka-adapter';
import { kafkaConfig } from '../../config/kafka';

export const makeKafkaAdapter = (): KafkaAdapter => {
  return new KafkaAdapter(kafkaConfig);
}; 