// Fixed: MongoDB User schema with Mongoose
import mongoose from 'mongoose';

interface IUser {
  username: string;
  password: string; // This will be hashed
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

// Create index for username for better query performance
userSchema.index({ username: 1 });

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;