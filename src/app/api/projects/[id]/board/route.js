import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { verifyProjectAccess } from '@/lib/auth-check';
import { cookies } from 'next/headers';

// GET: restituisce le colonne del progetto con i task nidificati
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // Verifica accesso al progetto
        const hasAccess = await verifyProjectAccess(id);
        if (!hasAccess) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Recupera il display_name dell'operatore dal cookie
        let operatorName = null;
        try {
            const cookieName = `operator_auth_${id}`;
            const cookieStore = await cookies();
            const authCookie = cookieStore.get(cookieName);
            if (authCookie) {
                const tokenData = JSON.parse(
                    Buffer.from(authCookie.value, 'base64').toString('utf-8')
                );
                operatorName = tokenData.display_name || null;
            }
        } catch (err) {
            console.error('Error decoding operator name from cookie:', err);
        }

        // Recupera colonne ordinate per display_order (desc: 3,2,1)
        const [columnsRows] = await pool.query(
            `SELECT id_column, id_project, title, display_order
             FROM \`COLUMN\`
             WHERE id_project = ? AND is_deleted = 0
             ORDER BY display_order`,
            [id]
        );

        // Recupera tutti i task del progetto ordinati per priorita
        const [tasksRows] = await pool.query(
            `SELECT t.* FROM 
            TASK t
            JOIN \`COLUMN\` c 
            ON t.id_column = c.id_column
            WHERE c.id_project = ? 
            AND t.is_deleted = FALSE 
            AND c.is_deleted = FALSE
           ORDER BY priority DESC`,
            [id]
        );

        // Raggruppa i task per colonna
        const columnsWithTasks = (columnsRows || []).map((col) => ({
            ...col,
            tasks: (tasksRows || []).filter((t) => t.id_column === col.id_column)
        }));
        return NextResponse.json({ 
            columns: columnsWithTasks,
            operatorName: operatorName
        });
    } catch (error) {
        console.error('Error fetching board data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
