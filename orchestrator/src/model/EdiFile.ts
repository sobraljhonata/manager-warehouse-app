import { Schema, model, Document } from 'mongoose';

export interface IEdiFile extends Document {
  _id: string;
  content: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'ERROR';
  errorMessage?: string;
  processingStartTime?: Date;
  processingEndTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ediFileSchema = new Schema<IEdiFile>({
  content: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'PROCESSED', 'ERROR'],
    default: 'PENDING'
  },
  errorMessage: { type: String },
  processingStartTime: { type: Date },
  processingEndTime: { type: Date }
}, {
  timestamps: true
});

export const EdiFile = model<IEdiFile>('EdiFile', ediFileSchema); 