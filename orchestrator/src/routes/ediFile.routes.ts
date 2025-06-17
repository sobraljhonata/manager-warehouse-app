import { Router } from 'express';
import multer from 'multer';
import { EdiFileController } from '../controllers/EdiFileController';
import { makeKafkaAdapter } from '../main/factories/kafka-adapter-factory';

const router = Router();
const upload = multer();
const ediFileController = new EdiFileController(makeKafkaAdapter());

// Upload de arquivo EDI
router.post('/upload', upload.single('file'), ediFileController.uploadFile.bind(ediFileController));

// Obter um arquivo específico
router.get('/:id', ediFileController.getFile.bind(ediFileController));

// Listar arquivos com paginação
router.get('/', ediFileController.listFiles.bind(ediFileController));

export default router; 