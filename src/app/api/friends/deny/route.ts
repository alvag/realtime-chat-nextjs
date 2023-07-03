import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { db } from '@/lib/db';

export async function POST( req: Request ) {
    try {
        const body = await req.json();

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json('Unauthorized', {status: 401});
        }

        const {id: idToAdd} = z.object({id: z.string()}).parse(body);

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd);

        return NextResponse.json( 'OK' );
    } catch ( error ) {
        return NextResponse.json( error, { status: 500 } );
    }
    return NextResponse.json( {} );
}
