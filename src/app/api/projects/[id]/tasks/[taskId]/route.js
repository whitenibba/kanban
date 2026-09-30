import { NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/auth-check';
import pool from '@/lib/db';
import { broadcastSSEEvent } from '@/lib/sse-manager'; // <--- Importazione aggiunta

export async function PATCH(request, { params }) {
  try {
    const { id: id_project, taskId } = await params;

    // 1. Verifica accesso al progetto
    const hasAccess = await verifyProjectAccess(id_project);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Lettura dati dal body
    const { id_column } = await request.json();

    if (id_column === undefined) {
      return NextResponse.json({ error: 'id_column is required' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // 3. Aggiornamento Database (Semplice, come concordato)
      const [result] = await connection.execute(
        'UPDATE TASK SET id_column = ?, updated_at = NOW() WHERE id_task = ? AND is_deleted = 0',
        [id_column, taskId]
      );

      if (result.affectedRows === 0) {
        connection.release();
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      connection.release();

      // 4. NOTIFICA REAL-TIME (L'Urlo del Server)
      // Inviamo il segnale a tutti quelli che hanno la board aperta su questo progetto
      broadcastSSEEvent(id_project, 'TASK_MOVED', {
        id_task: parseInt(taskId),
        id_column: parseInt(id_column)
      });

      return NextResponse.json({ success: true, message: "Task moved" }, { status: 200 });

    } catch (err) {
      connection.release();
      throw err;
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: id_project, taskId } = await params;

    const hasAccess = await verifyProjectAccess(id_project);
    if (!hasAccess) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const connection = await pool.getConnection();
    try {
      // Soft Delete: non eliminiamo il dato, lo nascondiamo
      await connection.execute(
        'UPDATE TASK SET is_deleted = 1, updated_at = NOW() WHERE id_task = ?',
        [taskId]
      );
      connection.release();

      // Notifica tutti che il task è sparito
      broadcastSSEEvent(id_project, 'TASK_DELETED', { id_task: parseInt(taskId) });

      return NextResponse.json({ success: true });
    } catch (err) {
      connection.release();
      throw err;
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}