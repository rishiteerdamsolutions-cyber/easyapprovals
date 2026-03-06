import mongoose, { Schema, Document, Model } from 'mongoose';

export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed';
export type OrderStatus =
  | 'created'
  | 'payment_pending'
  | 'paid'
  | 'documents_pending'
  | 'documents_uploaded'
  | 'in_review'
  | 'assigned'
  | 'ca_completed'
  | 'customer_verified'
  | 'approved'
  | 'rejected'
  | 'completed';

export type OrderComplexity = 'low' | 'medium' | 'high';

export interface IOrderService {
  serviceId: mongoose.Types.ObjectId;
  serviceName: string;
  categoryName: string;
  price: number;
  qty: number;
  total: number;
  professionalFee?: number;
}

export interface IOrder extends Document {
  orderId: string;
  firmId?: mongoose.Types.ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  services: IOrderService[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentReference?: string;
  invoiceUrl?: string;
  assignedToCa?: string;
  assignedCaId?: mongoose.Types.ObjectId;
  complexity?: OrderComplexity;
  customerVerified?: boolean;
  caMarkedCompleteAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderServiceSchema = new Schema<IOrderService>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    serviceName: { type: String, required: true },
    categoryName: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, default: 1 },
    total: { type: Number, required: true },
    professionalFee: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    firmId: { type: Schema.Types.ObjectId, ref: 'Firm' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    services: [OrderServiceSchema],
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['created', 'pending', 'paid', 'failed'],
      default: 'created',
    },
    orderStatus: {
      type: String,
      enum: [
        'created',
        'payment_pending',
        'paid',
        'documents_pending',
        'documents_uploaded',
        'in_review',
        'assigned',
        'ca_completed',
        'customer_verified',
        'approved',
        'rejected',
        'completed',
      ],
      default: 'created',
    },
    paymentReference: { type: String },
    invoiceUrl: { type: String },
    assignedToCa: { type: String },
    assignedCaId: { type: Schema.Types.ObjectId, ref: 'CA' },
    complexity: { type: String, enum: ['low', 'medium', 'high'] },
    customerVerified: { type: Boolean, default: false },
    caMarkedCompleteAt: { type: Date },
  },
  { timestamps: true }
);

OrderSchema.index({ orderId: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ customerEmail: 1 });
OrderSchema.index({ firmId: 1 });
OrderSchema.index({ assignedCaId: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
