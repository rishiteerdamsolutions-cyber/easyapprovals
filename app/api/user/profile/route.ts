import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ user: null, needsOnboarding: true });
    }

    return NextResponse.json({
      user: JSON.parse(JSON.stringify(user)),
      needsOnboarding: !user.onboardingComplete,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userType, nameAsOnPan, panNumber, username, aadharNumber, directorDin, companyName, directors } = body;

    await connectDB();

    const updateData: Record<string, unknown> = {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      userType: userType || 'new_member',
      onboardingComplete: true,
    };

    if (userType === 'new_member') {
      updateData.nameAsOnPan = nameAsOnPan;
      updateData.panNumber = panNumber;
    } else if (userType === 'owns_company' || userType === 'director_only') {
      updateData.username = username;
      updateData.nameAsOnPan = nameAsOnPan;
      updateData.panNumber = panNumber;
      updateData.aadharNumber = aadharNumber;
      updateData.directorDin = directorDin;
      updateData.companyName = companyName;
      updateData.directors = directors;
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({ user: JSON.parse(JSON.stringify(user)) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
