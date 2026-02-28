const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /<meta/gi,
  /expression\s*\(/gi,
  /vbscript:/gi,
];

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  let sanitized = input;
  XSS_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });
  return sanitized.trim();
}

export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeInput(val);
    } else if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(val as Record<string, unknown>);
    }
  }
  return result;
}
