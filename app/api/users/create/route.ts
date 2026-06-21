import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { email, password, name, role, companyId } = await request.json();

    // In a real app, you would verify that the requester is actually the master admin
    // by decoding their Bearer token. For now, we assume the client is the admin.
    
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Firebase Admin SDK is not initialized.' }, { status: 500 });
    }

    // 1. Create the user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2. Set custom claims for role-based access control (optional but good practice)
    await adminAuth.setCustomUserClaims(userRecord.uid, { role, companyId });

    // 3. Create the user document in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      role,
      companyIds: [companyId],
      activeCompanyId: companyId,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, uid: userRecord.uid }, { status: 200 });
  } catch (error: any) {
    console.error('User Creation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
