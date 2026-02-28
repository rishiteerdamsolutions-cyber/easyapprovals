import mongoose, { Schema, Document, Model } from 'mongoose';

export type QualityStatus = 'pending' | 'accepted' | 'rejected';

export interface IUploadedDocument extends Document {
  orderId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  fieldName: string;
  fileUrl: string;
  qualityStatus: QualityStatus;
  rejectionReason?: string;
  createdAt: Date;
}

const UploadedDocumentSchema = new Schema<IUploadedDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    fieldName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    qualityStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

UploadedDocumentSchema.index({ orderId: 1 });
UploadedDocumentSchema.index({ serviceId: 1 });
UploadedDocumentSchema.index({ qualityStatus: 1 });

const UploadedDocument: Model<IUploadedDocument> =
  mongoose.models.UploadedDocument ||
  mongoose.model<IUploadedDocument>('UploadedDocument', UploadedDocumentSchema);

export default UploadedDocument;
