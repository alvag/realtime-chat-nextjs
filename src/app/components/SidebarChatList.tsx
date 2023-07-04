'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { chatHrefConstructor, toPusherKey } from '@/lib/utils';
import { pusherClient } from '@/lib/pusher';
import { toast } from 'react-hot-toast';
import { UnseenChatToast } from '@/app/components/UnseenChatToast';


interface Props {
    friends: User[];
    sessionId: string
}

interface ExtendedMessage extends Message {
    senderImg: string;
    senderName: string;
}

export const SidebarChatList = ({friends, sessionId}: Props) => {

    const router = useRouter();
    const pathname = usePathname();
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));

        const chatHandler = (message: ExtendedMessage) => {
            const shouldNotify = pathname !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`;

            if ( shouldNotify ) {
                toast.custom((t) => (
                    <UnseenChatToast
                        t={t}
                        sessionId={sessionId}
                        senderId={message.senderId}
                        senderImg={message.senderImg}
                        senderName={message.senderName}
                        senderMessage={message.text} />
                ));

                setUnseenMessages( (prev) => [...prev, message])
            }
        };

        const friendHandler = () => {
         router.refresh();
        };

        pusherClient.bind(toPusherKey('new_message'), chatHandler);
        pusherClient.bind(toPusherKey('new_friend'), friendHandler);

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));

            pusherClient.unbind(toPusherKey('new_message'), chatHandler);
            pusherClient.unbind(toPusherKey('new_friend'), friendHandler);
        }
    }, [pathname, sessionId, router]);


    useEffect(() => {
        if ( pathname?.includes('chat') ) {
            setUnseenMessages( (prev) => {
                return prev.filter( ( message ) => !pathname.includes( message.senderId ) );
            } );
        }
    }, [pathname]);

    return (
        <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
            { friends.sort().map((friend) => {
                const unseenMessageCount = unseenMessages.filter( ( message ) => message.senderId === friend.id ).length;
                return <li key={friend.id}>
                    <a className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md text-sm leading-6 font-semibold"
                        href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}>
                        {friend.name}
                        {
                            unseenMessageCount > 0
                            && <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                                {unseenMessageCount}
                            </div>
                        }
                    </a>
                </li>
            }) }
        </ul>
    );
};
