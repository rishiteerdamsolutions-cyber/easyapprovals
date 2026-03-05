'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

type Step = 'choose' | 'new_member' | 'owns_company' | 'director_only';
type UserType = 'new_member' | 'owns_company' | 'director_only';

function OnboardingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [step, setStep] = useState<Step>('choose');
  const [userType, setUserType] = useState<UserType>('new_member');
  const [form, setForm] = useState({
    nameAsOnPan: '',
    panNumber: '',
    username: '',
    aadharNumber: '',
    directorDin: '',
    companyName: '',
    directors: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/onboarding');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/profile')
        .then((r) => r.json())
        .then((data) => {
          if (data.user?.onboardingComplete) {
            router.push(callbackUrl);
          }
        })
        .catch(() => {});
    }
  }, [session, router, callbackUrl]);

  const handleChoose = (type: UserType) => {
    setUserType(type);
    if (type === 'new_member') {
      setStep('new_member');
    } else if (type === 'owns_company') {
      setStep('owns_company');
    } else {
      setStep('director_only');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (userType === 'new_member' && (!form.nameAsOnPan || !form.panNumber)) {
      setError('Name as on PAN and PAN number are required.');
      setLoading(false);
      return;
    }

    if ((userType === 'owns_company' || userType === 'director_only') && (!form.nameAsOnPan || !form.panNumber || !form.aadharNumber || !form.companyName)) {
      setError('All fields are required for existing company members.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          nameAsOnPan: form.nameAsOnPan,
          panNumber: form.panNumber,
          username: form.username || form.nameAsOnPan,
          aadharNumber: form.aadharNumber,
          directorDin: form.directorDin,
          companyName: form.companyName,
          directors: form.directors,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      router.push(callbackUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
        <p className="text-gray-600 mb-8">Tell us about yourself to get started.</p>

        {step === 'choose' && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <p className="font-medium text-gray-700">Do you have a company?</p>
            <div className="space-y-3">
              <button
                onClick={() => handleChoose('new_member')}
                className="w-full text-left px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <span className="font-semibold">Yet to form a company</span>
                <p className="text-sm text-gray-500 mt-1">I am a new member / planning to start a company</p>
              </button>
              <button
                onClick={() => setStep('owns_company')}
                className="w-full text-left px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <span className="font-semibold">Already have a company</span>
                <p className="text-sm text-gray-500 mt-1">I own or am a director in an existing company</p>
              </button>
            </div>
          </div>
        )}

        {step === 'owns_company' && userType === 'new_member' && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <button onClick={() => setStep('choose')} className="text-sm text-primary-600 hover:underline mb-2">← Back</button>
            <p className="font-medium text-gray-700">Do you own the company?</p>
            <div className="space-y-3">
              <button
                onClick={() => handleChoose('owns_company')}
                className="w-full text-left px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <span className="font-semibold">I own a company</span>
              </button>
              <button
                onClick={() => handleChoose('director_only')}
                className="w-full text-left px-6 py-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <span className="font-semibold">Yet to own (I am a director in a company)</span>
              </button>
            </div>
          </div>
        )}

        {(step === 'new_member' || step === 'owns_company' || step === 'director_only') && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <button
              type="button"
              onClick={() => {
                if (step === 'new_member') setStep('choose');
                else {
                  setStep('owns_company');
                  setUserType('new_member');
                }
              }}
              className="text-sm text-primary-600 hover:underline"
            >
              ← Back
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name as on PAN *</label>
              <input
                type="text"
                required
                value={form.nameAsOnPan}
                onChange={(e) => setForm({ ...form, nameAsOnPan: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Full name as on PAN card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label>
              <input
                type="text"
                required
                value={form.panNumber}
                onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. ABCD1234E"
                maxLength={10}
              />
            </div>

            {(userType === 'owns_company' || userType === 'director_only') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username (as per PAN)</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number *</label>
                  <input
                    type="text"
                    required
                    value={form.aadharNumber}
                    onChange={(e) => setForm({ ...form, aadharNumber: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="12-digit Aadhar"
                    maxLength={12}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Director DIN (if applicable)</label>
                  <input
                    type="text"
                    value={form.directorDin}
                    onChange={(e) => setForm({ ...form, directorDin: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Director Identification Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Directors of your company</label>
                  <input
                    type="text"
                    value={form.directors}
                    onChange={(e) => setForm({ ...form, directors: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Names of directors (comma-separated)"
                  />
                </div>
              </>
            )}

            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/" className="text-primary-600 hover:underline">Browse without signing in</Link>
        </p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
