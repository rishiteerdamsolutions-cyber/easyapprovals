import mongoose, { Schema, Document, Model } from 'mongoose';

export type PerformedBy = 'user' | 'admin' | 'system';

export interface IOrderActivityLog extends Document {
  orderId: mongoose.Types.ObjectId;
  action: string;
  performedBy: PerformedBy;
  timestamp: Date;
}

const OrderActivityLogSchema = new Schema<IOrderActivityLog>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    action: { type: String, required: true },
    performedBy: {
      type: String,
      enum: ['user', 'admin', 'system'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

OrderActivityLogSchema.index({ orderId: 1 });
OrderActivityLogSchema.index({ timestamp: -1 });

const OrderActivityLog: Model<IOrderActivityLog> =
  mongoose.models.OrderActivityLog ||
  mongoose.model<IOrderActivityLog>('OrderActivityLog', OrderActivityLogSchema);

export default OrderActivityLog;
