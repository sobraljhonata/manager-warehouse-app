import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'edi-e2e-setup',
  brokers: ['localhost:29092'],
  connectionTimeout: 3000
});

const admin = kafka.admin();

async function setup() {
  try {
    await admin.connect();
    
    // Lista os tópicos existentes
    const topics = await admin.listTopics();
    
    // Se o tópico não existir, cria ele
    if (!topics.includes('edi-files')) {
      await admin.createTopics({
        topics: [{
          topic: 'edi-files',
          numPartitions: 1,
          replicationFactor: 1
        }]
      });
      console.log('Tópico edi-files criado com sucesso');
    } else {
      console.log('Tópico edi-files já existe');
    }
  } catch (error) {
    console.error('Erro ao configurar tópico:', error);
  } finally {
    await admin.disconnect();
  }
}

setup(); 