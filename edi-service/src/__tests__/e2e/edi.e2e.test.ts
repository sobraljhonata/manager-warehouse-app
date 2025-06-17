import { Kafka, Partitioners } from 'kafkajs';
import { Pool } from 'pg';

const kafka = new Kafka({
  clientId: 'edi-e2e-test',
  brokers: ['localhost:29092'],
  retry: {
    initialRetryTime: 100,
    retries: 3
  },
  connectionTimeout: 3000,
  authenticationTimeout: 3000,
  requestTimeout: 3000
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'warehouse',
  password: 'postgres',
  port: 5432,
});

describe('EDI Service E2E', () => {
  beforeAll(async () => {
    try {
      await producer.connect();
    } catch (error) {
      console.warn('Failed to connect to Kafka, skipping Kafka tests:', error);
    }
  });

  afterAll(async () => {
    try {
      await producer.disconnect();
    } catch (error) {
      console.warn('Failed to disconnect from Kafka:', error);
    }
    await pool.end();
  });

  it('should process and persist EDI received via Kafka', async () => {
    const ediContent = `000EMPRESA A                 EMPRESA B                 010120230800NOT010120001
313000000000123450101202300000000012345000000000123450000000001234
31400000000012345PRODUTO TESTE                   000000000012300000000001230000000000123
318000000000012300000000001230000000000123000000000123`;

    try {
      await producer.send({
        topic: 'edi-files',
        messages: [
          { value: ediContent }
        ]
      });

      // Aguarda um tempo para o processamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Verifica se o documento foi salvo no banco
      const result = await pool.query(
        'SELECT * FROM edi_documents WHERE content = $1',
        [ediContent]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe('PROCESSED');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.warn('Kafka not available, skipping test');
        return;
      }
      throw error;
    }
  });
}); 