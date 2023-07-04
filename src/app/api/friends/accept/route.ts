import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/app/helpers/redis';
import { db } from '@/lib/db';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';

export async function POST( req: Request ) {
    try {
        const body = await req.json();

        const {id: idToAdd} = z.object({id: z.string()}).parse(body);

        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json('Unauthorized', {status: 401});
        }

        const usAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, idToAdd);
        if (usAlreadyFriends) {
            return NextResponse.json('Already friends', {status: 400});
        }

        const hasFriendRequest = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, idToAdd);
        if (!hasFriendRequest) {
            return NextResponse.json('No friend request', {status: 400});
        }

        // notify added user
        pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`), 'new_friend', {});

        await db.sadd(`user:${session.user.id}:friends`, idToAdd);
        await db.sadd(`user:${idToAdd}:friends`, session.user.id);
        // await db.srem(`user:${idToAdd}:outbound_friend_requests`, session.user.id);
        await db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd);


        return NextResponse.json( {} );
    } catch ( error ) {
        if (error instanceof z.ZodError) {
            return NextResponse.json( 'Invalid request payload', { status: 422 } );
        }

        return NextResponse.json( error, { status: 500 } );
    }
}
