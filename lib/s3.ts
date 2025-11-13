import { S3Client } from '@aws-sdk/client-s3';

const isDevelopment = process.env.NODE_ENV === 'development';

export const s3Client = new S3Client({
  endpoint: isDevelopment ? (process.env.AWS_ENDPOINT_URL || 'http://localhost:4566') : undefined,
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: isDevelopment
    ? {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      }
    : undefined,
  forcePathStyle: isDevelopment, 
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'expense-receipts';