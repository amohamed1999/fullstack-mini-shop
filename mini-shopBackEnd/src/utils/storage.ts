import { MultipartFile } from '@fastify/multipart';
import { supabaseAdmin } from '../lib/supabase';
import { env } from '../config/env';
import { AppError } from './errors';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadProductImage(file: MultipartFile): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new AppError(
      `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
      400,
    );
  }

  const buffer = await file.toBuffer();

  if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new AppError('File size exceeds 5 MB limit', 400);
  }

  const ext = file.mimetype.split('/')[1];
  const fileName = `${randomUUID()}.${ext}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new AppError(`Storage upload failed: ${error.message}`, 500);
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  // Extract path relative to bucket from full public URL
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split(
    `/storage/v1/object/public/${env.SUPABASE_STORAGE_BUCKET}/`,
  );
  if (pathParts.length < 2) return;

  const filePath = pathParts[1];

  await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .remove([filePath]);
}
