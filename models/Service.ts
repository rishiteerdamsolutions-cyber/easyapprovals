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

export interface IProcessStep {
  title: string;
  description: string;
}

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IAdditionalCharge {
  label: string;
  amount: number;
}

export interface IService extends Document {
  categoryId: mongoose.Types.ObjectId;
  firmId?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number; // total (fallback)
  serviceCharge: number; // professional/service fee
  governmentFee: number;
  professionalFee: number; // if different from serviceCharge
  gstPercent: number; // e.g. 18
  /** Named surcharges (e.g. filing fee) shown to customers and in admin. */
  additionalCharges: IAdditionalCharge[];
  /** When true (default), public APIs use DB prices; when false, legacy Excel map applies. */
  useDatabasePricing: boolean;
  requiredDocuments: IRequiredDocument[];
  processSteps: IProcessStep[];
  eligibility: string[];
  faqs: IFAQ[];
  benefits: string[];
  processingTime: string;
  aliases: string[];
  variations: string[];
  locationsEnabled: boolean;
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

const ProcessStepSchema = new Schema<IProcessStep>(
  { title: { type: String, required: true }, description: { type: String, default: '' } },
  { _id: false }
);

const FAQSchema = new Schema<IFAQ>(
  { question: { type: String, required: true }, answer: { type: String, default: '' } },
  { _id: false }
);

const AdditionalChargeSchema = new Schema<IAdditionalCharge>(
  {
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
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
    serviceCharge: { type: Number, default: 0 },
    governmentFee: { type: Number, default: 0 },
    professionalFee: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 18 },
    additionalCharges: { type: [AdditionalChargeSchema], default: [] },
    useDatabasePricing: { type: Boolean, default: true },
    requiredDocuments: [RequiredDocumentSchema],
    processSteps: { type: [ProcessStepSchema], default: [] },
    eligibility: { type: [String], default: [] },
    faqs: { type: [FAQSchema], default: [] },
    benefits: { type: [String], default: [] },
    processingTime: { type: String, default: '' },
    aliases: { type: [String], default: [] },
    variations: { type: [String], default: [] },
    locationsEnabled: { type: Boolean, default: false },
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
