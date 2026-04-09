export type AdditionalChargeLine = { label?: string; amount?: number };

export function sumAdditionalCharges(charges: unknown): number {
  if (!Array.isArray(charges)) return 0;
  return charges.reduce((sum, c) => sum + (Number((c as AdditionalChargeLine).amount) || 0), 0);
}

/** Subtotal before GST: item price + government + professional + additional lines. */
export function getSubtotalExcludingGst(service: {
  price?: number;
  governmentFee?: number;
  professionalFee?: number;
  serviceCharge?: number;
  additionalCharges?: AdditionalChargeLine[];
}): number {
  const price = Number(service.price) || 0;
  const gov = Number(service.governmentFee) || 0;
  const prof = Number(service.professionalFee) || 0;
  const sc = Number(service.serviceCharge) || 0;
  const professionalLine = prof > 0 ? prof : sc;
  const addl = sumAdditionalCharges(service.additionalCharges);
  return price + gov + professionalLine + addl;
}

export function getGstAmount(
  subtotalExGst: number,
  gstPercent: number | undefined
): number {
  const pct = Number.isFinite(Number(gstPercent)) ? Number(gstPercent) : 18;
  return Math.round(subtotalExGst * (pct / 100));
}

/** Per-unit amount payable (subtotal + GST), for cart / checkout. */
export function getCheckoutUnitTotal(service: {
  price?: number;
  governmentFee?: number;
  professionalFee?: number;
  serviceCharge?: number;
  gstPercent?: number;
  additionalCharges?: AdditionalChargeLine[];
  isExtraService?: boolean;
}): { subtotalExGst: number; gstAmount: number; unitTotal: number } {
  if (service.isExtraService) {
    return { subtotalExGst: 0, gstAmount: 0, unitTotal: 0 };
  }
  const subtotalExGst = getSubtotalExcludingGst(service);
  const gstAmount = getGstAmount(subtotalExGst, service.gstPercent);
  return {
    subtotalExGst,
    gstAmount,
    unitTotal: subtotalExGst + gstAmount,
  };
}
