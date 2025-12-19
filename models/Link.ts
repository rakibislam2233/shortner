import mongoose, { Model, Schema } from "mongoose";

export interface ILink {
  imageName: string;
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
    imageName: {
      type: String,
      required: true,
      unique: true,
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

// Create indexes for better query performance
linkSchema.index({ username: 1 });
linkSchema.index({ imageName: 1 }); 

// Create and export the model with proper typing
const Link =
  (mongoose.models.Link as ILinkModel) ||
  mongoose.model<ILink, ILinkModel>("Link", linkSchema);

export default Link;
