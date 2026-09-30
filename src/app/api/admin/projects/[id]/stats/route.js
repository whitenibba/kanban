import pool from "@/lib/db";
import { getAdminIdFromCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Verifica che il progetto appartiene all'admin loggato
 */
async function verifyProjectOwnership(projectId, adminId) {
    const [rows] = await pool.query(
        "SELECT id_project FROM PROJECT WHERE id_project = ? AND id_admin = ? AND is_deleted = FALSE",
        [projectId, adminId]
    );
    return rows.length > 0;
}

/**
 * GET: Restituisce statistiche analitiche per il progetto specifico
 */
export async function GET(request, { params }) {
    const adminId = await getAdminIdFromCookies();
    if (!adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const resolvedParams = await params; 
        const projectId = resolvedParams.id;

        // Verifica che il progetto appartiene all'admin
        const isOwner = await verifyProjectOwnership(projectId, adminId);
        if (!isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Esegui tutte le query in parallelo
        const [
            [priorityData],
            [throughputData],
            [[completionStatus]]
        ] = await Promise.all([
            // 1. Distribuzione Priorità: Conteggio task raggruppati per priorità
            pool.query(
                `SELECT 
                    CASE 
                        WHEN t.priority = 0 THEN 'Bassa'
                        WHEN t.priority = 1 THEN 'Media'
                        WHEN t.priority = 2 THEN 'Alta'
                        WHEN t.priority = 3 THEN 'Urgente'
                        ELSE 'N.D.'
                    END as name, 
                    COUNT(*) as value
                FROM TASK t
                JOIN \`COLUMN\` c ON t.id_column = c.id_column
                JOIN PROJECT p ON c.id_project = p.id_project
                WHERE p.id_project = ? AND p.is_deleted = FALSE AND t.is_deleted = FALSE
                GROUP BY t.priority;`,[projectId]),

            // 2. Andamento Completati: Task completati negli ultimi 30 giorni, raggruppati per data
            pool.query(
                `SELECT 
                    DATE(t.updated_at) as giorno, 
                    COUNT(*) as completati 
                 FROM TASK t
                 WHERE t.id_column IN (
                    SELECT id_column FROM \`COLUMN\` 
                    WHERE id_project = ? AND display_order = 1 AND is_deleted = FALSE
                 ) 
                 AND t.is_deleted = FALSE 
                 AND t.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                 GROUP BY DATE(t.updated_at)
                 ORDER BY giorno ASC`,
                [projectId]
            ),

            // 3. Stato Avanzamento: Totale task e task completati (in colonna Done)
            pool.query(
                `SELECT 
                    (SELECT COUNT(*) 
                     FROM TASK 
                     WHERE id_column IN (
                        SELECT id_column FROM \`COLUMN\` 
                        WHERE id_project = ? AND is_deleted = FALSE
                     ) 
                     AND is_deleted = FALSE
                    ) as total,
                    (SELECT COUNT(*) 
                     FROM TASK 
                     WHERE id_column IN (
                        SELECT id_column FROM \`COLUMN\` 
                        WHERE id_project = ? AND display_order = 1 AND is_deleted = FALSE
                     ) 
                     AND is_deleted = FALSE
                    ) as completed`,
                [projectId, projectId]
            )
        ]);

        // Mappa i dati di priorità per etichette leggibili
        

        return NextResponse.json({
            priority: priorityData,
            throughput: throughputData,
            completionStatus: {
                total: completionStatus.total,
                completed: completionStatus.completed,
                percentage: completionStatus.total > 0 
                    ? Math.round((completionStatus.completed / completionStatus.total) * 100) 
                    : 0
            }
        });
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
