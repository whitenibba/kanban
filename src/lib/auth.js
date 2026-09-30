import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function getAdminIdFromCookies() {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await (await cookies()).get("session_id")?.value;
    if (!token) return null;

    const id = jwtVerify(token, secret)
        .then(({ payload }) => payload.id_admin)
        .catch((err) => {
            console.error("Token verification failed:", err);
            return null;
        });
    return id;
}