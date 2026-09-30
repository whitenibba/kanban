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
 * Genera un access_code univoco di 6-8 caratteri (alfanumerico)
 */
async function generateUniqueAccessCode(projectId) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let accessCode;
    let isUnique = false;

    while (!isUnique) {
        // Genera codice di 8 caratteri (es. "ABC-A1" = 6, ma generiamo 8)
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Verifica unicità all'interno del progetto
        const [rows] = await pool.query(
            "SELECT access_code FROM PROJECT_USER WHERE access_code = ? AND id_project = ? AND is_deleted = FALSE",
            [code, projectId]
        );
        
        if (rows.length === 0) {
            accessCode = code;
            isUnique = true;
        }
    }

    return accessCode;
}

/**
 * GET: Restituisce la lista di tutti gli operatori del progetto
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

        // Recupera tutti gli operatori del progetto
        const [operators] = await pool.query(
            `SELECT id_user, display_name, assigned_role, access_code 
             FROM PROJECT_USER 
             WHERE id_project = ? AND is_deleted = FALSE 
             ORDER BY assigned_role DESC, display_name ASC`,
            [projectId]
        );

        return NextResponse.json(operators);
    } catch (error) {
        console.error("Database query error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * POST: Aggiunge un nuovo operatore al progetto
 */
export async function POST(request, { params }) {
    const adminId = await getAdminIdFromCookies();
    if (!adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const resolvedParams = await params;
        const projectId = resolvedParams.id;
        const body = await request.json();
        const { display_name, assigned_role } = body;

        // Validazione input
        if (!display_name || assigned_role === undefined) {
            return NextResponse.json(
                { error: "display_name and assigned_role are required" },
                { status: 400 }
            );
        }

        // Verifica che il progetto appartiene all'admin
        const isOwner = await verifyProjectOwnership(projectId, adminId);
        if (!isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Genera access_code univoco
        const accessCode = await generateUniqueAccessCode(projectId);

        // Inserisci il nuovo operatore
        const [result] = await pool.query(
            `INSERT INTO PROJECT_USER 
             (id_project, display_name, assigned_role, access_code, is_deleted) 
             VALUES (?, ?, ?, ?, FALSE)`,
            [projectId, display_name, assigned_role, accessCode]
        );

        return NextResponse.json(
            {
                id_user: result.insertId,
                id_project: projectId,
                display_name,
                assigned_role,
                access_code: accessCode,
                is_deleted: false
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * DELETE: Soft delete di un operatore (imposta is_deleted = 1)
 */
export async function DELETE(request, { params }) {
    const adminId = await getAdminIdFromCookies();
    if (!adminId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const resolvedParams = await params;
        const projectId = resolvedParams.id;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("id_user");

        // Validazione
        if (!userId) {
            return NextResponse.json(
                { error: "id_user query parameter is required" },
                { status: 400 }
            );
        }

        // Verifica che il progetto appartiene all'admin
        const isOwner = await verifyProjectOwnership(projectId, adminId);
        if (!isOwner) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Verifica che l'operatore appartiene al progetto
        const [userCheck] = await pool.query(
            "SELECT id_user FROM PROJECT_USER WHERE id_user = ? AND id_project = ? AND is_deleted = FALSE",
            [userId, projectId]
        );

        if (userCheck.length === 0) {
            return NextResponse.json(
                { error: "Operator not found in this project" },
                { status: 404 }
            );
        }

        // Soft delete
        await pool.query(
            "UPDATE PROJECT_USER SET is_deleted = TRUE WHERE id_user = ? AND id_project = ?",
            [userId, projectId]
        );

        return NextResponse.json(
            { message: "Operator deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
