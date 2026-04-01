import type { ReactNode } from 'react';

type LegalPageLayoutProps = {
  title: string;
  children: ReactNode;
  /** ISO date YYYY-MM-DD or display string */
  effectiveDate?: string;
};

export default function LegalPageLayout({
  title,
  children,
  effectiveDate,
}: LegalPageLayoutProps) {
  const displayDate =
    effectiveDate ||
    new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-8 shadow-sm md:p-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-gray-500">Effective date: {displayDate}</p>
        <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-gray-700">
          {children}
        </div>
      </article>
    </div>
  );
}

export function LegalH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 border-b border-gray-100 pb-2 text-xl font-semibold text-gray-900 first:mt-0">
      {children}
    </h2>
  );
}

export function LegalH3({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 mt-6 text-base font-semibold text-gray-900">{children}</h3>;
}

export function LegalUl({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>;
}

export function LegalOl({ children }: { children: ReactNode }) {
  return <ol className="list-decimal space-y-2 pl-5">{children}</ol>;
}

export function LegalLi({ children }: { children: ReactNode }) {
  return <li>{children}</li>;
}

export function LegalNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      {children}
    </p>
  );
}
