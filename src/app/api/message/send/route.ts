import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchRedis } from '@/app/helpers/redis';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';
import { messageValidator } from '@/lib/validations/message';
import { pusherServer } from '@/lib/pusher';
import { toPusherKey } from '@/lib/utils';

export async function POST( req: Request ) {
    try {
        const {text, chatId} = await req.json();

        const session = await getServerSession(authOptions);

        if(!session) {
            return NextResponse.json( 'Unauthorized', { status: 401 } );
        }

        const [userId1, userId2] = chatId.split('--');

        if(session.user.id !== userId1 && session.user.id !== userId2) {
            return NextResponse.json( 'Unauthorized', { status: 401 } );
        }

        const friendId = session.user.id === userId1 ? userId2 : userId1;

        const friendList = await fetchRedis('smembers', `user:${session.user.id}:friends`) as string;
        const isFriend = friendList.includes(friendId);
        if (!isFriend) {
            return NextResponse.json( 'Unauthorized', { status: 401 } );
        }

        const rawSender = await fetchRedis('get', `user:${session.user.id}`) as string;
        const sender = JSON.parse(rawSender);

        const timestamp = Date.now();
        const messageData = {
            id: nanoid(),
            senderId: sender.id,
            text,
            timestamp
        }

        const message = messageValidator.parse(messageData);

        pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'incoming-message', message);

        pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
            ...message,
            senderImg: sender.image,
            senderName: sender.name,
        });

        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message)
        } );


        return NextResponse.json( 'OK' );
    } catch ( error ) {
        if (error instanceof Error) {
            return NextResponse.json( error, { status: 500 } );
        }

        return NextResponse.json( 'Internal Server Error', { status: 500 } );
    }
}
