// Fixed: MongoDB Link schema with Mongoose
import mongoose from 'mongoose';

// Define the interface for the Link document
interface ILink {
  id: string;
  image: string;
  urlMobile: string;
  urlDesktop?: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create the schema
const linkSchema = new mongoose.Schema<ILink>({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  urlMobile: {
    type: String,
    required: true
  },
  urlDesktop: {
    type: String,
    required: false
  },
  username: {
    type: String,
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Create indexes for better query performance
linkSchema.index({ id: 1 });
linkSchema.index({ username: 1 });

// Create and export the model
const Link = mongoose.models.Link || mongoose.model<ILink>('Link', linkSchema);
export default Link;