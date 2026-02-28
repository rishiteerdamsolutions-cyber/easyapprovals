'use client';

import { useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Upload, X } from 'lucide-react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';

export default function UploadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const fieldName = searchParams.get('field') || '';
  const serviceIdStr = searchParams.get('serviceId') || '';
  const cropRequired = searchParams.get('crop') === 'true';

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 100, height: 100, x: 0, y: 0 });
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const isImage = (f: File) => f.type.startsWith('image/');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError('');
    setFile(f);
    setCompletedCrop(null);

    if (isImage(f)) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const getCroppedBlob = async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width! * scaleX;
    canvas.height = completedCrop.height! * scaleY;
    ctx.drawImage(
      image,
      completedCrop.x! * scaleX,
      completedCrop.y! * scaleY,
      completedCrop.width! * scaleX,
      completedCrop.height! * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  };

  const processFile = async (): Promise<File> => {
    if (!file) throw new Error('No file');
    if (file.type === 'application/pdf') return file;

    let blob: Blob = file;
    if (cropRequired && completedCrop && imgRef.current) {
      const cropped = await getCroppedBlob();
      if (cropped) blob = cropped;
    }

    const f = new File([blob], file.name, { type: file.type });
    if (isImage(f)) {
      const compressed = await imageCompression(f, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      return compressed;
    }
    return f;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !serviceIdStr) {
      setError('Please select a file');
      return;
    }
    if (cropRequired && isImage(file) && !completedCrop) {
      setError('Please adjust the crop area');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const processedFile = await processFile();
      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('orderId', id);
      formData.append('serviceId', serviceIdStr);
      formData.append('fieldName', fieldName);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      router.push(`/order/${id}/documents`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setCompletedCrop(null);
    if (preview) URL.revokeObjectURL(preview);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Document</h1>
        <p className="text-gray-600 mb-4">{fieldName}</p>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary-50 file:text-primary-700"
          />

          {preview && isImage(file!) && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Preview {cropRequired && '(crop if needed)'}</p>
              <div className="relative max-h-80 overflow-auto bg-gray-100 rounded">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={cropRequired ? 3 / 4 : undefined}
                >
                  <img
                    ref={imgRef}
                    src={preview}
                    alt="Preview"
                    style={{ maxHeight: 400 }}
                    onLoad={() => setCompletedCrop(crop)}
                  />
                </ReactCrop>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="mt-2 text-sm text-red-600 hover:underline flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Remove
              </button>
            </div>
          )}

          {file && !isImage(file) && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Selected: {file.name}</p>
              <button
                type="button"
                onClick={clearFile}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
            </button>
            <Link href={`/order/${id}/documents`} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
