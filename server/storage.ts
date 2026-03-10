import { ENV } from './_core/env';
import fs from 'fs/promises';
import path from 'path';

// Local storage configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  await ensureUploadDir();
  
  const key = relKey.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), 'public', 'uploads', key);
  const dirPath = path.dirname(filePath);
  
  // Ensure the subdirectory exists
  await fs.mkdir(dirPath, { recursive: true });
  
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  await fs.writeFile(filePath, buffer);
  
  // Return the public URL
  const url = `/uploads/${key}`;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const key = relKey.replace(/^\/+/, "");
  return {
    key,
    url: `/uploads/${key}`,
  };
}
