import { NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/auth-check';
import pool from '@/lib/db';
import { broadcastSSEEvent } from '@/lib/sse-manager';

export async function POST(request, { params }) {
  try {
    const { id: id_project } = await params;
    const { title, description, priority, id_column } = await request.json();

    const hasAccess = await verifyProjectAccess(id_project);
    if (!hasAccess) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'INSERT INTO TASK (title, description, priority, id_column, updated_at) VALUES (?, ?, ?, ?, NOW())',
        [title, description, priority , id_column]
      );


      const newTask = {
        id_task: result.insertId,
        title,
        description,
        priority: priority,
        id_column,
        updated_at: new Date()
      };

      connection.release();

      // Notifica la creazione in tempo reale
      broadcastSSEEvent(id_project, 'TASK_CREATED', newTask);

      return NextResponse.json(newTask);
    } catch (err) {
      connection.release();
      throw err;
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 });
  }
}