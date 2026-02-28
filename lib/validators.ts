import mongoose from 'mongoose';

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);
}

export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export function validateFileType(mimeType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(mimeType);
}

export function validateFileSize(sizeBytes: number): boolean {
  return sizeBytes <= MAX_FILE_SIZE_BYTES;
}
