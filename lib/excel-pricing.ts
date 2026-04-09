import { getCheckoutUnitTotal, getSubtotalExcludingGst } from '@/lib/service-pricing-display';
import { normalizeServiceName } from '@/lib/normalize-service-name';
import { getCachedXlsxPricingMap } from '@/lib/pricing-xlsx';

type PricingDecision = {
  excelFee: number | null;
  isExtraService: boolean;
  matchedExcelName?: string;
};

const EXCEL_FEES_BY_NORMALIZED_NAME: Record<string, number> = {
  'proprietorship registration': 5000,
  'partnership firm': 5000,
  'opc registration': 10000,
  'limited liability partnership llp registration': 5000,
  'digital signatures no': 3000,
  'private limited company registration': 10000,
  'public limited company registration': 15000,
  'producer company registration': 15000,
  'section 8 company registration': 15000,
  'india subsidiary company registration': 15000,
  'commencement of business': 2000,
  'company regd office address change': 2000,
  'capital increase': 5000,
  'share transfer': 1500,
  'name change of company': 8000,
  'changes in moa aoa': 6000,
  'auditor change appointment or resignation': 2000,
  'filing dormant status': 6000,
  'gst registration': 5000,
  'udyam registration msme ssi': 2000,
  'gst amendments': 4000,
  'gst return filings monthly quarterly annual': 1000,
  'tm registration logo design application': 7000,
  'trademark objection': 7000,
  'trademark opposition': 7000,
  'trademark renewal': 7000,
  'startup india': 15000,
  'trade license': 10000,
  'fssai registration license': 5000,
  'icegate registration': 5000,
  'import export code iec': 5000,
  'legal entity identifier code': 5000,
  'iso registration': 15000,
  'pf registration': 7000,
  'esi registration': 7000,
  'professional tax registration': 7000,
  'rcmc registration': 5000,
  'apeda registration': 5000,
  'form 15ca cb': 6000,
  '12a registration': 15000,
  '80g registration': 15000,
  'darpan registration': 4000,
  'drug license': 30000,
  'it filings salary': 1500,
  'it filings business': 2500,
};

const WEBSITE_TO_EXCEL_ALIAS: Record<string, string> = {
  'partnership firm registration': 'partnership firm',
  'one person company registration': 'opc registration',
  'one person company opc registration': 'opc registration',
  'limited liability partnership registration': 'limited liability partnership llp registration',
  'section 8 company registration': 'section 8 company registration',
  'indian subsidiary registration': 'india subsidiary company registration',
  'startup india registration': 'startup india',
  'fssai registration': 'fssai registration license',
  'fssai license': 'fssai registration license',
  'import export code iec': 'import export code iec',
  'import export code': 'import export code iec',
  'legal entity identifier code lei': 'legal entity identifier code',
  '15ca 15cb filing': 'form 15ca cb',
  'income tax e filing': 'it filings salary',
  'business tax filing': 'it filings business',
  'udyam registration': 'udyam registration msme ssi',
  'udyam registration msme': 'udyam registration msme ssi',
  'digital signature certificate': 'digital signatures no',
  'gst return filing': 'gst return filings monthly quarterly annual',
  'gst amendment': 'gst amendments',
  'trademark registration': 'tm registration logo design application',
  'trademark objection handling': 'trademark objection',
};

export { normalizeServiceName } from '@/lib/normalize-service-name';

export function getPricingDecisionFromExcel(serviceName: string): PricingDecision {
  const normalized = normalizeServiceName(serviceName);
  const excelKey = WEBSITE_TO_EXCEL_ALIAS[normalized] || normalized;
  const xlsxMap = getCachedXlsxPricingMap();
  const fromSheet = xlsxMap[excelKey] ?? xlsxMap[normalized];
  if (typeof fromSheet === 'number') {
    return {
      excelFee: fromSheet,
      isExtraService: false,
      matchedExcelName: excelKey,
    };
  }

  const legacyFee = EXCEL_FEES_BY_NORMALIZED_NAME[excelKey];
  if (typeof legacyFee === 'number') {
    return {
      excelFee: legacyFee,
      isExtraService: false,
      matchedExcelName: excelKey,
    };
  }

  return {
    excelFee: null,
    isExtraService: true,
  };
}

export function usesDatabasePricing(service: Record<string, unknown>): boolean {
  return service.useDatabasePricing !== false;
}

function applyDatabasePricingToService<
  T extends Record<string, unknown> & {
    name?: string;
    price?: number;
    serviceCharge?: number;
    governmentFee?: number;
    professionalFee?: number;
    gstPercent?: number;
  },
>(service: T): T & { isExtraService: boolean; displayFeeText: string } {
  const sub = getSubtotalExcludingGst(service);
  const isExtra = sub <= 0;
  const { unitTotal } = getCheckoutUnitTotal({
    ...service,
    isExtraService: isExtra,
  });

  return {
    ...service,
    isExtraService: isExtra,
    displayFeeText: isExtra ? 'Contact us' : `₹${unitTotal.toLocaleString('en-IN')}`,
  };
}

export function applyExcelPricingToService<
  T extends Record<string, unknown> & {
    name?: string;
    price?: number;
    serviceCharge?: number;
    governmentFee?: number;
    professionalFee?: number;
  },
>(service: T): T & { isExtraService: boolean; displayFeeText: string } {
  const s = service as Record<string, unknown>;
  if (usesDatabasePricing(s)) {
    return applyDatabasePricingToService(service);
  }

  const name = String(service.name || '');
  const decision = getPricingDecisionFromExcel(name);

  if (decision.isExtraService) {
    return {
      ...service,
      isExtraService: true,
      displayFeeText: 'Contact us',
      price: 0,
      serviceCharge: 0,
      governmentFee: 0,
      professionalFee: 0,
    };
  }

  const fee = decision.excelFee ?? 0;
  return {
    ...service,
    isExtraService: false,
    displayFeeText: `₹${fee.toLocaleString()}`,
    price: fee,
    serviceCharge: fee,
    governmentFee: 0,
    professionalFee: 0,
  };
}
