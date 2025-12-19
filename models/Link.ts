import mongoose, { Model, Schema } from "mongoose";

// Define the interface for the Link document
export interface ILink {
  id: string;
  image: string;
  urlMobile: string;
  urlDesktop?: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the Link model
export interface ILinkModel extends Model<ILink> {}

// Create the schema
const linkSchema = new Schema<ILink, ILinkModel>(
  {
    id: {
      type: String,
      required: true,
      unique: true, // This creates an index automatically
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    urlMobile: {
      type: String,
      required: true,
    },
    urlDesktop: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance (excluding id since unique: true already creates index)
linkSchema.index({ username: 1 });

// Create and export the model with proper typing
const Link =
  (mongoose.models.Link as ILinkModel) ||
  mongoose.model<ILink, ILinkModel>("Link", linkSchema);

export default Link;
