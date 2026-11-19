import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    sender: {
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
      enum: ['Professional', 'Casual', 'Concise'],
      default: 'Professional'
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model('Message', messageSchema);
export default Message;
