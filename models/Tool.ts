import mongoose, { Schema, Document, Model } from 'mongoose';

export type ToolType = 'calculator' | 'search' | 'converter' | 'checker';

export interface ITool extends Document {
  name: string;
  slug: string;
  description: string;
  type: ToolType;
  icon?: string;
  relatedServiceIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ToolSchema = new Schema<ITool>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['calculator', 'search', 'converter', 'checker'],
      default: 'calculator',
    },
    icon: { type: String },
    relatedServiceIds: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ToolSchema.index({ slug: 1 });
ToolSchema.index({ isActive: 1, sortOrder: 1 });

const Tool: Model<ITool> =
  mongoose.models.Tool || mongoose.model<ITool>('Tool', ToolSchema);

export default Tool;
