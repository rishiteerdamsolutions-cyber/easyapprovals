import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStoredFile extends Document {
  orderId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  fieldName: string;
  contentType: string;
  data: Buffer;
  createdAt: Date;
}

const StoredFileSchema = new Schema<IStoredFile>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    fieldName: { type: String, required: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

StoredFileSchema.index({ orderId: 1, serviceId: 1, fieldName: 1 }, { unique: true });

const StoredFile: Model<IStoredFile> =
  mongoose.models.StoredFile ||
  mongoose.model<IStoredFile>('StoredFile', StoredFileSchema);

export default StoredFile;
