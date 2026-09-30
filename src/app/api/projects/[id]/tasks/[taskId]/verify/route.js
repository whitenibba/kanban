import { NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/auth-check';
import pool from '@/lib/db';
import { broadcastSSEEvent } from '@/lib/sse-manager';

export async function PATCH(request, { params }) {
  try {
    const { id: id_project, taskId } = await params;

    // 1. Controllo sicurezza sessione e accesso progetto
    const hasAccess = await verifyProjectAccess(id_project);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connection = await pool.getConnection();

    try {
      // 2. Aggiornamento: impostiamo solo il flag is_verified
      const [result] = await connection.execute(
        `UPDATE TASK 
         SET is_verified = 1, 
             updated_at = NOW() 
         WHERE id_task = ?`,
        [taskId]
      );

      if (result.affectedRows === 0) {
        connection.release();
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      connection.release();

      // 3. Notifica Real-time via SSE
      // Inviamo solo l'ID del task che è stato verificato
      broadcastSSEEvent(id_project, 'TASK_VERIFIED', {
        id_task: parseInt(taskId)
      });

      return NextResponse.json({ 
        success: true, 
        message: "Task verificato" 
      });

    } catch (err) {
      connection.release();
      throw err;
    }
  } catch (error) {
    console.error('Error verifying task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}