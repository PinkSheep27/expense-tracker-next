import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

// JWKS Client - fetches Auth0's public keys for token verification
// This client caches the keys so we don't fetch them on every request
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true, // Cache the keys in memory (improves performance)
  rateLimit: true, // Limit how often we fetch keys (prevents API abuse)
  jwksRequestsPerMinute: 5, // Max 5 requests per minute to JWKS endpoint
});

// Helper function to get the public key for verifying the token
// This is called automatically by jwt.verify()
function getKey(header: any, callback: any) {
  // The JWT header contains 'kid' (Key ID) which tells us which key to use
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }

    if (!key) {
      return callback(
        new Error(`Signing key not found for kid: ${header.kid}`)
      );
    }
    
    // Extract the public key from the signing key
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

// Interface defining what an authenticated request looks like
// After middleware runs, the request will have auth property with userId and email
export interface AuthenticatedRequest extends NextRequest {
  auth?: {
    userId: string;
    email: string;
  };
}

// Main authentication middleware function
// Call this at the start of any protected API route
export async function authenticateRequest(
  request: NextRequest
): Promise<
  | { authenticated: false; error: NextResponse }
  | { authenticated: true; userId: string; email: string }
> {
  try {
    // Step 1: Extract the token from the Authorization header
    // Format should be: "Authorization: Bearer <token>"
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return {
        authenticated: false,
        error: NextResponse.json(
          { error: 'No authorization header provided' },
          { status: 401 } // 401 = Unauthorized
        ),
      };
    }

    // Check if the header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        error: NextResponse.json(
          { error: 'Invalid authorization header format. Use: Bearer <token>' },
          { status: 401 }
        ),
      };
    }

    // Extract the actual token (everything after "Bearer ")
    const token = authHeader.substring(7); // Remove "Bearer " (7 characters)

    // Step 2: Verify the token's signature and decode its contents
    // jwt.verify() does THREE things:
    // 1. Checks the signature is valid (proves Auth0 created it)
    // 2. Checks the token hasn't expired
    // 3. Decodes the payload (user info)
    const decoded = await new Promise<any>((resolve, reject) => {
      jwt.verify(
        token,
        getKey, // Function that gets Auth0's public key
        {
          algorithms: ['RS256'], // Auth0 uses RS256 algorithm
          audience: process.env.AUTH0_AUDIENCE, // Must match our Auth0 API
          issuer: `https://${process.env.AUTH0_DOMAIN}/`, // Must be from our Auth0 tenant
        },
        (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        }
      );
    });

    // Step 3: Extract user information from the decoded token
    // "sub" (subject) is the standard JWT claim for user ID
    const userId = decoded.sub;
    const email = decoded.email || decoded[`https://${process.env.AUTH0_DOMAIN}/email`];

    // Validate that we got the required information
    if (!userId) {
      return {
        authenticated: false,
        error: NextResponse.json(
          { error: 'Token missing required claims' },
          { status: 401 }
        ),
      };
    }

    // Success! Token is valid and not expired
    // Return the authenticated user's information
    return {
      authenticated: true,
      userId,
      email: email || 'unknown',
    };
  } catch (error: any) {
    console.error('Authentication error:', error);

    // Handle specific JWT errors with helpful messages
    if (error.name === 'TokenExpiredError') {
      return {
        authenticated: false,
        error: NextResponse.json(
          { error: 'Token has expired. Please sign in again.' },
          { status: 401 }
        ),
      };
    }

    if (error.name === 'JsonWebTokenError') {
      return {
        authenticated: false,
        error: NextResponse.json(
          { error: 'Invalid token. Please sign in again.' },
          { status: 401 }
        ),
      };
    }

    if (error.name === 'NotBeforeError') {
      return {
        authenticated: false,
        error: NextResponse.json(
          { error: 'Token not yet valid.' },
          { status: 401 }
        ),
      };
    }

    // Generic authentication failure
    return {
      authenticated: false,
      error: NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      ),
    };
  }
}
export async function withAuth(
  request: NextRequest,
  handler: (userId: string, email: string, request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  // Authenticate the request
  const authResult = await authenticateRequest(request);

  // If authentication failed, return error immediately
  if (!authResult.authenticated) {
    return authResult.error;
  }

  // Authentication succeeded - call the handler with trusted userId
  return handler(authResult.userId, authResult.email, request);
}