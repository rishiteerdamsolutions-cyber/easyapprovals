import mongoose, { Schema, Document, Model } from 'mongoose';

export type DocumentFieldType = 'text' | 'email' | 'phone' | 'image' | 'pdf';
export type DocumentVerification = 'none' | 'otp';

export interface IRequiredDocument {
  fieldName: string;
  label: string;
  type: DocumentFieldType;
  verification: DocumentVerification;
  cropRequired: boolean;
  isMandatory: boolean;
  minResolutionWidth?: number;
  minFileSizeKB?: number;
}

export interface IService extends Document {
  categoryId: mongoose.Types.ObjectId;
  firmId?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  requiredDocuments: IRequiredDocument[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RequiredDocumentSchema = new Schema<IRequiredDocument>(
  {
    fieldName: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'email', 'phone', 'image', 'pdf'],
      default: 'text',
    },
    verification: {
      type: String,
      enum: ['none', 'otp'],
      default: 'none',
    },
    cropRequired: { type: Boolean, default: false },
    isMandatory: { type: Boolean, default: true },
    minResolutionWidth: { type: Number },
    minFileSizeKB: { type: Number },
  },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    firmId: { type: Schema.Types.ObjectId, ref: 'Firm' },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    requiredDocuments: [RequiredDocumentSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceSchema.index({ categoryId: 1 });
ServiceSchema.index({ slug: 1 });
ServiceSchema.index({ isActive: 1 });
ServiceSchema.index({ firmId: 1 });

const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

export default Service;
