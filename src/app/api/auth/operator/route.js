import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { id_project, access_code } = body;

    if (!id_project || !access_code) {
      return NextResponse.json(
        { error: 'id_project and access_code are required' },
        { status: 400 }
      );
    }

    // Query per verificare se esiste l'access_code nel database (BINARY per case-sensitive)
    const query = `
      SELECT id_user, display_name, assigned_role 
      FROM PROJECT_USER 
      WHERE id_project = ? AND BINARY access_code = ? AND is_deleted = 0
      LIMIT 1
    `;

    const connection = await pool.getConnection();
    const [rows] = await connection.execute(query, [id_project, access_code]);
    connection.release();

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      );
    }

    const user = rows[0];
    const cookieName = `operator_auth_${id_project}`;
    
    // Creare un token con i dati dell'utente in base64
    const tokenData = JSON.stringify({
      id_user: user.id_user,
      id_project: id_project,
      display_name: user.display_name,
      assigned_role: user.assigned_role,
      timestamp: Date.now()
    });
    const token = Buffer.from(tokenData).toString('base64');

    // Impostare il cookie
    const cookieStore = await cookies();
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 giorno
      path: '/'
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Authentication successful',
        user: {
          id_user: user.id_user,
          display_name: user.display_name,
          assigned_role: user.assigned_role
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
