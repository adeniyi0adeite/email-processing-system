import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  email: string;
  message: string;
  createdAt: Date;
  processedAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

const MessageSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IMessage>('Message', MessageSchema);