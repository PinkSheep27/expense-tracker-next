import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { authenticateRequest } from '@/lib/auth-middleware';


const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);

  if(!authResult.authenticated) return authResult.error;

  const { userId } = authResult;

  try {
    const formData = await request.formData();
    const file = formData.get('receipt') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No receipt file provided' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');

    const key = `${userId}/receipts/${Date.now()}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    const fileUrl = `${process.env.AWS_ENDPOINT_URL}/${BUCKET_NAME}/${key}`;

    return NextResponse.json({
      success: true,
      key,
      url: fileUrl,
      message: 'Receipt uploaded successfully',
    }, { status: 201 });
    
  } catch (error) {
    console.error('Receipt upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload receipt' },
      { status: 500 }
    );
  }
}