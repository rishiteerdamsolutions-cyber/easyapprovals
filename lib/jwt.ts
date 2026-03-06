import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const EXPIRY = '7d';

export function signAdminToken(payload: { adminId: string; email: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRY });
}

export function verifyAdminToken(token: string): { adminId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { adminId: string; email: string };
    return decoded;
  } catch {
    return null;
  }
}

export function getAdminFromRequest(request: Request): { adminId: string; email: string } | null {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function signCaToken(payload: { caId: string; email: string }): string {
  return jwt.sign({ ...payload, type: 'ca' }, SECRET, { expiresIn: EXPIRY });
}

export function verifyCaToken(token: string): { caId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET) as { caId: string; email: string; type?: string };
    if (decoded.type !== 'ca') return null;
    return { caId: decoded.caId, email: decoded.email };
  } catch {
    return null;
  }
}

export function getCaFromRequest(request: Request): { caId: string; email: string } | null {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  return verifyCaToken(token);
}
