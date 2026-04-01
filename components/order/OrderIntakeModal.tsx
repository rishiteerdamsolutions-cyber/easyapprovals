'use client';

import { useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import type { IntakeQuestion } from '@/lib/order-intake-questions';
import { isIntakeCompleteForItem } from '@/lib/order-intake-questions';

export interface OrderIntakeModalCartItem {
  serviceId: string;
  serviceName: string;
  categoryName: string;
  serviceSlug: string;
}

interface OrderIntakeModalProps {
  item: OrderIntakeModalCartItem;
  questions: IntakeQuestion[];
  answers: Record<string, string>;
  note: string;
  onAnswerChange: (questionId: string, value: string) => void;
  onNoteChange: (value: string) => void;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onClose: () => void;
  submitting: boolean;
  isQuoteItem: boolean;
}

export default function OrderIntakeModal({
  item,
  questions,
  answers,
  note,
  onAnswerChange,
  onNoteChange,
  customerName,
  customerEmail,
  customerPhone,
  onCustomerNameChange,
  onCustomerEmailChange,
  onCustomerPhoneChange,
  onSubmit,
  onClose,
  submitting,
  isQuoteItem,
}: OrderIntakeModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const intakeOk = isIntakeCompleteForItem(item.serviceSlug, answers, note);
  const contactOk =
    customerName.trim().length > 0 &&
    customerEmail.trim().length > 0 &&
    customerPhone.trim().length > 0;
  const canSubmit = intakeOk && contactOk;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[min(90vh,720px)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pr-14">
          <h2 id="intake-modal-title" className="text-xl font-bold text-gray-900 pr-2">
            Questions for your CA
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            <span className="font-medium text-gray-800">{item.serviceName}</span>
            {item.categoryName ? (
              <span className="text-gray-500"> · {item.categoryName}</span>
            ) : null}
          </p>
          {isQuoteItem && (
            <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              This is a quote / custom service. After you submit, we&apos;ll review and contact you;
              this item will be removed from your cart.
            </p>
          )}

          <div className="mt-6 space-y-4">
            {questions.map((q) => (
              <label key={q.id} className="block">
                <span className="text-sm font-medium text-gray-700">{q.label}</span>
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => onAnswerChange(q.id, e.target.value)}
                  rows={2}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </label>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Describe your requirement <span className="text-red-600">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => onNoteChange(e.target.value)}
                rows={3}
                placeholder="Anything else the CA should know"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Your contact (for follow-up)
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => onCustomerNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => onCustomerEmailChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => onCustomerPhoneChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="Mobile number"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={!canSubmit || submitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Submit & send to team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
