import pool from "@/lib/db";
import { getAdminIdFromCookies } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
    const adminId = await getAdminIdFromCookies();
    if (!adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [rows] = await pool.query(
            "SELECT id_project, name, description FROM PROJECT WHERE is_deleted = FALSE AND id_admin = ?",
            [adminId]
        );
        return NextResponse.json(rows);
    }catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request) {
    const adminId = await getAdminIdFromCookies();
    if (!adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, description,columns } = body;

        // Validazione input
        if (!name) {
            return NextResponse.json(
                { error: "Project name is required" },
                { status: 400 }
            );
        }

        const connection = await pool.getConnection();

        try {
            // Inizia transazione
            await connection.beginTransaction();

            // 1. Inserisco il progetto
            const [projectResult] = await connection.query(
                `INSERT INTO PROJECT (id_admin, name, description, start_date, is_deleted)
                 VALUES (?, ?, ?, NOW(), FALSE)`,
                [adminId, name, description || null]
            );

            const projectId = projectResult.insertId;

            // 2. Inserisco le colonne 
            for (const column of columns) {
                console.log(
                    `INSERT INTO \`COLUMN\` (id_project, title, display_order, is_deleted)
                     VALUES (?, ?, ?, FALSE)`,
                    [projectId, column.title, column.display_order]
                );
            }
            for (const column of columns) {
                await connection.query(
                    `INSERT INTO \`COLUMN\` (id_project, title, display_order, is_deleted)
                     VALUES (?, ?, ?, FALSE)`,
                    [projectId, column.title, column.display_order]
                );
            }

            // Commit della transazione
            await connection.commit();

            // Rilascia la connessione
            connection.release();

            // Restituisci il progetto creato
            return NextResponse.json(
                {
                    id_project: projectId,
                    id_admin: adminId,
                    name,
                    description: description || null,
                    start_date: new Date().toISOString().split('T')[0],
                    is_deleted: false
                },
                { status: 201 }
            );
        } catch (error) {
            // Rollback in caso di errore
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}