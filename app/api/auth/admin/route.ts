import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Verify hardcoded admin credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ error: 'Admin credentials not configured on the server.' }, { status: 500 });
    }

    if (email === adminEmail && password === adminPassword) {
      // Master credentials matched! Let's generate a custom Firebase Auth token for the admin.
      // We use a fixed UID for the master admin.
      const adminUid = 'master-admin-uid';
      
      if (!adminAuth) {
        return NextResponse.json({ error: 'Firebase Admin SDK is not initialized.' }, { status: 500 });
      }

      const customToken = await adminAuth.createCustomToken(adminUid, {
        admin: true,
        role: 'super_admin'
      });

      return NextResponse.json({ token: customToken }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Admin Auth Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
