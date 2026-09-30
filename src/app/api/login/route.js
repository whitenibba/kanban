import pool from '@/lib/db'
import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request){
    const {email,password} = await request.json();

    try{
        const [rows] = await pool.query(
            "SELECT id_admin FROM ADMIN WHERE email = ? AND password = MD5(?)",
            [email,password]
        )


        if(rows.length > 0){
            const user = rows[0];
            
            const secret = new TextEncoder().encode(process.env.JWT_SECRET);
            const token = await new SignJWT({ id_admin: user.id_admin })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('2h') // Scade tra 2 ore
                .sign(secret);

            const response = NextResponse.json({ message: "OK" });
            response.cookies.set("session_id", token, { 
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 2
            });

            return response;
        }else{
            return NextResponse.json({message: "Wrong credentials"},{status: 401})
        }
    }catch(error){
        console.error("ERRORE SQL:", error.code, error.message);
        return NextResponse.json({message: "DB Error"},{status: 500})
    }

} 