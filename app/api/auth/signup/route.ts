import { NextRequest, NextResponse } from 'next/server';
import { ManagementClient } from 'auth0';

// Initialize Auth0 Management Client
// This client allows us to create and manage users in Auth0
const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

// POST /api/auth/signup
// Creates a new user account in Auth0
export async function POST(request: NextRequest) {
  try {
    // Step 1: Get email and password from request body
    const body = await request.json();
    const { email, password } = body;

    // Step 2: Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 } // 400 = Bad Request
      );
    }

    // Step 3: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Step 4: Validate password requirements
    // Auth0 requires: minimum 8 characters
    // We're adding: at least one uppercase, one lowercase, one number
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one lowercase letter' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }

    // Step 5: Create user in Auth0
    const user = await management.users.create({
      email,
      password,
      connection: 'Username-Password-Authentication', // Auth0's default database connection
      email_verified: true, // Skip email verification for development
      // In production, set to false and implement email verification
    });

    // Step 6: Return success response
    return NextResponse.json({
      message: 'User created successfully',
      userId: user.user_id,
      email: user.email,
    }, { status: 201 }); // 201 = Created

  } catch (error: any) {
    console.error('Sign-up error:', error);

    // Handle specific Auth0 errors
    if (error.statusCode === 409) {
      // 409 = Conflict (user already exists)
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    if (error.statusCode === 400) {
      // 400 = Bad Request (Auth0 validation failed)
      return NextResponse.json(
        { error: error.message || 'Invalid user data' },
        { status: 400 }
      );
    }

    // Generic error for unexpected issues
    return NextResponse.json(
      { error: 'Sign-up failed. Please try again.' },
      { status: 500 } // 500 = Internal Server Error
    );
  }
}