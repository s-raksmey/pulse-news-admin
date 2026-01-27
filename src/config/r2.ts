// @/config/r2.ts

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
  publicUrl?: string;
  region?: string;
}

export function getR2Config(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const endpoint = process.env.R2_ENDPOINT;
  const publicUrl = process.env.R2_PUBLIC_URL;

  if (!accountId) {
    throw new Error('R2_ACCOUNT_ID environment variable is required');
  }

  if (!accessKeyId) {
    throw new Error('R2_ACCESS_KEY_ID environment variable is required');
  }

  if (!secretAccessKey) {
    throw new Error('R2_SECRET_ACCESS_KEY environment variable is required');
  }

  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME environment variable is required');
  }

  if (!endpoint) {
    throw new Error('R2_ENDPOINT environment variable is required');
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
    publicUrl,
    region: 'auto', // R2 uses 'auto' as the region
  };
}

export function validateR2Config(): boolean {
  try {
    getR2Config();
    return true;
  } catch (error) {
    console.error('R2 configuration validation failed:', error);
    return false;
  }
}
