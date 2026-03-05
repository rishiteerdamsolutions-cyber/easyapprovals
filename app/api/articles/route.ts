import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';

export const dynamic = 'force-dynamic';

const VALID_TYPES = ['learn', 'blog', 'guide'] as const;

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as (typeof VALID_TYPES)[number] | null;
    const slug = searchParams.get('slug');
    const tag = searchParams.get('tag');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    // Single article by slug
    if (slug && type && VALID_TYPES.includes(type)) {
      const article = await Article.findOne({
        slug,
        type,
        isPublished: true,
      })
        .populate('relatedServiceIds', 'name slug')
        .lean();
      if (!article) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }
      return NextResponse.json(article);
    }

    // List articles
    const filter: Record<string, unknown> = { isPublished: true };
    if (type && VALID_TYPES.includes(type)) {
      filter.type = type;
    }
    if (tag?.trim()) {
      filter.tags = { $in: [tag.trim()] };
    }

    const articles = await Article.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .select('title slug excerpt type tags publishedAt featuredImage')
      .lean();

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Articles API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
