import mongoose, { Model, Schema } from "mongoose";


export interface IUser {
  username: string;
  password: string; // This will be hashed
  createdAt: Date;
  updatedAt: Date;
}

// Define the interface for the User model
export interface IUserModel extends Model<IUser> {}

// Create the schema
const userSchema = new Schema<IUser, IUserModel>(
  {
    username: {
      type: String,
      required: true,
      unique: true, // This creates an index automatically
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model with proper typing
const User =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
