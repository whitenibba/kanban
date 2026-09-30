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
    cookieStore.delete(cookieName);

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
