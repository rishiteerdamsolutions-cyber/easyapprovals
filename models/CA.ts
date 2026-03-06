import mongoose, { Schema, Document, Model } from 'mongoose';

export type CAStatus = 'subscribed' | 'interview_scheduled' | 'admitted' | 'rejected';

export interface ICA extends Document {
  email: string;
  name: string;
  phone?: string;
  status: CAStatus;
  csoScore?: number;
  generatedLogin?: string;
  notes?: string;
  admittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CASchema = new Schema<ICA>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String },
    status: {
      type: String,
      enum: ['subscribed', 'interview_scheduled', 'admitted', 'rejected'],
      default: 'subscribed',
    },
    csoScore: { type: Number, min: 0, max: 100 },
    generatedLogin: { type: String, unique: true, sparse: true },
    notes: { type: String },
    admittedAt: { type: Date },
  },
  { timestamps: true }
);

CASchema.index({ email: 1 });
CASchema.index({ status: 1 });
CASchema.index({ generatedLogin: 1 });

const CA: Model<ICA> =
  mongoose.models.CA || mongoose.model<ICA>('CA', CASchema);

export default CA;
