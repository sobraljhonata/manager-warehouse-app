import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

// Setup global para testes
jest.setTimeout(30000);

// Log para debug
console.log('Setup de testes carregado');
console.log('MONGO_URL:', process.env.MONGO_URL);

// Configuração do MongoDB em memória
beforeAll(async () => {
  console.log('beforeAll: Iniciando MongoMemoryServer');
  jest.setTimeout(30000); // Aumenta o timeout para 30 segundos
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('beforeAll: MongoMemoryServer iniciado e mongoose conectado');
}, 30000); // Timeout específico para o beforeAll

// Limpar o banco de dados após cada teste
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Fechar conexão e parar o servidor após todos os testes
afterAll(async () => {
  console.log('afterAll: Fechando conexão e parando MongoMemoryServer');
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
  console.log('afterAll: MongoMemoryServer parado');
}); 