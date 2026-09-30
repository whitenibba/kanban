import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id_project } = body;

    if (!id_project) {
      return NextResponse.json(
        { error: 'id_project is required' },
        { status: 400 }
      );
    }

    const cookieName = `operator_auth_${id_project}`;
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(cookieName);

    if (!authCookie) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    // Decodificare il token per verificare i dati
    try {
      const tokenData = JSON.parse(Buffer.from(authCookie.value, 'base64').toString('utf-8'));
      return NextResponse.json(
        {
          authenticated: true,
          user: {
            id_user: tokenData.id_user,
            display_name: tokenData.display_name,
            assigned_role: tokenData.assigned_role
          }
        },
        { status: 200 }
      );
    } catch {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}
