import { Router } from 'express';
import { EdiFileController } from '../../controllers/EdiFileController';
import { makeKafkaAdapter } from '../factories/kafka-adapter-factory';
import { KafkaError, ValidationError } from '../../presentation/errors';

const router = Router();
const kafkaAdapter = makeKafkaAdapter();
const ediFileController = new EdiFileController(kafkaAdapter);

router.post('/edi', async (req, res, next) => {
  try {
    const result = await ediFileController.handle(req);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Kafka')) {
        next(new KafkaError(error.message));
      } else if (error.message.includes('validation')) {
        next(new ValidationError(error.message));
      } else {
        next(error);
      }
    } else {
      next(error);
    }
  }
});

export default router; 