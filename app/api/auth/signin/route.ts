import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/signin
// Validates credentials and returns JWT tokens from Auth0
export async function POST(request: NextRequest) {
  try {
    // Step 1: Get email and password from request body
    const body = await request.json();
    const { email, password } = body;

    // Step 2: Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Step 3: Call Auth0 OAuth Token endpoint
    // This is the standard OAuth 2.0 "Resource Owner Password" flow
    const tokenResponse = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'password', // OAuth grant type for username/password
          username: email,
          password: password,
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: process.env.AUTH0_AUDIENCE,
          scope: 'openid profile email', // Request user info in tokens
        }),
      }
    );

    // Step 4: Check if authentication succeeded
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      
      // Auth0 returns specific error codes we can translate to user-friendly messages
      if (errorData.error === 'invalid_grant') {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 } // 401 = Unauthorized
        );
      }

      if (errorData.error === 'access_denied') {
        return NextResponse.json(
          { error: 'Account is locked or disabled' },
          { status: 403 } // 403 = Forbidden
        );
      }

      // Generic authentication failure
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Step 5: Extract tokens from Auth0 response
    const tokens = await tokenResponse.json();

    // Step 6: Get user information from Auth0
    const userInfoResponse = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const userInfo = await userInfoResponse.json();

    // Step 7: Return tokens and user info to frontend
    return NextResponse.json({
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      expiresIn: tokens.expires_in, // How long until token expires (seconds)
      user: {
        id: userInfo.sub, // "sub" is the standard JWT claim for user ID
        email: userInfo.email,
        emailVerified: userInfo.email_verified,
      },
    });

  } catch (error: any) {
    console.error('Sign-in error:', error);

    // Network or unexpected errors
    return NextResponse.json(
      { error: 'Sign-in failed. Please try again.' },
      { status: 500 }
    );
  }
}