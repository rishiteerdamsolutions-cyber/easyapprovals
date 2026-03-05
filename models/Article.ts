import mongoose, { Schema, Document, Model } from 'mongoose';

export type ArticleType = 'learn' | 'blog' | 'guide';

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  type: ArticleType;
  tags: string[];
  relatedServiceIds: mongoose.Types.ObjectId[];
  author?: string;
  featuredImage?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    type: {
      type: String,
      enum: ['learn', 'blog', 'guide'],
      required: true,
    },
    tags: { type: [String], default: [] },
    relatedServiceIds: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    author: { type: String },
    featuredImage: { type: String },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

ArticleSchema.index({ slug: 1, type: 1 }, { unique: true });
ArticleSchema.index({ type: 1, isPublished: 1, publishedAt: -1 });
ArticleSchema.index({ tags: 1 });
ArticleSchema.index({ relatedServiceIds: 1 });

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);

export default Article;
