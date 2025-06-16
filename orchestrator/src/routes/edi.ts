import { Router, RequestHandler } from 'express';
import { KafkaProducer } from '../kafka';

const router = Router();
let producer: any = null;

async function getProducer() {
  if (!producer) {
    producer = await KafkaProducer();
  }
  return producer;
}

const processHandler: RequestHandler = async (req, res) => {
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'No EDI content provided' });
    return;
  }

  try {
    const kafkaProducer = await getProducer();
    await kafkaProducer.send({
      topic: 'edi-processing',
      messages: [
        {
          value: JSON.stringify({
            type: 'EDI_PROCESSING_REQUEST',
            content,
          }),
        },
      ],
    });

    res.status(200).json({
      message: 'EDI file sent for processing',
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Error in EDI processing:', error);
    res.status(500).json({ error: 'Failed to process EDI file' });
  }
};

router.post('/process', processHandler);

export default router; 