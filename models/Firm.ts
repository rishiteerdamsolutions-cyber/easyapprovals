import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFirm extends Document {
  firmName: string;
  gstNumber?: string;
  logo?: string;
  address?: string;
  contactEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FirmSchema = new Schema<IFirm>(
  {
    firmName: { type: String, required: true },
    gstNumber: { type: String },
    logo: { type: String },
    address: { type: String },
    contactEmail: { type: String },
  },
  { timestamps: true }
);

const Firm: Model<IFirm> =
  mongoose.models.Firm || mongoose.model<IFirm>('Firm', FirmSchema);

export default Firm;
