import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    tone: {
      type: String,
      enum: ['professional', 'casual', 'concise']
    },
    status: {
      type: String,
      enum: ['complete', 'aborted', 'error'],
      default: 'complete'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'New Conversation'
    },
    messages: [messageSchema]
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
