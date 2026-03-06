import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMonthlyExpenditure extends Document {
  month: number;
  year: number;
  amount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MonthlyExpenditureSchema = new Schema<IMonthlyExpenditure>(
  {
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

MonthlyExpenditureSchema.index({ year: 1, month: 1 }, { unique: true });

const MonthlyExpenditure: Model<IMonthlyExpenditure> =
  mongoose.models.MonthlyExpenditure ||
  mongoose.model<IMonthlyExpenditure>('MonthlyExpenditure', MonthlyExpenditureSchema);

export default MonthlyExpenditure;
