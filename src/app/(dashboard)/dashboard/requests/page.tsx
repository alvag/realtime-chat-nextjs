import { FC } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { fetchRedis } from '@/app/helpers/redis';
import { FriendRequests } from '@/app/components/FriendRequests';

interface RequestsProps {}

const RequestsPage: FC<RequestsProps> = async ( {} ) => {
    const session = await getServerSession( authOptions );
    if ( !session ) return notFound();

    const incomingSenderIds = await fetchRedis( 'smembers' ,`user:${ session.user.id }:incoming_friend_requests` ) as string[];

    const incomingFriendRequests = await Promise.all( incomingSenderIds.map( async ( senderId ) => {
        const sender = await fetchRedis( 'get', `user:${ senderId }` ) as string;
        const senderParsed = JSON.parse( sender );

        return {
            senderId,
            senderEmail: senderParsed.email,
        };
    }));

    return (
        <main className="pt-8">
            <h1 className="font-bold text-5xl mb-8">Add a friend</h1>

            <div className="flex flex-col gap-4">
                <FriendRequests incomingFriendRequest={incomingFriendRequests} sessionId={session.user.id} />
            </div>
        </main>
    );
};

export default RequestsPage;
