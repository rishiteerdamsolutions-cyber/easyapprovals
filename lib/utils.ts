import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculateGST(amount: number, rate: number = 18): number {
  return Math.round(amount * (rate / 100));
}

export function calculateTotal(serviceFee: number, governmentFee: number): number {
  const subtotal = serviceFee + governmentFee;
  const gst = calculateGST(subtotal);
  return subtotal + gst;
}

