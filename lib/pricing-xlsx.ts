import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { normalizeServiceName } from '@/lib/normalize-service-name';

let cached: Record<string, number> | null = null;
let cachedMtime = 0;

function pricingFilePath(): string {
  return path.join(process.cwd(), 'public', 'pricing.xlsx');
}

/**
 * Reads `public/pricing.xlsx` (Sheet1: column B = service name, column C = fee).
 * Cached; cache invalidates when the file mtime changes.
 */
export function getCachedXlsxPricingMap(): Record<string, number> {
  const file = pricingFilePath();
  if (!fs.existsSync(file)) {
    return {};
  }
  const stat = fs.statSync(file);
  if (cached && stat.mtimeMs === cachedMtime) {
    return cached;
  }

  const map: Record<string, number> = {};
  try {
    const wb = XLSX.readFile(file);
    const sheetName = wb.SheetNames[0];
    if (!sheetName) {
      cached = map;
      cachedMtime = stat.mtimeMs;
      return map;
    }
    const sh = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sh, { header: 1, defval: '' });

    for (const row of rows) {
      const nameCell = row[1];
      const feeCell = row[2];
      const name = typeof nameCell === 'string' ? nameCell.trim() : String(nameCell || '').trim();
      const feeNum =
        typeof feeCell === 'number'
          ? feeCell
          : typeof feeCell === 'string'
            ? parseFloat(feeCell.replace(/,/g, ''))
            : NaN;
      if (!name || !Number.isFinite(feeNum) || feeNum < 0) continue;
      const key = normalizeServiceName(name);
      if (key) map[key] = feeNum;
    }
  } catch (e) {
    console.error('pricing.xlsx read error:', e);
  }

  cached = map;
  cachedMtime = stat.mtimeMs;
  return map;
}
