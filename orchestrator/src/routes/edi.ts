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
  try {
    const ediContent = req.body?.content;
    if (!ediContent) {
      res.status(400).json({ error: 'No EDI content provided' });
      return;
    }

    const kafkaProducer = await getProducer();
    try {
      await kafkaProducer.send({
        topic: 'edi-processing',
        messages: [
          {
            value: JSON.stringify({
              type: 'EDI_PROCESSING_REQUEST',
              content: ediContent,
            }),
          },
        ],
      });

      res.status(200).json({
        message: 'EDI file sent for processing',
        status: 'PENDING',
      });
    } catch (error: any) {
      console.error('Error sending message to Kafka:', error);
      res.status(500).json({ error: 'Failed to process EDI file' });
    }
  } catch (error: any) {
    console.error('Error in EDI processing:', error);
    res.status(500).json({ error: 'Failed to process EDI file' });
  }
};

router.post('/process', processHandler);

export default router; 