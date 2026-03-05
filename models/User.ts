import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserType = 'new_member' | 'owns_company' | 'director_only';

export interface IUser extends Document {
  email: string;
  name?: string;
  image?: string;
  googleId?: string;
  userType: UserType;
  onboardingComplete: boolean;

  // New member (yet to form company)
  nameAsOnPan?: string;
  panNumber?: string;

  // Existing company (owns or director)
  username?: string; // as per PAN
  aadharNumber?: string;
  directorDin?: string;
  companyName?: string;
  directors?: string; // comma-separated or JSON

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    image: { type: String },
    googleId: { type: String },
    userType: {
      type: String,
      enum: ['new_member', 'owns_company', 'director_only'],
      required: true,
    },
    onboardingComplete: { type: Boolean, default: false },

    nameAsOnPan: { type: String },
    panNumber: { type: String },

    username: { type: String },
    aadharNumber: { type: String },
    directorDin: { type: String },
    companyName: { type: String },
    directors: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
