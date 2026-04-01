import mongoose, { Schema, Document, Model } from 'mongoose';

export type LeadSource =
  | 'contact'
  | 'service_inquiry'
  | 'order_followup'
  | 'blog'
  | 'cart_intake'
  | 'other';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  source: LeadSource;
  serviceSlug?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    source: {
      type: String,
      enum: ['contact', 'service_inquiry', 'order_followup', 'blog', 'cart_intake', 'other'],
      default: 'contact',
    },
    serviceSlug: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LeadSchema.index({ email: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ isRead: 1 });

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
