import express, { Request, Response } from 'express';
import Message, { IMessage } from '../models/message';
import { addEmailJob } from '../services/queueService';

const router = express.Router();

interface MessageRequest {
  email: string;
  message: string;
}

// Create new message
router.post('/', async (req: Request<{}, {}, MessageRequest>, res: Response) => {
  try {
    const { email, message } = req.body;

    // Basic validation
    if (!email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Email and message are required'
      });
    }

    // Create and save message to MongoDB
    const newMessage: IMessage = new Message({
      email,
      message,
      status: 'pending'
    });

    const savedMessage = await newMessage.save();
    console.log(`Message saved to DB: ${savedMessage._id}`);

    await addEmailJob(String(savedMessage._id));

    res.status(201).json({
      success: true,
      message: 'Message received and queued for processing',
      data: {
        id: String(savedMessage._id),
        email: savedMessage.email,
        message: savedMessage.message,
        status: savedMessage.status,
        createdAt: savedMessage.createdAt
      }
    });

  } catch (error: unknown) { 
    console.error('Error processing message:', error);
    
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message 
      });
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: String(error) // Convert unknown error to string for logging
    });
  }
});

// Get all messages
router.get('/', async (req: Request, res: Response) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    
    res.json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error: unknown) {
    console.error('Error fetching messages:', error);
    if (error instanceof Error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    } else {
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: String(error)
        });
    }
  }
});

export default router;
