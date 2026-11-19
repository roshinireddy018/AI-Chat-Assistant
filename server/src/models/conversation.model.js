import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'New Conversation'
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

conversationSchema.index({ updatedAt: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
