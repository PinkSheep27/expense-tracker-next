import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';

// GET /api/protected
// This route requires authentication - tests our middleware
export async function GET(request: NextRequest) {
  // Step 1: Authenticate the request FIRST
  // This validates the token and extracts the userId
  const authResult = await authenticateRequest(request);

  // If authentication failed, return the error response
  if (!authResult.authenticated) {
    return authResult.error;
  }

  // Authentication succeeded! Extract the userId
  // THIS IS CRITICAL: We now have a TRUSTED userId from the verified token
  // We did NOT accept this from the client - we extracted it from the cryptographic signature
  const { userId, email } = authResult;

  // Step 2: Use the authenticated user information
  return NextResponse.json({
    message: 'You are authenticated!',
    user: {
      id: userId,
      email: email,
    },
  });
}