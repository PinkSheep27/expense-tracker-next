import { NextRequest, NextResponse } from 'next/server';
import { docClient, PREFERENCES_TABLE } from '@/lib/dynamodb';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { authenticateRequest } from '@/lib/auth-middleware';
import { UserPreferences, defaultPreferences } from '@/types/preferences';

export async function GET(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (!authResult.authenticated) {
    return authResult.error;
  }

  const { userId } = authResult;

  try {
    const command = new GetCommand({
      TableName: PREFERENCES_TABLE,
      Key: {
        userId
      }
    });

    const response = await docClient.send(command);

    if (!response.Item) {
      return NextResponse.json({
        ...defaultPreferences,
        userId
      });
    }

    return NextResponse.json(response.Item as UserPreferences);

  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await authenticateRequest(request);
  
  if (!authResult.authenticated) {
    return authResult.error;
  }

  const { userId } = authResult;

  try {
    const preferences = await request.json();

    if (!preferences.theme || !preferences.currency) {
      return NextResponse.json(
        { error: 'Missing required preference fields' },
        { status: 400 }
      );
    }

    const item: UserPreferences = {
      userId,
      theme: preferences.theme,
      currency: preferences.currency,
      language: preferences.language || 'en',
      notifications: preferences.notifications || defaultPreferences.notifications,
      defaultCategory: preferences.defaultCategory || 'Other',
      updatedAt: new Date().toISOString()
    };

    const command = new PutCommand({
      TableName: PREFERENCES_TABLE,
      Item: item
    });

    await docClient.send(command);

    return NextResponse.json({
      message: 'Preferences saved successfully',
      preferences: item
    });

  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}