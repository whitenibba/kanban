import { getAdminIdFromCookies } from '@/lib/auth';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    const adminId = await getAdminIdFromCookies();

    if (!adminId) {
        return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    try {
        const [
            [projectsCount],
            [inProgressCount],
            [completedCount],
            [priorityData],
            [tasksPerProjectData],
            [completedVsInProgressData],
            [tasksCompletedOverTimeData]
        ] = await Promise.all([
            // 1. Totale progetti dell'admin
            pool.query("SELECT COUNT(*) as total FROM PROJECT WHERE id_admin = ? AND is_deleted = FALSE", [adminId]),
            
            // 2. Task "In Progress" (Basato su display_order > 1 come hai deciso tu)
            pool.query(`
                SELECT COUNT(*) as total 
                FROM TASK t
                JOIN \`COLUMN\` c ON t.id_column = c.id_column
                JOIN PROJECT p ON c.id_project = p.id_project
                WHERE p.id_admin = ? 
                AND c.display_order > 1 
                AND p.is_deleted = FALSE AND t.is_deleted = FALSE AND c.is_deleted = FALSE`, [adminId]),
            
            // 3. Completati negli ultimi 7 giorni (display_order = 1)
            pool.query(`
                SELECT COUNT(*) as total 
                FROM TASK t
                JOIN \`COLUMN\` c ON t.id_column = c.id_column
                JOIN PROJECT p ON c.id_project = p.id_project
                WHERE p.id_admin = ? 
                AND c.display_order = 1 
                AND t.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                AND p.is_deleted = FALSE AND t.is_deleted = FALSE AND c.is_deleted = FALSE`, [adminId]),

            // 4. Grafico a torta priorità (MODIFICATI ALIAS)
            pool.query(`
                SELECT 
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
                WHERE p.id_admin = ? AND p.is_deleted = FALSE AND t.is_deleted = FALSE
                GROUP BY t.priority;`,[adminId]),

            // 5. Grafico a barre (Task per progetto)
            pool.query(`
                SELECT p.name, COUNT(t.id_task) as taskCount
                FROM PROJECT p
                LEFT JOIN \`COLUMN\` c ON p.id_project = c.id_project
                LEFT JOIN TASK t ON c.id_column = t.id_column
                WHERE p.id_admin = ? AND p.is_deleted = FALSE 
                GROUP BY p.id_project;`,[adminId]),

            // 6. Rapporto Completati vs Totali (MODIFICATA LOGICA DONE)
            pool.query(`
                SELECT 
                    p.name,
                    COUNT(t.id_task) as total,
                    SUM(CASE WHEN c.display_order = 1 THEN 1 ELSE 0 END) as done
                FROM PROJECT p
                LEFT JOIN \`COLUMN\` c ON p.id_project = c.id_project
                LEFT JOIN TASK t ON c.id_column = t.id_column
                WHERE p.id_admin = ? AND p.is_deleted = FALSE 
                GROUP BY p.id_project;`,[adminId]),

            // 7. Line Chart (MODIFICATA LOGICA DONE)
            pool.query(`
                SELECT DATE(t.updated_at) as giorno, COUNT(*) as completati
                FROM TASK t
                JOIN \`COLUMN\` c ON t.id_column = c.id_column
                JOIN PROJECT p ON c.id_project = p.id_project
                WHERE p.id_admin = ? 
                AND c.display_order = 1
                AND t.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY DATE(t.updated_at)
                ORDER BY giorno ASC;`,[adminId])
        ]);

        return NextResponse.json({
            totalProjects: projectsCount[0].total,
            inProgress: inProgressCount[0].total,
            completedLastWeek: completedCount[0].total,
            priority: priorityData,
            taskPerProject: tasksPerProjectData, // Corretta ortografia
            completedVsInProgress: completedVsInProgressData,
            tasksCompletedOverTime: tasksCompletedOverTimeData
        });

    } catch (error) {
        console.error("Errore SQL Stats:", error);
        return NextResponse.json({ error: "Errore nel calcolo statistiche" }, { status: 500 });
    }
}